// src/core/CacheBlockExtractor.js
import { SourceParser } from './Parser.js';

export class CacheBlockExtractor {
    constructor(rawText) {
        this.text = rawText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ');
    }

    extractBalancedBraces(startBraceIdx) {
        let level = 0;
        let inString = false;
        const len = this.text.length;

        for (let i = startBraceIdx; i < len; i++) {
            const ch = this.text[i];
            if (ch === '"' && this.text[i - 1] !== '\\') {
                inString = !inString;
            } else if (!inString) {
                if (ch === '{') level++;
                else if (ch === '}') {
                    level--;
                    if (level === 0) {
                        return {
                            body: this.text.substring(startBraceIdx + 1, i),
                            endIndex: i + 1
                        };
                    }
                }
            }
        }
        throw new Error('Brak zamykającego nawiasu } w initial.cache_block');
    }

    findAllNamedContainers(containerKey) {
        const regex = new RegExp(`\\b${containerKey}\\s*=\\s*\\{`, 'g');
        const blocks = [];
        let match;

        while ((match = regex.exec(this.text)) !== null) {
            const openBraceIdx = match.index + match[0].length - 1;
            const prefixContext = this.text.substring(Math.max(0, match.index - 220), match.index);
            const { body, endIndex } = this.extractBalancedBraces(openBraceIdx);
            blocks.push({ body, prefixContext });
            regex.lastIndex = endIndex;
        }
        return blocks;
    }

