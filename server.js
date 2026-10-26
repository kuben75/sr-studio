// server.js (v7.6 - In-Pak Binary String Patcher & Null-Prop Guard)
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync, exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import sevenBin from '7zip-bin';

import { CacheBlockExtractor } from './src/core/CacheBlockExtractor.js';
import { taskTransformer } from './src/core/transformers/StageTransformer.js';
import { zoneTransformerInstance } from './src/core/transformers/ZoneTransformer.js';
import { helperInstance } from './src/utils/helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_GAME_DIR = 'C:\\Program Files\\Epic Games\\SnowRunner\\en_us\\preload\\paks\\client';
const FLIP_OFFSET = 16;
const PORT = 3000;

let cachedRawEngineText = null;
let cachedEnginePath = null;

const MAP_DICTIONARY = {
    level_us_01_01: { en: 'Black River', pl: 'Czarna Rzeka', regionPl: 'Michigan, USA', regionEn: 'Michigan, USA' },
    level_us_01_02: { en: 'Smithville Dam', pl: 'Zapora Smithville', regionPl: 'Michigan, USA', regionEn: 'Michigan, USA' },
    level_us_01_03: { en: 'Drummond Island', pl: 'Wyspa Drummond', regionPl: 'Michigan, USA', regionEn: 'Michigan, USA' },
    level_us_01_04: { en: 'Island Lake', pl: 'Wyspowe jezioro', regionPl: 'Michigan, USA', regionEn: 'Michigan, USA' },
    level_us_01_04_new: { en: 'Island Lake', pl: 'Wyspowe jezioro', regionPl: 'Michigan, USA', regionEn: 'Michigan, USA' },

    level_us_02_01: { en: 'North Port', pl: 'Port północny', regionPl: 'Alaska, USA', regionEn: 'Alaska, USA' },
    level_us_02_02: { en: 'Mountain River', pl: 'Rzeka górska', regionPl: 'Alaska, USA', regionEn: 'Alaska, USA' },
    level_us_02_03: { en: 'White Valley', pl: 'Biała Dolina', regionPl: 'Alaska, USA', regionEn: 'Alaska, USA' },
    level_us_02_04: { en: 'Pedro Bay', pl: 'Zatoka Pedro', regionPl: 'Alaska, USA', regionEn: 'Alaska, USA' },

    level_ru_02_01: { en: 'Drowned Lands', pl: 'Zalane tereny', regionPl: 'Tajmyr, Rosja', regionEn: 'Taymyr, Russia' },
    level_ru_02_01_crop: { en: 'Drowned Lands', pl: 'Zalane tereny', regionPl: 'Tajmyr, Rosja', regionEn: 'Taymyr, Russia' },
    level_ru_02_02: { en: 'Quarry', pl: 'Kamieniołom', regionPl: 'Tajmyr, Rosja', regionEn: 'Taymyr, Russia' },
    level_ru_02_03: { en: 'Zimnegorsk', pl: 'Zimnogórsk', regionPl: 'Tajmyr, Rosja', regionEn: 'Taymyr, Russia' },
    level_ru_02_04: { en: 'Rift', pl: 'Rozpadlina', regionPl: 'Tajmyr, Rosja', regionEn: 'Taymyr, Russia' },

    level_ru_03_01: { en: 'Lake Kovd', pl: 'Jezioro Kovd', regionPl: 'Półwysep Kolski, Rosja', regionEn: 'Kola Peninsula, Russia' },
    level_ru_03_02: { en: 'Imandra', pl: 'Imandra', regionPl: 'Półwysep Kolski, Rosja', regionEn: 'Kola Peninsula, Russia' },

    level_us_03_01: { en: 'Flooded Foothills', pl: 'Zalane podnóże gór', regionPl: 'Jukon, Kanada', regionEn: 'Yukon, Canada' },
    level_us_03_02: { en: 'Big Salmon Peak', pl: 'Góra Big Salmon', regionPl: 'Jukon, Kanada', regionEn: 'Yukon, Canada' },

    level_us_04_01: { en: 'Black Badger Lake', pl: 'Jezioro Black Badger', regionPl: 'Wisconsin, USA', regionEn: 'Wisconsin, USA' },
    level_us_04_02: { en: 'Grainwoods River', pl: 'Rzeka Grainwoods', regionPl: 'Wisconsin, USA', regionEn: 'Wisconsin, USA' },

    level_ru_04_01: { en: 'Urska River', pl: 'Urska', regionPl: 'Amur, Rosja', regionEn: 'Amur, Russia' },
    level_ru_04_02: { en: 'Cosmodrome', pl: 'Kosmodrom', regionPl: 'Amur, Rosja', regionEn: 'Amur, Russia' },
    level_ru_04_03: { en: 'Northern Aegis Installation', pl: 'Stanowisko Północnej Tarczy', regionPl: 'Amur, Rosja', regionEn: 'Amur, Russia' },
    level_ru_04_04: { en: 'Chernokamensk', pl: 'Czarnokamieńsk', regionPl: 'Amur, Rosja', regionEn: 'Amur, Russia' },

    level_ru_05_01: { en: 'Factory Grounds', pl: 'Tereny fabryczne', regionPl: 'Don, Rosja', regionEn: 'Don, Russia' },
    level_ru_05_02: { en: 'Antonovskiy Nature Reserve', pl: 'Rezerwat Przyrody Antonowski', regionPl: 'Don, Rosja', regionEn: 'Don, Russia' },

    level_us_06_01: { en: 'The Lowland', pl: 'Nizina', regionPl: 'Maine, USA', regionEn: 'Maine, USA' },
    level_us_06_02: { en: 'Yellowrock National Forest', pl: 'Park narodowy Yellowrock', regionPl: 'Maine, USA', regionEn: 'Maine, USA' },

    level_us_07_01: { en: 'Burning Mill', pl: 'Płonący młyn', regionPl: 'Tennessee, USA', regionEn: 'Tennessee, USA' },

    level_ru_08_01: { en: 'Crossroads', pl: 'Skrzyżowanie', regionPl: 'Biełozierskie Pola', regionEn: 'Belozersk Glades' },
    level_ru_08_02: { en: 'The Institute', pl: 'Instytut', regionPl: 'Biełozierskie Pola', regionEn: 'Belozersk Glades' },
    level_ru_08_03: { en: 'Heartlands', pl: 'Prowincja', regionPl: 'Biełozierskie Pola', regionEn: 'Belozersk Glades' },
    level_ru_08_04: { en: 'HarvestCorp', pl: '„HarvestCorp”', regionPl: 'Biełozierskie Pola', regionEn: 'Belozersk Glades' },

    level_us_09_01: { en: 'The Albany River', pl: 'Rzeka Albany', regionPl: 'Ontario, Kanada', regionEn: 'Ontario, Canada' },
    level_us_09_02: { en: 'Burned Forest', pl: 'Spalony las', regionPl: 'Ontario, Kanada', regionEn: 'Ontario, Canada' },

    level_us_10_01: { en: 'Duncan Bay', pl: 'Zatoka Duncana', regionPl: 'Kolumbia Brytyjska', regionEn: 'British Columbia' },
    level_us_10_02: { en: 'North Peak National Park', pl: 'Park narodowy North Peak', regionPl: 'Kolumbia Brytyjska', regionEn: 'British Columbia' },

    level_us_11_01: { en: 'Mountain Ridge', pl: 'Górski grzbiet', regionPl: 'Skandynawia', regionEn: 'Scandinavia' },
    level_us_11_02: { en: 'By The Lake', pl: 'Nad jeziorem', regionPl: 'Skandynawia', regionEn: 'Scandinavia' },

    level_us_12_01: { en: 'Pineline Bay', pl: 'Pineline Bay', regionPl: 'Karolina Północna', regionEn: 'North Carolina' },
    level_us_12_02: { en: 'Reactive Zone', pl: 'Strefa reaktywna', regionPl: 'Karolina Północna', regionEn: 'North Carolina' },
    level_us_12_03: { en: 'Flatland', pl: 'Płaski obszar', regionPl: 'Karolina Północna', regionEn: 'North Carolina' },
    level_us_12_04: { en: 'Oviro Hills', pl: 'Oviro Hills', regionPl: 'Karolina Północna', regionEn: 'North Carolina' },

    level_ru_13_01: { en: 'Zherbai Quarries', pl: 'Kopalnie żerbajskie', regionPl: 'Rejon ałmacki', regionEn: 'Almaty Region' },
    level_us_13_01: { en: 'Zherbai Quarries', pl: 'Kopalnie żerbajskie', regionPl: 'Rejon ałmacki', regionEn: 'Almaty Region' },

    level_us_14_01: { en: 'Unterfeld', pl: 'Unterfeld', regionPl: 'Austria', regionEn: 'Austria' },
    level_us_14_02: { en: 'Foothills', pl: 'Pogórze', regionPl: 'Austria', regionEn: 'Austria' },

    level_us_15_01: { en: 'Harbor', pl: 'Port', regionPl: 'Quebec', regionEn: 'Quebec' },
    level_us_15_02: { en: 'Lake Ribiere', pl: 'Jezioro Ribiere', regionPl: 'Quebec', regionEn: 'Quebec' },

    level_us_16_01: { en: 'Solace Bay', pl: 'Zatoka ukojenia', regionPl: 'Waszyngton', regionEn: 'Washington' },
    level_us_16_02: { en: 'Selten River National Park', pl: 'Park Narodowy Selten River', regionPl: 'Waszyngton', regionEn: 'Washington' },
    level_us_16_03: { en: 'Selten River Mountains', pl: 'Góry Selten River', regionPl: 'Waszyngton', regionEn: 'Washington' },

    level_us_17_01: { en: 'Zurdanian Valley', pl: 'Dolina Zurdańska', regionPl: 'Zurdania', regionEn: 'Zurdania' },
    level_us_17_02: { en: 'Landslide Valley', pl: 'Dolina Osuwisk', regionPl: 'Zurdania', regionEn: 'Zurdania' },
    level_ru_17_01: { en: 'Zurdanian Valley', pl: 'Dolina Zurdańska', regionPl: 'Zurdania', regionEn: 'Zurdania' },
    level_ru_17_02: { en: 'Landslide Valley', pl: 'Dolina Osuwisk', regionPl: 'Zurdania', regionEn: 'Zurdania' },

    level_us_18_01: { en: 'Costa Atardecer', pl: 'Costa Atardecer', regionPl: 'Chiapas', regionEn: 'Chiapas' },
    level_us_18_02: { en: 'Sierra Fuerte', pl: 'Sierra Fuerte', regionPl: 'Chiapas', regionEn: 'Chiapas' },

    level_us_19_01: { en: 'Grüntal Hollow', pl: 'Grüntal Hollow', regionPl: 'Szwajcaria', regionEn: 'Switzerland' },
    level_us_19_02: { en: 'Schneetal', pl: 'Schneetal', regionPl: 'Szwajcaria', regionEn: 'Switzerland' },
    level_us_19_03: { en: 'Eiswandspitze', pl: 'Eiswandspitze', regionPl: 'Szwajcaria', regionEn: 'Switzerland' }
};

function lookupMapNames(mapName) {
    if (!mapName) return { en: '', pl: '' };
    const lower = mapName.toLowerCase().trim();
    if (MAP_DICTIONARY[lower]) return MAP_DICTIONARY[lower];
    const coreMatch = lower.match(/^(level_[a-z]{2}_\d{2}_\d{2})/i);
    if (coreMatch && MAP_DICTIONARY[coreMatch[1]]) return MAP_DICTIONARY[coreMatch[1]];
    return { en: '', pl: '' };
}

function formatTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const ms = String(now.getMilliseconds()).padStart(3, '0');
    return `${hh}:${mm}:${ss}.${ms}`;
}

function getLocalBaseOutputDir() {
    const home = os.homedir();
    const localPulpit = path.join(home, 'Pulpit');
    const localDesktop = path.join(home, 'Desktop');
    if (fs.existsSync(localPulpit)) return path.join(localPulpit, 'snowrunner');
    return path.join(localDesktop, 'snowrunner');
}

function getDefaultModsDir() {
    const defaultKuben = 'C:\\Users\\21Kuben\\OneDrive\\Dokumenty\\My Games\\SnowRunner\\Media\\Mods';
    if (fs.existsSync(defaultKuben)) return defaultKuben;

    const home = os.homedir();
    const candidates = [
        defaultKuben,
        path.join(home, 'OneDrive', 'Dokumenty', 'My Games', 'SnowRunner', 'Media', 'Mods'),
        path.join(home, 'OneDrive', 'Documents', 'My Games', 'SnowRunner', 'Media', 'Mods'),
        path.join(home, 'Dokumenty', 'My Games', 'SnowRunner', 'Media', 'Mods'),
        path.join(home, 'Documents', 'My Games', 'SnowRunner', 'Media', 'Mods')
    ];
    return candidates.find(p => fs.existsSync(p)) || defaultKuben;
}

function getDefaultPrebuildDir() {
    const defaultKuben = 'C:\\Users\\21Kuben\\OneDrive\\Dokumenty\\My Games\\SnowRunner\\Media\\prebuild';
    if (fs.existsSync(defaultKuben)) return defaultKuben;

    const home = os.homedir();
    const candidates = [
        defaultKuben,
        path.join(home, 'OneDrive', 'Dokumenty', 'My Games', 'SnowRunner', 'Media', 'prebuild'),
        path.join(home, 'OneDrive', 'Documents', 'My Games', 'SnowRunner', 'Media', 'prebuild'),
        path.join(home, 'Dokumenty', 'My Games', 'SnowRunner', 'Media', 'prebuild'),
        path.join(home, 'Documents', 'My Games', 'SnowRunner', 'Media', 'prebuild')
    ];
    return candidates.find(p => fs.existsSync(p)) || defaultKuben;
}

function scanPrebuildProjects(prebuildBaseDir) {
    if (!prebuildBaseDir || !fs.existsSync(prebuildBaseDir)) return [];
    try {
        return fs.readdirSync(prebuildBaseDir, { withFileTypes: true })
            .filter(d => d.isDirectory())
            .map(d => d.name)
            .sort();
    } catch {
        return [];
    }
}

function scanModZips(modsDir) {
    if (!modsDir || !fs.existsSync(modsDir)) return [];
    try {
        return fs.readdirSync(modsDir, { withFileTypes: true })
            .filter(f => f.isFile() && f.name.toLowerCase().endsWith('.zip'))
            .map(f => path.join(modsDir, f.name))
            .sort();
    } catch {
        return [];
    }
}

function isActiveProp(propObj) {
    return Boolean(propObj && typeof propObj === 'object' && propObj.__type !== 'null');
}

// Skanuje wszystkie wpisy wewnątrz pliku .pak i zwraca fizyczne identyfikatory stref + nazwę pliku, w którym leżą
const PS_SCAN_ALL_PAK_ZONES = `
param([Parameter(Mandatory=$true)][string]$PakPath)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead($PakPath)
$found = New-Object System.Collections.Generic.HashSet[string]

try {
    foreach ($entry in $zip.Entries) {
        if ($entry.Length -gt 0 -and $entry.Length -lt 25000000) {
            $stream = $entry.Open()
            $ms = New-Object System.IO.MemoryStream
            $stream.CopyTo($ms)
            $stream.Close()
            $bytes = $ms.ToArray()
            $ms.Close()

            $ascii = [System.Text.Encoding]::ASCII.GetString($bytes)
            $matches = [regex]::Matches($ascii, '\\b(?:[A-Z]{2}_\\d{2}_\\d{2}_[A-Za-z0-9_]+|MAP_TRANSITION_[A-Za-z0-9_]+)\\b')
            foreach ($m in $matches) {
                $null = $found.Add($m.Value)
            }
        }
    }
} finally {
    $zip.Dispose()
}

$arr = @($found)
Write-Output ("PAK_ZONES:" + ($arr -join ','))
`;

function getPhysicalZonesFromPak(pakPath) {
    try {
        const res = runPowerShell(PS_SCAN_ALL_PAK_ZONES, [pakPath]);
        if (res.stdout.includes('PAK_ZONES:')) {
            const rawList = res.stdout.split('PAK_ZONES:')[1].trim();
            if (!rawList) return new Set();
            return new Set(rawList.split(',').map(s => s.trim()).filter(Boolean));
        }
    } catch (err) {
        console.error('Błąd PS_SCAN_ALL_PAK_ZONES:', err);
    }
    return new Set();
}


// W server.js - podmień stałą PS_INJECT_AND_PATCH na tę czystą wersję bajtową:
const PS_INJECT_AND_PATCH = `
param(
    [Parameter(Mandatory=$true)][string]$TargetPak,
    [Parameter(Mandatory=$true)][string]$DonorDir,
    [int]$FlipOffset = 16,
    [string]$PatchBin = "true",
    [string]$InjectFiles = "true",
    [string]$BinaryRenames = ""
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$donorFiles = @(
    'zone_settings.json',
    'objective_settings.json',
    'content_settings.json',
    'level_desc.json',
    'user_name_of_map.txt'
)

$zip = [System.IO.Compression.ZipFile]::Open($TargetPak, [System.IO.Compression.ZipArchiveMode]::Update)
$oldHex = "SKIP"
$injectedCount = 0
$patchedEntries = @()

try {
    if ($PatchBin -eq "true") {
        $sslEntry = $null
        foreach ($entry in $zip.Entries) {
            if ($entry.FullName.ToLower().EndsWith('data_for_ssl.bin')) {
                $sslEntry = $entry
                break
            }
        }

        if (-not $sslEntry) {
            throw "W pliku .pak nie znaleziono data_for_ssl.bin!"
        }

        $sslFullName = $sslEntry.FullName
        $sslStream = $sslEntry.Open()
        $sslMs = New-Object System.IO.MemoryStream
        $sslStream.CopyTo($sslMs)
        $sslStream.Close()
        $sslBytes = $sslMs.ToArray()
        $sslMs.Close()

        if ($sslBytes.Length -le $FlipOffset) {
            throw "Plik data_for_ssl.bin jest za krótki ($($sslBytes.Length) B)!"
        }

        $oldByte = $sslBytes[$FlipOffset]
        $oldHex = "0x" + $oldByte.ToString("X2")
        $sslBytes[$FlipOffset] = 1

        # Bezpośrednia podmiana sekwencji bajtów ASCII w tablicy byte[] (np. US_16_02_GARAGE_EXIT -> US_19_02_GARAGE_EXIT)
        if (-not [string]::IsNullOrWhiteSpace($BinaryRenames)) {
            $pairs = $BinaryRenames.Split(';')
            foreach ($pair in $pairs) {
                if ([string]::IsNullOrWhiteSpace($pair)) { continue }
                $parts = $pair.Split('=')
                if ($parts.Length -ne 2) { continue }
                $oldBytes = [System.Text.Encoding]::ASCII.GetBytes($parts[0])
                $newBytes = [System.Text.Encoding]::ASCII.GetBytes($parts[1])
                if ($oldBytes.Length -ne $newBytes.Length -or $oldBytes.Length -eq 0) { continue }

                $patLen = $oldBytes.Length
                $limit = $sslBytes.Length - $patLen
                for ($i = 0; $i -le $limit; $i++) {
                    if ($sslBytes[$i] -eq $oldBytes[0]) {
                        $match = $true
                        for ($j = 1; $j -lt $patLen; $j++) {
                            if ($sslBytes[$i + $j] -ne $oldBytes[$j]) {
                                $match = $false
                                break
                            }
                        }
                        if ($match) {
                            for ($j = 0; $j -lt $patLen; $j++) {
                                $sslBytes[$i + $j] = $newBytes[$j]
                            }
                            $patchedEntries += "$sslFullName@0x$($i.ToString('X'))($($parts[0])->$($parts[1]))"
                        }
                    }
                }
            }
        }

        $sslEntry.Delete()
        $newSslEntry = $zip.CreateEntry($sslFullName, [System.IO.Compression.CompressionLevel]::NoCompression)
        $newSslStream = $newSslEntry.Open()
        $newSslStream.Write($sslBytes, 0, $sslBytes.Length)
        $newSslStream.Close()
    }

    if ($InjectFiles -eq "true") {
        foreach ($fileName in $donorFiles) {
            $localFilePath = Join-Path $DonorDir $fileName
            if (-not (Test-Path $localFilePath)) {
                throw "Brak wygenerowanego pliku: $localFilePath"
            }

            $toRemove = @()
            foreach ($e in $zip.Entries) {
                if ($e.Name.ToLower() -eq $fileName.ToLower()) {
                    $toRemove += $e
                }
            }
            foreach ($rem in $toRemove) {
                $rem.Delete()
            }

            $fileBytes = [System.IO.File]::ReadAllBytes($localFilePath)
            $newEntry = $zip.CreateEntry($fileName, [System.IO.Compression.CompressionLevel]::Optimal)
            $newStream = $newEntry.Open()
            $newStream.Write($fileBytes, 0, $fileBytes.Length)
            $newStream.Close()
            $injectedCount++
        }
    }
} finally {
    $zip.Dispose()
}

$patchedJoined = $patchedEntries -join ','
Write-Output "SUCCESS:$($injectedCount):$($oldHex):$($patchedJoined)"
`;

