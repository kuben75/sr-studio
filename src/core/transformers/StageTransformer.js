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
} from '../../utils/stringToNumber.js'
import { helperInstance } from '../../utils/helpers.js'
import { zoneTransformerInstance } from './ZoneTransformer.js'

export const CARGO_COMPAT_MAP = {
    "CargoConsumableFuel": "CargoBarrels"
};

export function normalizeCargoName(rawName, contextPath = "") {
    if (!rawName) return "";
    if (CARGO_COMPAT_MAP[rawName]) {
        helperInstance.addDiagnostic(
            'info',
            'CARGO-FIX',
            `${contextPath ? `[${contextPath}] ` : ''}Podmieniono nieobsługiwany w modach ładunek "${rawName}" ➔ "${CARGO_COMPAT_MAP[rawName]}"`
        );
        return CARGO_COMPAT_MAP[rawName];
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
        }
    }
    handleAddItemsToZone(key, data) {
        if (!data || helperInstance.isNulled(data)) return null;
        return {
            "$type": "ObjectiveRewardAddItemsToZone",
            "cargosSettings": Array.isArray(data.cargosSettings) ? data.cargosSettings.map(cargoSetting => ({
                "$type": "CargoLoadingSettings",
                "count": -1,
                "name": normalizeCargoName(cargoSetting.name, key)
            })) : [],
            "mapId": helperInstance.formatLevelName(data.mapId) || "",
            "zoneId": data.zoneId || ""
        }
    }
    handleOpenZoneProperties(key, data) {
        if (!data || helperInstance.isNulled(data) || !data.zoneSettings) return null;

        const transformedZoneSettings = {};

        for (const zoneSettingKey in data.zoneSettings) {
            if (zoneSettingKey === '__type' || zoneSettingKey === '__value') continue;
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
        }
    }
    handleUpdateZoneProperties(key, data) {
        if (!data || helperInstance.isNulled(data)) return null;

        const transformedZoneSettings = {};
        const transformedZoneSettingsToRemove = {};
        const transformedZoneSettingsToRemove2 = {};

        if (data.zoneSettings && typeof data.zoneSettings === 'object') {
            for (const zoneSettingKey in data.zoneSettings) {
                if (zoneSettingKey === '__type' || zoneSettingKey === '__value') continue;
                const zoneSettingData = data.zoneSettings[zoneSettingKey];
                if (helperInstance.isNulled(zoneSettingData)) continue;

                transformedZoneSettings[zoneSettingKey] = {
                    "$type": "ZonePropertiesSettingsObjectiveReward",
                    "mapId": helperInstance.formatLevelName(zoneSettingData.mapId) || "",
                    "props": zoneTransformerInstance.transformRewardProps(zoneSettingData),
                    "zoneId": zoneSettingData.zoneId || ""
                }
            }
        }

        if (data.zoneSettingsToRemove && typeof data.zoneSettingsToRemove === 'object') {
            for (const removeKey in data.zoneSettingsToRemove) {
                if (removeKey === '__type' || removeKey === '__value') continue;
                const removeData = data.zoneSettingsToRemove[removeKey]
                if (helperInstance.isNulled(removeData)) continue

                transformedZoneSettingsToRemove[removeKey] = {
                    "$type": "ZonePropertiesSettingsObjectiveReward",
                    "mapId": helperInstance.formatLevelName(removeData.mapId) || "",
                    "props": zoneTransformerInstance.transformRewardProps(removeData),
                    "zoneId": removeData.zoneId || ""
                }
            }
        }

        if (data.zoneSettingsToRemove2 && typeof data.zoneSettingsToRemove2 === 'object') {
            for (const removeKey in data.zoneSettingsToRemove2) {
                if (removeKey === '__type' || removeKey === '__value') continue;
                const removeData = data.zoneSettingsToRemove2[removeKey]
                if (helperInstance.isNulled(removeData)) continue;

                const rawPropTypes = removeData.propTypes;
                const propTypesArray = (Array.isArray(rawPropTypes) ? rawPropTypes : (rawPropTypes ? [rawPropTypes] : []))
                    .map(pt => modPropTypes(pt));

                transformedZoneSettingsToRemove2[removeKey] = {
                    "$type": "ZonePropertiesToRemoveSettings",
                    "globalZoneId": {
                        "$type": "ZoneGlobalIdentificator",
                        "globalZoneId": helperInstance.formatGlobalZoneId(removeData.globalZoneId?.globalZoneId) || ""
                    },
                    "propTypes": propTypesArray
                }
            }
        }
        const result = {
            "$type": "ObjectiveRewardUpdateZoneProperties"
        }

        if (Object.keys(transformedZoneSettings).length > 0) result.zoneSettings = transformedZoneSettings
        if (Object.keys(transformedZoneSettingsToRemove).length > 0) result.zoneSettingsToRemove = transformedZoneSettingsToRemove
        if (Object.keys(transformedZoneSettingsToRemove2).length > 0) result.zoneSettingsToRemove2 = transformedZoneSettingsToRemove2

        return result
    }
    handleUpgradeGarage(key, data) {
        if (!data || helperInstance.isNulled(data)) return
        return {
            "$type": "ObjectiveRewardsUpgradeGarage",
            "feature": modGarageFeatures(data.feature),
            "zone": helperInstance.formatGlobalZoneId(data.zone)
        }
    }
    transformRewards(rawSrcRewards, path) {
        if (helperInstance.isNulled(rawSrcRewards)) return {}

        const tracker = helperInstance.createTracker(rawSrcRewards, path || "Rewards");
        const srcRewards = tracker.proxy;
        const result = {}

        for (const key in srcRewards) {
            if (key === '__type' || key === '__value') continue;
            const matchedHandlerName = Object.keys(this.rewardHandlers).find(handlerName => key.startsWith(handlerName))

            if (!matchedHandlerName && key !== "ObjectiveRewardExperience" && key !== "ObjectiveRewardMoney") {
                continue;
            }

            if (matchedHandlerName) {
                const handler = this.rewardHandlers[matchedHandlerName].bind(this)
                const rewardData = srcRewards[key]
                const handlerResult = handler(key, rewardData)
                if (handlerResult) result[key] = handlerResult
            }
        }
        if (srcRewards.ObjectiveRewardExperience && !helperInstance.isNulled(srcRewards.ObjectiveRewardExperience) && !result.ObjectiveRewardExperience) {
            result.ObjectiveRewardExperience = {
                "$type": "ObjectiveRewardExperience",
                "amount": helperInstance.toNum(srcRewards.ObjectiveRewardExperience.amount, 0)
            };
        }
        if (srcRewards.ObjectiveRewardMoney && !helperInstance.isNulled(srcRewards.ObjectiveRewardMoney) && !result.ObjectiveRewardMoney) {
            result.ObjectiveRewardMoney = {
                "$type": "ObjectiveRewardMoney",
                "amount": helperInstance.toNum(srcRewards.ObjectiveRewardMoney.amount, 0)
            };
        }

        tracker.check();
        return result
    }
}

