// src/core/transformers/ZoneTransformer.js
import { helperInstance } from '../../utils/helpers.js'
import { stageTransformerInstance, rewardsController, normalizeCargoName } from "./StageTransformer.js";
import { modWaterStationType } from "../../utils/stringToNumber.js";

class ZoneTransformer {
    constructor() {
        this.propertyTransformers = {
            ...Object.fromEntries(helperInstance.onlyTypeProps.map(name => [name, (prop) => this.transformZoneWithOnlyType(name, prop)])),
            "ZonePropertyCargoLoading": this.transformZonePropertyCargoLoading.bind(this),
            "ZonePropertyMiniObjectiveCargo": this.transformZonePropertyMiniObjectiveCargo.bind(this),
            "ZonePropertyFuelStation": this.transformZonePropertyFuelStation.bind(this),
            "ZonePropertyGarageEntrance": this.transformZonePropertyGarageEntrance.bind(this),
            "ZonePropertyGateway": this.transformZonePropertyGateway.bind(this),
            "ZonePropertyRecovery": this.transformZonePropertyRecovery.bind(this),
            "ZonePropertyUpgradesGiver": this.transformZonePropertyUpgradesGiver.bind(this),
            "ZonePropertyWatchpoint": this.transformZonePropertyWatchpoint.bind(this),
            "ZonePropertyStorehouseCraft": this.transformZonePropertyStorehouseCraft.bind(this),
            "ZonePropertyLivingArea": this.transformZonePropertyLivingArea.bind(this),
            "ZonePropertyResupplyRepairParts": this.transformZonePropertyResupplyRepairParts.bind(this),
            "ZonePropertyWaterStation": this.transformZonePropertyWaterStation.bind(this),
            "ZonePropertyCargoLoadingAlwaysVisible": this.transformZonePropertyCargoLoadingAlwaysVisible.bind(this),
            "ZonePropertyUnloadingCargo": this.transformZonePropertyUnloadingCargo.bind(this),
            "ZonePropertyMiniObjectiveVisitAllZones": this.transformZonePropertyMiniObjectiveVisitAllZones.bind(this)
        }
    }

    transformZoneWithOnlyType(type, prop) {
        return { "$type": type }
    }

    transformZonePropertyUnloadingCargo(prop) {
        const blocking = prop.blockingZoneGlobalId ? helperInstance.transformZoneId(prop.blockingZoneGlobalId) : undefined;
        return {
            "$type": "ZonePropertyUnloadingCargo",
            ...(blocking && { blockingZoneGlobalId: blocking }),
        }
    }

    transformZonePropertyCargoLoading(prop) {
        return {
            "$type": "ZonePropertyCargoLoading",
            "cargosSettings": Array.isArray(prop.cargosSettings) ? prop.cargosSettings.map(cargoSetting => ({
                "count": -1,
                "name": normalizeCargoName(cargoSetting.name)
            })) : [],
            "modelBuildingSetting": prop.modelBuildingSetting ? stageTransformerInstance.transformModel(prop.modelBuildingSetting) : null,
            ...(prop.isHiddenArea !== undefined && !helperInstance.isNulled(prop.isHiddenArea) && { isHiddenArea: Boolean(prop.isHiddenArea) }),
            "platformId": prop.platformId || "",
        }
    }

    transformZonePropertyFuelStation(prop) {
        return {
            "$type": "ZonePropertyFuelStation",
            "pricePerLiter": helperInstance.toNum(prop.pricePerLiter, 0),
        }
    }

    transformZonePropertyGarageEntrance(prop) {
        const result = {
            "$type": "ZonePropertyGarageEntrance",
        }
        if (prop.initialState !== undefined && !helperInstance.isNulled(prop.initialState)) {
            const init = prop.initialState;
            const resolveFlag = (val) => {
                if (typeof val === 'boolean') return val;
                if (val && typeof val === 'object') {
                    if (val.__type === 'null') return false;
                    if (typeof val.__value === 'boolean') return val.__value;
                    return false;
                }
                return false;
            };

            const rawCustom = init.CUSTOMIZATION !== undefined ? init.CUSTOMIZATION : init.customization;
            const rawRepair = init.REPAIR !== undefined ? init.REPAIR : init.repair;
            const rawSlots = init.SLOTS !== undefined ? init.SLOTS : init.slots;
            const rawStore = init.STORE !== undefined ? init.STORE : init.store;

            result.initialState = {
                "$type": "GarageFeaturesInitialState",
                "CUSTOMIZATION": resolveFlag(rawCustom),
                "REPAIR": resolveFlag(rawRepair),
                "SLOTS": resolveFlag(rawSlots),
                "STORE": resolveFlag(rawStore),
            }
        }
        return result
    }

