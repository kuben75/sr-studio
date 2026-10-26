// src/main.js
const I18N = {
    pl: {
        regionSection: 'Konfiguracja Regionu & Ścieżek',
        regionPlaceholder: 'np. US_19',
        mapsSuffix: 'map(y)',
        noPaksFound: 'Brak paków w folderze gry',
        outputDirLabel: 'Lokalny folder wyjściowy:',
        modsDirLabel: 'Folder Mods (Media\\Mods):',
        prebuildDirLabel: 'Katalog Prebuild (Media\\prebuild):',
        prebuildProjectLabel: 'Projekt w Prebuild (np. szwajcaria / zurdania):',
        zoneFilterLabel: 'Algorytm filtrowania stref (zone_settings.json):',
        filterSmart: 'Inteligentny (Task/Contract + Infrastruktura, bez Contestów)',
        filterStrict: 'Ścisły (Wyłącznie strefy użyte w Task/Contract)',
        filterNone: 'Brak filtru (Kopiuj wszystkie strefy 1:1)',
        patchBinLabel: 'Zmień 17. bajt w data_for_ssl.bin (0x01)',
        injectFilesLabel: 'Wstrzyknij 5 plików luzem do .pak',
        autoBlockerMapLabel: 'Auto-uzupełniaj brakujący blockerMap z blockerObjectives',
        forceCacheLabel: 'Wymuś wypakowanie initial.pak na nowo',
        buildBtn: 'Zbuduj cały region (.pak + JSON)',
        deployModsBtn: '1. Kopiuj .pak do folderu Mods (Media\\Mods)',
        deploySuccess: 'Skopiowano .pak do Mods!',
        injectPrebuildBtn: '2. Wstrzyknij kontrakty do Prebuild (2 pliki JSON)',
        injectPrebuildSuccess: 'Wstrzyknięto kontrakty do Prebuild!',
        statusReady: 'Gotowy do pracy',
        telemetrySection: 'Telemetria Regionu',
        statZones: 'Zapisane Strefy',
        statFiltered: 'Odrzucone Strefy',
        statTasks: 'Misje (Tasks)',
        statContracts: 'Kontrakty',
        consoleSection: 'Logi Diagnostyczne',
        copyLogsBtn: 'Kopiuj logi',
        waitingLogs: 'Wybierz region i kliknij Zbuduj...',
        noRegionBuilt: 'Brak zbudowanego regionu w tej sesji',
        noRegionHint: 'Po zbudowaniu regionu zobaczysz tu podział stref, rozpoznaną Mapę Startową oraz symulację przejść między mapami.',
        cardZones: 'Strefy',
        cardFiltered: 'Odrzucono',
        cardTasks: 'Taski',
        cardInjected: 'Wstrzyknięto',
        cardRoot: 'luzem',
        tabContracts: 'Kontrakty [ ]',
        tabContractsRaw: 'Kontrakty (bez [ ])',
        tabLocalObj: 'local_objective_settings.json',
        tabModioZip: 'Mod.io ZIP Patcher (blockerMap)',
        tabProgression: 'Graf Przejść & Mapa Startowa',
        tabCompare: 'Porównaj z initial.cache_block',
        tabAudit: 'Audytor & Filtr Stref',
        tabEngineSearch: 'Szukaj w initial.cache_block',
        searchJsonPlaceholder: 'Filtruj linie JSON...',
        downloadBtn: 'Pobierz',
        copyBtn: 'Kopiuj',
        copied: 'Skopiowano!',
        buildingStatus: 'Skanowanie initial.cache_block, analiza grafu przejść i budowanie paków...',
        selectObjectToCompare: 'Wybierz obiekt (Misję / Kontrakt / Strefę):',
        filterObjectPlaceholder: 'Filtruj listę obiektów...',
        rawEngineCodeHeader: 'Oryginał z silnika (initial.cache_block)',
        compiledJsonHeader: 'Przekonwertowany wynik (JSON)',
        engineSearchPlaceholder: 'Wpisz nazwę bloku w initial.cache_block (np. US_19_03_GEOLOGICAL)...',
        searchEngineBtn: 'Szukaj w initial.cache_block',
        modioPatcherTitle: 'Konwerter blockerMap wewnątrz spakowanego pliku .zip (Lokalny ⇄ Mod.io)',
        modioPatcherDesc: 'Narzędzie otwiera wybrany plik .zip (np. z folderu Media\\Mods) bez konieczności ręcznego wypakowywania, odczytuje plik objective_settings.json i podmienia wyłącznie te pola blockerMap, które faktycznie są już wypełnione w pliku (np. "~#@%$`*level_us_16_02~#@%$`*" ➔ "5267880_level_us_16_02").',
        selectZipLabel: 'Wybierz plik .zip z folderu Mods lub wskaż ręcznie z dysku:',
        browseZipBtn: 'Wybierz .zip...',
        modioIdLabel: 'ID projektu z Mod.io (np. 5267880):',
        extractBesideLabel: 'Dodatkowo wypakuj zmodyfikowany plik objective_settings.json luzem obok pliku .zip (do podglądu)',
        scanZipBtn: '1. Skanuj blockerMap w pliku .zip (Podgląd)',
        applyModioZipBtn: '2. Zapisz w .zip format Mod.io (ID_level_...)',
        revertLocalZipBtn: 'Przywróć w .zip format Lokalny (~#@%$`*level_...)',
        modioScanHint: 'Wybierz plik .zip powyżej i kliknij "Skanuj blockerMap w pliku .zip", aby zobaczyć wszystkie niepuste pola blockerMap przed ich podmianą.',
        auditTitleMissing: '1. Weryfikacja spójności stref (Czy misje mają swoje strefy w zone_settings.json)',
        auditAllZonesOk: 'Wszystkie strefy używane w Taskach i Kontraktach znajdują się w wygenerowanych plikach zone_settings.json!',
        auditTitleBlocker: '2. Analiza blockerMap w Kontraktach (Kontrakty z blockerObjectives lub spawnem poza Hubem)',
        auditTitleFiltered: '3. Odrzucone strefy (Nieużywane w misjach lub należące do ContestSettings)',
        auditTitleUnmapped: '4. Zignorowane / nieobsłużone właściwości (Unmapped Properties)',
        auditNoUnmapped: 'Brak zignorowanych właściwości! Wszystkie pola zostały przetworzone w 100%.'
    },
    en: {
        regionSection: 'Region & Paths Configuration',
        regionPlaceholder: 'e.g. US_19',
        mapsSuffix: 'map(s)',
        noPaksFound: 'No .pak files found in game dir',
        outputDirLabel: 'Local Output Folder:',
        modsDirLabel: 'Mods Folder (Media\\Mods):',
        prebuildDirLabel: 'Prebuild Directory (Media\\prebuild):',
        prebuildProjectLabel: 'Prebuild Project Folder (e.g. szwajcaria):',
        zoneFilterLabel: 'Zone Filtering Algorithm (zone_settings.json):',
        filterSmart: 'Smart (Task/Contract + Infrastructure, exclude Contests)',
        filterStrict: 'Strict (Only zones referenced in Task/Contract)',
        filterNone: 'No Filter (Keep all engine zones 1:1)',
        patchBinLabel: 'Patch 17th byte in data_for_ssl.bin (0x01)',
        injectFilesLabel: 'Inject 5 files to .pak root',
        autoBlockerMapLabel: 'Auto-fill missing blockerMap from blockerObjectives',
        forceCacheLabel: 'Force re-extract initial.pak cache',
        buildBtn: 'Build Entire Region (.pak + JSON)',
        deployModsBtn: '1. Copy .pak files to Mods Folder (Media\\Mods)',
        deploySuccess: 'Copied .pak to Mods!',
        injectPrebuildBtn: '2. Inject Contracts into Prebuild (2 JSON files)',
        injectPrebuildSuccess: 'Injected into Prebuild!',
        statusReady: 'System ready',
        telemetrySection: 'Region Telemetry',
        statZones: 'Saved Zones',
        statFiltered: 'Filtered Zones',
        statTasks: 'Tasks',
        statContracts: 'Contracts',
        consoleSection: 'Engine Diagnostics & Logs',
        copyLogsBtn: 'Copy Logs',
        waitingLogs: 'Select a region and click Build...',
        noRegionBuilt: 'No region built in this session yet',
        noRegionHint: 'Build a region to inspect saved vs filtered zones, detected Starting Map, and gateway progression graph.',
        cardZones: 'Zones',
        cardFiltered: 'Filtered',
        cardTasks: 'Tasks',
        cardInjected: 'Injected',
        cardRoot: 'root',
        tabContracts: 'Contracts [ ]',
        tabContractsRaw: 'Contracts (unwrapped)',
        tabLocalObj: 'local_objective_settings.json',
        tabModioZip: 'Mod.io ZIP Patcher (blockerMap)',
        tabProgression: 'Gateway Graph & Start Map',
        tabCompare: 'Compare with initial.cache_block',
        tabAudit: 'Mod Auditor & Zone Filter',
        tabEngineSearch: 'Search initial.cache_block',
        searchJsonPlaceholder: 'Filter JSON lines...',
        downloadBtn: 'Download',
        copyBtn: 'Copy',
        copied: 'Copied!',
        buildingStatus: 'Scanning initial.cache_block, analyzing progression graph & patching .paks...',
        selectObjectToCompare: 'Select object (Task / Contract / Zone):',
        filterObjectPlaceholder: 'Filter object list...',
        rawEngineCodeHeader: 'Raw Engine Source (initial.cache_block)',
        compiledJsonHeader: 'Compiled Output (JSON)',
        engineSearchPlaceholder: 'Enter block name in initial.cache_block (e.g. US_19_03_GEOLOGICAL)...',
        searchEngineBtn: 'Search initial.cache_block',
        modioPatcherTitle: 'In-Place .ZIP blockerMap Converter (Local ⇄ Mod.io)',
        modioPatcherDesc: 'Opens your packed .zip mod directly (without manual unpacking), reads objective_settings.json, and converts ONLY existing non-empty blockerMap fields (e.g. "~#@%$`*level_us_16_02~#@%$`*" ➔ "5267880_level_us_16_02").',
        selectZipLabel: 'Select .zip from Mods folder or browse from disk:',
        browseZipBtn: 'Browse .zip...',
        modioIdLabel: 'Mod.io Project ID (e.g. 5267880):',
        extractBesideLabel: 'Also extract modified objective_settings.json beside the .zip file (for inspection)',
        scanZipBtn: '1. Scan blockerMap in .zip (Preview)',
        applyModioZipBtn: '2. Patch .zip to Mod.io Format (ID_level_...)',
        revertLocalZipBtn: 'Revert .zip to Local Format (~#@%$`*level_...)',
        modioScanHint: 'Select a .zip file above and click "Scan blockerMap in .zip" to preview all existing blockerMap fields.',
        auditTitleMissing: '1. Zone Integrity Check (Do all missions have their zones in zone_settings.json?)',
        auditAllZonesOk: '100% of zones referenced by Tasks and Contracts exist in the generated zone_settings.json files!',
        auditTitleBlocker: '2. Contract blockerMap Analysis (Contracts with blockerObjectives or non-hub cargo spawn)',
        auditTitleFiltered: '3. Filtered-Out Zones (Unused in missions or belonging to ContestSettings)',
        auditTitleUnmapped: '4. Unmapped Engine Properties',
        auditNoUnmapped: 'Zero unmapped properties! 100% of fields were cleanly transformed.'
    }
};