export class StageTransformer {
    formatManualSettings(manualSettings) {
        return helperInstance.isNulled(manualSettings) ? null : {
            "$type": "CargoManualUnloadingSettings",
            "interactionZoneId": manualSettings.interactionZoneId ? helperInstance.transformZoneId(manualSettings.interactionZoneId) : null,
            "isAutoLoadAllowed": Boolean(manualSettings.isAutoLoadAllowed ?? false),
            "isVisible": Boolean(manualSettings.isVisible ?? true),
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
            "zoneToFill": Array.isArray(src.zoneToFill)
                ? src.zoneToFill.map((t, i) => this.transformZoneToFill(t, `${path} -> zoneToFill[${i}]`)).filter(Boolean)
                : []
        }

        tracker.check();
        return result;
    }

    transformZoneToFill(rawSrcZone, path) {
        if (helperInstance.isNulled(rawSrcZone)) return null;

        const tracker = helperInstance.createTracker(rawSrcZone, path);
        const srcZone = tracker.proxy;

        const result = {
            "$type": "CargoUnloadingZoneSettings",
            "additionalUnloadZones": Array.isArray(srcZone.additionalUnloadZones)
                ? srcZone.additionalUnloadZones.filter(Boolean)
                : [],
            "cargo": srcZone.cargo ? this.transformCargoPack(srcZone.cargo, path) : null,
            "globalZoneId": srcZone.globalZoneId ? helperInstance.transformZoneId(srcZone.globalZoneId) : null,
            "manualSettings": srcZone.manualSettings ? this.formatManualSettings(srcZone.manualSettings) : null,
            "model": srcZone.model ? this.transformModel(srcZone.model) : null,
            "truckUid": srcZone.truckUid || "",
            "uiDesc": srcZone.uiDesc || ""
        }

        tracker.check();
        return result;
    }