    transformZonePropertyGateway(prop) {
        return {
            "$type": "ZonePropertyGateway",
            "animationTime": helperInstance.toNum(prop.animationTime, 8000),
            "cameraDir": {
                "$type": "Vector3d",
                "x": helperInstance.toNum(prop.cameraDir?.x, 0),
                "y": helperInstance.toNum(prop.cameraDir?.y, 0),
                "z": helperInstance.toNum(prop.cameraDir?.z, 0),
            },
            "cameraPos": {
                "$type": "Vector3d",
                "x": helperInstance.toNum(prop.cameraPos?.x, 0),
                "y": helperInstance.toNum(prop.cameraPos?.y, 0),
                "z": helperInstance.toNum(prop.cameraPos?.z, 0),
            },
            "extraZoneToPlaceTrucks": helperInstance.formatGlobalZoneId(prop.extraZoneToPlaceTrucks) || "",
            "extraZoneToPlaceWinch": helperInstance.formatGlobalZoneId(prop.extraZoneToPlaceWinch) || "",
            "levelZoneLink": helperInstance.formatGlobalZoneId(prop.levelZoneLink) || "",
            "startDelayTime": helperInstance.toNum(prop.startDelayTime, 3000),
        }
    }

    transformZonePropertyRecovery(prop) {
        return {
            "$type": "ZonePropertyRecovery",
            ...(prop.priority !== undefined && !helperInstance.isNulled(prop.priority) && { priority: helperInstance.toNum(prop.priority, 0) })
        }
    }

    transformZonePropertyUpgradesGiver(prop) {
        return {
            "$type": "ZonePropertyUpgradesGiver",
            "upgrades": Array.isArray(prop.upgrades) ? prop.upgrades : [],
        }
    }

    transformZonePropertyWatchpoint(prop) {
        return {
            "$type": "ZonePropertyWatchpoint",
            "animationTime": helperInstance.toNum(prop.animationTime, 8000),
            "cameraDirEnd": {
                "$type": "Vector3d",
                "x": helperInstance.toNum(prop.cameraDirEnd?.x, 0),
                "y": helperInstance.toNum(prop.cameraDirEnd?.y, 0),
                "z": helperInstance.toNum(prop.cameraDirEnd?.z, 0),
            },
            "cameraDirStart": {
                "$type": "Vector3d",
                "x": helperInstance.toNum(prop.cameraDirStart?.x, 0),
                "y": helperInstance.toNum(prop.cameraDirStart?.y, 0),
                "z": helperInstance.toNum(prop.cameraDirStart?.z, 0),
            },
            "cameraPosEnd": {
                "$type": "Vector3d",
                "x": helperInstance.toNum(prop.cameraPosEnd?.x, 0),
                "y": helperInstance.toNum(prop.cameraPosEnd?.y, 0),
                "z": helperInstance.toNum(prop.cameraPosEnd?.z, 0),
            },
            "cameraPosStart": {
                "$type": "Vector3d",
                "x": helperInstance.toNum(prop.cameraPosStart?.x, 0),
                "y": helperInstance.toNum(prop.cameraPosStart?.y, 0),
                "z": helperInstance.toNum(prop.cameraPosStart?.z, 0),
            },
            "finishDelayTime": helperInstance.toNum(prop.finishDelayTime, 500),
            "range": helperInstance.toNum(prop.range, 600),
        }
    }

    transformZonePropertyStorehouseCraft(prop) {
        const result = {
            "$type": "ZonePropertyStorehouseCraft",
            "craftSettings": Array.isArray(prop.craftSettings) ? prop.craftSettings.map(craft => ({
                "cargoComponents": Array.isArray(craft.cargoComponents) ? craft.cargoComponents.map(c => ({
                    "count": helperInstance.toNum(c.count, 1),
                    "name": normalizeCargoName(c.name)
                })) : [],
                "craftCount": helperInstance.toNum(craft.craftCount, 1),
                "energy": helperInstance.toNum(craft.energy, 0),
                "name": normalizeCargoName(craft.name),
            })) : [],
            "platformId": prop.platformId || "",
        }
        if (prop.energyZoneId !== undefined && !helperInstance.isNulled(prop.energyZoneId)) {
            const ez = helperInstance.transformZoneId(prop.energyZoneId);
            if (ez) result.energyZoneId = ez;
        }
        return result
    }

    transformZonePropertyLivingArea(prop) {
        return {
            "$type": "ZonePropertyLivingArea",
            "name": prop.name || "",
        }
    }

    transformZonePropertyResupplyRepairParts(prop) {
        return {
            "$type": "ZonePropertyResupplyRepairParts",
            ...(prop.repairPartPrice !== undefined && !helperInstance.isNulled(prop.repairPartPrice) && { repairPartPrice: helperInstance.toNum(prop.repairPartPrice, 0) }),
            ...(prop.repairWheelPrice !== undefined && !helperInstance.isNulled(prop.repairWheelPrice) && { repairWheelPrice: helperInstance.toNum(prop.repairWheelPrice, 0) })
        }
    }