class StudioApp {
    constructor() {
        this.lang = localStorage.getItem('sr_lang') || 'pl';
        this.regionsData = {};
        this.prebuildProjects = [];
        this.modZips = [];
        this.lastResult = null;
        this.activeTab = 'contracts';
        this.filesMap = {};
        this.filteredComparisonItems = [];

        this.bindDOM();
        this.setupEvents();
        this.applyLanguage();
        this.loadRegions();
    }

    bindDOM() {
        this.langToggleBtn = document.getElementById('langToggleBtn');
        this.regionSelect = document.getElementById('regionSelect');
        this.customRegionInput = document.getElementById('customRegionInput');

        this.outputDirInput = document.getElementById('outputDirInput');
        this.pickOutputDirBtn = document.getElementById('pickOutputDirBtn');
        this.openFolderBtn = document.getElementById('openFolderBtn');

        this.modsDirInput = document.getElementById('modsDirInput');
        this.pickModsDirBtn = document.getElementById('pickModsDirBtn');
        this.openModsDirBtn = document.getElementById('openModsDirBtn');

        this.prebuildDirInput = document.getElementById('prebuildDirInput');
        this.pickPrebuildDirBtn = document.getElementById('pickPrebuildDirBtn');
        this.openPrebuildDirBtn = document.getElementById('openPrebuildDirBtn');
        this.prebuildProjectSelect = document.getElementById('prebuildProjectSelect');
        this.customPrebuildProjectInput = document.getElementById('customPrebuildProjectInput');
        this.refreshPrebuildBtn = document.getElementById('refreshPrebuildBtn');

        this.zoneFilterSelect = document.getElementById('zoneFilterSelect');

        this.patchBinCb = document.getElementById('patchBinCb');
        this.injectFilesCb = document.getElementById('injectFilesCb');
        this.autoBlockerMapCb = document.getElementById('autoBlockerMapCb');
        this.forceCacheCb = document.getElementById('forceCacheCb');

        this.autoBuildBtn = document.getElementById('autoBuildBtn');
        this.deployModsBtn = document.getElementById('deployModsBtn');
        this.injectPrebuildBtn = document.getElementById('injectPrebuildBtn');

        this.statusEl = document.getElementById('status');
        this.economyBadge = document.getElementById('economyBadge');
        this.logsArea = document.getElementById('logsArea');
        this.copyLogsBtn = document.getElementById('copyLogsBtn');
        this.mapsCardsArea = document.getElementById('mapsCardsArea');

        this.inspectorTabs = document.getElementById('inspectorTabs');
        this.jsonToolbar = document.getElementById('jsonToolbar');
        this.jsonSearchInput = document.getElementById('jsonSearchInput');
        this.copyBtn = document.getElementById('copyBtn');
        this.downloadBtn = document.getElementById('downloadBtn');

        this.jsonViewPane = document.getElementById('jsonViewPane');
        this.modioZipViewPane = document.getElementById('modioZipViewPane');
        this.progressionViewPane = document.getElementById('progressionViewPane');
        this.compareViewPane = document.getElementById('compareViewPane');
        this.auditViewPane = document.getElementById('auditViewPane');
        this.engineSearchPane = document.getElementById('engineSearchPane');

        this.outputArea = document.getElementById('jsonOutput');
        this.progressionContentArea = document.getElementById('progressionContentArea');

        this.modZipSelect = document.getElementById('modZipSelect');
        this.modZipPathInput = document.getElementById('modZipPathInput');
        this.pickZipFileBtn = document.getElementById('pickZipFileBtn');
        this.modioIdInput = document.getElementById('modioIdInput');
        this.extractJsonBesideZipCb = document.getElementById('extractJsonBesideZipCb');
        this.scanZipBlockerBtn = document.getElementById('scanZipBlockerBtn');
        this.applyModioZipBtn = document.getElementById('applyModioZipBtn');
        this.revertLocalZipBtn = document.getElementById('revertLocalZipBtn');
        this.modioZipResultsArea = document.getElementById('modioZipResultsArea');

        this.compareItemSelect = document.getElementById('compareItemSelect');
        this.compareFilterInput = document.getElementById('compareFilterInput');
        this.compareRawOutput = document.getElementById('compareRawOutput');
        this.compareJsonOutput = document.getElementById('compareJsonOutput');
        this.copyRawEngineBtn = document.getElementById('copyRawEngineBtn');
        this.copyCompiledCompareBtn = document.getElementById('copyCompiledCompareBtn');

        this.auditContentArea = document.getElementById('auditContentArea');

        this.engineQueryInput = document.getElementById('engineQueryInput');
        this.engineSearchBtn = document.getElementById('engineSearchBtn');
        this.engineMatchesSelect = document.getElementById('engineMatchesSelect');
        this.engineSearchOutput = document.getElementById('engineSearchOutput');
        // W bindDOM() dopisz na końcu:
        this.patchBinStringsCb = document.getElementById('patchBinStringsCb');
        this.garageModeSelect = document.getElementById('garageModeSelect');
        this.compatModeSelect = document.getElementById('compatModeSelect');
        this.checkGameLogsBtn = document.getElementById('checkGameLogsBtn');
    }