    transformModel(srcModel) {
        if (helperInstance.isNulled(srcModel)) return null;

        const stagesProgress = {};
        if (srcModel.stagesProgress) {
            for (const key in srcModel.stagesProgress) {
                if (key === '__type' || key === '__value') continue;
                const value = srcModel.stagesProgress[key];
                stagesProgress[key] = helperInstance.toNum(value, 0);
            }
        }

        const model = {
            "$type": "ModelBuildingSettings",
            "levelName": helperInstance.formatLevelName(srcModel.levelName),
            "modelTag": srcModel.modelTag || "",
            "modelType": srcModel.modelType ? modModelType(srcModel.modelType) : 0,
            "unloadBlockedZoneId": srcModel.unloadBlockedZoneId ? helperInstance.transformZoneId(srcModel.unloadBlockedZoneId) : null,
            "stagesProgress": stagesProgress,
        };

        if (srcModel.objectiveSequenceIdx !== undefined && !helperInstance.isNulled(srcModel.objectiveSequenceIdx)) {
            model.objectiveSequenceIdx = helperInstance.toNum(srcModel.objectiveSequenceIdx, 0);
        }
        return model;
    }

    transformVisitAllZones(rawSrcVisit, path) {
        if (helperInstance.isNulled(rawSrcVisit) || !rawSrcVisit.zones || rawSrcVisit.zones.length === 0) return null;

        const tracker = helperInstance.createTracker(rawSrcVisit, path);
        const srcVisit = tracker.proxy;

        const result = {
            "$type": "VisitAllZonesSettings",
            "zones": Array.isArray(srcVisit.zones) ? srcVisit.zones.map(z => ({
                "$type": "TaskSettingVisitZone",
                "globalZoneId": helperInstance.transformZoneId(z.globalZoneId),
                ...(z.hideZone !== undefined && !helperInstance.isNulled(z.hideZone) && { "hideZone": Boolean(z.hideZone) }),
                "truckUid": z.truckUid || "",
                "uiDesc": z.uiDesc || ""
            })) : []
        }

        tracker.check();
        return result;
    }

    transformCargoPack(srcCargo, path = "") {
        return helperInstance.isNulled(srcCargo)
            ? null
            : {
                "$type": "CargoPack",
                "count": helperInstance.toNum(srcCargo.count, 1),
                "name": normalizeCargoName(srcCargo.name, path)
            };
    }

    resolveModSafeAfterStage(rawAfterStage, path = "") {
        const val = modAfterStageFinished(rawAfterStage);
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
            "additionalDeliveryZones": Array.isArray(srcDelivery.additionalDeliveryZones) ? srcDelivery.additionalDeliveryZones.filter(Boolean) : [],
            "afterStageFinished": this.resolveModSafeAfterStage(srcDelivery.afterStageFinished, path),
            "globalZoneDeliveryId": srcDelivery.globalZoneDeliveryId ? helperInstance.transformZoneId(srcDelivery.globalZoneDeliveryId) : null,
            "isListeningTruckOnly": Boolean(srcDelivery.isListeningTruckOnly ?? false),
            "mustDestroyAfterSubstage": Boolean(srcDelivery.mustDestroyAfterSubstage ?? false),
            "truckId": srcDelivery.truckId || "",
            "truckUiName": srcDelivery.truckUiName || "",
            "uiDesc": srcDelivery.uiDesc || ""
        };
        if (srcDelivery.globalZoneSpawnId && !helperInstance.isNulled(srcDelivery.globalZoneSpawnId)) {
            const gz = helperInstance.transformZoneId(srcDelivery.globalZoneSpawnId);
            if (gz) truckDelivery.globalZoneSpawnId = gz;
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
            "cargos": Array.isArray(srcSpawn.cargos) ? srcSpawn.cargos.map(c => ({
                "$type": "ObjectiveCargoSettings",
                "count": helperInstance.toNum(c.count, 1),
                "name": normalizeCargoName(c.name, path)
            })) : [],
            "ignoreHidingCargoWhenNotTracked": Boolean(srcSpawn.ignoreHidingCargoWhenNotTracked ?? false),
            "needToBeDiscoveredByMetallodetector": Boolean(srcSpawn.needToBeDiscoveredByMetallodetector ?? false),
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
            "hideStageFromUi": Boolean(srcFarming.hideStageFromUi ?? false),
            "model": srcFarming.model ? this.transformModel(srcFarming.model) : null,
            "neededState": modNeededStateFarm(srcFarming.neededState),
            "requiredTrailer": modRequiredTrailerFarm(srcFarming.requiredTrailer),
            "tolerance": helperInstance.toNum(srcFarming.tolerance, 0),
            "uiDesc": srcFarming.uiDesc || ""
        }