    extractInnerBlocks(containerBody) {
        const results = [];
        const startRegex = /\b([a-zA-Z0-9_]+)\s*=\s*\{/g;
        let currentIndex = 0;

        while (currentIndex < containerBody.length) {
            startRegex.lastIndex = currentIndex;
            const match = startRegex.exec(containerBody);
            if (!match) break;

            const blockName = match[1];
            const openBraceIdx = match.index + match[0].length - 1;

            let level = 0;
            let inString = false;
            let i = openBraceIdx;

            for (; i < containerBody.length; i++) {
                const ch = containerBody[i];
                if (ch === '"' && containerBody[i - 1] !== '\\') {
                    inString = !inString;
                } else if (!inString) {
                    if (ch === '{') level++;
                    else if (ch === '}') {
                        level--;
                        if (level === 0) break;
                    }
                }
            }

            const rawBlockText = `${blockName} = ${containerBody.substring(openBraceIdx, i + 1)}`;
            results.push({ name: blockName, rawText: rawBlockText });
            currentIndex = i + 1;
        }
        return results;
    }

    collectReferencedZonesFromRaw(rawText, targetSet) {
        const pipeRegex = /"\s*level_[a-z0-9_]+\s*\|\|\s*([A-Za-z0-9_]+)\s*"/gi;
        let m;
        while ((m = pipeRegex.exec(rawText)) !== null) {
            targetSet.add(m[1].trim());
        }

        const zoneIdRegex = /\bzoneId\s*=\s*"([A-Za-z0-9_]+)"/g;
        while ((m = zoneIdRegex.exec(rawText)) !== null) {
            targetSet.add(m[1].trim());
        }

        const listKeys = ['additionalTaskGivers', 'additionalUnloadZones', 'additionalDeliveryZones'];
        for (const key of listKeys) {
            const listRegex = new RegExp(`\\b${key}\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'g');
            while ((m = listRegex.exec(rawText)) !== null) {
                const strRegex = /"([A-Za-z0-9_]+)"/g;
                let sm;
                while ((sm = strRegex.exec(m[1])) !== null) {
                    targetSet.add(sm[1].trim());
                }
            }
        }
    }

    collectInfraLinkedZonesFromRaw(rawZoneText, targetSet) {
        const pipeRegex = /"\s*level_[a-z0-9_]+\s*\|\|\s*([A-Za-z0-9_]+)\s*"/gi;
        let m;
        while ((m = pipeRegex.exec(rawZoneText)) !== null) {
            targetSet.add(m[1].trim());
        }
        const platformRegex = /\bplatformId\s*=\s*"([A-Za-z0-9_]+)"/g;
        while ((m = platformRegex.exec(rawZoneText)) !== null) {
            targetSet.add(m[1].trim());
        }
    }

    hasInfrastructureProps(zoneObj) {
        if (!zoneObj || !zoneObj.props || typeof zoneObj.props !== 'object') return false;
        const propKeys = Object.keys(zoneObj.props).filter(k => k !== '__type' && k !== '__value');
        if (propKeys.length === 0) return false;
        const nonObjectiveProps = propKeys.filter(k => k !== 'ZonePropertyObjectiveZoneToVisit');
        return nonObjectiveProps.length > 0;
    }

    searchBlocksInCache(query, limit = 30) {
        const q = query.trim();
        if (!q) return [];
        const results = [];
        const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // 1. Szukanie bloków NAME = { ... }
        const blockRegex = new RegExp(`\\b([A-Za-z0-9_]*${escaped}[A-Za-z0-9_]*)\\s*=\\s*\\{`, 'gi');
        let match;

        while ((match = blockRegex.exec(this.text)) !== null && results.length < limit) {
            const blockName = match[1];
            const openBraceIdx = match.index + match[0].length - 1;
            try {
                const { body, endIndex } = this.extractBalancedBraces(openBraceIdx);
                results.push({
                    name: blockName,
                    rawText: `${blockName} = {${body}}`
                });
                blockRegex.lastIndex = endIndex;
            } catch {
                break;
            }
        }

        // 2. Jeśli wpisano frazę ze spacjami lub kod skryptu (np. "Invalid zone for map in setting"),
        // wyciągamy kontekst ±35 linii wokół każdego wystąpienia w initial.cache_block
        if (results.length === 0 || q.includes(' ')) {
            const rawRegex = new RegExp(escaped, 'gi');
            let rMatch;
            let hitIdx = 1;
            while ((rMatch = rawRegex.exec(this.text)) !== null && results.length < limit) {
                const startPos = Math.max(0, rMatch.index - 1800);
                const endPos = Math.min(this.text.length, rMatch.index + 1800);
                results.push({
                    name: `[Kontekst #${hitIdx++}] "${q}" (offset: ${rMatch.index})`,
                    rawText: this.text.substring(startPos, endPos)
                });
            }
        }

        return results;
    }

    extractForRegion(regionId, mapNames, zoneFilterMode = 'smart') {
        const normRegion = regionId.toUpperCase().trim();
        const normRegionLower = normRegion.toLowerCase();

        const mapData = {};
        const coreToFullMapName = {};

        for (const mapName of mapNames) {
            // Wyciągamy bazowy 3-członowy kod (np. z "level_ru_02_01_crop" -> "RU_02_01")
            const coreMatch = mapName.match(/^level_([a-z]{2}_\d{2}_\d{2})/i);
            const shortCode = coreMatch ? coreMatch[1].toUpperCase() : mapName.replace(/^level_/i, '').toUpperCase();
            const coreLevel = `level_${shortCode.toLowerCase()}`;

            coreToFullMapName[mapName.toLowerCase()] = mapName;
            coreToFullMapName[coreLevel] = mapName;

            const mapNumMatch = shortCode.match(/_(\d{2})$/);
            const fallbackIdx = mapNumMatch ? Math.max(0, parseInt(mapNumMatch[1], 10) - 1) : 0;

            mapData[mapName] = {
                shortCode,
                coreLevel,
                indexInRegion: fallbackIdx,
                rawZones: [],
                zonesParsed: [],
                filteredOutZones: [],
                tasksParsed: []
            };
        }

        const resolveMapKey = (rawLevelStr) => {
            if (!rawLevelStr) return null;
            const clean = rawLevelStr.trim().toLowerCase();
            if (coreToFullMapName[clean]) return coreToFullMapName[clean];
            const m = clean.match(/^(level_[a-z]{2}_\d{2}_\d{2})/i);
            if (m && coreToFullMapName[m[1].toLowerCase()]) {
                return coreToFullMapName[m[1].toLowerCase()];
            }
            return null;
        };

        const contractsParsed = [];
        const missionUsedZones = new Set();
        const contestUsedZones = new Set();
        const infraLinkedZones = new Set();

        // 1. Zbieranie stref z bloków zoneDesc + odczyt indexInRegion
        const zoneContainers = this.findAllNamedContainers('zoneDesc');
        for (const { body: containerBody, prefixContext } of zoneContainers) {
            if (!containerBody.toUpperCase().includes(normRegion)) continue;

            const innerBlocks = this.extractInnerBlocks(containerBody);
            if (innerBlocks.length === 0) continue;

            let bestMap = null;
            let maxCount = 0;

            for (const mapName of mapNames) {
                const prefix = mapData[mapName].shortCode + '_';
                let count = 0;
                for (const item of innerBlocks) {
                    if (item.name.toUpperCase().startsWith(prefix)) count++;
                }
                if (count > maxCount) {
                    maxCount = count;
                    bestMap = mapName;
                }
            }

            if (bestMap && maxCount > 0) {
                const idxMatch = prefixContext.match(/indexInRegion\s*=\s*(\d+)/);
                if (idxMatch) {
                    mapData[bestMap].indexInRegion = parseInt(idxMatch[1], 10);
                }

                for (const item of innerBlocks) {
                    if (item.name.toUpperCase().startsWith('TRIAL')) continue;
                    const parsedArr = new SourceParser(item.rawText).parse();
                    for (const p of parsedArr) {
                        p.rawText = item.rawText;
                        mapData[bestMap].rawZones.push(p);
                        if (this.hasInfrastructureProps(p.obj)) {
                            this.collectInfraLinkedZonesFromRaw(item.rawText, infraLinkedZones);
                        }
                    }
                }
            }
        }

        // 2. Zbieranie zadań (tasksSettings)
        const taskContainers = this.findAllNamedContainers('tasksSettings');
        for (const { body: containerBody } of taskContainers) {
            if (!containerBody.toUpperCase().includes(normRegion)) continue;

            const innerBlocks = this.extractInnerBlocks(containerBody);
            for (const item of innerBlocks) {
                if (item.name.toUpperCase().startsWith('TRIAL')) continue;

                if (item.rawText.includes('"ContestSettings"')) {
                    this.collectReferencedZonesFromRaw(item.rawText, contestUsedZones);
                    continue;
                }

                let assignedMap = null;
                const giverMatch = item.rawText.match(/taskGiverZone\s*=\s*\{[^}]*?"(level_[a-z0-9_]+)\s*\|\|/i);
                if (giverMatch) {
                    assignedMap = resolveMapKey(giverMatch[1]);
                }

                if (!assignedMap) {
                    for (const mapName of mapNames) {
                        const { shortCode } = mapData[mapName];
                        if (item.name.toUpperCase().startsWith(shortCode + '_')) {
                            assignedMap = mapName;
                            break;
                        }
                    }
                }

                if (!assignedMap) {
                    for (const mapName of mapNames) {
                        const { coreLevel } = mapData[mapName];
                        if (
                            item.rawText.toLowerCase().includes(mapName.toLowerCase()) ||
                            item.rawText.toLowerCase().includes(coreLevel)
                        ) {
                            assignedMap = mapName;
                            break;
                        }
                    }
                }

                if (assignedMap) {
                    this.collectReferencedZonesFromRaw(item.rawText, missionUsedZones);
                    const parsedArr = new SourceParser(item.rawText).parse();
                    for (const p of parsedArr) {
                        p.rawText = item.rawText;
                        mapData[assignedMap].tasksParsed.push(p);
                    }
                }
            }
        }

        // 3. Zbieranie osobnych bloków contestSettings
        const contestContainers = this.findAllNamedContainers('contestSettings');
        for (const { body: containerBody } of contestContainers) {
            if (!containerBody.toUpperCase().includes(normRegion)) continue;
            const innerBlocks = this.extractInnerBlocks(containerBody);
            for (const item of innerBlocks) {
                this.collectReferencedZonesFromRaw(item.rawText, contestUsedZones);
            }
        }

        // 4. Zbieranie kontraktów (contractsSettings)
        const contractContainers = this.findAllNamedContainers('contractsSettings');
        for (const { body: containerBody } of contractContainers) {
            if (!containerBody.toUpperCase().includes(normRegion)) continue;

            const innerBlocks = this.extractInnerBlocks(containerBody);
            for (const item of innerBlocks) {
                if (item.name.toUpperCase().startsWith('TRIAL')) continue;

                const regionPropRegex = new RegExp(`region\\s*=\\s*"${normRegionLower}"`, 'i');
                const startsWithRegion = item.name.toUpperCase().startsWith(normRegion + '_');

                if (regionPropRegex.test(item.rawText) || startsWithRegion) {
                    this.collectReferencedZonesFromRaw(item.rawText, missionUsedZones);
                    const parsedArr = new SourceParser(item.rawText).parse();
                    for (const p of parsedArr) {
                        p.rawText = item.rawText;
                        contractsParsed.push(p);
                    }
                }
            }
        }

        // 5. Filtrowanie stref dla każdej mapy
        for (const mapName of mapNames) {
            const mData = mapData[mapName];
            for (const zItem of mData.rawZones) {
                const zName = zItem.name;
                const usedInMission = missionUsedZones.has(zName);
                const usedInContest = contestUsedZones.has(zName);
                const isInfra = this.hasInfrastructureProps(zItem.obj) || infraLinkedZones.has(zName);

                if (zoneFilterMode === 'none') {
                    mData.zonesParsed.push(zItem);
                    continue;
                }

                if (usedInContest && !usedInMission) {
                    mData.filteredOutZones.push({ name: zName, reason: 'CONTEST_ZONE' });
                    continue;
                }

                if (zoneFilterMode === 'strict') {
                    if (usedInMission) {
                        mData.zonesParsed.push(zItem);
                    } else {
                        mData.filteredOutZones.push({ name: zName, reason: 'UNUSED_STRICT' });
                    }
                } else {
                    if (usedInMission || isInfra) {
                        mData.zonesParsed.push(zItem);
                    } else {
                        mData.filteredOutZones.push({ name: zName, reason: 'ORPHAN_MISSION_ZONE' });
                    }
                }
            }
        }

        return {
            mapData,
            contractsParsed,
            missionUsedZones: Array.from(missionUsedZones),
            contestUsedZones: Array.from(contestUsedZones)
        };
    }
}