function analyzeRegionProgression(mapNames, mapData, contractsParsed) {
    const mapsInfo = {};
    const allMissions = {};
    const coreToFullMapName = {};

    for (let i = 0; i < mapNames.length; i++) {
        const mapName = mapNames[i];
        const coreMatch = mapName.match(/^level_([a-z]{2}_\d{2}_\d{2})/i);
        const coreLevel = coreMatch ? `level_${coreMatch[1].toLowerCase()}` : mapName.toLowerCase();
        coreToFullMapName[mapName.toLowerCase()] = mapName;
        coreToFullMapName[coreLevel] = mapName;

        const names = lookupMapNames(mapName);
        mapsInfo[mapName] = {
            mapName,
            titleEn: names.en,
            titlePl: names.pl,
            indexInRegion: mapData[mapName]?.indexInRegion ?? i,
            garages: [],
            gateways: []
        };
    }

    const resolveMapKey = (rawLevelStr) => {
        if (!rawLevelStr) return null;
        const clean = rawLevelStr.replace(/~#@%\$`\*/g, '').trim().toLowerCase();
        if (coreToFullMapName[clean]) return coreToFullMapName[clean];
        const m = clean.match(/^(level_[a-z]{2}_\d{2}_\d{2})/i);
        if (m && coreToFullMapName[m[1].toLowerCase()]) {
            return coreToFullMapName[m[1].toLowerCase()];
        }
        return clean;
    };

    const formatMapLang = (rawMap, lang = 'pl') => {
        const resolved = resolveMapKey(rawMap) || rawMap || 'unknown';
        const names = lookupMapNames(resolved);
        const title = lang === 'pl' ? (names.pl || names.en) : (names.en || names.pl);
        return title ? `${resolved.toUpperCase()} (${title})` : resolved.toUpperCase();
    };

    const lockedZonesLookup = {};
    const mapsWithUpgradeGarageRewards = new Set();

    const addUniqueLock = (lockKey, missionName) => {
        if (!lockedZonesLookup[lockKey]) lockedZonesLookup[lockKey] = [];
        if (!lockedZonesLookup[lockKey].includes(missionName)) {
            lockedZonesLookup[lockKey].push(missionName);
        }
    };

    const registerMission = (item, isContract, ownerMap = null) => {
        const name = item.name;
        const obj = item.obj || {};
        const rawText = item.rawText || '';

        let giverMap = ownerMap;
        const giverMatch = rawText.match(/taskGiverZone\s*=\s*\{[^}]*?"(level_[a-z0-9_]+)\s*\|\|/i);
        if (giverMatch) {
            giverMap = resolveMapKey(giverMatch[1]);
        }

        const stageMaps = new Set();
        if (Array.isArray(obj.stages)) {
            const stagesStr = JSON.stringify(obj.stages);
            const levelRegex = /level_[a-z]{2}_\d{2}_\d{2}(?:_[a-z0-9]+)?/gi;
            let m;
            while ((m = levelRegex.exec(stagesStr)) !== null) {
                const foundMap = resolveMapKey(m[0]);
                if (foundMap && mapsInfo[foundMap]) stageMaps.add(foundMap);
            }
        }

        const blockers = Array.isArray(obj.blockerObjectives) ? [...obj.blockerObjectives] : [];
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
                    if (!zs || typeof zs !== 'object') continue;

                    let targetMapId = zs.mapId ? resolveMapKey(zs.mapId) : null;
                    const targetZoneId = zs.zoneId || '';
                    if (!targetMapId && targetZoneId) {
                        const zPref = targetZoneId.match(/^([A-Za-z]{2}_\d{2}_\d{2})_/);
                        if (zPref) targetMapId = resolveMapKey(`level_${zPref[1].toLowerCase()}`);
                    }
                    if (!targetMapId || !targetZoneId) continue;

                    const props = zs.props || {};

                    if (isActiveProp(props.ZonePropertyGateway)) {
                        const link = props.ZonePropertyGateway.levelZoneLink || '';
                        const rawDestMap = link.includes('||') ? link.split('||')[0].trim() : '';
                        const destMap = resolveMapKey(rawDestMap);
                        const destZone = link.includes('||') ? link.split('||')[1].trim() : '';

                        const lockKey = `${targetMapId}|${targetZoneId}`;
                        addUniqueLock(lockKey, name);

                        unlocksGateways.push({
                            fromMap: targetMapId,
                            zoneId: targetZoneId,
                            toMap: destMap,
                            toZone: destZone
                        });
                    }

                    if (isActiveProp(props.ZonePropertyGarageEntrance)) {
                        const lockKey = `${targetMapId}|${targetZoneId}`;
                        addUniqueLock(lockKey, name);

                        unlocksGarages.push({
                            mapName: targetMapId,
                            zoneId: targetZoneId,
                            rewardKey: rewKey
                        });
                    }
                }
            } else if (rewKey.startsWith('ObjectiveRewardsUpgradeGarage')) {
                const upg = rewards[rewKey];
                const zoneStr = upg?.zone || '';
                const mapPart = zoneStr.includes('||') ? zoneStr.split('||')[0].trim() : '';
                const zonePart = zoneStr.includes('||') ? zoneStr.split('||')[1].trim() : zoneStr;
                const targetMapId = resolveMapKey(mapPart);
                if (targetMapId && zonePart) {
                    mapsWithUpgradeGarageRewards.add(targetMapId);
                    const lockKey = `${targetMapId}|${zonePart}`;
                    addUniqueLock(lockKey, name);

                    if (!unlocksGarages.some(u => u.mapName === targetMapId && u.zoneId === zonePart)) {
                        unlocksGarages.push({
                            mapName: targetMapId,
                            zoneId: zonePart,
                            rewardKey: rewKey
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
        for (const t of (mapData[mapName]?.tasksParsed || [])) {
            registerMission(t, false, mapName);
        }
    }
    for (const c of contractsParsed) {
        registerMission(c, true, null);
    }

    for (const mapName of mapNames) {
        const rawZones = mapData[mapName]?.rawZones || mapData[mapName]?.zonesParsed || [];
        for (const z of rawZones) {
            const props = z.obj?.props || {};
            const lockKey = `${mapName}|${z.name}`;
            const lockedBy = lockedZonesLookup[lockKey] || [];

            if (isActiveProp(props.ZonePropertyGarageEntrance)) {
                mapsInfo[mapName].garages.push({
                    zoneId: z.name,
                    lockedBy
                });
            }

            if (isActiveProp(props.ZonePropertyGateway)) {
                const link = props.ZonePropertyGateway.levelZoneLink || '';
                const rawTargetMap = link.includes('||') ? link.split('||')[0].trim() : '';
                const targetMap = resolveMapKey(rawTargetMap);
                const targetZone = link.includes('||') ? link.split('||')[1].trim() : '';
                const tNames = lookupMapNames(targetMap);

                mapsInfo[mapName].gateways.push({
                    zoneId: z.name,
                    targetMap,
                    targetTitleEn: tNames.en,
                    targetTitlePl: tNames.pl,
                    targetZone,
                    lockedBy
                });
            }
        }

        for (const m of Object.values(allMissions)) {
            for (const ugw of m.unlocksGateways) {
                if (ugw.fromMap === mapName) {
                    const exists = mapsInfo[mapName].gateways.some(g => g.zoneId === ugw.zoneId);
                    if (!exists) {
                        const tNames = lookupMapNames(ugw.toMap);
                        mapsInfo[mapName].gateways.push({
                            zoneId: ugw.zoneId,
                            targetMap: ugw.toMap,
                            targetTitleEn: tNames.en,
                            targetTitlePl: tNames.pl,
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

    const mapsWithOpenGarage = mapNames.filter(m =>
        mapsInfo[m].garages.some(g => g.lockedBy.length === 0)
    );

    let primaryStartMap = mapNames[0];
    let startMapReasonPl = 'Domyślnie pierwsza mapa regionu (_01)';
    let startMapReasonEn = 'Default first map of the region (_01)';

    if (mapsWithOpenGarage.length > 0) {
        mapsWithOpenGarage.sort((a, b) => mapsInfo[a].indexInRegion - mapsInfo[b].indexInRegion);
        primaryStartMap = mapsWithOpenGarage[0];
        const idx = mapsInfo[primaryStartMap].indexInRegion;
        startMapReasonPl = `Posiada otwarty na starcie Garaż oraz najniższy indexInRegion (${idx})`;
        startMapReasonEn = `Has an open Garage from start and the lowest indexInRegion (${idx})`;
    } else {
        const sortedByIdx = [...mapNames].sort((a, b) => mapsInfo[a].indexInRegion - mapsInfo[b].indexInRegion);
        primaryStartMap = sortedByIdx[0];
        const idx = mapsInfo[primaryStartMap].indexInRegion;
        startMapReasonPl = `Brak otwartego garażu na starcie w całym regionie – wybrano mapę z indexInRegion = ${idx}`;
        startMapReasonEn = `No open garage at start in the entire region – selected map with indexInRegion = ${idx}`;
    }

    const reachableMaps = new Set(mapsWithOpenGarage.length > 0 ? mapsWithOpenGarage : [primaryStartMap]);
    const completedMissions = new Set();
    const progressionSteps = [];

    progressionSteps.push({
        pl: `Start symulacji: Gracz rozpoczyna na mapie ${formatMapLang(primaryStartMap, 'pl')} — ${startMapReasonPl}.`,
        en: `Simulation start: Player spawns on ${formatMapLang(primaryStartMap, 'en')} — ${startMapReasonEn}.`
    });

    let changed = true;
    let safetyCounter = 0;

    while (changed && safetyCounter < 500) {
        changed = false;
        safetyCounter++;

        for (const currentMap of Array.from(reachableMaps)) {
            const gwList = mapsInfo[currentMap]?.gateways || [];
            for (const gw of gwList) {
                if (!gw.targetMap || !mapsInfo[gw.targetMap]) continue;
                const isUnlocked = gw.lockedBy.length === 0 || gw.lockedBy.some(mName => completedMissions.has(mName));

                if (isUnlocked && !reachableMaps.has(gw.targetMap)) {
                    reachableMaps.add(gw.targetMap);
                    changed = true;
                    const viaReasonPl = gw.lockedBy.length === 0
                        ? `otwarte od startu przejście ${gw.zoneId}`
                        : `przejście ${gw.zoneId} (odblokowane przez: ${gw.lockedBy.join(', ')})`;
                    const viaReasonEn = gw.lockedBy.length === 0
                        ? `open-from-start gateway ${gw.zoneId}`
                        : `gateway ${gw.zoneId} (unlocked by: ${gw.lockedBy.join(', ')})`;

                    progressionSteps.push({
                        pl: `Odblokowano dojazd do mapy ${formatMapLang(gw.targetMap, 'pl')} z ${formatMapLang(currentMap, 'pl')} przez ${viaReasonPl}.`,
                        en: `Unlocked access to ${formatMapLang(gw.targetMap, 'en')} from ${formatMapLang(currentMap, 'en')} via ${viaReasonEn}.`
                    });
                }
            }
        }

        for (const m of Object.values(allMissions)) {
            if (completedMissions.has(m.name)) continue;
            if (m.giverMap && mapsInfo[m.giverMap] && !reachableMaps.has(m.giverMap)) continue;

            const blockersOk = m.blockerObjectives.every(bName => {
                if (!allMissions[bName]) return false;
                return completedMissions.has(bName);
            });
            if (!blockersOk) continue;

            const stagesOk = m.requiredStageMaps.every(reqMap => reachableMaps.has(reqMap));
            if (!stagesOk) continue;

            completedMissions.add(m.name);
            changed = true;

            if (m.unlocksGateways.length > 0 || m.unlocksGarages.length > 0) {
                const unlockedDescPl = [
                    ...m.unlocksGateways.map(g => `Brama ${g.zoneId} (${formatMapLang(g.fromMap, 'pl')} ➔ ${formatMapLang(g.toMap, 'pl')})`),
                    ...m.unlocksGarages.map(g => `Garaż ${g.zoneId} (${formatMapLang(g.mapName, 'pl')})`)
                ].join(', ');
                const unlockedDescEn = [
                    ...m.unlocksGateways.map(g => `Gateway ${g.zoneId} (${formatMapLang(g.fromMap, 'en')} ➔ ${formatMapLang(g.toMap, 'en')})`),
                    ...m.unlocksGarages.map(g => `Garage ${g.zoneId} (${formatMapLang(g.mapName, 'en')})`)
                ].join(', ');

                progressionSteps.push({
                    pl: `Ukończono kluczową misję [${m.type}] ${m.name} ➔ Odblokowano: ${unlockedDescPl}`,
                    en: `Completed key mission [${m.type}] ${m.name} ➔ Unlocked: ${unlockedDescEn}`
                });
            }
        }
    }

    const unreachableMaps = mapNames.filter(m => !reachableMaps.has(m));
    const criticalDeadlocks = [];
    const secondaryLockedMissions = [];

    for (const uMap of unreachableMaps) {
        criticalDeadlocks.push({
            type: 'UNREACHABLE_MAP',
            target: uMap,
            reasonPl: `Mapa ${formatMapLang(uMap, 'pl')} jest całkowicie nieosiągalna! Żadne otwarte przejście ani możliwa do ukończenia misja nie pozwala na nią wjechać.`,
            reasonEn: `Map ${formatMapLang(uMap, 'en')} is completely unreachable! No open gateway or completable mission grants access to it.`
        });
    }

    for (const m of Object.values(allMissions)) {
        if (completedMissions.has(m.name)) continue;

        const missingExternalBlockers = m.blockerObjectives.filter(b => !allMissions[b]);
        const unMets = m.blockerObjectives.filter(b => allMissions[b] && !completedMissions.has(b));
        const unreachableStageMaps = m.requiredStageMaps.filter(rm => !reachableMaps.has(rm));
        const giverUnreachable = m.giverMap && !reachableMaps.has(m.giverMap);
        const isKeyUnlocker = m.unlocksGateways.length > 0 || m.unlocksGarages.length > 0;

        const reasonsPl = [];
        const reasonsEn = [];

        if (missingExternalBlockers.length > 0) {
            reasonsPl.push(`wymaga w blockerObjectives nieistniejącego zadania: ${missingExternalBlockers.join(', ')}`);
            reasonsEn.push(`requires non-existent blockerObjectives: ${missingExternalBlockers.join(', ')}`);
        }
        if (giverUnreachable) {
            reasonsPl.push(`zleceniodawca (taskGiverZone) leży na niedostępnej mapie ${formatMapLang(m.giverMap, 'pl')}`);
            reasonsEn.push(`taskGiverZone is located on unreachable map ${formatMapLang(m.giverMap, 'en')}`);
        }
        if (unMets.length > 0) {
            reasonsPl.push(`wymaga wcześniejszego ukończenia zablokowanych misji: ${unMets.join(', ')}`);
            reasonsEn.push(`requires completing locked prerequisite missions: ${unMets.join(', ')}`);
        }
        if (unreachableStageMaps.length > 0) {
            reasonsPl.push(`etapy misji wymagają wjazdu na niedostępną mapę: ${unreachableStageMaps.map(x => formatMapLang(x, 'pl')).join(', ')}`);
            reasonsEn.push(`mission stages require entering unreachable map: ${unreachableStageMaps.map(x => formatMapLang(x, 'en')).join(', ')}`);
        }

        if (isKeyUnlocker || missingExternalBlockers.length > 0 || (!giverUnreachable && unreachableStageMaps.length === 0)) {
            criticalDeadlocks.push({
                type: isKeyUnlocker
                    ? 'CRITICAL_GATEWAY_DEADLOCK'
                    : missingExternalBlockers.length > 0
                        ? 'MISSING_BLOCKER_DEADLOCK'
                        : 'LOGIC_CYCLE_DEADLOCK',
                target: m.name,
                isKeyUnlocker,
                reasonPl: `[${m.type}: ${m.name}] ${isKeyUnlocker ? '(OTWIERA PRZEJŚCIE/GARAŻ!) ' : ''}Nie może zostać ukończona, ponieważ: ${reasonsPl.join(' ORAZ ')}.`,
                reasonEn: `[${m.type}: ${m.name}] ${isKeyUnlocker ? '(UNLOCKS GATEWAY/GARAGE!) ' : ''}Cannot be completed because: ${reasonsEn.join(' AND ')}.`
            });
        } else {
            secondaryLockedMissions.push({
                type: 'SECONDARY_LOCKED_MISSION',
                target: m.name,
                reasonPl: `[${m.type}: ${m.name}] Czeka na odblokowanie dojazdu do mapy (${reasonsPl.join(' ORAZ ')}).`,
                reasonEn: `[${m.type}: ${m.name}] Waiting for map access unlock (${reasonsEn.join(' AND ')}).`
            });
        }
    }

    const startNames = lookupMapNames(primaryStartMap);
    return {
        primaryStartMap,
        startTitleEn: startNames.en,
        startTitlePl: startNames.pl,
        startMapReason: startMapReasonPl,
        startMapReasonPl,
        startMapReasonEn,
        mapsWithOpenGarage,
        mapsWithUpgradeGarageRewards: Array.from(mapsWithUpgradeGarageRewards),
        mapsInfo,
        reachableMaps: Array.from(reachableMaps),
        unreachableMaps,
        totalMissionsCount: Object.keys(allMissions).length,
        completableMissionsCount: completedMissions.size,
        progressionSteps,
        criticalDeadlocks,
        secondaryLockedMissions,
        deadlocks: criticalDeadlocks
    };
}

const PS_PICK_FOLDER = `
param([string]$InitialDir = "")
Add-Type -AssemblyName System.Windows.Forms
$form = New-Object System.Windows.Forms.Form
$form.TopMost = $true
$dialog = New-Object System.Windows.Forms.FolderBrowserDialog
$dialog.Description = "Wybierz folder docelowy / Select target folder"
$dialog.ShowNewFolderButton = $true
if ($InitialDir -and (Test-Path $InitialDir)) {
    $dialog.SelectedPath = $InitialDir
}
$res = $dialog.ShowDialog($form)
if ($res -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output "SELECTED:$($dialog.SelectedPath)"
} else {
    Write-Output "CANCELLED"
}
`;

const PS_PICK_ZIP_FILE = `
param([string]$InitialDir = "")
Add-Type -AssemblyName System.Windows.Forms
$form = New-Object System.Windows.Forms.Form
$form.TopMost = $true
$ofd = New-Object System.Windows.Forms.OpenFileDialog
$ofd.Title = "Wybierz spakowany plik .zip moda / Select Mod .zip"
$ofd.Filter = "Mod ZIP (*.zip)|*.zip"
if ($InitialDir -and (Test-Path $InitialDir)) {
    $ofd.InitialDirectory = $InitialDir
}
if ($ofd.ShowDialog($form) -eq [System.Windows.Forms.DialogResult]::OK) {
    Write-Output "SELECTED:$($ofd.FileName)"
} else {
    Write-Output "CANCELLED"
}
`;

const PS_EXTRACT_JSON_FROM_ZIP = `
param(
    [Parameter(Mandatory=$true)][string]$ZipPath,
    [Parameter(Mandatory=$true)][string]$TempJsonOut
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::OpenRead($ZipPath)
try {
    $target = $null
    foreach ($e in $zip.Entries) {
        if ($e.Name.ToLower() -eq 'objective_settings.json') {
            $target = $e
            break
        }
    }
    if (-not $target) {
        throw "W pliku .zip nie znaleziono objective_settings.json!"
    }
    [System.IO.Compression.ZipFileExtensions]::ExtractToFile($target, $TempJsonOut, $true)
    Write-Output "EXTRACTED:$($target.FullName)"
} finally {
    $zip.Dispose()
}
`;

const PS_UPDATE_JSON_IN_ZIP = `
param(
    [Parameter(Mandatory=$true)][string]$ZipPath,
    [Parameter(Mandatory=$true)][string]$ModifiedMainJsonPath,
    [string]$ModifiedLocalJsonPath = ""
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zip = [System.IO.Compression.ZipFile]::Open($ZipPath, [System.IO.Compression.ZipArchiveMode]::Update)
try {
    $mainEntry = $null
    foreach ($e in $zip.Entries) {
        if ($e.Name.ToLower() -eq 'objective_settings.json') {
            $mainEntry = $e
            break
        }
    }
    if (-not $mainEntry) {
        throw "W pliku .zip nie znaleziono objective_settings.json!"
    }
    $mainFullName = $mainEntry.FullName
    $mainEntry.Delete()
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $ModifiedMainJsonPath, $mainFullName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null

    if ($ModifiedLocalJsonPath -and (Test-Path $ModifiedLocalJsonPath)) {
        $localEntry = $null
        foreach ($e in $zip.Entries) {
            if ($e.Name.ToLower() -eq 'local_objective_settings.json') {
                $localEntry = $e
                break
            }
        }
        if ($localEntry) {
            $localFullName = $localEntry.FullName
            $localEntry.Delete()
            [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $ModifiedLocalJsonPath, $localFullName, [System.IO.Compression.CompressionLevel]::Optimal) | Out-Null
        }
    }
} finally {
    $zip.Dispose()
}
Write-Output "UPDATED_OK"
`;

function runPowerShell(scriptText, args = [], useSta = false) {
    const tmpScript = path.join(os.tmpdir(), `sr_ps_${Date.now()}_${Math.random().toString(36).slice(2)}.ps1`);
    fs.writeFileSync(tmpScript, scriptText, 'utf8');
    try {
        const psArgs = [
            '-NoProfile',
            ...(useSta ? ['-Sta'] : []),
            '-ExecutionPolicy', 'Bypass',
            '-File', tmpScript,
            ...args
        ];
        const r = spawnSync('powershell.exe', psArgs, { encoding: 'utf8' });

        return {
            status: r.status,
            stdout: (r.stdout || '').trim(),
            stderr: (r.stderr || '').trim()
        };
    } finally {
        fs.rmSync(tmpScript, { force: true });
    }
}

function extractCleanLevelFromBlockerMap(rawVal) {
    if (!rawVal || typeof rawVal !== 'string') return '';
    let clean = rawVal.trim();
    if (!clean) return '';

    clean = clean.replace(/~#@%\$`\*/g, '').trim();
    const matchLevel = clean.match(/(level_[a-z0-9_]+)$/i);
    if (matchLevel) {
        return matchLevel[1].toLowerCase();
    }
    return clean.replace(/^\d+_/, '').toLowerCase();
}

function processBlockerMapsInJsonObj(jsonObj, mode = 'scan', modioId = '') {
    const contracts = jsonObj?.SslValue?.contractsSettings || [];
    const tasks = jsonObj?.SslValue?.tasksSettings || [];
    const foundItems = [];

    const processList = (list, listType) => {
        if (!Array.isArray(list)) return;
        for (const item of list) {
            if (!item || typeof item !== 'object') continue;
            const currentVal = item.blockerMap;
            if (typeof currentVal === 'string' && currentVal.trim() !== '') {
                const cleanLevel = extractCleanLevelFromBlockerMap(currentVal);
                let newVal = currentVal;

                if (mode === 'modio') {
                    newVal = `${modioId.trim()}_${cleanLevel}`;
                    item.blockerMap = newVal;
                } else if (mode === 'local') {
                    newVal = `~#@%$\`*${cleanLevel}~#@%$\`*`;
                    item.blockerMap = newVal;
                }

                foundItems.push({
                    type: listType,
                    name: item.name || 'Unnamed',
                    blockerObjectives: item.blockerObjectives || [],
                    oldBlockerMap: currentVal,
                    cleanLevel,
                    newBlockerMap: mode === 'scan'
                        ? (modioId ? `${modioId.trim()}_${cleanLevel}` : cleanLevel)
                        : newVal
                });
            }
        }
    };

    processList(contracts, 'Contract');
    processList(tasks, 'Task');

    return foundItems;
}

function getRawCacheBlockText(gameDir, workDir, forceRefresh = false) {
    const initialPakPath = path.join(gameDir, 'initial.pak');
    if (!fs.existsSync(initialPakPath)) {
        throw new Error(`Nie znaleziono pliku initial.pak w: ${initialPakPath}`);
    }

    const cacheDir = path.join(workDir, '_cache');
    fs.mkdirSync(cacheDir, { recursive: true });
    const extractedCacheBlock = path.join(cacheDir, 'initial.cache_block');
    const metaFile = path.join(cacheDir, 'initial_meta.json');

    const pakStat = fs.statSync(initialPakPath);
    let needExtract = forceRefresh || !fs.existsSync(extractedCacheBlock) || !fs.existsSync(metaFile);

    if (!needExtract) {
        try {
            const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
            if (meta.mtimeMs !== pakStat.mtimeMs || meta.size !== pakStat.size) {
                needExtract = true;
            }
        } catch {
            needExtract = true;
        }
    }

    if (needExtract) {
        let exePath = sevenBin.path7za;
        if (exePath.includes('app.asar')) {
            exePath = exePath.replace('app.asar', 'app.asar.unpacked');
        }

        const res = spawnSync(exePath, [
            'e', initialPakPath,
            `-o${cacheDir}`,
            'initial.cache_block',
            '-r', '-y'
        ], { encoding: 'utf8' });

        if (res.status !== 0 && !(res.stdout || '').includes('Everything is Ok')) {
            throw new Error(`Błąd 7-Zip: ${res.stderr || res.stdout}`);
        }

        fs.writeFileSync(metaFile, JSON.stringify({ mtimeMs: pakStat.mtimeMs, size: pakStat.size }));
        cachedRawEngineText = null;
    }

    if (!cachedRawEngineText || cachedEnginePath !== extractedCacheBlock) {
        cachedRawEngineText = fs.readFileSync(extractedCacheBlock, 'utf8');
        cachedEnginePath = extractedCacheBlock;
    }

    return cachedRawEngineText;
}

function scanAvailableRegions(gameDir) {
    if (!fs.existsSync(gameDir)) return {};
    const files = fs.readdirSync(gameDir);
    const regions = {};

    const regex = /^level_([a-z]{2}_\d{2})_(\d{2}(?:_[a-z0-9]+)?)\.pak$/i;
    for (const file of files) {
        const match = file.match(regex);
        if (match) {
            const regionCode = match[1].toUpperCase();
            if (!regions[regionCode]) regions[regionCode] = [];
            regions[regionCode].push(file.toLowerCase());
        }
    }

    for (const reg in regions) {
        regions[reg].sort();
    }
    return regions;
}

function stripUpgradeGarageRewards(compiledMission, addLog) {
    if (!compiledMission.rewards) return;
    const removedKeys = [];
    for (const k of Object.keys(compiledMission.rewards)) {
        if (k.startsWith('ObjectiveRewardsUpgradeGarage')) {
            delete compiledMission.rewards[k];
            removedKeys.push(k);
        }
    }
    if (removedKeys.length > 0 && addLog) {
        addLog('info', 'GARAGE-MODE', `[Misja: ${compiledMission.name}] Odpięto ${removedKeys.join(', ')}`);
    }
}

function findPathsInJson(node, needle, curPath = '$', out = []) {
    if (typeof node === 'string') {
        if (node.toUpperCase().includes(needle)) out.push(`${curPath} = "${node}"`);
    } else if (Array.isArray(node)) {
        node.forEach((n, i) => findPathsInJson(n, needle, `${curPath}[${i}]`, out));
    } else if (node && typeof node === 'object') {
        for (const [k, v] of Object.entries(node)) {
            if (k.toUpperCase().includes(needle)) out.push(`${curPath}.${k} (klucz)`);
            findPathsInJson(v, needle, `${curPath}.${k}`, out);
        }
    }
    return out;
}
function auditOutput(docs, addLog) {
    const norm = s => String(s || '').replace(/~#@%\$`\*/g, '').trim().toLowerCase();
    const definedByMap = new Set();
    const definedAnyMap = new Set();

    for (const [label, json] of docs) {
        if (label.endsWith('/zones')) {
            const mapKey = norm(label.split('/')[0]);
            for (const z of (JSON.parse(json)?.SslValue?.zoneDesc || [])) {
                definedByMap.add(`${mapKey}|${z.name}`);
                definedAnyMap.add(z.name);
            }
        }
    }

    const seen = new Set();
    const report = (tag, msg) => {
        if (!seen.has(msg)) {
            seen.add(msg);
            addLog('warn', tag, msg);
        }
    };

    const walk = (node, curPath, currentMapKey) => {
        if (Array.isArray(node)) {
            node.forEach((n, i) => {
                if (n === null || n === undefined) {
                    report('NULL-IN-ARRAY', `${curPath}[${i}]`);
                } else {
                    walk(n, `${curPath}[${i}]`, currentMapKey);
                }
            });
        } else if (node && typeof node === 'object') {
            if (node.mapId && node.zoneId && !definedByMap.has(`${norm(node.mapId)}|${node.zoneId}`)) {
                report('DANGLING-REF', `${curPath}: ${node.mapId} || ${node.zoneId}`);
            }
            if (node.$type === 'ZonePropertyGateway' && !node.levelZoneLink) {
                report('EMPTY-GATEWAY', curPath);
            }
            if (node.platformId && currentMapKey && !definedByMap.has(`${currentMapKey}|${node.platformId}`)) {
                report('DANGLING-PLATFORM', `${curPath}.platformId = "${node.platformId}"`);
            }
            for (const [k, v] of Object.entries(node)) {
                if (
                    ['additionalTaskGivers', 'additionalUnloadZones', 'additionalDeliveryZones'].includes(k) &&
                    Array.isArray(v)
                ) {
                    v.forEach((zName, idx) => {
                        if (typeof zName === 'string' && !zName.includes('||') && !definedAnyMap.has(zName)) {
                            report('DANGLING-LIST-ZONE', `${curPath}.${k}[${idx}] = "${zName}"`);
                        }
                    });
                }
                walk(v, `${curPath}.${k}`, currentMapKey);
            }
        } else if (typeof node === 'string' && node.includes('||')) {
            const [lv, zn] = node.split('||').map(s => s.trim());
            if (!definedByMap.has(`${norm(lv)}|${zn}`)) {
                report('DANGLING-REF', `${curPath}: ${node}`);
            }
        }
    };

    for (const [label, json] of docs) {
        const mapKey = label.includes('/') ? norm(label.split('/')[0]) : '';
        walk(JSON.parse(json), label, mapKey);
    }

    if (seen.size === 0) {
        addLog('success', 'STRUCT-AUDIT', 'Audyt strukturalny JSON: 0 pustych bram, 0 nulli w tablicach, 0 wiszących referencji stref!');
    }
}
function inspectSnowRunnerLogs() {
    const logs = [];
    const pushLog = (level, tag, message) => logs.push({ time: formatTime(), level, tag, message });

    const home = os.homedir();
    const candidateDirs = [
        'C:\\Users\\21Kuben\\OneDrive\\Dokumenty\\My Games\\SnowRunner\\base\\logs',
        path.join(home, 'OneDrive', 'Dokumenty', 'My Games', 'SnowRunner', 'base', 'logs'),
        path.join(home, 'OneDrive', 'Documents', 'My Games', 'SnowRunner', 'base', 'logs'),
        path.join(home, 'Dokumenty', 'My Games', 'SnowRunner', 'base', 'logs'),
        path.join(home, 'Documents', 'My Games', 'SnowRunner', 'base', 'logs'),
        path.join(process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local'), 'Saber', 'SnowRunner', 'storage', 'logs')
    ];

    const foundDirs = [...new Set(candidateDirs.filter(d => fs.existsSync(d)))];
    if (foundDirs.length === 0) {
        pushLog('warn', 'GAME-LOGS', 'Nie znaleziono katalogu base\\logs ani AppData\\Local\\Saber\\SnowRunner.');
        return logs;
    }

    for (const dir of foundDirs) {
        pushLog('info', 'GAME-LOGS', `Skanowanie katalogu logów gry: ${dir}`);
        const modErrPath = path.join(dir, 'ModMapError.txt');
        if (fs.existsSync(modErrPath)) {
            const stat = fs.statSync(modErrPath);
            const content = fs.readFileSync(modErrPath, 'utf8').trim();
            if (!content) {
                pushLog('success', 'MOD-MAP-ERROR', `Plik ModMapError.txt jest PUSTY (0 błędów walidatora)! Ostatnia modyfikacja: ${stat.mtime.toLocaleTimeString()}`);
            } else {
                const lines = content.split(/\r?\n/);
                pushLog('warn', 'MOD-MAP-ERROR', `Wykryto ${lines.length} linii w ModMapError.txt (zmodyfikowano: ${stat.mtime.toLocaleTimeString()}):`);
                lines.slice(-25).forEach(l => pushLog('warn', 'MOD-MAP-ERROR', l));
            }
        }

        const files = fs.readdirSync(dir)
            .filter(f => /\.(log|txt)$/i.test(f) && f.toLowerCase() !== 'modmaperror.txt')
            .map(f => {
                const full = path.join(dir, f);
                return { name: f, full, mtimeMs: fs.statSync(full).mtimeMs };
            })
            .sort((a, b) => b.mtimeMs - a.mtimeMs)
            .slice(0, 3);

        for (const f of files) {
            try {
                const raw = fs.readFileSync(f.full, 'utf8');
                const lines = raw.split(/\r?\n/).filter(Boolean);
                const errLines = lines.filter(l => /error|assert|exception|fatal|crash|invalid|garage|ssl|deadlock|fail/i.test(l));
                pushLog('info', f.name, `Ostatnie linie z ${f.name} (łącznie ${lines.length} linii, podejrzanych: ${errLines.length}):`);
                errLines.slice(-15).forEach(l => pushLog('warn', f.name, l));
                lines.slice(-10).forEach(l => pushLog('info', `${f.name}-TAIL`, l));
            } catch (e) {
                pushLog('warn', f.name, `Nie udało się odczytać: ${e.message}`);
            }
        }
    }
    return logs;
}
function buildRegionPipeline({
                                 region,
                                 gameDir,
                                 outputBaseDir,
                                 patchBin = true,
                                 patchBinStrings = false,
                                 injectFiles = true,
                                 forceCacheRefresh = false,
                                 zoneFilterMode = 'smart',
                                 autoInferBlockerMap = false,
                                 garageMode = 'remap_to_pak',
                                 compatMode = 'normal'
                             }) {
    const logs = [];
    const addLog = (level, tag, message) => {
        const entry = { time: formatTime(), level, tag, message };
        console.log(`[${entry.time}] [${tag}] ${message}`);
        logs.push(entry);
    };

    const normRegion = region.trim().toUpperCase();
    const countryCode = normRegion.slice(0, 2).toUpperCase();
    const allRegions = scanAvailableRegions(gameDir);
    const pakFiles = allRegions[normRegion];

    if (!pakFiles || pakFiles.length === 0) {
        throw new Error(`Brak plików level_${normRegion.toLowerCase()}_xx.pak w: ${gameDir}`);
    }

    const workBaseDir = outputBaseDir || getLocalBaseOutputDir();
    const baseOutputDir = path.join(workBaseDir, normRegion);
    fs.mkdirSync(baseOutputDir, { recursive: true });

    addLog(
        'info',
        'INIT',
        `SR Studio v7.8 — Budowanie ${normRegion} | Garaż: ${garageMode} | Tryb: ${compatMode} | Edycja nazw w .bin: ${patchBinStrings ? 'WŁĄCZONA (Eksperymentalna)' : 'WYŁĄCZONA (Tylko diagnostyka)'}`
    );

    const t0 = Date.now();
    const rawCacheText = getRawCacheBlockText(gameDir, workBaseDir, forceCacheRefresh);
    const lineCount = rawCacheText.split('\n').length;
    const sizeMb = (rawCacheText.length / 1048576).toFixed(2);
    const elapsedReadMs = Date.now() - t0;

    addLog('info', 'ENGINE', `Wczytano initial.cache_block (${sizeMb} MB, ${lineCount.toLocaleString()} linii) w ${elapsedReadMs} ms.`);

    const tExtract = Date.now();
    const mapNames = pakFiles.map(f => f.replace(/\.pak$/i, ''));
    const extractor = new CacheBlockExtractor(rawCacheText);
    const { mapData, contractsParsed, missionUsedZones, contestUsedZones } = extractor.extractForRegion(normRegion, mapNames, zoneFilterMode);
    const elapsedExtractMs = Date.now() - tExtract;

    addLog('info', 'PARSER', `Wyodrębniono strukturę regionu w ${elapsedExtractMs} ms. Strefy w misjach: ${missionUsedZones.length} | Strefy w Contestach (wykluczane): ${contestUsedZones.length}`);

    const progressionReport = analyzeRegionProgression(mapNames, mapData, contractsParsed);
    const hubMapName = progressionReport.primaryStartMap;
    const upgradeGarageMapsSet = new Set(progressionReport.mapsWithUpgradeGarageRewards || []);

    addLog(
        'info',
        'START-MAP',
        `Wykryta mapa startowa (Hub): ${hubMapName.toUpperCase()} (${progressionReport.startTitlePl || progressionReport.startTitleEn})`
    );

    helperInstance.clearWarnings();
    helperInstance.resetNullCount();

    const taskToMapLookup = {};
    for (const mapName of mapNames) {
        for (const t of mapData[mapName].tasksParsed) {
            taskToMapLookup[t.name] = mapName;
        }
    }

    const regionKnownZones = new Set(mapNames.flatMap(m => mapData[m].rawZones.map(z => z.name)));
    const stripZonePfx = (n) => n.replace(/^[A-Z]{2}_\d{2}_\d{2}_/i, '').toUpperCase();

    const allExportedZonesSet = new Set();
    const allCompiledTasks = [];
    const mapsOutput = [];
    const builtPakPaths = [];
    const comparisonItems = [];
    let totalFilteredZonesCount = 0;
    let totalMoney = 0;
    let totalXp = 0;

    for (const pakFile of pakFiles) {
        const mapName = pakFile.replace(/\.pak$/i, '');
        const currentMapData = mapData[mapName];
        const mapBuildDir = path.join(baseOutputDir, `files_${mapName}`);
        fs.mkdirSync(mapBuildDir, { recursive: true });

        const srcPakPath = path.join(gameDir, pakFile);
        const usesUpgradeGarage = upgradeGarageMapsSet.has(mapName);

        // Skanujemy fizyczne identyfikatory stref wewnątrz pliku .pak (w 100% bezinwazyjnie - tylko odczyt)
        const physicalPakZonesSet = getPhysicalZonesFromPak(srcPakPath);
        const prefix = currentMapData.shortCode + '_';
        const foreignZonesInPak = [...physicalPakZonesSet].filter(
            z => !z.toUpperCase().startsWith(prefix) && !z.toUpperCase().startsWith('MAP_TRANSITION_')
        );

        addLog(
            'info',
            'PAK-DIAG',
            `[${pakFile}] Fizycznych stref w .pak: ${physicalPakZonesSet.size} | Obce prefiksy w binariach .pak: ${foreignZonesInPak.join(', ') || 'brak'}`
        );

        const binaryRenamePairsForPak = [];
        const missingInPakDiagnostics = [];

        const userNameTxt = helperInstance.formatLevelName(mapName);
        const contentSettingsJson = JSON.stringify({
            prices: [],
            startingLevel: 1,
            startingMoney: 5000,
            states: []
        }, null, 2);

        const levelDescJson = JSON.stringify({
            SslType: "LevelDesc",
            SslValue: {
                globalMapPreview: "globalimage",
                saveSlotMapPreview: "saveimage"
            },
            popupSettings: {
                objectives: [],
                uiIcon: "",
                uiText: "",
                uiTitle: ""
            }
        }, null, 2);

        const transformedZones = [];

        for (const zItem of currentMapData.zonesParsed) {

            const zProps = zItem.obj?.props || {};
            let finalZoneName = zItem.name;

            const HARDCODED_PHANTOM_ZONES = new Set([
                'US_19_01_TEST_CAM',
                'US_19_01_TEST_CAM_GIVER',
                'US_19_01_MINI_BRIDGE_02_A',
                'US_19_01_MINI_BRIDGE_02_B',
                'US_19_02_REPAIR_BRIDGE_01_A_TASK',
                'US_19_02_REPAIR_BRIDGE_01_B_TASK',
                'US_19_02_REPAIR_BRIDGE_02_A_TASK',
                'US_19_02_REPAIR_BRIDGE_02_B_TASK',
                'US_19_02_REPAIR_BRIDGE_03_B_TASK',
                'US_19_02_REPAIR_BRIDGE_03_A_TASK',
                'US_19_02_COURIER_09',
                'US_19_03_SCIENCE_TRAILER_BLOKER_02'
            ]);

            if (HARDCODED_PHANTOM_ZONES.has(finalZoneName)) {
                addLog('info', 'PHANTOM-DROP', `[${mapName}] Pominięto strefę-widmo (nieobecną na scenie 3D): ${finalZoneName}`);
                continue;
            }

            const existsInPak = physicalPakZonesSet.size === 0 || physicalPakZonesSet.has(finalZoneName);
            let matchedForeignZoneInPak = null;

            if (!existsInPak) {
                const cands = [...physicalPakZonesSet].filter(
                    pz => !regionKnownZones.has(pz) && stripZonePfx(pz) === stripZonePfx(finalZoneName)
                );
                if (cands.length === 1) {
                    matchedForeignZoneInPak = cands[0];
                }
                missingInPakDiagnostics.push(
                    matchedForeignZoneInPak
                        ? `${finalZoneName} (w .pak istnieje odpowiednik: ${matchedForeignZoneInPak})`
                        : `${finalZoneName} (BRAK odpowiednika w .pak!)`
                );
            }

            // Jeśli użytkownik WŁĄCZYŁ eksperymentalne nadpisywanie .bin:
            if (patchBinStrings && !existsInPak && matchedForeignZoneInPak && matchedForeignZoneInPak.length === finalZoneName.length) {
                binaryRenamePairsForPak.push(`${matchedForeignZoneInPak}=${finalZoneName}`);
                addLog(
                    'warn',
                    'PAK-BIN-PATCH',
                    `[${pakFile}] Eksperymentalny zapis binarny w .pak: "${matchedForeignZoneInPak}" ➔ "${finalZoneName}"`
                );
            }

            // A. Tryb kompatybilności: usuwanie MiniObjectives
            if (compatMode === 'no_mini_objectives' && zItem.obj?.props) {
                delete zItem.obj.props.ZonePropertyMiniObjectiveCargo;
                delete zItem.obj.props.ZonePropertyMiniObjectiveVisitAllZones;
            }

            // B. Obsługa ulepszanych garaży i brakującego GARAGE_EXIT (bez psucia pliku .bin!)
            if (usesUpgradeGarage) {
                if (garageMode === 'disable_second_garage') {
                    // Jeśli to GARAGE_EXIT, którego nie ma w .pak (lub wyłączamy garaż), CAŁKOWICIE pomijamy go w zone_settings.json!
                    if (isActiveProp(zProps.ZonePropertyGarageExit) || finalZoneName.endsWith('_GARAGE_EXIT')) {
                        addLog(
                            'info',
                            'GARAGE-FIX',
                            `[${mapName}] Całkowicie pominięto strefę "${finalZoneName}" w zone_settings.json (Tryb: disable_second_garage -> brak błędu Invalid zone i brak zwiechy C++)`
                        );
                        continue;
                    }
                    if (isActiveProp(zProps.ZonePropertyGarageEntrance)) {
                        const neutralZone = {
                            "$type": "ZoneSettings",
                            "isForCoop": false,
                            "name": finalZoneName,
                            "props": {}
                        };
                        transformedZones.push(neutralZone);
                        allExportedZonesSet.add(finalZoneName);
                        addLog('info', 'GARAGE-FIX', `[${mapName}] Wyłączono właściwość garażową w "${finalZoneName}" (ustawiono props: {})`);
                        comparisonItems.push({
                            category: `Zone (${mapName.replace(/^level_/i, '').toUpperCase()})`,
                            name: finalZoneName,
                            rawText: zItem.rawText,
                            compiledJson: JSON.stringify(neutralZone, null, 2)
                        });
                        continue;
                    }
                } else if (garageMode === 'remap_to_pak' || garageMode === 'convert_to_normal') {
                    // Jeśli strefa (np. US_19_02_GARAGE_EXIT) nie istnieje w .pak, ale w .pak jest jej obcy odpowiednik (US_16_02_GARAGE_EXIT)
                    // i nie jest używana po nazwie w żadnej misji -> używamy w zone_settings.json fizycznej nazwy z .pak!
                    if (!existsInPak && matchedForeignZoneInPak && !missionUsedZones.includes(finalZoneName)) {
                        addLog(
                            'success',
                            'GARAGE-JSON-REMAP',
                            `[${mapName}] Dopasowano nazwę strefy w zone_settings.json do fizycznej sceny .pak (bez edycji .bin!): "${finalZoneName}" ➔ "${matchedForeignZoneInPak}"`
                        );
                        finalZoneName = matchedForeignZoneInPak;
                    }

                    if (garageMode === 'convert_to_normal' && isActiveProp(zProps.ZonePropertyGarageEntrance)) {
                        const openGarageZone = {
                            "$type": "ZoneSettings",
                            "isForCoop": false,
                            "name": finalZoneName,
                            "props": {
                                "ZonePropertyGarageEntrance": {
                                    "$type": "ZonePropertyGarageEntrance"
                                }
                            }
                        };
                        transformedZones.push(openGarageZone);
                        allExportedZonesSet.add(finalZoneName);
                        addLog('info', 'GARAGE-FIX', `[${mapName}] Zamieniono "${finalZoneName}" na zwykły otwarty garaż`);
                        comparisonItems.push({
                            category: `Zone (${mapName.replace(/^level_/i, '').toUpperCase()})`,
                            name: finalZoneName,
                            rawText: zItem.rawText,
                            compiledJson: JSON.stringify(openGarageZone, null, 2)
                        });
                        continue;
                    }
                }
            }

            const compiled = zoneTransformerInstance.transformZones(zItem.obj, finalZoneName);
            if (compiled) {
                transformedZones.push(compiled);
                allExportedZonesSet.add(finalZoneName);
                comparisonItems.push({
                    category: `Zone (${mapName.replace(/^level_/i, '').toUpperCase()})`,
                    name: finalZoneName,
                    rawText: zItem.rawText,
                    compiledJson: JSON.stringify(compiled, null, 2)
                });
            }
        }

        if (missingInPakDiagnostics.length > 0) {
            addLog(
                'warn',
                'PAK-MISSING-ZONES',
                `[${pakFile}] Strefy z initial.cache_block nieobecne pod swoją nazwą w binariach .pak (${missingInPakDiagnostics.length}): ${missingInPakDiagnostics.join(' | ')}`
            );
        } else {
            addLog('success', 'PAK-DIAG', `[${pakFile}] 100% stref z zone_settings.json fizycznie istnieje w binariach pliku .pak!`);
        }

        const zoneSettingsJson = JSON.stringify({
            Country: countryCode,
            SslType: "MapWithZonesDesc",
            SslValue: {
                isNeedToBeCloacked: false,
                name: helperInstance.formatLevelName(mapName),
                zoneDesc: transformedZones
            }
        }, null, 2);

        // Pętla Tasków:
        const transformedTasks = [];
        const tasksSourceList = compatMode === 'zones_only' ? [] : currentMapData.tasksParsed;
        for (const tItem of tasksSourceList) {
            const compiled = taskTransformer.transformTask(tItem.obj, tItem.name, false);
            if (compiled) {
                if (usesUpgradeGarage && (garageMode === 'convert_to_normal' || garageMode === 'disable_second_garage')) {
                    stripUpgradeGarageRewards(compiled, addLog);
                }

                transformedTasks.push(compiled);
                allCompiledTasks.push(compiled);
                totalMoney += compiled.rewards?.ObjectiveRewardMoney?.amount || 0;
                totalXp += compiled.rewards?.ObjectiveRewardExperience?.amount || 0;
                comparisonItems.push({
                    category: `Task (${mapName.replace(/^level_/i, '').toUpperCase()})`,
                    name: tItem.name,
                    rawText: tItem.rawText,
                    compiledJson: JSON.stringify(compiled, null, 2)
                });
            }
        }

        const objectiveSettingsJson = JSON.stringify({
            ExternalData: [],
            SslType: "ObjectiveSettings",
            SslValue: {
                contestSettings: [],
                contractsSettings: [],
                employer: [],
                name: "objectiveSettings",
                tasksSettings: transformedTasks
            }
        }, null, 2);

        fs.writeFileSync(path.join(mapBuildDir, 'user_name_of_map.txt'), userNameTxt, 'utf8');
        fs.writeFileSync(path.join(mapBuildDir, 'content_settings.json'), contentSettingsJson, 'utf8');
        fs.writeFileSync(path.join(mapBuildDir, 'level_desc.json'), levelDescJson, 'utf8');
        fs.writeFileSync(path.join(mapBuildDir, 'zone_settings.json'), zoneSettingsJson, 'utf8');
        fs.writeFileSync(path.join(mapBuildDir, 'objective_settings.json'), objectiveSettingsJson, 'utf8');

        const destPakPath = path.join(baseOutputDir, pakFile);
        fs.copyFileSync(srcPakPath, destPakPath);

        const patchRes = runPowerShell(PS_INJECT_AND_PATCH, [
            destPakPath,
            mapBuildDir,
            String(FLIP_OFFSET),
            patchBin ? 'true' : 'false',
            injectFiles ? 'true' : 'false',
            patchBinStrings ? binaryRenamePairsForPak.join(';') : ''
        ]);

        if (patchRes.status !== 0 || !patchRes.stdout.includes('SUCCESS:')) {
            throw new Error(`Błąd modyfikacji ${pakFile}: ${patchRes.stderr || patchRes.stdout}`);
        }

        builtPakPaths.push(destPakPath);

        const parts = patchRes.stdout.split(':');
        const injectedCount = parts[1];
        const oldByteHex = parts[2];
        const patchedFilesLog = parts.slice(3).join(':');

        if (patchedFilesLog) {
            addLog('warn', 'PAK-BIN-PATCH', `[${pakFile}] Zmodyfikowano binarnie wewnątrz .pak wpis: ${patchedFilesLog}`);
        }

        const filteredCount = currentMapData.filteredOutZones?.length || 0;
        totalFilteredZonesCount += filteredCount;

        const mNames = lookupMapNames(mapName);
        addLog(
            'success',
            mapName.toUpperCase(),
            `(${mNames.pl || mNames.en || mapName}) Strefy: ${transformedZones.length} (odfiltrowano: ${filteredCount}) | Taski: ${transformedTasks.length} | SSL Bin: ${oldByteHex}->0x01 | Wstrzyknięto luzem: ${injectedCount}/5`
        );

        mapsOutput.push({
            mapName,
            titleEn: mNames.en,
            titlePl: mNames.pl,
            pakFile,
            pakFullPath: destPakPath,
            isStartMap: hubMapName === mapName,
            indexInRegion: currentMapData.indexInRegion ?? 0,
            rawZonesCount: currentMapData.rawZones?.length || transformedZones.length,
            zonesCount: transformedZones.length,
            filteredZonesCount: filteredCount,
            filteredOutZones: currentMapData.filteredOutZones || [],
            tasksCount: transformedTasks.length,
            oldByteHex,
            injectedCount: Number(injectedCount),
            zoneSettingsJson,
            objectiveSettingsJson
        });
    }

    // Pętla Kontraktów:
    const transformedContracts = [];
    const blockerMapAudit = [];
    const contractsSourceList = (compatMode === 'zones_only' || compatMode === 'no_contracts') ? [] : contractsParsed;

    for (const cItem of contractsSourceList) {
        const compiled = taskTransformer.transformTask(cItem.obj, cItem.name, true);
        if (!compiled) continue;

        if (upgradeGarageMapsSet.size > 0 && (garageMode === 'convert_to_normal' || garageMode === 'disable_second_garage')) {
            stripUpgradeGarageRewards(compiled, addLog);
        }

        totalMoney += compiled.rewards?.ObjectiveRewardMoney?.amount || 0;
        totalXp += compiled.rewards?.ObjectiveRewardExperience?.amount || 0;

        let nonHubSpawnLevel = null;
        for (const stg of (compiled.stages || [])) {
            for (const sp of (stg.spawnCargoOnStageActive || [])) {
                const gz = sp?.zone?.globalZoneId || '';
                const m = gz.match(/(level_[a-z]{2}_\d{2}_\d{2}(?:_[a-z0-9]+)?)/i);
                if (m) {
                    const foundLevel = m[1].toLowerCase();
                    if (foundLevel !== hubMapName.toLowerCase()) {
                        nonHubSpawnLevel = foundLevel;
                        break;
                    }
                }
            }
            if (nonHubSpawnLevel) break;
        }

        if (nonHubSpawnLevel && !compiled.blockerMap) {
            compiled.blockerMap = helperInstance.formatLevelName(nonHubSpawnLevel);
            addLog(
                'info',
                'MOD-FIX',
                `[Kontrakt: ${compiled.name}] Spawnuje ładunek poza mapą startową (${nonHubSpawnLevel}) -> automatycznie ustawiono blockerMap: ${compiled.blockerMap}`
            );
        }

        let inferredLevel = nonHubSpawnLevel;
        if (!inferredLevel && Array.isArray(compiled.blockerObjectives) && compiled.blockerObjectives.length > 0) {
            for (const bName of compiled.blockerObjectives) {
                if (taskToMapLookup[bName]) {
                    inferredLevel = taskToMapLookup[bName];
                    break;
                }
                const prefixMatch = bName.match(/^([A-Za-z]{2}_\d{2}_\d{2})_/);
                if (prefixMatch) {
                    const coreCandidate = `level_${prefixMatch[1].toLowerCase()}`;
                    const matchedFull = mapNames.find(m => m.toLowerCase() === coreCandidate || m.toLowerCase().startsWith(coreCandidate + '_'));
                    if (matchedFull && matchedFull !== hubMapName) {
                        inferredLevel = matchedFull;
                    }
                }
            }

            if (autoInferBlockerMap && !compiled.blockerMap && inferredLevel && taskToMapLookup[compiled.blockerObjectives[0]]) {
                compiled.blockerMap = helperInstance.formatLevelName(inferredLevel);
            }
        }

        if (compiled.blockerMap || (Array.isArray(compiled.blockerObjectives) && compiled.blockerObjectives.length > 0)) {
            blockerMapAudit.push({
                contractName: compiled.name,
                blockerObjectives: compiled.blockerObjectives || [],
                engineBlockerMap: cItem.obj.blockerMap || '',
                compiledBlockerMap: compiled.blockerMap || '',
                suggestedMap: inferredLevel ? helperInstance.formatLevelName(inferredLevel) : ''
            });
        }

        transformedContracts.push(compiled);
        comparisonItems.push({
            category: 'Contract',
            name: cItem.name,
            rawText: cItem.rawText,
            compiledJson: JSON.stringify(compiled, null, 2)
        });
    }

    for (const diag of (helperInstance.diagnostics || [])) {
        addLog(diag.level, diag.tag, diag.message);
    }

    const contractsJson = JSON.stringify(transformedContracts, null, 2);
    const allTasksJson = JSON.stringify(allCompiledTasks, null, 2);
    const contractsUnwrapped = contractsJson.replace(/^\[\r?\n?/, '').replace(/\r?\n?\]$/, '') + ',';

    const localObjectiveSettingsJson = JSON.stringify({
        ExternalData: [],
        SslType: "ObjectiveSettings",
        SslValue: {
            contractsSettings: transformedContracts,
            name: "objectiveSettings"
        }
    }, null, 2);

    const contractsFilePath = path.join(baseOutputDir, 'contractsettings.json');
    const allTasksFilePath = path.join(baseOutputDir, 'all_taskssettings.json');
    fs.writeFileSync(contractsFilePath, contractsJson, 'utf8');
    fs.writeFileSync(allTasksFilePath, allTasksJson, 'utf8');
    fs.writeFileSync(path.join(baseOutputDir, 'contractsettings_unwrapped.txt'), contractsUnwrapped, 'utf8');
    fs.writeFileSync(path.join(baseOutputDir, 'local_objective_settings.json'), localObjectiveSettingsJson, 'utf8');

    addLog('success', 'CONTRACTS', `Wygenerowano ${transformedContracts.length} kontraktów oraz ${allCompiledTasks.length} tasków dla regionu ${normRegion}. Ekonomia regionu: $${totalMoney.toLocaleString()} | ${totalXp.toLocaleString()} XP.`);

    const traceTargets = [
        ...mapsOutput.flatMap(m => [
            [`${m.mapName}/zone_settings`, m.zoneSettingsJson],
            [`${m.mapName}/objective_settings`, m.objectiveSettingsJson]
        ]),
        ['contracts', contractsJson]
    ];
    for (const needle of ['GARAGE_EXIT', 'GARAGE_ENTRANCE']) {
        for (const [label, jsonStr] of traceTargets) {
            for (const hit of findPathsInJson(JSON.parse(jsonStr), needle, label)) {
                addLog('info', 'ZONE-TRACE', hit);
            }
        }
    }

    const missingZonesInPaks = missionUsedZones.filter(z => !allExportedZonesSet.has(z));
    if (missingZonesInPaks.length > 0) {
        addLog('warn', 'UNEXPECTED', `Wykryto ${missingZonesInPaks.length} stref używanych w misjach, których nie ma w żadnym zone_settings.json regionu: ${missingZonesInPaks.join(', ')}`);
    } else {
        addLog('success', 'AUDIT', `Walidacja spójności stref: 100% stref wymaganych przez Taski i Kontrakty (${missionUsedZones.length}) znajduje się w plikach zone_settings.json!`);
    }

    for (const w of (helperInstance.warnings || [])) {
        addLog('warn', 'UNMAPPED', w);
    }

    auditOutput([
        ...mapsOutput.flatMap(m => [
            [`${m.mapName}/zones`, m.zoneSettingsJson],
            [`${m.mapName}/tasks`, m.objectiveSettingsJson]
        ]),
        ['contracts', contractsJson]
    ], addLog);

    return {
        region: normRegion,
        outputDir: baseOutputDir,
        builtPakPaths,
        contractsFilePath,
        allTasksFilePath,
        maps: mapsOutput,
        contractsCount: transformedContracts.length,
        totalFilteredZonesCount,
        economy: { totalMoney, totalXp },
        contractsJson,
        contractsUnwrapped,
        localObjectiveSettingsJson,
        comparisonItems,
        progressionReport,
        audit: {
            missionUsedZonesCount: missionUsedZones.length,
            contestZonesExcludedCount: contestUsedZones.length,
            missingZonesInPaks,
            blockerMapAudit,
            unmappedWarnings: [...(helperInstance.warnings || [])]
        },
        warnings: [...(helperInstance.warnings || [])],
        logs
    };
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8'
};

const server = http.createServer((req, res) => {
    const url = new URL(req.url, `http://localhost:${PORT}`);

    if (url.pathname === '/api/regions' && req.method === 'GET') {
        const gameDir = url.searchParams.get('gameDir') || DEFAULT_GAME_DIR;
        const outputBaseDir = getLocalBaseOutputDir();
        const modsDir = getDefaultModsDir();
        const prebuildDir = url.searchParams.get('prebuildDir') || getDefaultPrebuildDir();
        try {
            const regions = scanAvailableRegions(gameDir);
            const prebuildProjects = scanPrebuildProjects(prebuildDir);
            const modZips = scanModZips(modsDir);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, gameDir, outputBaseDir, modsDir, prebuildDir, prebuildProjects, modZips, regions, mapDictionary: MAP_DICTIONARY }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return;
    }

    if (url.pathname === '/api/prebuild-projects' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const { prebuildDir, modsDir } = JSON.parse(body || '{}');
                const targetPrebuild = (prebuildDir || getDefaultPrebuildDir()).trim();
                const targetMods = (modsDir || getDefaultModsDir()).trim();
                const projects = scanPrebuildProjects(targetPrebuild);
                const modZips = scanModZips(targetMods);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, prebuildDir: targetPrebuild, projects, modZips }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    if (url.pathname === '/api/game-logs' && req.method === 'GET') {
        try {
            const logs = inspectSnowRunnerLogs();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, logs }));
        } catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: false, error: err.message }));
        }
        return;
    }

    if (url.pathname === '/api/inject-prebuild' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const { prebuildDir, projectName, contractsFilePath, allTasksFilePath } = JSON.parse(body || '{}');
                if (!contractsFilePath || !fs.existsSync(contractsFilePath)) {
                    throw new Error('Najpierw zbuduj region, aby wygenerować kontrakty.');
                }
                if (!projectName || !projectName.trim()) {
                    throw new Error('Wybierz lub wpisz nazwę folderu projektu w prebuild (np. szwajcaria).');
                }

                const basePrebuild = (prebuildDir || getDefaultPrebuildDir()).trim();
                const projectDir = path.join(basePrebuild, projectName.trim());

                if (!fs.existsSync(projectDir)) {
                    throw new Error(`Folder projektu nie istnieje: ${projectDir}`);
                }

                const contractsArray = JSON.parse(fs.readFileSync(contractsFilePath, 'utf8').replace(/^\uFEFF/, ''));
                const tasksArray = (allTasksFilePath && fs.existsSync(allTasksFilePath))
                    ? JSON.parse(fs.readFileSync(allTasksFilePath, 'utf8').replace(/^\uFEFF/, ''))
                    : null;

                const localObjPath = path.join(projectDir, 'local_objective_settings.json');
                let localObjData = {
                    ExternalData: [],
                    SslType: "ObjectiveSettings",
                    SslValue: {
                        contractsSettings: [],
                        name: "objectiveSettings"
                    }
                };
                if (fs.existsSync(localObjPath)) {
                    try {
                        localObjData = JSON.parse(fs.readFileSync(localObjPath, 'utf8').replace(/^\uFEFF/, ''));
                    } catch (err) {
                        console.error('Error parsing local_objective_settings.json:', err);
                    }
                }
                if (!localObjData.SslValue) localObjData.SslValue = { name: "objectiveSettings" };
                localObjData.SslValue.contractsSettings = contractsArray;
                fs.writeFileSync(localObjPath, JSON.stringify(localObjData, null, 4), 'utf8');

                const mainObjPath = path.join(projectDir, 'objective_settings.json');
                let mainObjData = {
                    ExternalData: [],
                    SslType: "ObjectiveSettingsContainer",
                    SslValue: {
                        contestSettings: [],
                        contractsSettings: [],
                        tasksSettings: []
                    }
                };
                if (fs.existsSync(mainObjPath)) {
                    try {
                        mainObjData = JSON.parse(fs.readFileSync(mainObjPath, 'utf8').replace(/^\uFEFF/, ''));
                    } catch (err) {
                        console.error('Error parsing objective_settings.json:', err);
                    }
                }
                if (!mainObjData.SslValue) {
                    mainObjData.SslValue = { contestSettings: [], contractsSettings: [], tasksSettings: [] };
                }
                mainObjData.SslValue.contractsSettings = contractsArray;
                if (tasksArray !== null) {
                    mainObjData.SslValue.tasksSettings = tasksArray;
                }
                fs.writeFileSync(mainObjPath, JSON.stringify(mainObjData, null, 4), 'utf8');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ok: true,
                    projectDir,
                    injectedContractsCount: contractsArray.length,
                    injectedTasksCount: mainObjData.SslValue.tasksSettings?.length || 0,
                    time: formatTime()
                }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    if (url.pathname === '/api/pick-zip' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const { initialDir } = JSON.parse(body || '{}');
                const r = runPowerShell(PS_PICK_ZIP_FILE, [initialDir || getDefaultModsDir()], true);
                if (r.stdout.includes('SELECTED:')) {
                    const selectedPath = r.stdout.split('SELECTED:')[1].trim();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true, cancelled: false, path: selectedPath }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true, cancelled: true }));
                }
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    if (url.pathname === '/api/modio-zip-blocker' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            const tmpMainJson = path.join(os.tmpdir(), `sr_zip_main_${Date.now()}.json`);
            const tmpLocalJson = path.join(os.tmpdir(), `sr_zip_local_${Date.now()}.json`);
            try {
                const { zipPath, mode, modioId, extractBesideZip } = JSON.parse(body || '{}');
                if (!zipPath || !fs.existsSync(zipPath)) {
                    throw new Error(`Nie znaleziono pliku .zip: ${zipPath || '(brak ścieżki)'}`);
                }
                if (mode === 'modio' && (!modioId || !/^\d+$/.test(modioId.trim()))) {
                    throw new Error('Podaj poprawne numeryczne ID projektu z Mod.io (np. 5267880).');
                }

                const extRes = runPowerShell(PS_EXTRACT_JSON_FROM_ZIP, [zipPath, tmpMainJson]);
                if (extRes.status !== 0 || !extRes.stdout.includes('EXTRACTED:')) {
                    throw new Error(`Błąd odczytu .zip: ${extRes.stderr || extRes.stdout}`);
                }

                const rawJsonText = fs.readFileSync(tmpMainJson, 'utf8').replace(/^\uFEFF/, '');
                const jsonObj = JSON.parse(rawJsonText);

                const foundItems = processBlockerMapsInJsonObj(jsonObj, mode || 'scan', modioId || '');

                let extractedOutPath = null;

                if (mode === 'modio' || mode === 'local') {
                    const updatedJsonText = JSON.stringify(jsonObj, null, 4);
                    fs.writeFileSync(tmpMainJson, updatedJsonText, 'utf8');

                    const localObj = {
                        ExternalData: [],
                        SslType: "ObjectiveSettings",
                        SslValue: {
                            contractsSettings: jsonObj?.SslValue?.contractsSettings || [],
                            name: "objectiveSettings"
                        }
                    };
                    fs.writeFileSync(tmpLocalJson, JSON.stringify(localObj, null, 4), 'utf8');

                    const updRes = runPowerShell(PS_UPDATE_JSON_IN_ZIP, [zipPath, tmpMainJson, tmpLocalJson]);
                    if (updRes.status !== 0 || !updRes.stdout.includes('UPDATED_OK')) {
                        throw new Error(`Błąd zapisu do .zip: ${updRes.stderr || updRes.stdout}`);
                    }

                    if (extractBesideZip) {
                        extractedOutPath = path.join(path.dirname(zipPath), 'objective_settings.json');
                        fs.writeFileSync(extractedOutPath, updatedJsonText, 'utf8');
                    }
                } else if (extractBesideZip) {
                    extractedOutPath = path.join(path.dirname(zipPath), 'objective_settings.json');
                    fs.writeFileSync(extractedOutPath, JSON.stringify(jsonObj, null, 4), 'utf8');
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ok: true,
                    zipPath,
                    mode: mode || 'scan',
                    modioId: modioId || '',
                    totalContractsInZip: (jsonObj?.SslValue?.contractsSettings || []).length,
                    totalTasksInZip: (jsonObj?.SslValue?.tasksSettings || []).length,
                    foundBlockerMaps: foundItems,
                    extractedOutPath,
                    time: formatTime()
                }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            } finally {
                fs.rmSync(tmpMainJson, { force: true });
                fs.rmSync(tmpLocalJson, { force: true });
            }
        });
        return;
    }

    if (url.pathname === '/api/pick-folder' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const { initialDir } = JSON.parse(body || '{}');
                const r = runPowerShell(PS_PICK_FOLDER, [initialDir || ''], true);
                if (r.stdout.includes('SELECTED:')) {
                    const selectedPath = r.stdout.split('SELECTED:')[1].trim();
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true, cancelled: false, path: selectedPath }));
                } else {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ ok: true, cancelled: true }));
                }
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    if (url.pathname === '/api/deploy-mods' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const { pakPaths, modsDir } = JSON.parse(body || '{}');
                const targetModsDir = (modsDir || getDefaultModsDir()).trim();

                if (!Array.isArray(pakPaths) || pakPaths.length === 0) {
                    throw new Error('Brak zbudowanych plików .pak do skopiowania.');
                }

                fs.mkdirSync(targetModsDir, { recursive: true });
                const copiedFiles = [];

                for (const srcPak of pakPaths) {
                    if (!fs.existsSync(srcPak)) {
                        throw new Error(`Nie znaleziono pliku źródłowego: ${srcPak}`);
                    }
                    const fileName = path.basename(srcPak);
                    const destPak = path.join(targetModsDir, fileName);
                    fs.copyFileSync(srcPak, destPak);
                    copiedFiles.push(fileName);
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    ok: true,
                    targetModsDir,
                    copiedFiles,
                    time: formatTime()
                }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    if (url.pathname === '/api/build-region' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const payload = JSON.parse(body || '{}');
                if (!payload.region) throw new Error('Wybierz lub wpisz kod regionu (np. US_19).');

                const result = buildRegionPipeline({
                    region: payload.region,
                    gameDir: payload.gameDir || DEFAULT_GAME_DIR,
                    outputBaseDir: payload.outputBaseDir || getLocalBaseOutputDir(),
                    patchBin: payload.patchBin !== false,
                    injectFiles: payload.injectFiles !== false,
                    forceCacheRefresh: Boolean(payload.forceCacheRefresh),
                    zoneFilterMode: payload.zoneFilterMode || 'smart',
                    autoInferBlockerMap: Boolean(payload.autoInferBlockerMap),
                    garageMode: payload.garageMode || 'keep_raw_false',
                    compatMode: payload.compatMode || 'normal'
                });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, result }));
            } catch (err) {
                console.error(err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    if (url.pathname === '/api/search-cache' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const { query, gameDir } = JSON.parse(body || '{}');
                const rawText = getRawCacheBlockText(gameDir || DEFAULT_GAME_DIR, getLocalBaseOutputDir(), false);
                const extractor = new CacheBlockExtractor(rawText);
                const matches = extractor.searchBlocksInCache(query || '', 40);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true, matches }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    if (url.pathname === '/api/open-folder' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => (body += chunk));
        req.on('end', () => {
            try {
                const { folderPath } = JSON.parse(body || '{}');
                const target = folderPath ? folderPath.trim() : getLocalBaseOutputDir();
                fs.mkdirSync(target, { recursive: true });
                exec(`explorer.exe "${target}"`);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: true }));
            } catch (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ ok: false, error: err.message }));
            }
        });
        return;
    }

    let filePath = path.join(__dirname, url.pathname === '/' ? 'index.html' : url.pathname);
    if (!filePath.startsWith(__dirname) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        res.writeHead(404);
        res.end('Not found');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'text/plain' });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
    console.log(`=====================================================`);
    console.log(` SR Studio v7.6 działa!`);
    console.log(` Otwórz w przeglądarce: http://localhost:${PORT}`);
    console.log(`=====================================================`);
});