        tracker.check();
        return result;
    }

    transformRepairTruck(rawSrcRepair, path) {
        if (helperInstance.isNulled(rawSrcRepair)) return null;

        const tracker = helperInstance.createTracker(rawSrcRepair, path);
        const srcRepair = tracker.proxy;

        const repairTruckMap = {
            "$type": "TruckRepairSettings",
            "afterStageFinished": this.resolveModSafeAfterStage(srcRepair.afterStageFinished, path),
            "mustDestroyAfterSubstage": Boolean(srcRepair.mustDestroyAfterSubstage ?? false),
            "truckId": srcRepair.truckId || "",
            "truckUiName": srcRepair.truckUiName || "",
            "uiDesc": srcRepair.uiDesc || ""
        }
        if (srcRepair.globalZoneSpawnId && !helperInstance.isNulled(srcRepair.globalZoneSpawnId)) {
            const gz = helperInstance.transformZoneId(srcRepair.globalZoneSpawnId);
            if (gz) repairTruckMap.globalZoneSpawnId = gz;
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
            "afterStageFinished": this.resolveModSafeAfterStage(srcTruck.afterStageFinished, path),
            "mustDestroyAfterSubstage": Boolean(srcTruck.mustDestroyAfterSubstage ?? false),
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
            "livingAreaValue": helperInstance.toNum(areaInfo.livingAreaValue, 0)
        }
    }

    transformStage(rawSrcStage, path) {
        if (helperInstance.isNulled(rawSrcStage)) return null;

        const tracker = helperInstance.createTracker(rawSrcStage, path);
        const srcStage = tracker.proxy;

        void srcStage.unloadBlockedZoneId;
        void srcStage.unloadBlockedZoneIdList;

        const result = {
            "$type": "ObjectiveStage",
            "actions": srcStage.actions ? this.transformActions(srcStage.actions, `${path} -> actions`) : null,
            "changeTruck": srcStage.changeTruck ? this.transformChangeTruck(srcStage.changeTruck, `${path} -> changeTruck`) : null,
            "farmingInfo": srcStage.farmingInfo ? this.transformFarmingInfo(srcStage.farmingInfo, `${path} -> farmingInfo`) : null,
            "isForceSearchCargoOnMap": Boolean(srcStage.isForceSearchCargoOnMap ?? false),
            "livingAreaInfo": srcStage.livingAreaInfo ? this.transformLivingAreaInfo(srcStage.livingAreaInfo) : null,
            "makeActionInZone": srcStage.makeActionInZone ? this.transformVisitAllZones(srcStage.makeActionInZone, `${path} -> makeActionInZone`) : null,
            "model": srcStage.model ? this.transformModel(srcStage.model) : null,
            "needToStartTimer": Boolean(srcStage.needToStartTimer ?? false),
            "repairTruck": Array.isArray(srcStage.repairTruck)
                ? srcStage.repairTruck.map((t, i) => this.transformRepairTruck(t, `${path} -> repairTruck[${i}]`)).filter(Boolean)
                : [],
            "spawnCargoOnStageActive": Array.isArray(srcStage.spawnCargoOnStageActive)
                ? srcStage.spawnCargoOnStageActive.map((t, i) => this.transformSpawnCargo(t, `${path} -> spawnCargoOnStageActive[${i}]`)).filter(Boolean)
                : [],
            "truckDelivery": Array.isArray(srcStage.truckDelivery)
                ? srcStage.truckDelivery.map((t, i) => this.transformTruckDelivery(t, `${path} -> truckDelivery[${i}]`)).filter(Boolean)
                : [],
            "restartBlockedZoneIds": Array.isArray(srcStage.restartBlockedZoneIds)
                ? srcStage.restartBlockedZoneIds.map(zone => helperInstance.transformZoneId(zone)).filter(Boolean)
                : [],
            "uiDesc": (srcStage.uiDesc !== null && srcStage.uiDesc !== undefined && typeof srcStage.uiDesc === 'string')
                ? srcStage.uiDesc
                : "oldUIDescdeprecated",
            "visitAllZones": srcStage.visitAllZones ? this.transformVisitAllZones(srcStage.visitAllZones, `${path} -> visitAllZones`) : null,
        }

        tracker.check();
        return result;
    }
}

export class TaskTransformer {
    constructor(stageTransformer, rewardsController) {
        this.rewardsController = rewardsController
        this.stageTransformer = stageTransformer
    }

