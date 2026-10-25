// src/core/transformers/StageTransformer.js
import {
    modAfterStageFinished,
    modGarageFeatures,
    modMinimapList,
    modModelType,
    modNeededStateFarm,
    modPropTypes,
    modRecommendedTruck,
    modRequiredTrailerFarm,
    modRestrictionList
} from '../../utils/stringToNumber.js';
import { helperInstance } from '../../utils/helpers.js';
import { zoneTransformerInstance } from './ZoneTransformer.js';

export const CARGO_COMPAT_MAP = {
    "CargoConsumableFuel": "CargoBarrels"
};

export function normalizeCargoName(rawName, contextPath = "") {
    if (!rawName) return "";
    if (CARGO_COMPAT_MAP[rawName]) {
        const replacement = CARGO_COMPAT_MAP[rawName];
        helperInstance.addDiagnostic(
            'info',
            'CARGO-FIX',
            `${contextPath ? `[${contextPath}] ` : ''}Podmieniono nieobsługiwany w modach ładunek "${rawName}" ➔ "${replacement}"`
        );
        return replacement;
    }
    return rawName;
}

class RewardsController {
    constructor() {
        this.rewardHandlers = {
            "ObjectiveRewardAddItemsToZone": this.handleAddItemsToZone,
            "ObjectiveRewardOpenZoneProperties": this.handleOpenZoneProperties,
            "ObjectiveRewardUpdateZoneProperties": this.handleUpdateZoneProperties,
            "ObjectiveRewardsUpgradeGarage": this.handleUpgradeGarage
        };
    }

    handleAddItemsToZone(key, data) {
        if (!data || helperInstance.isNulled(data)) return null;
        return {
            "$type": "ObjectiveRewardAddItemsToZone",
            "cargosSettings": data.cargosSettings ? data.cargosSettings.map(cargoSetting => ({
                "$type": "CargoLoadingSettings",
                "count": -1,
                "name": normalizeCargoName(cargoSetting.name, key)
            })) : [],
            "mapId": helperInstance.formatLevelName(data.mapId) || "",
            "zoneId": data.zoneId || ""
        };
    }

    handleOpenZoneProperties(key, data) {
        if (!data || helperInstance.isNulled(data) || !data.zoneSettings) return null;

        const transformedZoneSettings = {};

        for (const zoneSettingKey in data.zoneSettings) {
            const zoneSettingData = data.zoneSettings[zoneSettingKey];
            if (helperInstance.isNulled(zoneSettingData)) continue;

            transformedZoneSettings[zoneSettingKey] = {
                "$type": "ZonePropertiesSettingsObjectiveReward",
                "mapId": helperInstance.formatLevelName(zoneSettingData.mapId) || "",
                "props": zoneTransformerInstance.transformRewardProps(zoneSettingData),
                "zoneId": zoneSettingData.zoneId || ""
            };
        }

        return {
            "$type": "ObjectiveRewardOpenZoneProperties",
            "zoneSettings": transformedZoneSettings
        };
    }

