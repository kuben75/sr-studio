export function modAfterStageFinished(afterStageFinished) {
    const map = {
        "REWARD": 0,
        "DETACH": 1,
        "DESTROY": 2,
        "DO_NOTHING": 3
    }
    return map[afterStageFinished] === undefined ? 3 : map[afterStageFinished]
}
export function modRecommendedTruck(recommendedTruck) {
    if (!recommendedTruck) return 0
    const map = {
        "NONE": 0,
        "CRANE": 1,
        "OFFROAD": 2,
        "SCOUT": 3,
        "SEISMIC": 4,
        "METAL_DETECTOR": 5,
        "LOGS": 6,
        "FARMING_EQUIPMENT": 7,
        "KIROVETS_MANIPULATOR": 8
    }
    return map[recommendedTruck] || 0
}
export function modMinimapList(minimapList) {
    if(!minimapList) return 0
    const map = {
        "DEFAULT": 0,
        "TINY": 1
    }
    return map[minimapList] || 0
}
export function modNeededStateFarm(neededState) {
    if (!neededState) return 0
    const map = {
        "FIELD_STATE_DEFAULT": 0,
        "FIELD_STATE_PLOWED": 1,
        "FIELD_STATE_SOWN": 2,
        "FIELD_STATE_SOWN_GROWN": 3,
        "FIELD_STATE_COMPLETE": 4,
        "FIELD_STATE_COMPLETE_GROWN": 5
    }
    return map[neededState] || 0
}
export function modRequiredTrailerFarm(requiredTrailer) {
    if (!requiredTrailer) return 0
    const map = {
        "None": 0,
        "Cultivator": 1,
        "Planter": 2,
        "Harvester": 3
    }
    return map[requiredTrailer] || 0
}
export function modModelType(modelType) {
    if(!modelType) return 0
    const map = {
        "COMMON": 0,
        "WOOD": 1,
        "BRICK": 2,
        "METAL": 3,
        "LOG": 4
    }
    return map[modelType] || 0
}
export function modWaterStationType(stationType) {
    if(!stationType) return 0
    const map = {
        "PICK_UP": 0,
        "TRANSIT": 1,
        "DROP": 2
    }
    return map[stationType] || 0
}
export function modPropTypes(propType) {
    if(!propType) return 0
    const map = {
        "UNDEFINED": 0,
        "CARGO_LOADING": 1,
        "CARGO_UNLOADING": 2,
        "TRUCK_CARGO_SPAWNER": 3,
        "GARAGE_ENTRANCE": 4,
        "GARAGE_EXIT": 5,
        "TASK_GIVER": 6,
        "GATEWAY": 7,
        "UPGRADES_GIVER": 8,
        "UPGRADE_STATION": 9,
        "TRAILER_ATTACH": 10,
        "WATCHPOINT": 11,
        "OBJECTIVE_TRUCK_DELIVERY": 12,
        "ZONE_TO_VISIT": 13,
        "FUEL_STATION": 14,
        "MANUAL_LOADING": 15,
        "AUTO_RESTORE": 16,
        "ZONE_TO_FIND": 17,
        "ZONE_TO_RESEACH": 18,
        "ZONE_TO_RESEARCH": 18,
        "RECOVERY": 19,
        "STOREHOUSE_CRAFT": 20,
        "LIVING_AREA": 21,
        "CARGO_UNLOADING_PLATFORM": 22,
        "GATEWAY_OUT": 23,
        "GATEWAY_OUT_WINCH": 24,
        "ENERGY": 25,
        "RESUPPLY_REPAIR": 26,
        "CARGO_UNLOADING_BLOCKER": 27,
        "AUTO_REFUEL": 28,
        "COOP_TASK_GIVER": 29,
        "WATER_STATION": 30,
    }
    return map[propType] || 0
}
export function modGarageFeatures(garageFeatures) {
    if (!garageFeatures) return 0;
    const map = {
        "SLOTS": 0,
        "CUSTOMIZATION": 1,
        "STORE": 2,
        "REPAIR": 3
    }
    return map[garageFeatures] || 0
}
export function modFreezeTrailers(freezeTrailers) {
    if (!freezeTrailers) return 0;
    const map = {
        "FREEZE": 0,
        "UNFREEZE": 1,
    }
    return map[freezeTrailers] || 0
}

export function modRestrictionList(restrictionList) {
    if(!restrictionList) return 0;
    const map = {
        "NO_GARAGE_ACCESS": 0,
        "NO_REPAIR": 1,
        "NO_REFUEL": 0
    }
    return map[restrictionList] === undefined ? 0 : map[restrictionList];
}