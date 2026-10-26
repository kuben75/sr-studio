// src/utils/helpers.js
import { modFreezeTrailers } from "./stringToNumber.js";

class Helper {
    constructor() {
        // Dokładnie 8 oryginalnych właściwości (bez ZonePropertyObjectiveZoneToVisit, które w JSON ma dawać puste props: {})
        this.onlyTypeProps = [
            "ZonePropertyManualLoading",
            "ZonePropertyTrailerAttach",
            "ZonePropertyAutoRepairAndRestore",
            "ZonePropertyGarageExit",
            "ZonePropertyEnergy",
            "ZonePropertyAutoRefuel",
            "ZonePropertyGatewayOut",
            "ZonePropertyFarmingArea"
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

    /**
     * Bezpieczna konwersja liczb z initial.cache_block (gdzie wartość 0 bywa zapisana jako puste {})
     */
    toNum(v, fallback = 0) {
        if (typeof v === 'number' && !Number.isNaN(v)) return v;
        if (typeof v === 'object' && v !== null) {
            if (typeof v.__value === 'number') return v.__value;
            return fallback;
        }
        if (v === undefined || v === null || v === '') return fallback;
        const n = Number(v);
        return Number.isNaN(n) ? fallback : n;
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
                const warningMsg = `[${contextName}]: Zignorowano -> ${keysList}`;
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
        if (!levelName || typeof levelName !== 'string') return "";
        const clean = levelName.replace(/~#@%\$`\*/g, '').trim();
        if (!clean) return "";
        return "~#@%$`*" + clean + "~#@%$`*";
    }

    formatGlobalZoneId(zoneId) {
        if (!zoneId || typeof zoneId !== 'string') return "";
        if (zoneId.includes('||')) {
            const parts = zoneId.split('||');
            const level = parts[0].trim();
            const zone = parts[1].trim();
            return `${this.formatLevelName(level)} || ${zone}`;
        }
        return zoneId;
    }

    modJingleSett(jingleSett) {
        return (!jingleSett || this.isNulled(jingleSett)) ? null : {
            "$type": "ObjectiveJingleSettings",
            "overrideJingleName": jingleSett.overrideJingleName || "",
            "playJingleWithCinematic": Boolean(jingleSett.playJingleWithCinematic)
        };
    }

    transformZoneId(srcZoneId) {
        if (!srcZoneId || this.isNulled(srcZoneId) || !srcZoneId.globalZoneId) {
            return null;
        }
        return {
            "$type": "ZoneGlobalIdentificator",
            "globalZoneId": this.formatGlobalZoneId(srcZoneId.globalZoneId)
        };
    }

    modPlatformOverride(platformColorOverride) {
        return (!platformColorOverride || this.isNulled(platformColorOverride)) ? null : {
            "$type": "Color",
            "a": this.toNum(platformColorOverride.a, 0),
            "b": this.toNum(platformColorOverride.b, 0),
            "g": this.toNum(platformColorOverride.g, 0),
            "r": this.toNum(platformColorOverride.r, 0)
        };
    }

    transformFreezeTrailer(freezeTrailer) {
        return (!freezeTrailer || this.isNulled(freezeTrailer)) ? null : {
            "$type": "TrailerFreezeSettings",
            "animationId": freezeTrailer.animationId || "",
            "trailerId": freezeTrailer.trailerId || "",
            "type": modFreezeTrailers(freezeTrailer.type) || 0
        };
    }
}

export const helperInstance = new Helper();