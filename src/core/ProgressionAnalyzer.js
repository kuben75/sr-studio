// src/core/ProgressionAnalyzer.js

export class ProgressionAnalyzer {
    /**
     * Analizuje graf połączeń map, garaże, bramy (Gateways) oraz wykrywa pętle/deadlocki w misjach.
     */
    analyze(mapNames, mapData, contractsParsed) {
        const mapsInfo = {};
        const allMissions = {};

        for (const mapName of mapNames) {
            mapsInfo[mapName] = {
                mapName,
                indexInRegion: mapData[mapName]?.indexInRegion ?? 99,
                garages: [],   // { zoneId, lockedBy: [] }
                gateways: []   // { zoneId, targetMap, targetZone, lockedBy: [] }
            };
        }

        // 1. Zbieramy wszystkie misje (Taski + Kontrakty) i sprawdzamy, co odblokowują w nagrodach
        const lockedZonesLookup = {}; // klucz: "level_xx_yy_zz|ZONE_ID" -> tablica nazw misji odblokowujących

        const registerMission = (item, isContract, ownerMap = null) => {
            const name = item.name;
            const obj = item.obj || {};
            const rawText = item.rawText || '';

            // Wyciągamy mapę zleceniodawcy (dla Tasków)
            let giverMap = ownerMap;
            const giverMatch = rawText.match(/taskGiverZone\s*=\s*\{[^}]*?"(level_[a-z0-9_]+)\s*\|\|/i);
            if (giverMatch) {
                giverMap = giverMatch[1].toLowerCase();
            }

            // Wyciągamy mapy wymagane w etapach (stages)
            const stageMaps = new Set();
            if (Array.isArray(obj.stages)) {
                const stagesStr = JSON.stringify(obj.stages);
                const levelRegex = /level_[a-z]{2}_\d{2}_\d{2}/gi;
                let m;
                while ((m = levelRegex.exec(stagesStr)) !== null) {
                    const foundMap = m[0].toLowerCase();
                    if (mapsInfo[foundMap]) {
                        stageMaps.add(foundMap);
                    }
                }
            }

            const blockers = Array.isArray(obj.blockerObjectives) ? [...obj.blockerObjectives] : [];

            // Sprawdzamy nagrody pod kątem otwierania bram (ZonePropertyGateway) lub garaży (ZonePropertyGarageEntrance)
            const unlocksGateways = [];
            const unlocksGarages = [];

            const rewards = obj.rewards || {};
            for (const rewKey of Object.keys(rewards)) {
                if (
                    rewKey.startsWith('ObjectiveRewardOpenZoneProperties') ||
                    rewKey.startsWith('ObjectiveRewardUpdateZoneProperties')
                ) {
                    const zoneSettings = rewards[rewKey]?.zoneSettings || {};
                    for (const zsKey of Object.keys(zoneSettings)) {
                        const zs = zoneSettings[zsKey];
                        if (!zs || !zs.mapId || !zs.zoneId) continue;
                        const targetMapId = zs.mapId.toLowerCase();
                        const targetZoneId = zs.zoneId;
                        const props = zs.props || {};

                        if (props.ZonePropertyGateway) {
                            const link = props.ZonePropertyGateway.levelZoneLink || '';
                            const destMap = link.includes('||') ? link.split('||')[0].trim().toLowerCase() : '';
                            const destZone = link.includes('||') ? link.split('||')[1].trim() : '';

                            const lockKey = `${targetMapId}|${targetZoneId}`;
                            if (!lockedZonesLookup[lockKey]) lockedZonesLookup[lockKey] = [];
                            lockedZonesLookup[lockKey].push(name);

                            unlocksGateways.push({
                                fromMap: targetMapId,
                                zoneId: targetZoneId,
                                toMap: destMap,
                                toZone: destZone
                            });
                        }

                        if (props.ZonePropertyGarageEntrance) {
                            const lockKey = `${targetMapId}|${targetZoneId}`;
                            if (!lockedZonesLookup[lockKey]) lockedZonesLookup[lockKey] = [];
                            lockedZonesLookup[lockKey].push(name);

                            unlocksGarages.push({
                                mapName: targetMapId,
                                zoneId: targetZoneId
                            });
                        }
                    }
                }
            }

            allMissions[name] = {
                name,
                type: isContract ? 'Contract' : 'Task',
                giverMap: isContract ? null : giverMap,
                blockerObjectives: blockers,
                requiredStageMaps: Array.from(stageMaps),
                unlocksGateways,
                unlocksGarages
            };
        };

        for (const mapName of mapNames) {
            for (const t of mapData[mapName].tasksParsed) {
                registerMission(t, false, mapName);
            }
        }
        for (const c of contractsParsed) {
            registerMission(c, true, null);
        }

        // 2. Skanujemy strefy każdej mapy w poszukiwaniu Garaży i Bram (Gateways)
        for (const mapName of mapNames) {
            const rawZones = mapData[mapName].rawZones || [];
            for (const z of rawZones) {
                const props = z.obj?.props || {};
                const lockKey = `${mapName}|${z.name}`;
                const lockedBy = lockedZonesLookup[lockKey] || [];

                if (props.ZonePropertyGarageEntrance) {
                    mapsInfo[mapName].garages.push({
                        zoneId: z.name,
                        lockedBy
                    });
                }

                if (props.ZonePropertyGateway) {
                    const link = props.ZonePropertyGateway.levelZoneLink || '';
                    const targetMap = link.includes('||') ? link.split('||')[0].trim().toLowerCase() : '';
                    const targetZone = link.includes('||') ? link.split('||')[1].trim() : '';

                    mapsInfo[mapName].gateways.push({
                        zoneId: z.name,
                        targetMap,
                        targetZone,
                        lockedBy
                    });
                }
            }

            // Dodajemy też bramy/garaże, które w zoneDesc były puste, a są wstrzykiwane wyłącznie przez nagrodę misji
            for (const m of Object.values(allMissions)) {
                for (const ugw of m.unlocksGateways) {
                    if (ugw.fromMap === mapName) {
                        const exists = mapsInfo[mapName].gateways.some(g => g.zoneId === ugw.zoneId);
                        if (!exists) {
                            mapsInfo[mapName].gateways.push({
                                zoneId: ugw.zoneId,
                                targetMap: ugw.toMap,
                                targetZone: ugw.toZone,
                                lockedBy: lockedZonesLookup[`${mapName}|${ugw.zoneId}`] || [m.name]
                            });
                        }
                    }
                }
                for (const ugar of m.unlocksGarages) {
                    if (ugar.mapName === mapName) {
                        const exists = mapsInfo[mapName].garages.some(g => g.zoneId === ugar.zoneId);
                        if (!exists) {
                            mapsInfo[mapName].garages.push({
                                zoneId: ugar.zoneId,
                                lockedBy: lockedZonesLookup[`${mapName}|${ugar.zoneId}`] || [m.name]
                            });
                        }
                    }
                }
            }
        }

        // 3. Wyznaczenie Mapy Startowej
        const mapsWithOpenGarage = mapNames.filter(m =>
            mapsInfo[m].garages.some(g => g.lockedBy.length === 0)
        );

        let primaryStartMap = mapNames[0];
        let startMapReason = 'Domyślnie pierwsza mapa regionu (_01)';

        if (mapsWithOpenGarage.length > 0) {
            mapsWithOpenGarage.sort((a, b) => mapsInfo[a].indexInRegion - mapsInfo[b].indexInRegion);
            primaryStartMap = mapsWithOpenGarage[0];
            startMapReason = `Posiada otwarty na starcie Garaż oraz najniższy indexInRegion (${mapsInfo[primaryStartMap].indexInRegion})`;
        } else {
            const sortedByIdx = [...mapNames].sort((a, b) => mapsInfo[a].indexInRegion - mapsInfo[b].indexInRegion);
            primaryStartMap = sortedByIdx[0];
            startMapReason = `Brak otwartego garażu na starcie w całym regionie – wybrano mapę z indexInRegion = ${mapsInfo[primaryStartMap].indexInRegion}`;
        }

        // 4. Symulacja Progresji Gracza (BFS) w celu wykrycia labiryntów / deadlocków
        const reachableMaps = new Set(mapsWithOpenGarage.length > 0 ? mapsWithOpenGarage : [primaryStartMap]);
        const completedMissions = new Set();
        const progressionSteps = [];

        progressionSteps.push(
            `Start symulacji: Gracz rozpoczyna na mapie ${primaryStartMap.toUpperCase()} (${startMapReason}).`
        );

        let changed = true;
        let safetyCounter = 0;

        while (changed && safetyCounter < 500) {
            changed = false;
            safetyCounter++;

            // A. Przejścia przez aktualnie odblokowane bramy (Gateways)
            for (const currentMap of Array.from(reachableMaps)) {
                const gwList = mapsInfo[currentMap]?.gateways || [];
                for (const gw of gwList) {
                    if (!gw.targetMap || !mapsInfo[gw.targetMap]) continue;
                    const isUnlocked = gw.lockedBy.length === 0 || gw.lockedBy.some(mName => completedMissions.has(mName));

                    if (isUnlocked && !reachableMaps.has(gw.targetMap)) {
                        reachableMaps.add(gw.targetMap);
                        changed = true;
                        const viaReason = gw.lockedBy.length === 0
                            ? `otwarte od startu przejście ${gw.zoneId}`
                            : `przejście ${gw.zoneId} (odblokowane przez: ${gw.lockedBy.join(', ')})`;
                        progressionSteps.push(`Odblokowano dojazd do mapy ${gw.targetMap.toUpperCase()} z ${currentMap.toUpperCase()} przez ${viaReason}.`);
                    }
                }
            }

            // B. Sprawdzanie misji możliwych do ukończenia na obecnie dostępnych mapach
            for (const m of Object.values(allMissions)) {
                if (completedMissions.has(m.name)) continue;

                // 1. Czy zleceniodawca Taska leży na dostępnej mapie?
                if (m.giverMap && mapsInfo[m.giverMap] && !reachableMaps.has(m.giverMap)) {
                    continue;
                }

                // 2. Czy wszystkie istniejące w regionie blockerObjectives są już ukończone?
                const blockersOk = m.blockerObjectives.every(bName => {
                    if (!allMissions[bName]) return true; // zewnętrzny lub nieistniejący blocker
                    return completedMissions.has(bName);
                });
                if (!blockersOk) continue;

                // 3. Czy wszystkie mapy wymagane w etapach (stages) są dostępne?
                const stagesOk = m.requiredStageMaps.every(reqMap => reachableMaps.has(reqMap));
                if (!stagesOk) continue;

                // Misja może zostać ukończona!
                completedMissions.add(m.name);
                changed = true;

                if (m.unlocksGateways.length > 0 || m.unlocksGarages.length > 0) {
                    const unlockedDesc = [
                        ...m.unlocksGateways.map(g => `Brama ${g.zoneId} (${g.fromMap} -> ${g.toMap})`),
                        ...m.unlocksGarages.map(g => `Garaż ${g.zoneId} (${g.mapName})`)
                    ].join(', ');
                    progressionSteps.push(`Ukończono kluczową misję [${m.type}] ${m.name} -> Odblokowano: ${unlockedDesc}`);
                }
            }
        }

        // 5. Diagnoza Labiryntów / Deadlocków (co pozostało zablokowane i dlaczego)
        const unreachableMaps = mapNames.filter(m => !reachableMaps.has(m));
        const deadlocks = [];

        for (const uMap of unreachableMaps) {
            deadlocks.push({
                type: 'UNREACHABLE_MAP',
                target: uMap,
                reason: `Mapa ${uMap.toUpperCase()} jest całkowicie nieosiągalna! Żadne otwarte przejście ani możliwa do ukończenia misja nie pozwala na nią wjechać.`
            });
        }

        for (const m of Object.values(allMissions)) {
            if (completedMissions.has(m.name)) continue;

            const reasons = [];
            if (m.giverMap && !reachableMaps.has(m.giverMap)) {
                reasons.push(`zleceniodawca (taskGiverZone) leży na niedostępnej mapie ${m.giverMap}`);
            }
            const unMets = m.blockerObjectives.filter(b => allMissions[b] && !completedMissions.has(b));
            if (unMets.length > 0) {
                reasons.push(`wymaga wcześniejszego ukończenia zablokowanych misji: ${unMets.join(', ')}`);
            }
            const unreachableStageMaps = m.requiredStageMaps.filter(rm => !reachableMaps.has(rm));
            if (unreachableStageMaps.length > 0) {
                reasons.push(`etapy misji wymagają wjazdu na niedostępną mapę: ${unreachableStageMaps.join(', ')}`);
            }

            // Szczególnie groźne, gdy zablokowana misja sama otwiera bramę lub garaż!
            const isKeyUnlocker = m.unlocksGateways.length > 0 || m.unlocksGarages.length > 0;
            deadlocks.push({
                type: isKeyUnlocker ? 'CRITICAL_GATEWAY_DEADLOCK' : 'LOCKED_MISSION',
                target: m.name,
                isKeyUnlocker,
                reason: `[${m.type}: ${m.name}] ${isKeyUnlocker ? '(OTWIERA PRZEJŚCIE/GARAŻ!) ' : ''}Nie może zostać ukończona, ponieważ: ${reasons.join(' ORAZ ')}.`
            });
        }

        return {
            primaryStartMap,
            startMapReason,
            mapsWithOpenGarage,
            mapsInfo,
            reachableMaps: Array.from(reachableMaps),
            unreachableMaps,
            totalMissionsCount: Object.keys(allMissions).length,
            completableMissionsCount: completedMissions.size,
            progressionSteps,
            deadlocks
        };
    }
}

export const progressionAnalyzer = new ProgressionAnalyzer();