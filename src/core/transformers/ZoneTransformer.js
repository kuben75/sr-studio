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
        return {
            "$type": "ZonePropertyUnloadingCargo",
            ...(prop.blockingZoneGlobalId !== undefined && { blockingZoneGlobalId: helperInstance.transformZoneId(prop.blockingZoneGlobalId) }),
        }
    }

    transformZonePropertyCargoLoading(prop) {
        return {
            "$type": "ZonePropertyCargoLoading",
            "cargosSettings": prop.cargosSettings ? prop.cargosSettings.map(cargoSetting => ({
                "count": -1,
                "name": normalizeCargoName(cargoSetting.name)
            })) : [],
            "modelBuildingSetting": prop.modelBuildingSetting ? stageTransformerInstance.transformModel(prop.modelBuildingSetting) : null,
            ...(prop.isHiddenArea !== undefined && { isHiddenArea: prop.isHiddenArea }),
            "platformId": prop.platformId || "",
        }
    }

    transformZonePropertyFuelStation(prop) {
        return {
            "$type": "ZonePropertyFuelStation",
            "pricePerLiter": prop.pricePerLiter || 0,
        }
    }

    transformZonePropertyGarageEntrance(prop) {
        const result = {
            "$type": "ZonePropertyGarageEntrance",
        };
        if (prop.initialState !== undefined) {
            const init = prop.initialState;

            if (helperInstance.isNulled(init)) return result;

            result.initialState = {
                "$type": "GarageFeaturesInitialState",
                "CUSTOMIZATION": Boolean(init.CUSTOMIZATION ?? init.customization ?? false),
                "REPAIR": Boolean(init.REPAIR ?? init.repair ?? false),
                "SLOTS": Boolean(init.SLOTS ?? init.slots ?? false),
                "STORE": Boolean(init.STORE ?? init.store ?? false),
            };
        }
        return result;
    }

    transformZonePropertyGateway(prop) {
        return {
            "$type": "ZonePropertyGateway",
            "animationTime": prop.animationTime || 8000,
            "cameraDir": {
                "$type": "Vector3d",
                "x": prop.cameraDir?.x || 0,
                "y": prop.cameraDir?.y || 0,
                "z": prop.cameraDir?.z || 0,
            },
            "cameraPos": {
                "$type": "Vector3d",
                "x": prop.cameraPos?.x || 0,
                "y": prop.cameraPos?.y || 0,
                "z": prop.cameraPos?.z || 0,
            },
            "extraZoneToPlaceTrucks": helperInstance.formatGlobalZoneId(prop.extraZoneToPlaceTrucks) || "",
            "extraZoneToPlaceWinch": helperInstance.formatGlobalZoneId(prop.extraZoneToPlaceWinch) || "",
            "levelZoneLink": helperInstance.formatGlobalZoneId(prop.levelZoneLink) || "",
            "startDelayTime": prop.startDelayTime || 3000,
        }
    }

    transformZonePropertyRecovery(prop) {
        return {
            "$type": "ZonePropertyRecovery",
            ...(prop.priority !== undefined && { priority: prop.priority })
        }
    }

    transformZonePropertyUpgradesGiver(prop) {
        return {
            "$type": "ZonePropertyUpgradesGiver",
            "upgrades": prop.upgrades || [],
        }
    }

    transformZonePropertyWatchpoint(prop) {
        return {
            "$type": "ZonePropertyWatchpoint",
            "animationTime": prop.animationTime || 8000,
            "cameraDirEnd": {
                "$type": "Vector3d",
                "x": prop.cameraDirEnd?.x || 0,
                "y": prop.cameraDirEnd?.y || 0,
                "z": prop.cameraDirEnd?.z || 0,
            },
            "cameraDirStart": {
                "$type": "Vector3d",
                "x": prop.cameraDirStart?.x || 0,
                "y": prop.cameraDirStart?.y || 0,
                "z": prop.cameraDirStart?.z || 0,
            },
            "cameraPosEnd": {
                "$type": "Vector3d",
                "x": prop.cameraPosEnd?.x || 0,
                "y": prop.cameraPosEnd?.y || 0,
                "z": prop.cameraPosEnd?.z || 0,
            },
            "cameraPosStart": {
                "$type": "Vector3d",
                "x": prop.cameraPosStart?.x || 0,
                "y": prop.cameraPosStart?.y || 0,
                "z": prop.cameraPosStart?.z || 0,
            },
            "finishDelayTime": prop.finishDelayTime || 500,
            "range": prop.range || 600,
        }
    }

    transformZonePropertyStorehouseCraft(prop) {
        const result = {
            "$type": "ZonePropertyStorehouseCraft",
            "craftSettings": prop.craftSettings ? prop.craftSettings.map(craft => ({
                "cargoComponents": craft.cargoComponents ? craft.cargoComponents.map(c => ({
                    "count": c.count || 1,
                    "name": normalizeCargoName(c.name)
                })) : [],
                "craftCount": craft.craftCount || 1,
                "energy": craft.energy || 0,
                "name": normalizeCargoName(craft.name),
            })) : [],
            "platformId": prop.platformId || "",
        }
        if (prop.energyZoneId !== undefined) {
            result.energyZoneId = helperInstance.transformZoneId(prop.energyZoneId)
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
            ...(prop.repairPartPrice !== undefined && { repairPartPrice: prop.repairPartPrice }),
            ...(prop.repairWheelPrice !== undefined && { repairWheelPrice: prop.repairWheelPrice })
        }
    }

    transformZonePropertyWaterStation(prop) {
        return {
            "$type": "ZonePropertyWaterStation",
            "isWaterDeliveryObjectiveZone": prop.isWaterDeliveryObjectiveZone ?? false,
            ...(prop.sharedZones !== undefined && { sharedZones: prop.sharedZones.map(z => helperInstance.transformZoneId(z)) }),
            "stationType": modWaterStationType(prop.stationType),
            "stationUIName": prop.stationUIName || "",
            ...(prop.water !== undefined && { water: prop.water }),
            ...(prop.waterCapacity !== undefined && { waterCapacity: prop.waterCapacity })
        }
    }

    transformZonePropertyCargoLoadingAlwaysVisible(prop) {
        return {
            "$type": "ZonePropertyCargoLoadingAlwaysVisible",
            "cargosSettings": prop.cargosSettings ? prop.cargosSettings.map(c => ({
                "count": -1,
                "name": normalizeCargoName(c.name)
            })) : [],
        }
    }

    transformPropsObject(src) {
        if (helperInstance.isNulled(src)) return
        const transformedProps = {}

        if (src.props) {
            for (const propName in src.props) {
                if (this.propertyTransformers[propName]) {
                    const transformerFunc = this.propertyTransformers[propName]
                    const rawPropData = src.props[propName]

                    const tracker = helperInstance.createTracker(rawPropData, `Właściwość: ${propName}`);
                    transformedProps[propName] = transformerFunc(tracker.proxy)
                    tracker.check()
                } else {
                    console.warn(`Nieznany typ właściwości strefy (zapisano jako $type): ${propName}`);
                    transformedProps[propName] = { "$type": propName };
                }
            }
        }
        return transformedProps
    }

    transformRewardProps(src) {
        if (helperInstance.isNulled(src)) return
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
            "cargoRequirements": prop.cargoRequirements ? prop.cargoRequirements.map(c => ({
                "count": c.count || 0,
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
        if (helperInstance.isNulled(prop)) return null

        return {
            "$type": "ZonePropertyMiniObjectiveVisitAllZones",
            "modelBuildingSettings": prop.modelBuildingSettings ? stageTransformerInstance.transformModel(prop.modelBuildingSettings) : null,
            "rewards": prop.rewards ? rewardsController.transformRewards(prop.rewards) : {},
            "visitAllZones": prop.visitAllZones ? stageTransformerInstance.transformVisitAllZones(prop.visitAllZones) : null
        }
    }
}

export const zoneTransformerInstance = new ZoneTransformer()