    handleUpdateZoneProperties(key, data) {
        if (!data || helperInstance.isNulled(data)) return null;

        const transformedZoneSettings = {};
        const transformedZoneSettingsToRemove = {};
        const transformedZoneSettingsToRemove2 = {};

        if (data.zoneSettings && typeof data.zoneSettings === 'object') {
            for (const zoneSettingKey in data.zoneSettings) {
                const zoneSettingData = data.zoneSettings[zoneSettingKey];
                if (helperInstance.isNulled(zoneSettingData)) continue;

                transformedZoneSettings[zoneSettingKey] = {
                    "$type": "ZonePropertiesSettingsObjectiveReward",
                    "mapId": helperInstance.formatLevelName(zoneSettingData.mapId) || "",
                    "props": zoneTransformerInstance.transformRewardProps(zoneSettingData),
                    "zoneId": zoneSettingData.zoneId || ""
                };
            }
        }

        if (data.zoneSettingsToRemove && typeof data.zoneSettingsToRemove === 'object') {
            for (const removeKey in data.zoneSettingsToRemove) {
                const removeData = data.zoneSettingsToRemove[removeKey];
                if (helperInstance.isNulled(removeData)) continue;

                transformedZoneSettingsToRemove[removeKey] = {
                    "$type": "ZonePropertiesSettingsObjectiveReward",
                    "mapId": helperInstance.formatLevelName(removeData.mapId) || "",
                    "props": zoneTransformerInstance.transformRewardProps(removeData),
                    "zoneId": removeData.zoneId || ""
                };
            }
        }

        if (data.zoneSettingsToRemove2 && typeof data.zoneSettingsToRemove2 === 'object') {
            for (const removeKey in data.zoneSettingsToRemove2) {
                const removeData = data.zoneSettingsToRemove2[removeKey];
                if (helperInstance.isNulled(removeData)) continue;

                const propTypesArray = Array.isArray(removeData.propTypes)
                    ? modPropTypes(removeData.propTypes)
                    : (removeData.propTypes ? [removeData.propTypes] : []);

                transformedZoneSettingsToRemove2[removeKey] = {
                    "$type": "ZonePropertiesToRemoveSettings",
                    "globalZoneId": {
                        "$type": "ZoneGlobalIdentificator",
                        "globalZoneId": helperInstance.formatGlobalZoneId(removeData.globalZoneId?.globalZoneId) || ""
                    },
                    "propTypes": propTypesArray
                };
            }
        }
        const result = {
            "$type": "ObjectiveRewardUpdateZoneProperties"
        };

        if (Object.keys(transformedZoneSettings).length > 0) result.zoneSettings = transformedZoneSettings;
        if (Object.keys(transformedZoneSettingsToRemove).length > 0) result.zoneSettingsToRemove = transformedZoneSettingsToRemove;
        if (Object.keys(transformedZoneSettingsToRemove2).length > 0) result.zoneSettingsToRemove2 = transformedZoneSettingsToRemove2;

        return result;
    }

    handleUpgradeGarage(key, data) {
        if (!data || helperInstance.isNulled(data)) return;
        return {
            "$type": "ObjectiveRewardsUpgradeGarage",
            "feature": modGarageFeatures(data.feature),
            "zone": helperInstance.formatGlobalZoneId(data.zone)
        };
    }

    transformRewards(rawSrcRewards, path) {
        if (helperInstance.isNulled(rawSrcRewards)) return {};

        const tracker = helperInstance.createTracker(rawSrcRewards, path || "Rewards");
        const srcRewards = tracker.proxy;
        const result = {};

        for (const key in srcRewards) {
            const matchedHandlerName = Object.keys(this.rewardHandlers).find(handlerName => key.startsWith(handlerName));

            if (!matchedHandlerName && key !== "ObjectiveRewardExperience" && key !== "ObjectiveRewardMoney") {
                continue;
            }

            if (matchedHandlerName) {
                const handler = this.rewardHandlers[matchedHandlerName].bind(this);
                const rewardData = srcRewards[key];
                const handlerResult = handler(key, rewardData);
                if (handlerResult) result[key] = handlerResult;
            }
        }
        if (srcRewards.ObjectiveRewardExperience && !result.ObjectiveRewardExperience) {
            result.ObjectiveRewardExperience = { "$type": "ObjectiveRewardExperience", "amount": srcRewards.ObjectiveRewardExperience.amount || 0 };
        }
        if (srcRewards.ObjectiveRewardMoney && !result.ObjectiveRewardMoney) {
            result.ObjectiveRewardMoney = { "$type": "ObjectiveRewardMoney", "amount": srcRewards.ObjectiveRewardMoney.amount || 0 };
        }

        tracker.check();
        return result;
    }
}

export class StageTransformer {
    formatManualSettings(manualSettings) {
        return helperInstance.isNulled(manualSettings) ? null : {
            "$type": "CargoManualUnloadingSettings",
            "interactionZoneId": manualSettings.interactionZoneId ? helperInstance.transformZoneId(manualSettings.interactionZoneId) : null,
            "isAutoLoadAllowed": manualSettings.isAutoLoadAllowed || false,
            "isVisible": manualSettings.isVisible || true,
            "platformColorOverride": manualSettings.platformColorOverride ? helperInstance.modPlatformOverride(manualSettings.platformColorOverride) : null,
            "model": manualSettings.model ? this.transformModel(manualSettings.model) : null,
            "truckUid": manualSettings.truckUid || "",
            "uiDesc": manualSettings.uiDesc || ""
        };
    }