    transformTask(rawSrc, name, isContract = false) {
        if (helperInstance.isNulled(rawSrc)) return null;

        const basePath = `[${isContract ? 'Contract' : 'Task'}: ${name}]`;
        const tracker = helperInstance.createTracker(rawSrc, basePath);
        const src = tracker.proxy;

        const result = {
            "$type": "TaskSettings",
            ...isContract && { "$type": "ContractSettings" },
            "FreezeTrailer": src.FreezeTrailer ? helperInstance.transformFreezeTrailer(src.FreezeTrailer) : null,
            ...!isContract && { "additionalTaskGivers": Array.isArray(src.additionalTaskGivers) ? src.additionalTaskGivers.filter(Boolean) : [] },
            "blockerMap": src.blockerMap ? helperInstance.formatLevelName(src.blockerMap) : "",
            "blockerObjectives": Array.isArray(src.blockerObjectives) ? src.blockerObjectives.filter(Boolean) : [],
            ...isContract && { "contractMap": src.contractMap ? helperInstance.formatLevelName(src.contractMap) : "" },
            "customMessage": src.customMessage || "",
            "description": src.description || "",
            ...isContract && {
                "employer": src.employer || "Husky",
                "failReasons": (src.failReasons && !helperInstance.isNulled(src.failReasons)) ? src.failReasons : {}
            },
            "forcedDaytime": src.forcedDaytime && !helperInstance.isNulled(src.forcedDaytime) ? {
                "$type": "ForcedDaytimeSettings",
                "daytime": src.forcedDaytime.daytime || "",
                "level": helperInstance.formatLevelName(src.forcedDaytime.level) || ""
            } : null,
            "isCoop": Boolean(src.isCoop ?? false),
            "isForTutorial": Boolean(src.isForTutorial ?? false),
            "isMarkersDisabled": Boolean(src.isMarkersDisabled ?? false),
            "isNeedRaceMusic": Boolean(src.isNeedRaceMusic ?? false),
            "isRepeatable": Boolean(src.isRepeatable ?? false),
            "isSilentReward": Boolean(src.isSilentReward ?? false),
            "jingleSett": src.jingleSett ? helperInstance.modJingleSett(src.jingleSett) : null,
            "minimapList": modMinimapList(src.minimapList),
            "model": src.model ? this.stageTransformer.transformModel(src.model) : null,
            "name": name,
            "recommendedTruck": modRecommendedTruck(src.recommendedTruck),
            ...isContract && { "region": src.region || "no_region" },
            "requiredRank": helperInstance.toNum(src.requiredRank, 0),
            "rewards": src.rewards ? this.rewardsController.transformRewards(src.rewards, `${basePath} -> rewards`) : {},
            "stages": Array.isArray(src.stages)
                ? src.stages.map((stage, idx) => this.stageTransformer.transformStage(stage, `${basePath} -> stages[${idx}]`)).filter(Boolean)
                : [],
            "truckDeliveryBlockedZoneId": src.truckDeliveryBlockedZoneId ? helperInstance.transformZoneId(src.truckDeliveryBlockedZoneId) : null,
            ...!isContract && { "taskGiverZone": src.taskGiverZone ? helperInstance.transformZoneId(src.taskGiverZone) : null },
            "trucksWithoutForceGrounding": Array.isArray(src.trucksWithoutForceGrounding) ? src.trucksWithoutForceGrounding.filter(Boolean) : [],
            "uiDesc": src.uiDesc || "",
            "unloadBlockedZoneId": src.unloadBlockedZoneId ? helperInstance.transformZoneId(src.unloadBlockedZoneId) : null,
            ...(src.unloadBlockedZoneIdList !== undefined && !helperInstance.isNulled(src.unloadBlockedZoneIdList) && {
                "unloadBlockedZoneIdList": Array.isArray(src.unloadBlockedZoneIdList)
                    ? src.unloadBlockedZoneIdList.map(zone => helperInstance.transformZoneId(zone)).filter(Boolean)
                    : []
            }),
            "restartBlockedZoneIds": Array.isArray(src.restartBlockedZoneIds)
                ? src.restartBlockedZoneIds.map(zone => helperInstance.transformZoneId(zone)).filter(Boolean)
                : []
        }

        tracker.check();
        return result;
    }
}

export const rewardsController = new RewardsController()
export const stageTransformerInstance = new StageTransformer()
const rewardsControllerInstance = new RewardsController()
export const taskTransformer = new TaskTransformer(stageTransformerInstance, rewardsControllerInstance)