    transformZonePropertyWaterStation(prop) {
        return {
            "$type": "ZonePropertyWaterStation",
            "isWaterDeliveryObjectiveZone": Boolean(prop.isWaterDeliveryObjectiveZone ?? false),
            ...(Array.isArray(prop.sharedZones) && { sharedZones: prop.sharedZones.map(z => helperInstance.transformZoneId(z)).filter(Boolean) }),
            "stationType": modWaterStationType(prop.stationType),
            "stationUIName": prop.stationUIName || "",
            ...(prop.water !== undefined && !helperInstance.isNulled(prop.water) && { water: helperInstance.toNum(prop.water, 0) }),
            ...(prop.waterCapacity !== undefined && !helperInstance.isNulled(prop.waterCapacity) && { waterCapacity: helperInstance.toNum(prop.waterCapacity, 0) })
        }
    }

    transformZonePropertyCargoLoadingAlwaysVisible(prop) {
        return {
            "$type": "ZonePropertyCargoLoadingAlwaysVisible",
            "cargosSettings": Array.isArray(prop.cargosSettings) ? prop.cargosSettings.map(c => ({
                "count": -1,
                "name": normalizeCargoName(c.name)
            })) : [],
        }
    }

    transformPropsObject(src) {
        if (helperInstance.isNulled(src)) return {}
        const transformedProps = {}

        if (src.props) {
            for (const propName in src.props) {
                if (propName === '__type' || propName === '__value') continue;

                if (propName === 'ZonePropertyObjectiveZoneToVisit') {
                    continue;
                }

                const rawPropData = src.props[propName]
                if (helperInstance.isNulled(rawPropData)) {
                    continue;
                }

                if (this.propertyTransformers[propName]) {
                    const transformerFunc = this.propertyTransformers[propName]
                    const tracker = helperInstance.createTracker(rawPropData, `Właściwość: ${propName}`);
                    const compiled = transformerFunc(tracker.proxy)
                    tracker.check()
                    if (compiled !== null && compiled !== undefined) {
                        transformedProps[propName] = compiled
                    }
                } else {
                    helperInstance.addDiagnostic('warn', 'UNKNOWN-ZONE-PROP', `Nieznany typ właściwości strefy: ${propName} (pominięto)`);
                }
            }
        }
        return transformedProps
    }

    transformRewardProps(src) {
        if (helperInstance.isNulled(src)) return {}
        return this.transformPropsObject(src)
    }

    transformZones(rawSrc, name) {
        if (helperInstance.isNulled(rawSrc)) return null

        const tracker = helperInstance.createTracker(rawSrc, `Strefa: ${name || "bez nazwy"}`);
        const src = tracker.proxy

        const result = {
            "$type": "ZoneSettings",
            "isForCoop": false,
            "name": name || "",
            "props": this.transformPropsObject(src),
        }
        tracker.check()
        return result
    }

    transformZonePropertyMiniObjectiveCargo(prop) {
        if (helperInstance.isNulled(prop)) return null;

        return {
            "$type": "ZonePropertyMiniObjectiveCargo",
            "cargoRequirements": Array.isArray(prop.cargoRequirements) ? prop.cargoRequirements.map(c => ({
                "count": helperInstance.toNum(c.count, 0),
                "name": normalizeCargoName(c.name)
            })) : [],
            "modelBuildingSettings": prop.modelBuildingSettings ? stageTransformerInstance.transformModel(prop.modelBuildingSettings) : null,
            "zoneColorOverride": prop.zoneColorOverride ? helperInstance.modPlatformOverride(prop.zoneColorOverride) : null,
            "rewards": prop.rewards ? rewardsController.transformRewards(prop.rewards) : {},
            "additionalUnloadZones": prop.additionalUnloadZones && Array.isArray(prop.additionalUnloadZones)
                ? prop.additionalUnloadZones.map(zone => {
                    return typeof zone === 'string'
                        ? helperInstance.transformZoneId({ globalZoneId: zone })
                        : helperInstance.transformZoneId(zone);
                }).filter(Boolean)
                : [],
            "unloadBlockedZoneId": prop.unloadBlockedZoneId ? helperInstance.transformZoneId(prop.unloadBlockedZoneId) : null
        }
    }

    transformZonePropertyMiniObjectiveVisitAllZones(prop) {
        if (helperInstance.isNulled(prop)) return null;
        void prop.rewards;

        return {
            "$type": "ZonePropertyMiniObjectiveVisitAllZones",
            "modelBuildingSettings": prop.modelBuildingSettings ? stageTransformerInstance.transformModel(prop.modelBuildingSettings) : null,
            "visitAllZones": prop.visitAllZones ? stageTransformerInstance.transformVisitAllZones(prop.visitAllZones) : null
        }
    }
}

export const zoneTransformerInstance = new ZoneTransformer()