    transformActions(rawSrcActions, path) {
        if (helperInstance.isNulled(rawSrcActions)) return null;

        const tracker = helperInstance.createTracker(rawSrcActions, path);
        const src = tracker.proxy;

        const result = {
            "$type": "ActionPackSettings",
            "zoneToFill": src.zoneToFill ? src.zoneToFill.map((t, i) => this.transformZoneToFill(t, `${path} -> zoneToFill[${i}]`)) : []
        };

        tracker.check();
        return result;
    }

    transformZoneToFill(rawSrcZone, path) {
        if (helperInstance.isNulled(rawSrcZone)) return null;

        const tracker = helperInstance.createTracker(rawSrcZone, path);
        const srcZone = tracker.proxy;

        const result = {
            "$type": "CargoUnloadingZoneSettings",
            "additionalUnloadZones": srcZone.additionalUnloadZones
                ? srcZone.additionalUnloadZones : [],
            "cargo": srcZone.cargo ? this.transformCargoPack(srcZone.cargo, path) : null,
            "globalZoneId": srcZone.globalZoneId ? helperInstance.transformZoneId(srcZone.globalZoneId) : null,
            "manualSettings": srcZone.manualSettings ? this.formatManualSettings(srcZone.manualSettings) : null,
            "model": srcZone.model ? this.transformModel(srcZone.model) : null,
            "truckUid": srcZone.truckUid || "",
            "uiDesc": srcZone.uiDesc || ""
        };

        tracker.check();
        return result;
    }

    transformModel(srcModel) {
        if (helperInstance.isNulled(srcModel)) return null;

        const stagesProgress = {};
        if (srcModel.stagesProgress) {
            for (const key in srcModel.stagesProgress) {
                const value = srcModel.stagesProgress[key];
                stagesProgress[key] = (typeof value === 'object' && Object.keys(value).length === 0) ? 0 : value;
            }
        }

        const model = {
            "$type": "ModelBuildingSettings",
            "levelName": helperInstance.formatLevelName(srcModel.levelName),
            "modelTag": srcModel.modelTag || "",
            "modelType": srcModel.modelType ? modModelType(srcModel.modelType) : 0,
            "unloadBlockedZoneId": srcModel.unloadBlockedZoneId ? helperInstance.transformZoneId(srcModel.unloadBlockedZoneId) : null,
            ...(srcModel.unloadBlockedZoneIdList !== undefined && {
                "unloadBlockedZoneIdList": Array.isArray(srcModel.unloadBlockedZoneIdList)
                    ? srcModel.unloadBlockedZoneIdList.map(z => helperInstance.transformZoneId(z)).filter(Boolean)
                    : []
            }),
            "stagesProgress": stagesProgress,
        };

        if (srcModel.objectiveSequenceIdx !== undefined) {
            model.objectiveSequenceIdx = srcModel.objectiveSequenceIdx;
        }
        return model;
    }

    transformVisitAllZones(rawSrcVisit, path) {
        if (helperInstance.isNulled(rawSrcVisit) || !rawSrcVisit.zones || rawSrcVisit.zones.length === 0) return null;

        const tracker = helperInstance.createTracker(rawSrcVisit, path);
        const srcVisit = tracker.proxy;

        const result = {
            "$type": "VisitAllZonesSettings",
            "zones": srcVisit.zones ? srcVisit.zones.map(z => ({
                "$type": "TaskSettingVisitZone",
                "globalZoneId": helperInstance.transformZoneId(z.globalZoneId),
                ...(z.hideZone !== undefined && { "hideZone": z.hideZone || true }),
                "truckUid": z.truckUid || "",
                "uiDesc": z.uiDesc || ""
            })) : []
        };

        tracker.check();
        return result;
    }

    transformCargoPack(srcCargo, path = "") {
        return helperInstance.isNulled(srcCargo)
            ? null
            : { "$type": "CargoPack", "count": srcCargo.count, "name": normalizeCargoName(srcCargo.name, path) };
    }

    resolveModSafeAfterStage(rawAfterStage, path = "") {
        const val = modAfterStageFinished(rawAfterStage);
        // Walidator modMapError wymaga DESTROY (2) dla ciężarówek z DLC (np. wortek_250t, derry_savior)
        // zarówno na etapie końcowym REWARD (0), jak i w zadaniach typu NEW_TRUCK
        if (val === 0 || path.includes("NEW_TRUCK")) {
            return 2; // 2 = DESTROY
        }
        return val;
    }

