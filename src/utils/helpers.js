// src/utils/helpers.js
import { modFreezeTrailers } from "./stringToNumber.js";

class Helper {
    constructor() {
        this.onlyTypeProps = [
            "ZonePropertyManualLoading",
            "ZonePropertyTrailerAttach",
            "ZonePropertyAutoRepairAndRestore",
            "ZonePropertyGarageExit",
            "ZonePropertyEnergy",
            "ZonePropertyAutoRefuel",
            "ZonePropertyGatewayOut",
            "ZonePropertyFarmingArea",
            "ZonePropertyObjectiveZoneToVisit"
        ];
        this.nullCounter = 0;
        this.warnings = [];
        this.diagnostics = [];
    }

    clearWarnings() {
        this.warnings = [];
        this.diagnostics = [];
    }

    addDiagnostic(level, tag, message) {
        this.diagnostics.push({ level, tag, message });
    }

    createTracker(src, contextName) {
        if (!src || typeof src !== 'object' || Array.isArray(src) || this.isNulled(src)) {
            return { proxy: src, check: () => {} };
        }

        const unusedKeys = new Set(Object.keys(src).filter(k => k !== '__type' && k !== '__value'));

        const proxy = new Proxy(src, {
            get(t, p) {
                unusedKeys.delete(p);
                return t[p];
            }
        });

        const check = () => {
            if (unusedKeys.size > 0) {
                const keysList = Array.from(unusedKeys).join(', ');
                const warningMsg = `[${contextName}]: Zignorowano nieznane pole -> ${keysList}`;
                console.warn(warningMsg);
                this.warnings.push(warningMsg);
            }
        };
        return { proxy, check };
    }

    isNulled(v) {
        const isNull = Boolean(v && v.__type === "null");
        if (isNull) {
            this.nullCounter++;
        }
        return isNull;
    }

    getNullCount() {
        return this.nullCounter;
    }

    resetNullCount() {
        this.nullCounter = 0;
    }

    formatLevelName(levelName) {
        if (!levelName) return "";
        return "~#@%$`*" + levelName + "~#@%$`*";
    }

    formatGlobalZoneId(zoneId) {
        if (!zoneId) return "";
        if (zoneId.includes('||')) {
            const parts = zoneId.split('||');
            const level = parts[0].trim();
            const zone = parts[1].trim();
            return `${this.formatLevelName(level)} || ${zone}`;
        }
        return zoneId;
    }

    modJingleSett(jingleSett) {
        return this.isNulled(jingleSett) ? null : {
            "$type": "ObjectiveJingleSettings",
            "overrideJingleName": jingleSett.overrideJingleName || "",
            "playJingleWithCinematic": jingleSett.playJingleWithCinematic || false
        };
    }

    transformZoneId(srcZoneId) {
        if (!srcZoneId || this.isNulled(srcZoneId) || !srcZoneId.globalZoneId)
            return null;

        return {
            "$type": "ZoneGlobalIdentificator",
            "globalZoneId": this.formatGlobalZoneId(srcZoneId.globalZoneId)
        };
    }

    modPlatformOverride(platformColorOverride) {
        return this.isNulled(platformColorOverride) ? null : {
            "$type": "Color",
            "a": platformColorOverride.a || 0,
            "b": platformColorOverride.b || 0,
            "g": platformColorOverride.g || 0,
            "r": platformColorOverride.r || 0
        };
    }

    transformFreezeTrailer(freezeTrailer) {
        return this.isNulled(freezeTrailer) ? null : {
            "$type": "TrailerFreezeSettings",
            "animationId": freezeTrailer.animationId || "",
            "trailerId": freezeTrailer.trailerId || "",
            "type": modFreezeTrailers(freezeTrailer.type) || 0
        };
    }
}

export const helperInstance = new Helper();