    setupEvents() {
        this.langToggleBtn.addEventListener('click', () => {
            this.lang = this.lang === 'pl' ? 'en' : 'pl';
            localStorage.setItem('sr_lang', this.lang);
            this.applyLanguage();
        });

        this.pickOutputDirBtn.addEventListener('click', () => this.handlePickFolder(this.outputDirInput, 'sr_output_dir'));
        this.outputDirInput.addEventListener('change', () => localStorage.setItem('sr_output_dir', this.outputDirInput.value.trim()));
        this.openFolderBtn.addEventListener('click', () => {
            const folderPath = this.lastResult?.outputDir || this.outputDirInput.value.trim();
            this.openSystemFolder(folderPath);
        });

        this.pickModsDirBtn.addEventListener('click', async () => {
            await this.handlePickFolder(this.modsDirInput, 'sr_mods_dir');
            this.refreshPrebuildProjectsList();
        });
        this.modsDirInput.addEventListener('change', () => {
            localStorage.setItem('sr_mods_dir', this.modsDirInput.value.trim());
            this.refreshPrebuildProjectsList();
        });
        this.openModsDirBtn.addEventListener('click', () => this.openSystemFolder(this.modsDirInput.value.trim()));

        this.pickPrebuildDirBtn.addEventListener('click', async () => {
            await this.handlePickFolder(this.prebuildDirInput, 'sr_prebuild_dir');
            this.refreshPrebuildProjectsList();
        });
        this.prebuildDirInput.addEventListener('change', () => {
            localStorage.setItem('sr_prebuild_dir', this.prebuildDirInput.value.trim());
            this.refreshPrebuildProjectsList();
        });
        this.openPrebuildDirBtn.addEventListener('click', () => {
            const proj = this.customPrebuildProjectInput.value.trim() || this.prebuildProjectSelect.value;
            const base = this.prebuildDirInput.value.trim();
            this.openSystemFolder(proj ? `${base}\\${proj}` : base);
        });
        this.refreshPrebuildBtn.addEventListener('click', () => this.refreshPrebuildProjectsList());

        this.autoBuildBtn.addEventListener('click', () => this.handleBuildRegion());
        this.deployModsBtn.addEventListener('click', () => this.handleDeployToMods());
        this.injectPrebuildBtn.addEventListener('click', () => this.handleInjectPrebuild());

        this.modioIdInput.value = localStorage.getItem('sr_modio_id') || '';
        this.modioIdInput.addEventListener('input', () => {
            localStorage.setItem('sr_modio_id', this.modioIdInput.value.trim());
        });
        this.modZipSelect.addEventListener('change', () => {
            if (this.modZipSelect.value) {
                this.modZipPathInput.value = this.modZipSelect.value;
            }
        });
        this.pickZipFileBtn.addEventListener('click', () => this.handlePickZipFile());
        this.scanZipBlockerBtn.addEventListener('click', () => this.handleProcessZipBlocker('scan'));
        this.applyModioZipBtn.addEventListener('click', () => this.handleProcessZipBlocker('modio'));
        this.revertLocalZipBtn.addEventListener('click', () => this.handleProcessZipBlocker('local'));

        this.copyBtn.addEventListener('click', () => this.handleCopyJson());
        this.downloadBtn.addEventListener('click', () => this.handleDownload());
        this.copyLogsBtn.addEventListener('click', () => this.handleCopyLogs());
        this.jsonSearchInput.addEventListener('input', () => this.renderActiveTabContent());

        this.compareItemSelect.addEventListener('change', () => this.renderSelectedCompareItem());
        this.compareFilterInput.addEventListener('input', () => this.populateCompareSelect());

        this.copyRawEngineBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(this.compareRawOutput.dataset.raw || '');
        });
        this.copyCompiledCompareBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(this.compareJsonOutput.dataset.raw || '');
        });

        this.engineSearchBtn.addEventListener('click', () => this.handleEngineSearch());
        this.engineQueryInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.handleEngineSearch();
        });
        this.engineMatchesSelect.addEventListener('change', () => this.renderSelectedEngineMatch());

        if (this.checkGameLogsBtn) {
            this.checkGameLogsBtn.addEventListener('click', () => this.handleCheckGameLogs());
        }
        this.bindTabClicks();
    }
    async handleCheckGameLogs() {
        try {
            const res = await fetch('/api/game-logs');
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);

            if (!this.lastResult) {
                this.lastResult = { logs: [] };
            }
            for (const entry of data.logs) {
                this.lastResult.logs.push(entry);
            }
            this.renderLogs(this.lastResult);
            this.showStatus('Wczytano logi diagnostyczne gry SnowRunner', 'success');
        } catch (err) {
            this.showStatus(`Błąd odczytu logów gry: ${err.message}`, 'error');
        }
    }
    async handlePickZipFile() {
        try {
            const res = await fetch('/api/pick-zip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initialDir: this.modsDirInput.value.trim() })
            });
            const data = await res.json();
            if (data.ok && !data.cancelled && data.path) {
                this.modZipPathInput.value = data.path;
            }
        } catch (err) {
            this.showStatus(`Error: ${err.message}`, 'error');
        }
    }

    async handleProcessZipBlocker(mode = 'scan') {
        const zipPath = this.modZipPathInput.value.trim() || this.modZipSelect.value;
        const modioId = this.modioIdInput.value.trim();

        if (!zipPath) {
            this.showStatus('Wybierz lub wskaż plik .zip do przetworzenia!', 'error');
            return;
        }
        if (mode === 'modio' && !modioId) {
            this.showStatus('Wpisz numeryczne ID projektu z Mod.io (np. 5267880)!', 'error');
            return;
        }

        try {
            const res = await fetch('/api/modio-zip-blocker', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zipPath,
                    mode,
                    modioId,
                    extractBesideZip: this.extractJsonBesideZipCb.checked
                })
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);

            const rows = data.foundBlockerMaps.map(item => `
                <tr>
                    <td><code>${item.type}</code></td>
                    <td><code><b>${item.name}</b></code></td>
                    <td><code>${item.blockerObjectives.join(', ') || '-'}</code></td>
                    <td><code style="color: #fca5a5;">${item.oldBlockerMap}</code></td>
                    <td><code style="color: #4ade80;"><b>${item.newBlockerMap}</b></code></td>
                </tr>
            `).join('');

            const actionBanner = mode === 'scan'
                ? `<div class="audit-pass">Przeskanowano plik <b>${data.zipPath}</b> (Kontrakty: ${data.totalContractsInZip}, Taski: ${data.totalTasksInZip}). Wykryto <b>${data.foundBlockerMaps.length}</b> wypełnionych pól blockerMap.</div>`
                : `<div class="audit-pass">✓ Zaktualizowano bezpośrednio w pliku <b>${data.zipPath}</b> wszystkie istniejące pola blockerMap (${data.foundBlockerMaps.length}) w trybie: <b>${mode.toUpperCase()}</b>!${data.extractedOutPath ? `<br>Dodatkowo zapisano plik na zewnątrz: <b>${data.extractedOutPath}</b>` : ''}</div>`;

            this.modioZipResultsArea.innerHTML = `
                ${actionBanner}
                <table class="audit-table" style="margin-top: 12px;">
                    <thead>
                        <tr>
                            <th>Typ</th>
                            <th>Nazwa Kontraktu / Misji</th>
                            <th>blockerObjectives</th>
                            <th>Poprzedni blockerMap w .zip</th>
                            <th>${mode === 'scan' ? 'Podgląd docelowego blockerMap' : 'Zapisany nowy blockerMap w .zip'}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rows || '<tr><td colspan="5">W pliku objective_settings.json wewnątrz tego .zip żadna misja nie ma ustawionego blockerMap (wszystkie mają pusty string "").</td></tr>'}
                    </tbody>
                </table>
            `;

            this.showStatus(
                mode === 'scan'
                    ? `Przeskanowano .zip: znaleziono ${data.foundBlockerMaps.length} blockerMap`
                    : `Zaktualizowano ${data.foundBlockerMaps.length} blockerMap w pliku .zip!`,
                'success'
            );
        } catch (err) {
            this.modioZipResultsArea.innerHTML = `<div class="audit-warn-box">Błąd: ${err.message}</div>`;
            this.showStatus(`Error: ${err.message}`, 'error');
        }
    }

    async refreshPrebuildProjectsList() {
        try {
            const res = await fetch('/api/prebuild-projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prebuildDir: this.prebuildDirInput.value.trim(),
                    modsDir: this.modsDirInput.value.trim()
                })
            });
            const data = await res.json();
            if (data.ok) {
                this.prebuildProjects = data.projects || [];
                this.modZips = data.modZips || [];
                this.renderPrebuildProjectsDropdown();
                this.renderModZipsDropdown();
            }
        } catch {}
    }

    renderPrebuildProjectsDropdown() {
        const current = this.prebuildProjectSelect.value;
        if (this.prebuildProjects.length === 0) {
            this.prebuildProjectSelect.innerHTML = `<option value="">(Brak folderów w prebuild)</option>`;
            return;
        }
        this.prebuildProjectSelect.innerHTML = this.prebuildProjects
            .map(p => `<option value="${p}">${p}</option>`)
            .join('');
        if (current && this.prebuildProjects.includes(current)) {
            this.prebuildProjectSelect.value = current;
        }
    }

    renderModZipsDropdown() {
        if (!this.modZipSelect) return;
        if (this.modZips.length === 0) {
            this.modZipSelect.innerHTML = `<option value="">(Brak plików .zip w Media\\Mods)</option>`;
            return;
        }
        this.modZipSelect.innerHTML = this.modZips
            .map(fullPath => {
                const base = fullPath.split(/[\\/]/).pop();
                return `<option value="${fullPath}">${base}</option>`;
            })
            .join('');
        if (!this.modZipPathInput.value && this.modZips[0]) {
            this.modZipPathInput.value = this.modZips[0];
        }
    }

    async handleInjectPrebuild() {
        if (!this.lastResult?.contractsFilePath) return;
        const prebuildDir = this.prebuildDirInput.value.trim();
        const projectName = this.customPrebuildProjectInput.value.trim() || this.prebuildProjectSelect.value;

        if (!projectName) {
            this.showStatus('Wybierz z listy lub wpisz nazwę folderu w prebuild!', 'error');
            return;
        }

        this.injectPrebuildBtn.disabled = true;
        try {
            const res = await fetch('/api/inject-prebuild', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prebuildDir,
                    projectName,
                    contractsFilePath: this.lastResult.contractsFilePath,
                    allTasksFilePath: this.lastResult.allTasksFilePath
                })
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);

            this.lastResult.logs.push({
                time: data.time,
                level: 'success',
                tag: 'PREBUILD-INJECT',
                message: `Wstrzyknięto ${data.injectedContractsCount} kontraktów oraz zaktualizowano ${data.injectedTasksCount} tasków w: ${data.projectDir}`
            });
            this.renderLogs(this.lastResult);
            this.showStatus(`${I18N[this.lang].injectPrebuildSuccess} (${projectName})`, 'success');

            const span = this.injectPrebuildBtn.querySelector('span');
            const origText = span.textContent;
            span.textContent = `✓ ${I18N[this.lang].injectPrebuildSuccess}`;
            setTimeout(() => {
                span.textContent = origText;
            }, 2200);
        } catch (err) {
            this.showStatus(`Error: ${err.message}`, 'error');
        } finally {
            this.injectPrebuildBtn.disabled = false;
        }
    }

    async handlePickFolder(inputEl, storageKey) {
        try {
            const res = await fetch('/api/pick-folder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ initialDir: inputEl.value.trim() })
            });
            const data = await res.json();
            if (data.ok && !data.cancelled && data.path) {
                inputEl.value = data.path;
                localStorage.setItem(storageKey, data.path);
            }
        } catch (err) {
            this.showStatus(`Error: ${err.message}`, 'error');
        }
    }

    async handleDeployToMods() {
        if (!this.lastResult || !this.lastResult.builtPakPaths?.length) return;
        const modsDir = this.modsDirInput.value.trim();
        if (modsDir) localStorage.setItem('sr_mods_dir', modsDir);

        this.deployModsBtn.disabled = true;
        try {
            const res = await fetch('/api/deploy-mods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    pakPaths: this.lastResult.builtPakPaths,
                    modsDir
                })
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);

            this.lastResult.logs.push({
                time: data.time,
                level: 'success',
                tag: 'DEPLOY-MODS',
                message: `Skopiowano ${data.copiedFiles.length} plików (${data.copiedFiles.join(', ')}) do: ${data.targetModsDir}`
            });
            this.renderLogs(this.lastResult);
            this.showStatus(`${I18N[this.lang].deploySuccess} (${data.copiedFiles.length})`, 'success');

            const span = this.deployModsBtn.querySelector('span');
            const origText = span.textContent;
            span.textContent = `✓ ${I18N[this.lang].deploySuccess}`;
            setTimeout(() => {
                span.textContent = origText;
            }, 2200);
        } catch (err) {
            this.showStatus(`Error: ${err.message}`, 'error');
        } finally {
            this.deployModsBtn.disabled = false;
        }
    }

    bindTabClicks() {
        this.inspectorTabs.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.inspectorTabs.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.activeTab = btn.getAttribute('data-tab');
                this.renderActiveTabContent();
            });
        });
    }

    applyLanguage() {
        const dict = I18N[this.lang];
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (dict[key]) el.textContent = dict[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            if (dict[key]) el.placeholder = dict[key];
        });
        this.langToggleBtn.textContent = this.lang.toUpperCase();

        this.renderRegionDropdownOptions();
        if (this.lastResult) {
            this.renderMapCards(this.lastResult);
            this.prepareFilesTabs(this.lastResult, this.activeTab);
            this.renderProgressionView(this.lastResult);
            this.renderAuditView(this.lastResult);
        }
    }

    renderRegionDropdownOptions() {
        const dict = I18N[this.lang];
        const keys = Object.keys(this.regionsData).sort();
        const currentVal = this.regionSelect.value;
        this.regionSelect.innerHTML = keys.length
            ? keys.map(r => `<option value="${r}">${r} (${this.regionsData[r].length} ${dict.mapsSuffix})</option>`).join('')
            : `<option value="">${dict.noPaksFound}</option>`;
        if (currentVal && keys.includes(currentVal)) {
            this.regionSelect.value = currentVal;
        }
    }

    async loadRegions() {
        try {
            const res = await fetch('/api/regions');
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);

            this.regionsData = data.regions || {};
            this.prebuildProjects = data.prebuildProjects || [];
            this.modZips = data.modZips || [];

            const savedOutDir = localStorage.getItem('sr_output_dir');
            const savedModsDir = localStorage.getItem('sr_mods_dir');
            const savedPrebuildDir = localStorage.getItem('sr_prebuild_dir');

            this.outputDirInput.value = savedOutDir || data.outputBaseDir;
            this.modsDirInput.value = savedModsDir || data.modsDir;
            this.prebuildDirInput.value = savedPrebuildDir || data.prebuildDir;

            this.renderRegionDropdownOptions();
            this.renderPrebuildProjectsDropdown();
            this.renderModZipsDropdown();
        } catch (err) {
            this.showStatus(err.message, 'error');
        }
    }

    async handleBuildRegion() {
        const region = (this.customRegionInput.value.trim() || this.regionSelect.value || '').toUpperCase();
        if (!region) {
            this.showStatus('Wybierz lub wpisz kod regionu (np. US_19)', 'error');
            return;
        }

        const outputBaseDir = this.outputDirInput.value.trim();
        const modsDir = this.modsDirInput.value.trim();
        const prebuildDir = this.prebuildDirInput.value.trim();
        if (outputBaseDir) localStorage.setItem('sr_output_dir', outputBaseDir);
        if (modsDir) localStorage.setItem('sr_mods_dir', modsDir);
        if (prebuildDir) localStorage.setItem('sr_prebuild_dir', prebuildDir);

        this.autoBuildBtn.disabled = true;
        this.autoBuildBtn.classList.add('loading');
        this.deployModsBtn.style.display = 'none';
        this.injectPrebuildBtn.style.display = 'none';
        this.showStatus(I18N[this.lang].buildingStatus, '');

        try {
            const res = await fetch('/api/build-region', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    region,
                    outputBaseDir,
                    patchBin: this.patchBinCb.checked,
                    patchBinStrings: Boolean(this.patchBinStringsCb?.checked),
                    injectFiles: this.injectFilesCb.checked,
                    autoInferBlockerMap: this.autoBlockerMapCb.checked,
                    forceCacheRefresh: this.forceCacheCb.checked,
                    zoneFilterMode: this.zoneFilterSelect.value,
                    garageMode: this.garageModeSelect?.value || 'remap_to_pak',
                    compatMode: this.compatModeSelect?.value || 'normal'
                })
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);

            this.forceCacheCb.checked = false;
            this.lastResult = data.result;
            this.prepareFilesTabs(data.result, 'contracts');
            this.populateCompareSelect();
            this.renderProgressionView(data.result);
            this.renderAuditView(data.result);
            this.renderMapCards(data.result);
            this.updateTelemetry(data.result);
            this.renderLogs(data.result);
            this.showStatus(`OK: ${data.result.outputDir}`, 'success');

            this.deployModsBtn.style.display = 'inline-flex';
            this.injectPrebuildBtn.style.display = 'inline-flex';
            lucide.createIcons();
        } catch (err) {
            this.showStatus(`Error: ${err.message}`, 'error');
        } finally {
            this.autoBuildBtn.disabled = false;
            this.autoBuildBtn.classList.remove('loading');
        }
    }

    prepareFilesTabs(result, keepTab = 'contracts') {
        const dict = I18N[this.lang];
        this.filesMap = {
            contracts: { name: 'contractsettings.json', content: result.contractsJson },
            contracts_unwrapped: { name: 'contractsettings_unwrapped.txt', content: result.contractsUnwrapped },
            local_obj: { name: 'local_objective_settings.json', content: result.localObjectiveSettingsJson }
        };

        let tabsHtml = `
            <button class="tab-btn" data-tab="contracts">${dict.tabContracts} (${result.contractsCount})</button>
            <button class="tab-btn" data-tab="contracts_unwrapped">${dict.tabContractsRaw}</button>
            <button class="tab-btn" data-tab="local_obj">${dict.tabLocalObj}</button>
        `;

        for (const m of result.maps) {
            const short = m.mapName.replace(/^level_/i, '').toUpperCase();
            const zKey = `zones_${m.mapName}`;
            const tKey = `tasks_${m.mapName}`;
            this.filesMap[zKey] = { name: `${m.mapName}_zone_settings.json`, content: m.zoneSettingsJson };
            this.filesMap[tKey] = { name: `${m.mapName}_objective_settings.json`, content: m.objectiveSettingsJson };

            tabsHtml += `
                <button class="tab-btn" data-tab="${zKey}">${short}: Zones (${m.zonesCount})</button>
                <button class="tab-btn" data-tab="${tKey}">${short}: Tasks (${m.tasksCount})</button>
            `;
        }

        const deadlockBadge = result.progressionReport?.deadlocks?.length
            ? ` ⚠️(${result.progressionReport.deadlocks.length})`
            : ' ✓';

        tabsHtml += `
            <button class="tab-btn tab-special" data-tab="modio_zip_view">${dict.tabModioZip}</button>
            <button class="tab-btn tab-special" data-tab="progression_view">${dict.tabProgression}${deadlockBadge}</button>
            <button class="tab-btn tab-special" data-tab="compare_view">${dict.tabCompare}</button>
            <button class="tab-btn tab-special" data-tab="audit_view">${dict.tabAudit}</button>
            <button class="tab-btn tab-special" data-tab="engine_search">${dict.tabEngineSearch}</button>
        `;

        this.inspectorTabs.innerHTML = tabsHtml;
        this.activeTab = keepTab;
        const activeBtn = this.inspectorTabs.querySelector(`[data-tab="${this.activeTab}"]`) || this.inspectorTabs.querySelector('.tab-btn');
        if (activeBtn) activeBtn.classList.add('active');

        this.bindTabClicks();
        this.renderActiveTabContent();
    }

    renderActiveTabContent() {
        this.jsonViewPane.style.display = 'none';
        this.modioZipViewPane.style.display = 'none';
        this.progressionViewPane.style.display = 'none';
        this.compareViewPane.style.display = 'none';
        this.auditViewPane.style.display = 'none';
        this.engineSearchPane.style.display = 'none';
        this.jsonToolbar.style.display = 'none';

        if (this.activeTab === 'modio_zip_view') {
            this.modioZipViewPane.style.display = 'block';
            return;
        }
        if (this.activeTab === 'progression_view') {
            this.progressionViewPane.style.display = 'block';
            return;
        }
        if (this.activeTab === 'compare_view') {
            this.compareViewPane.style.display = 'flex';
            return;
        }
        if (this.activeTab === 'audit_view') {
            this.auditViewPane.style.display = 'block';
            return;
        }
        if (this.activeTab === 'engine_search') {
            this.engineSearchPane.style.display = 'flex';
            return;
        }

        this.jsonViewPane.style.display = 'block';
        this.jsonToolbar.style.display = 'flex';

        const entry = this.filesMap[this.activeTab];
        if (!entry) return;

        let text = entry.content;
        const query = this.jsonSearchInput.value.trim().toLowerCase();
        if (query) {
            text = text
                .split('\n')
                .filter(line => line.toLowerCase().includes(query))
                .join('\n');
        }

        this.outputArea.innerHTML = this.syntaxHighlight(text, true);
        this.outputArea.dataset.raw = entry.content;
        this.outputArea.dataset.filename = entry.name;
    }

    renderProgressionView(result) {
        const isEn = this.lang === 'en';
        const rep = result?.progressionReport;
        if (!rep) {
            this.progressionContentArea.innerHTML = `
                <div class="audit-pass">
                    ${isEn
                ? 'Select a region on the left and click <b>"Build Entire Region (.pak + JSON)"</b> to generate the Starting Map, Garage, and Gateway Progression Graph analysis.'
                : 'Wybierz region w lewym panelu i kliknij <b>"Zbuduj cały region (.pak + JSON)"</b>, aby wygenerować analizę Mapy Startowej, Garaży i Grafu Przejść.'}
                </div>
            `;
            return;
        }

        const getMapTitle = (mObj) => {
            if (!mObj) return '';
            return isEn
                ? (mObj.titleEn || mObj.titlePl || '')
                : (mObj.titlePl || mObj.titleEn || '');
        };

        const formatMapLabel = (mObj) => {
            if (!mObj) return '';
            const title = getMapTitle(mObj);
            return title
                ? `<b>${mObj.mapName.toUpperCase()}</b> <span style="color: #93c5fd;">(${title})</span>`
                : `<b>${mObj.mapName.toUpperCase()}</b>`;
        };

        const startTitle = isEn
            ? (rep.startTitleEn || rep.startTitlePl)
            : (rep.startTitlePl || rep.startTitleEn);
        const startDisplay = startTitle
            ? `${rep.primaryStartMap.toUpperCase()} (${startTitle})`
            : rep.primaryStartMap.toUpperCase();

        const startReasonText = isEn
            ? (rep.startMapReasonEn || rep.startMapReason)
            : (rep.startMapReasonPl || rep.startMapReason);

        const mapRows = Object.values(rep.mapsInfo).map(m => {
            const isStart = m.mapName === rep.primaryStartMap;
            const startBadgeText = isEn ? '★ STARTING MAP' : '★ MAPA STARTOWA';
            const noGarageText = isEn ? 'No garage on this map' : 'Brak garażu na mapie';
            const openStartText = isEn ? 'OPEN FROM START' : 'OTWARTY NA STARCIE';
            const lockedReqText = isEn ? 'LOCKED -> requires:' : 'ZABLOKOWANY -> wymaga:';

            const garagesHtml = m.garages.length === 0
                ? `<span style="color: var(--text-tertiary);">${noGarageText}</span>`
                : m.garages.map(g => g.lockedBy.length === 0
                    ? `<span class="badge-ok">${openStartText} (${g.zoneId})</span>`
                    : `<span class="code-pill" style="border-color: #f59e0b; color: #fcd34d;">${lockedReqText} <b>${g.lockedBy.join(', ')}</b> (${g.zoneId})</span>`
                ).join(' ');

            return `
                <tr>
                    <td>
                        <code>${formatMapLabel(m)}</code>
                        ${isStart ? `<span class="badge-ok" style="margin-left: 8px;">${startBadgeText}</span>` : ''}
                    </td>
                    <td><code>indexInRegion = ${m.indexInRegion}</code></td>
                    <td>${garagesHtml}</td>
                </tr>
            `;
        }).join('');

        const gatewayRows = [];
        for (const m of Object.values(rep.mapsInfo)) {
            for (const gw of m.gateways) {
                const statusHtml = gw.lockedBy.length === 0
                    ? `<span class="badge-ok">${isEn ? 'OPEN FROM START' : 'OTWARTE OD STARTU'}</span>`
                    : `<span class="code-pill" style="border-color: #f59e0b; color: #fcd34d;">${isEn ? 'LOCKED -> Unlocked by mission:' : 'ZABLOKOWANE -> Otwiera misja:'} <b>${gw.lockedBy.join(', ')}</b></span>`;

                const targetTitle = isEn
                    ? (gw.targetTitleEn || gw.targetTitlePl || '')
                    : (gw.targetTitlePl || gw.targetTitleEn || '');
                const targetDisplay = targetTitle
                    ? `${(gw.targetMap || 'unknown').toUpperCase()} <span style="color: #93c5fd;">(${targetTitle})</span>`
                    : (gw.targetMap || 'unknown').toUpperCase();

                gatewayRows.push(`
                    <tr>
                        <td><code>${formatMapLabel(m)}</code></td>
                        <td><code>${gw.zoneId}</code></td>
                        <td><code>➔ <b>${targetDisplay}</b> (${gw.targetZone})</code></td>
                        <td>${statusHtml}</td>
                    </tr>
                `);
            }
        }

        const criticalList = rep.criticalDeadlocks || rep.deadlocks || [];
        const secondaryList = rep.secondaryLockedMissions || [];

        const criticalHtml = criticalList.length === 0
            ? `<div class="audit-pass">${
                isEn
                    ? `✓ Zero critical deadlocks! All maps (${rep.reachableMaps.length}) and all missions (${rep.completableMissionsCount}/${rep.totalMissionsCount}) are 100% reachable and completable from starting map ${startDisplay}.`
                    : `✓ Brak krytycznych blokad (Deadlocków)! Wszystkie mapy (${rep.reachableMaps.length}) oraz wszystkie misje (${rep.completableMissionsCount}/${rep.totalMissionsCount}) są w 100% przechodnie z mapy startowej ${startDisplay}.`
            }</div>`
            : `<div class="audit-warn-box" style="flex-direction: column; border-color: rgba(239, 68, 68, 0.45); background: rgba(239, 68, 68, 0.08);">
                <div style="color: #f87171; font-weight: 700; margin-bottom: 4px;">${
                isEn
                    ? `🔥 CRITICAL DEADLOCKS (Impossible to bypass in-game — ${criticalList.length}):`
                    : `🔥 KRYTYCZNE BLOKADY (Niemożliwe do obejścia w grze — ${criticalList.length}):`
            }</div>
                ${criticalList.map(d => `<div>❌ <b>[${d.type}]</b> ${isEn ? (d.reasonEn || d.reasonPl || d.reason) : (d.reasonPl || d.reasonEn || d.reason)}</div>`).join('')}
               </div>`;

        const secondaryHtml = secondaryList.length > 0
            ? `<details style="margin-top: 10px; background: var(--bg-surface); padding: 10px 14px; border-radius: 7px; border: 1px solid var(--border-default); font-family: var(--font-mono); font-size: 11.5px; cursor: pointer;">
                <summary style="color: var(--text-secondary); font-weight: 600;">${
                isEn
                    ? `ℹ️ Show secondary effects: regular missions waiting for map access (${secondaryList.length})`
                    : `ℹ️ Pokaż skutki wtórne: zwykłe misje oczekujące na odblokowanie mapy (${secondaryList.length})`
            }</summary>
                <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 5px; color: var(--text-secondary);">
                    ${secondaryList.map(s => `<div>• ${isEn ? (s.reasonEn || s.reasonPl || s.reason) : (s.reasonPl || s.reasonEn || s.reason)}</div>`).join('')}
                </div>
               </details>`
            : '';

        const stepWord = isEn ? 'Step' : 'Krok';
        const stepsHtml = rep.progressionSteps
            .map((s, idx) => {
                const text = typeof s === 'object' ? (isEn ? s.en : s.pl) : s;
                return `<div style="padding: 4px 0; border-bottom: 1px solid var(--border-subtle); font-family: var(--font-mono); font-size: 11.5px;"><b>${stepWord} ${idx + 1}:</b> ${text}</div>`;
            })
            .join('');

        this.progressionContentArea.innerHTML = `
            <div class="audit-block">
                <h3>${isEn ? '1. Recommended Starting Map & Garage Status' : '1. Rekomendowana Mapa Startowa i Status Garaży'}</h3>
                <div class="audit-pass" style="margin-bottom: 10px;">
                    ${isEn ? '★ Primary Starting Map:' : '★ Główna Mapa Startowa:'} <b>${startDisplay}</b> — ${startReasonText}
                </div>
                <table class="audit-table">
                    <thead>
                        <tr>
                            <th>${isEn ? 'Map (Code + EN Name)' : 'Mapa (Kod + Nazwa PL)'}</th>
                            <th>${isEn ? 'Engine Order' : 'Kolejność w silniku'}</th>
                            <th>${isEn ? 'Garages on Map (ZonePropertyGarageEntrance)' : 'Garaże na mapie (ZonePropertyGarageEntrance)'}</th>
                        </tr>
                    </thead>
                    <tbody>${mapRows}</tbody>
                </table>
            </div>

            <div class="audit-block">
                <h3>${isEn ? '2. Labyrinth & Progression Deadlock Detector' : '2. Detektor Labiryntów i Sprzeczności Przejść (Deadlock Detector)'}</h3>
                ${criticalHtml}
                ${secondaryHtml}
            </div>

            <div class="audit-block">
                <h3>${isEn ? '3. Inter-Map Gateway Graph (Tunnels / Transitions)' : '3. Graf Przejść Między Mapami (Tunele / Gateways)'}</h3>
                <table class="audit-table">
                    <thead>
                        <tr>
                            <th>${isEn ? 'From Map' : 'Z Mapy'}</th>
                            <th>${isEn ? 'Gateway Zone' : 'Strefa Bramy (Gateway)'}</th>
                            <th>${isEn ? 'Leads To Map' : 'Prowadzi Do Mapy'}</th>
                            <th>${isEn ? 'Unlock Condition (from initial.cache_block)' : 'Warunek Odblokowania (z initial.cache_block)'}</th>
                        </tr>
                    </thead>
                    <tbody>${gatewayRows.join('') || `<tr><td colspan="4">${isEn ? 'Single-map region (no inter-map gateways)' : '1 mapa w regionie (brak przejść między mapami)'}</td></tr>`}</tbody>
                </table>
            </div>

            <div class="audit-block">
                <h3>${isEn ? '4. Step-by-Step Region Unlock Simulation (BFS Algorithm)' : '4. Symulacja Odblokowywania Regionu Krok po Kroku (Algorytm BFS)'}</h3>
                <div style="background: var(--bg-surface); padding: 12px 14px; border-radius: 8px; border: 1px solid var(--border-default);">
                    ${stepsHtml}
                </div>
            </div>
        `;
    }

    populateCompareSelect() {
        if (!this.lastResult || !this.lastResult.comparisonItems) return;
        const filter = this.compareFilterInput.value.trim().toLowerCase();
        this.filteredComparisonItems = this.lastResult.comparisonItems.filter(item =>
            !filter || item.name.toLowerCase().includes(filter) || item.category.toLowerCase().includes(filter)
        );

        this.compareItemSelect.innerHTML = this.filteredComparisonItems
            .map((item, idx) => `<option value="${idx}">[${item.category}] ${item.name}</option>`)
            .join('');

        this.renderSelectedCompareItem();
    }

    renderSelectedCompareItem() {
        const idx = Number(this.compareItemSelect.value || 0);
        const item = this.filteredComparisonItems[idx];
        if (!item) {
            this.compareRawOutput.innerHTML = '';
            this.compareJsonOutput.innerHTML = '';
            return;
        }
        this.compareRawOutput.innerHTML = this.wrapLinesWithNumbers(item.rawText, false);
        this.compareRawOutput.dataset.raw = item.rawText;
        this.compareJsonOutput.innerHTML = this.syntaxHighlight(item.compiledJson, true);
        this.compareJsonOutput.dataset.raw = item.compiledJson;
    }

    renderAuditView(result) {
        if (!result || !result.audit) return;
        const dict = I18N[this.lang];
        const { missingZonesInPaks, blockerMapAudit, unmappedWarnings } = result.audit;

        const missingHtml = missingZonesInPaks.length === 0
            ? `<div class="audit-pass">${dict.auditAllZonesOk}</div>`
            : `<div class="audit-warn-box">${missingZonesInPaks.map(z => `<span class="code-pill">${z}</span>`).join(' ')}</div>`;

        const blockerRows = blockerMapAudit.map(b => `
            <tr>
                <td><code>${b.contractName}</code></td>
                <td><code>${b.blockerObjectives.join(', ') || '-'}</code></td>
                <td><code>${b.compiledBlockerMap || '""'}</code></td>
                <td><code>${b.suggestedMap || '-'}</code></td>
            </tr>
        `).join('');

        const filteredSections = result.maps.map(m => {
            if (!m.filteredOutZones || m.filteredOutZones.length === 0) return '';
            return `
                <div style="margin-bottom: 12px;">
                    <div style="font-weight: 600; margin-bottom: 6px; font-family: var(--font-mono); font-size: 12px;">
                        ${m.mapName} (${m.filteredOutZones.length}):
                    </div>
                    <div class="pills-wrap">
                        ${m.filteredOutZones.map(fz => `<span class="code-pill">${fz.name} <small>(${fz.reason})</small></span>`).join('')}
                    </div>
                </div>
            `;
        }).join('');

        const unmappedHtml = unmappedWarnings.length === 0
            ? `<div class="audit-pass">${dict.auditNoUnmapped}</div>`
            : `<div class="audit-warn-box">${unmappedWarnings.map(w => `<div>• ${w}</div>`).join('')}</div>`;

        this.auditContentArea.innerHTML = `
            <div class="audit-block">
                <h3>${dict.auditTitleMissing}</h3>
                ${missingHtml}
            </div>
            <div class="audit-block">
                <h3>${dict.auditTitleUnmapped}</h3>
                ${unmappedHtml}
            </div>
            <div class="audit-block">
                <h3>${dict.auditTitleBlocker} (${blockerMapAudit.length})</h3>
                <table class="audit-table">
                    <thead>
                        <tr>
                            <th>Contract</th>
                            <th>blockerObjectives</th>
                            <th>blockerMap (JSON)</th>
                            <th>Inferred Map</th>
                        </tr>
                    </thead>
                    <tbody>${blockerRows}</tbody>
                </table>
            </div>
            <div class="audit-block">
                <h3>${dict.auditTitleFiltered} (${result.totalFilteredZonesCount})</h3>
                ${filteredSections || '<div class="audit-pass">0</div>'}
            </div>
        `;
    }

    async handleEngineSearch() {
        const query = this.engineQueryInput.value.trim();
        if (!query) return;

        this.engineSearchOutput.innerHTML = this.wrapLinesWithNumbers('Searching initial.cache_block...', false);
        try {
            const res = await fetch('/api/search-cache', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query })
            });
            const data = await res.json();
            if (!data.ok) throw new Error(data.error);

            this.engineSearchMatches = data.matches || [];
            this.engineMatchesSelect.innerHTML = this.engineSearchMatches.length
                ? this.engineSearchMatches.map((m, i) => `<option value="${i}">${m.name}</option>`).join('')
                : '<option value="">0 results</option>';

            this.renderSelectedEngineMatch();
        } catch (err) {
            this.engineSearchOutput.innerHTML = this.wrapLinesWithNumbers(`Error: ${err.message}`, false);
        }
    }

    renderSelectedEngineMatch() {
        const idx = Number(this.engineMatchesSelect.value || 0);
        const match = (this.engineSearchMatches || [])[idx];
        this.engineSearchOutput.innerHTML = match
            ? this.wrapLinesWithNumbers(match.rawText, false)
            : this.wrapLinesWithNumbers('Brak wyników / No matches found.', false);
    }

    renderMapCards(result) {
        const dict = I18N[this.lang];
        this.mapsCardsArea.innerHTML = result.maps.map(m => {
            const readable = this.lang === 'en' ? (m.titleEn || m.titlePl) : (m.titlePl || m.titleEn);
            return `
            <div class="map-card" style="${m.isStartMap ? 'border-color: rgba(16, 185, 129, 0.45);' : ''}">
                <div class="map-card-header">
                    <span>${m.pakFile} ${readable ? `<small style="color:#93c5fd;font-weight:500;">(${readable})</small>` : ''} ${m.isStartMap ? '<span class="badge-ok" style="margin-left:4px;">★ START</span>' : ''}</span>
                    <span class="badge-ok">SSL: ${m.oldByteHex} → 0x01</span>
                </div>
                <div class="map-card-metrics">
                    <span>${dict.cardZones}: <b>${m.zonesCount}</b></span>
                    <span>${dict.cardFiltered}: <b>${m.filteredZonesCount}</b></span>
                    <span>${dict.cardTasks}: <b>${m.tasksCount}</b></span>
                    <span>${dict.cardInjected}: <b>${m.injectedCount}/5</b> (${dict.cardRoot})</span>
                </div>
            </div>
        `}).join('');
    }

    updateTelemetry(result) {
        const totalZones = result.maps.reduce((s, m) => s + m.zonesCount, 0);
        const totalTasks = result.maps.reduce((s, m) => s + m.tasksCount, 0);

        document.getElementById('statZones').textContent = totalZones;
        document.getElementById('statFiltered').textContent = result.totalFilteredZonesCount || 0;
        document.getElementById('statTasks').textContent = totalTasks;
        document.getElementById('statContracts').textContent = result.contractsCount;

        if (result.economy && this.economyBadge) {
            this.economyBadge.textContent = `$${result.economy.totalMoney.toLocaleString()} • ${result.economy.totalXp.toLocaleString()} XP`;
        }
    }

    renderLogs(result) {
        const items = result.logs.map(entry => {
            const cls = entry.level === 'warn'
                ? 'log-warn'
                : entry.level === 'filter' || entry.level === 'info'
                    ? 'log-info'
                    : 'log-success';
            return `
                <div class="log-item ${cls}">
                    <span class="log-time">[${entry.time}]</span>
                    <span class="log-tag">[${entry.tag}]</span>
                    <span class="log-msg">${entry.message}</span>
                </div>
            `;
        });
        this.logsArea.innerHTML = items.join('');
        this.logsArea.scrollTop = this.logsArea.scrollHeight;
    }

    handleCopyLogs() {
        if (!this.lastResult || !this.lastResult.logs) return;
        const text = this.lastResult.logs
            .map(e => `[${e.time}] [${e.tag}] ${e.message}`)
            .join('\n');
        navigator.clipboard.writeText(text).then(() => {
            const span = this.copyLogsBtn.querySelector('span');
            const orig = span.textContent;
            span.textContent = I18N[this.lang].copied;
            setTimeout(() => (span.textContent = orig), 1500);
        });
    }

    async openSystemFolder(folderPath) {
        await fetch('/api/open-folder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ folderPath })
        });
    }

    handleCopyJson() {
        const raw = this.outputArea.dataset.raw;
        if (!raw) return;
        navigator.clipboard.writeText(raw).then(() => {
            const span = this.copyBtn.querySelector('span');
            const orig = span.textContent;
            span.textContent = I18N[this.lang].copied;
            setTimeout(() => (span.textContent = orig), 1500);
        });
    }

    handleDownload() {
        const raw = this.outputArea.dataset.raw;
        const filename = this.outputArea.dataset.filename || 'output.json';
        if (!raw) return;

        const blob = new Blob([raw], { type: 'application/json;charset=utf-8' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        URL.revokeObjectURL(a.href);
    }

    showStatus(message, type) {
        this.statusEl.textContent = message;
        this.statusEl.className = `status-text ${type}`;
    }

    syntaxHighlight(json, withLineNumbers = true) {
        const escaped = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const highlighted = escaped.replace(
            /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(?:\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
            match => {
                const cls = /^"/.test(match)
                    ? /:$/.test(match) ? 'key' : 'string'
                    : /true|false/.test(match)
                        ? 'boolean'
                        : /null/.test(match)
                            ? 'null'
                            : 'number';
                return `<span class="${cls}">${match}</span>`;
            }
        );
        return withLineNumbers ? this.wrapLinesWithNumbers(highlighted, true) : highlighted;
    }

    wrapLinesWithNumbers(textOrHtml, isAlreadyEscapedHtml = false) {
        if (!textOrHtml) return '';
        const safeContent = isAlreadyEscapedHtml
            ? textOrHtml
            : textOrHtml.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

        const lines = safeContent.split(/\r?\n/);
        return lines
            .map((lineContent, idx) => `<div class="code-line"><span class="line-num" data-line="${idx + 1}"></span><span class="line-text">${lineContent || ' '}</span></div>`)
            .join('');
    }
}

new StudioApp();