    transformTruckDelivery(rawSrcDelivery, path) {
        if (helperInstance.isNulled(rawSrcDelivery)) return null;

        const tracker = helperInstance.createTracker(rawSrcDelivery, path);
        const srcDelivery = tracker.proxy;

        const truckDelivery = {
            "$type": "TruckDeliverySettings",
            "additionalDeliveryZones": srcDelivery.additionalDeliveryZones || [],
            "afterStageFinished": this.resolveModSafeAfterStage(srcDelivery.afterStageFinished, path, srcDelivery.truckId),
            "globalZoneDeliveryId": srcDelivery.globalZoneDeliveryId ? helperInstance.transformZoneId(srcDelivery.globalZoneDeliveryId) : null,
            "isListeningTruckOnly": srcDelivery.isListeningTruckOnly || false,
            "mustDestroyAfterSubstage": srcDelivery.mustDestroyAfterSubstage || false,
            "truckId": srcDelivery.truckId || "",
            "truckUiName": srcDelivery.truckUiName || "",
            "uiDesc": srcDelivery.uiDesc || ""
        };
        if (srcDelivery.globalZoneSpawnId && !helperInstance.isNulled(srcDelivery.globalZoneSpawnId)) {
            truckDelivery.globalZoneSpawnId = helperInstance.transformZoneId(srcDelivery.globalZoneSpawnId);
        }

        tracker.check();
        return truckDelivery;
    }

    transformSpawnCargo(rawSrcSpawn, path) {
        if (helperInstance.isNulled(rawSrcSpawn)) return null;

        const tracker = helperInstance.createTracker(rawSrcSpawn, path);
        const srcSpawn = tracker.proxy;

        const result = {
            "$type": "SpawnPhysicalCargoSettings",
            "cargos": srcSpawn.cargos ? srcSpawn.cargos.map(c => ({
                "$type": "ObjectiveCargoSettings",
                "count": c.count,
                "name": normalizeCargoName(c.name, path)
            })) : [],
            "ignoreHidingCargoWhenNotTracked": srcSpawn.ignoreHidingCargoWhenNotTracked || false,
            "needToBeDiscoveredByMetallodetector": srcSpawn.needToBeDiscoveredByMetallodetector || false,
            "zone": srcSpawn.zone ? helperInstance.transformZoneId(srcSpawn.zone) : null
        };

        tracker.check();
        return result;
    }

    transformFarmingInfo(rawSrcFarming, path) {
        if (helperInstance.isNulled(rawSrcFarming)) return null;

        const tracker = helperInstance.createTracker(rawSrcFarming, path);
        const srcFarming = tracker.proxy;

        const result = {
            "$type": "FarmingActionSettings",
            "farmingZone": srcFarming.farmingZone ? helperInstance.transformZoneId(srcFarming.farmingZone) : null,
            "hideStageFromUi": srcFarming.hideStageFromUi || false,
            "model": srcFarming.model ? this.transformModel(srcFarming.model) : null,
            "neededState": modNeededStateFarm(srcFarming.neededState),
            "requiredTrailer": modRequiredTrailerFarm(srcFarming.requiredTrailer),
            "tolerance": srcFarming.tolerance || 0,
            "uiDesc": srcFarming.uiDesc || ""
        };

        tracker.check();
        return result;
    }

    transformRepairTruck(rawSrcRepair, path) {
        if (helperInstance.isNulled(rawSrcRepair)) return null;

        const tracker = helperInstance.createTracker(rawSrcRepair, path);
        const srcRepair = tracker.proxy;

        const repairTruckMap = {
            "$type": "TruckRepairSettings",
            "afterStageFinished": this.resolveModSafeAfterStage(srcRepair.afterStageFinished, path, srcRepair.truckId),
            "mustDestroyAfterSubstage": srcRepair.mustDestroyAfterSubstage || false,
            "truckId": srcRepair.truckId || "",
            "truckUiName": srcRepair.truckUiName || "",
            "uiDesc": srcRepair.uiDesc || ""
        };
        if (srcRepair.globalZoneSpawnId && !helperInstance.isNulled(srcRepair.globalZoneSpawnId)) {
            repairTruckMap.globalZoneSpawnId = helperInstance.transformZoneId(srcRepair.globalZoneSpawnId);
        }

        tracker.check();
        return repairTruckMap;
    }

    transformChangeTruck(rawSrcTruck, path) {
        if (helperInstance.isNulled(rawSrcTruck)) return null;

        const tracker = helperInstance.createTracker(rawSrcTruck, path);
        const srcTruck = tracker.proxy;

        const result = {
            "$type": "ChangeTruckSettings",
            "afterStageFinished": this.resolveModSafeAfterStage(srcTruck.afterStageFinished, path, srcTruck.truckId),
            "mustDestroyAfterSubstage": srcTruck.mustDestroyAfterSubstage || false,
            "truckId": srcTruck.truckId || "",
            "truckUiName": srcTruck.truckUiName || "",
            "uiDesc": srcTruck.uiDesc || "",
            "truckRestrictionList": Array.isArray(srcTruck.truckRestrictionList)
                ? srcTruck.truckRestrictionList.map(truck => modRestrictionList(truck))
                : (srcTruck.truckRestrictionList ? [modRestrictionList(srcTruck.truckRestrictionList)] : [])
        };

        tracker.check();
        return result;
    }

    transformLivingAreaInfo(areaInfo) {
        return helperInstance.isNulled(areaInfo) ? null : {
            "$type": "LivingAreaInfo",
            "livingAreaGlobalZoneId": areaInfo.livingAreaGlobalZoneId ? helperInstance.transformZoneId(areaInfo.livingAreaGlobalZoneId) : null,
            "livingAreaValue": areaInfo.livingAreaValue || null
        };
    }

    transformStage(rawSrcStage, path) {
        if (helperInstance.isNulled(rawSrcStage)) return null;

        const tracker = helperInstance.createTracker(rawSrcStage, path);
        const srcStage = tracker.proxy;

        const result = {
            "$type": "ObjectiveStage",
            "actions": srcStage.actions ? this.transformActions(srcStage.actions, `${path} -> actions`) : null,
            "changeTruck": srcStage.changeTruck ? this.transformChangeTruck(srcStage.changeTruck, `${path} -> changeTruck`) : null,
            "farmingInfo": srcStage.farmingInfo ? this.transformFarmingInfo(srcStage.farmingInfo, `${path} -> farmingInfo`) : null,
            "isForceSearchCargoOnMap": srcStage.isForceSearchCargoOnMap || false,
            "livingAreaInfo": srcStage.livingAreaInfo ? this.transformLivingAreaInfo(srcStage.livingAreaInfo) : null,
            "makeActionInZone": srcStage.makeActionInZone ? this.transformVisitAllZones(srcStage.makeActionInZone, `${path} -> makeActionInZone`) : null,
            "model": srcStage.model ? this.transformModel(srcStage.model) : null,
            "needToStartTimer": srcStage.needToStartTimer ? srcStage.needToStartTimer : false,
            "repairTruck": srcStage.repairTruck ? srcStage.repairTruck.map((t, i) => this.transformRepairTruck(t, `${path} -> repairTruck[${i}]`)) : [],
            "spawnCargoOnStageActive": srcStage.spawnCargoOnStageActive ? srcStage.spawnCargoOnStageActive.map((t, i) => this.transformSpawnCargo(t, `${path} -> spawnCargoOnStageActive[${i}]`)) : [],
            "truckDelivery": srcStage.truckDelivery ? srcStage.truckDelivery.map((t, i) => this.transformTruckDelivery(t, `${path} -> truckDelivery[${i}]`)) : [],
            "restartBlockedZoneIds": srcStage.restartBlockedZoneIds
                ? srcStage.restartBlockedZoneIds.map(zone => helperInstance.transformZoneId(zone))
                : [],
            ...(srcStage.unloadBlockedZoneId !== undefined && {
                "unloadBlockedZoneId": srcStage.unloadBlockedZoneId ? helperInstance.transformZoneId(srcStage.unloadBlockedZoneId) : null
            }),
            ...(srcStage.unloadBlockedZoneIdList !== undefined && {
                "unloadBlockedZoneIdList": Array.isArray(srcStage.unloadBlockedZoneIdList)
                    ? srcStage.unloadBlockedZoneIdList.map(z => helperInstance.transformZoneId(z)).filter(Boolean)
                    : []
            }),
            "uiDesc": (srcStage.uiDesc !== null && srcStage.uiDesc !== undefined && typeof srcStage.uiDesc === 'string')
                ? srcStage.uiDesc
                : "oldUIDescdeprecated",
            "visitAllZones": srcStage.visitAllZones ? this.transformVisitAllZones(srcStage.visitAllZones, `${path} -> visitAllZones`) : null,
        };

        tracker.check();
        return result;
    }
}

export class TaskTransformer {
    constructor(stageTransformer, rewardsController) {
        this.rewardsController = rewardsController;
        this.stageTransformer = stageTransformer;
    }

    transformTask(rawSrc, name, isContract = false) {
        if (helperInstance.isNulled(rawSrc)) return null;

        const basePath = `[${isContract ? 'Contract' : 'Task'}: ${name}]`;
        const tracker = helperInstance.createTracker(rawSrc, basePath);
        const src = tracker.proxy;

        if (!src.stages || !Array.isArray(src.stages) || src.stages.length === 0) {
            helperInstance.addDiagnostic('warn', 'UNEXPECTED', `${basePath}: Misja nie posiada żadnych etapów (stages jest puste)!`);
        }

        const result = {
            "$type": "TaskSettings",
            ...isContract && { "$type": "ContractSettings" },
            "FreezeTrailer": src.FreezeTrailer ? helperInstance.transformFreezeTrailer(src.FreezeTrailer) : null,
            ...!isContract && { "additionalTaskGivers": src.additionalTaskGivers || [] },
            "blockerMap": src.blockerMap ? helperInstance.formatLevelName(src.blockerMap) : "",
            "blockerObjectives": src.blockerObjectives || [],
            ...isContract && { "contractMap": src.contractMap ? helperInstance.formatLevelName(src.contractMap) : "" },
            "customMessage": src.customMessage || "",
            "description": src.description || "",
            ...isContract && {
                "employer": src.employer || "Husky",
                "failReasons": src.failReasons || {}
            },
            "forcedDaytime": src.forcedDaytime && !helperInstance.isNulled(src.forcedDaytime) ? {
                "$type": "ForcedDaytimeSettings",
                "daytime": src.forcedDaytime.daytime || "",
                "level": helperInstance.formatLevelName(src.forcedDaytime.level) || ""
            } : null,
            "isCoop": src.isCoop || false,
            "isForTutorial": src.isForTutorial || false,
            "isMarkersDisabled": src.isMarkersDisabled || false,
            "isNeedRaceMusic": src.isNeedRaceMusic || false,
            "isRepeatable": src.isRepeatable || false,
            "isSilentReward": src.isSilentReward || false,
            "jingleSett": src.jingleSett ? helperInstance.modJingleSett(src.jingleSett) : null,
            "minimapList": modMinimapList(src.minimapList),
            "model": src.model ? this.stageTransformer.transformModel(src.model) : null,
            "name": name,
            "recommendedTruck": modRecommendedTruck(src.recommendedTruck),
            ...isContract && { "region": src.region || "no_region" },
            "requiredRank": src.requiredRank || 0,
            "rewards": src.rewards ? this.rewardsController.transformRewards(src.rewards, `${basePath} -> rewards`) : {},
            "stages": src.stages ? src.stages.map((stage, idx) => this.stageTransformer.transformStage(stage, `${basePath} -> stages[${idx}]`)) : [],
            "truckDeliveryBlockedZoneId": src.truckDeliveryBlockedZoneId ? helperInstance.transformZoneId(src.truckDeliveryBlockedZoneId) : null,
            ...!isContract && { "taskGiverZone": src.taskGiverZone ? helperInstance.transformZoneId(src.taskGiverZone) : null },
            "trucksWithoutForceGrounding": src.trucksWithoutForceGrounding || [],
            "uiDesc": src.uiDesc || "",
            "unloadBlockedZoneId": src.unloadBlockedZoneId ? helperInstance.transformZoneId(src.unloadBlockedZoneId) : null,
            ...(src.unloadBlockedZoneIdList !== undefined && {
                "unloadBlockedZoneIdList": Array.isArray(src.unloadBlockedZoneIdList)
                    ? src.unloadBlockedZoneIdList.map(zone => helperInstance.transformZoneId(zone)).filter(Boolean)
                    : []
            }),
            "restartBlockedZoneIds": src.restartBlockedZoneIds ? src.restartBlockedZoneIds.map(zone => helperInstance.transformZoneId(zone)) : []
        };

        tracker.check();
        return result;
    }
}

export const rewardsController = new RewardsController();
export const stageTransformerInstance = new StageTransformer();
const rewardsControllerInstance = new RewardsController();
export const taskTransformer = new TaskTransformer(stageTransformerInstance, rewardsControllerInstance);