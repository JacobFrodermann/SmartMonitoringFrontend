/* global UIkit */

// ─── Data stores ─────────────────────────────────────────────────────────────
window['pm2_5'] = [{id: 1, pm2_5: -1, ts: new Date().toISOString()}];
window['pm10_0'] = [{id: 1, pm10_0: -1, ts: new Date().toISOString()}];

window['sm_pm25_legend_data'] = {
    pm2_5: {
        txt_title: 'PM2.5', txt_desc: 'Particulate matter <= 2.5 um', txt_uknw: 'unknown',
        minValue: 0, maxValue: 100, calcmode: '<',
        values: {
            '5': {txt: '< 5 ug/m3 (WHO)', col: '#2AAD27'},
            '10': {txt: '5-10 ug/m3 (EU 2030)', col: '#CAC428'},
            '25': {txt: '10-25 ug/m3 (EU 2025)', col: '#CB8427'},
            '95': {txt: '> 25 ug/m3', col: '#CB2B3E'},
            '100': {txt: '> 40 ug/m3', col: '#000000'}
        }
    }
};

window['sm_pm10_legend_data'] = {
    pm10_0: {
        txt_title: 'PM10', txt_desc: 'Particulate matter <= 10 um', txt_uknw: 'unknown',
        minValue: 0, maxValue: 150, calcmode: '<',
        values: {
            '15': {txt: '< 15 ug/m3 (WHO)', col: '#2AAD27'},
            '20': {txt: '15-20 ug/m3 (EU 2030)', col: '#CAC428'},
            '40': {txt: '20-40 ug/m3 (EU 2010)', col: '#CB8427'},
            '140': {txt: '> 40 ug/m3', col: '#CB2B3E'},
            '150': {txt: '> 40 ug/m3', col: '#000000'}
        }
    }
};

window['label_question_options'] = {timeToReanswer: 0, autoSave: true};

/**
 * Scans window for sm_*_legend_data keys and injects matching hidden div elements into the DOM.
 */
function injectLegendElements() {
    Object.keys(window)
        .filter(k => k.startsWith('sm_') && k.endsWith('_legend_data'))
        .forEach(function (key) {
            const id = key.replace('_data', '');
            if (document.getElementById(id))
                return;
            const el = document.createElement('div');
            el.id = id;
            el.setAttribute('swa', 'Datadescription FROM ' + key);
            el.style.display = 'none';
            document.body.appendChild(el);
        });
}

/**
 * Reports the current scroll height of the page to the parent frame so it can resize the iframe.
 */
function reportHeight() {
    window.parent.postMessage({type: 'sm_resize', height: document.body.scrollHeight}, '*');
}

var _timerInterval = null;
var _timerCountdown = null;
var _timerMs = 30000;

/**
 * Stops the measurement polling timer and resets the countdown display.
 */
function timerStop() {
    if (_timerInterval !== null) {
        clearInterval(_timerInterval);
        _timerInterval = null;
    }
    if (_timerCountdown !== null) {
        clearInterval(_timerCountdown);
        _timerCountdown = null;
    }
    const curEl = document.getElementById('sm-countdown-cur');
    const maxEl = document.getElementById('sm-countdown-max');
    if (curEl)
        curEl.textContent = '-';
    if (maxEl)
        maxEl.textContent = '-';
}

/**
 * Starts the measurement polling timer and updates the countdown display every second.
 */
function timerStart() {
    timerStop();

    const routerElem = window.parent.document.querySelector('#commands');
    if (!routerElem || !routerElem.swac_comp)
        return;

    // Fire once immediately, then repeat on interval
    routerElem.swac_comp.suppressModal = true;
    routerElem.swac_comp.executeCommand('last_measuring', null, true, false);

    _timerInterval = setInterval(function () {
        if (!routerElem.swac_comp)
            return;
        routerElem.swac_comp.suppressModal = true;
        routerElem.swac_comp.executeCommand('last_measuring', null, true, false);
    }, _timerMs);

    const cdDiv = document.getElementById('sm-countdown');
    if (cdDiv)
        cdDiv.style.display = '';
    const maxEl = document.getElementById('sm-countdown-max');
    if (maxEl)
        maxEl.textContent = _timerMs / 1000;

    let remaining = _timerMs / 1000;
    const curEl = document.getElementById('sm-countdown-cur');
    if (curEl)
        curEl.textContent = remaining;

    _timerCountdown = setInterval(function () {
        remaining--;
        if (remaining <= 0)
            remaining = _timerMs / 1000;
        if (curEl)
            curEl.textContent = remaining;
    }, 1000);
}

// Stop the timer when the user navigates away from this iframe
window.addEventListener('beforeunload', function () {
    timerStop();
});

/**
 * Enables or disables the control buttons based on the current connection state.
 *
 * @param {boolean} connected - True if a BLE or WebSocket connection is active.
 */
function applyConnectionState(connected) {
    const toggleBtn = document.querySelector('[data-cmd-toggle="smartMobile_toggle_measuring"]');
    const dropdownBtn = document.querySelector('.uk-button-group .uk-button-default');

    if (toggleBtn) {
        toggleBtn.disabled = !connected;
        toggleBtn.style.opacity = connected ? '' : '0.4';
        toggleBtn.style.cursor = connected ? '' : 'not-allowed';
    }
    if (dropdownBtn) {
        dropdownBtn.disabled = !connected;
        dropdownBtn.style.opacity = connected ? '' : '0.4';
        dropdownBtn.style.cursor = connected ? '' : 'not-allowed';
    }
}

/**
 * Updates the toggle button appearance and shows or hides the display area based on measuring state.
 *
 * @param {boolean} isRunning - True if a measurement is currently active.
 */
function applyMeasuringState(isRunning) {
    const btn = document.querySelector('.device_toogle_measurement');
    const displayArea = document.querySelector('.displayArea');
    const messagebox = document.querySelector('.messagebox');
    const cdDiv = document.getElementById('sm-countdown');

    if (isRunning) {
        if (btn) {
            btn.setAttribute('swac_lang', 'device_measurement_stop');
            btn.textContent = 'Messung stoppen';
            btn.classList.remove('uk-button-primary');
            btn.classList.add('uk-button-danger');
        }
        if (displayArea)
            displayArea.classList.remove('swac_dontdisplay');
        if (messagebox)
            messagebox.classList.add('swac_dontdisplay');
        if (cdDiv)
            cdDiv.style.display = '';
    } else {
        if (btn) {
            btn.setAttribute('swac_lang', 'device_measurement_start');
            btn.textContent = 'Messung starten';
            btn.classList.remove('uk-button-danger');
            btn.classList.add('uk-button-primary');
        }
        if (displayArea)
            displayArea.classList.add('swac_dontdisplay');
        if (messagebox)
            messagebox.classList.remove('swac_dontdisplay');
        if (cdDiv)
            cdDiv.style.display = 'none';
    }
}

/**
 * Binds the toggle button and the route-name modal flow to their respective click and keydown events.
 */
function wireToggleButton() {
    const toggleBtn = document.querySelector('[data-cmd-toggle="smartMobile_toggle_measuring"]');
    if (!toggleBtn)
        return;

    toggleBtn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();

        const measuringNow = document.getElementById('sm-countdown')?.style.display !== 'none';

        if (measuringNow) {
            // Stop measuring immediately without asking for a route name
            fireToggle(null);
            return;
        }

        UIkit.modal(document.getElementById('modal-new-route')).show();
    });

    document.getElementById('btn-route-no').addEventListener('click', function () {
        UIkit.modal(document.getElementById('modal-new-route')).hide();
        fireToggle({newRoute: false, measurementProcessName: ''});
    });

    document.getElementById('btn-route-yes').addEventListener('click', function () {
        UIkit.modal(document.getElementById('modal-new-route')).hide();
        document.getElementById('input-route-name').value = '';
        UIkit.modal(document.getElementById('modal-route-name')).show();
    });

    document.getElementById('btn-name-skip').addEventListener('click', function () {
        UIkit.modal(document.getElementById('modal-route-name')).hide();
        fireToggle({newRoute: true, measurementProcessName: ''});
    });

    document.getElementById('btn-name-ok').addEventListener('click', function () {
        const name = document.getElementById('input-route-name').value.trim();
        UIkit.modal(document.getElementById('modal-route-name')).hide();
        fireToggle({newRoute: true, measurementProcessName: name});
    });

    document.getElementById('input-route-name').addEventListener('keydown', function (e) {
        if (e.key === 'Enter')
            document.getElementById('btn-name-ok').click();
    });
}

/**
 * Stops the timer and sends the toggle measuring command to the parent CommandRouter.
 *
 * @param {Object|null} param - Route parameters forwarded with the command, or null when stopping.
 */
function fireToggle(param) {
    const routerElem = window.parent.document.querySelector('#commands');
    if (!routerElem)
        return;

    // timerStart() is called later by handleCommandResult when action='start' arrives
    timerStop();
    routerElem.swac_comp.executeCommand('smartMobile_toggle_measuring', param, true, false);
}

/**
 * Binds all [data-cmd] buttons to the parent CommandRouter and handles one-shot timer restarts.
 */
function wireButtons() {
    const routerElem = window.parent.document.querySelector('#commands');
    if (!routerElem)
        return;

    document.querySelectorAll('[data-cmd]').forEach(function (el) {
        el.addEventListener('click', function (e) {
            e.preventDefault();

            const dropdown = el.closest('[uk-dropdown]');
            if (dropdown)
                UIkit.dropdown(dropdown).hide(false);

            const cmd = el.getAttribute('data-cmd');
            const measuringNow = document.getElementById('sm-countdown')?.style.display !== 'none';

            timerStop();

            if (cmd === 'addWlan') {
                // WLAN config is handled by the Bluetooth component directly
                const btElem = window.parent.document.querySelector('[id^="bluetooth_"]');
                btElem?.swac_comp?.doCommand('addWlan');
                if (measuringNow)
                    setTimeout(timerStart, 3000);
                return;
            }

            routerElem.swac_comp.executeCommand(cmd);

            // Restart the polling timer after one-shot commands so live data continues
            const isOneShot = (cmd !== 'smartMobile_toggle_measuring');
            if (isOneShot && measuringNow) {
                setTimeout(timerStart, 2000);
            }
        });
    });
}

/**
 * Processes a command result from the parent, updates the UI and dispatches sensor data to dashboard cards.
 *
 * @param {Object|Array} raw - The raw result forwarded from the parent via postMessage.
 */
function handleCommandResult(raw) {
    const rawRecord = Array.isArray(raw) ? raw[0] : raw;
    const record = (rawRecord.records && rawRecord.records[0]) ? rawRecord.records[0]
        : (rawRecord.data && typeof rawRecord.data === 'object') ? rawRecord.data
        : rawRecord;
    const measurement = record;
    const action = record.action ?? null;

    // Initial status sync in response to smartMobile_measuring_status
    if (action === null && record.status !== undefined && record.collection === undefined
        && (record.status === '200' || record.status === '204')) {
        const isRunning = (record.status === '200');
        applyMeasuringState(isRunning);
        if (isRunning)
            timerStart();
        setTimeout(reportHeight, 50);
        return;
    }

    const cardCompElem = document.querySelector('[swa^="Dashboard"]');
    const cards = cardCompElem ? cardCompElem.swac_comp.getMainSourceData() : null;
    const displayArea = document.querySelector('.displayArea');
    const messagebox = document.querySelector('.messagebox');

    if (action === 'start') {
        applyMeasuringState(true);
        timerStart();
        setTimeout(reportHeight, 50);
    }

    if (action === 'stop') {
        applyMeasuringState(false);
        timerStop();
        setTimeout(reportHeight, 50);
    }

    // Collection responses carry no sensor values — nothing to render
    if (record.collection !== undefined)
        return;

    const cdDiv2 = document.getElementById('sm-countdown');
    const isRunning = cdDiv2 && cdDiv2.style.display !== 'none';
    const hasSensorData = record && typeof record === 'object'
        && action === null
        && record.collection === undefined;

    if (hasSensorData && cards && isRunning) {
        if (displayArea)
            displayArea.classList.remove('swac_dontdisplay');
        if (messagebox)
            messagebox.classList.add('swac_dontdisplay');

        for (let curCard of cards.getSets()) {
            if (!curCard)
                continue;
            const value = measurement[curCard.data_source];
            const subCompsElem = cardCompElem.querySelector('#set' + curCard.id + 'dash');
            if (!subCompsElem)
                continue;

            if (action !== 'start' && (value === null || value === undefined)) {
                // Save original HTML so it can be restored when data arrives again
                if (!subCompsElem.dataset.originalHtml) {
                    subCompsElem.dataset.originalHtml = subCompsElem.innerHTML;
                    subCompsElem._savedSwacComp = subCompsElem.swac_comp;
                }
                subCompsElem.innerHTML =
                    '<p class="uk-text-center uk-text-muted sm_no_data_fallback">'
                    + '<img src="/SWAC/swac/components/Icon/imgs/data/database_warning.svg" width="80" height="80"><br>'
                    + 'No data available</p>';
                continue;
            }

            // Restore the original card HTML if it was replaced by the no-data fallback
            if (subCompsElem.dataset.originalHtml && subCompsElem.querySelector('.sm_no_data_fallback')) {
                subCompsElem.innerHTML = subCompsElem.dataset.originalHtml;
                subCompsElem.swac_comp = subCompsElem._savedSwacComp;
                delete subCompsElem.dataset.originalHtml;
                delete subCompsElem._savedSwacComp;
            }

            const dataStore = window[curCard.data_source];
            if (dataStore && dataStore[0])
                dataStore[0][curCard.data_source] = value;

            subCompsElem.swac_comp.removeAllData();
            const set = {};
            set[curCard.data_source] = value;
            subCompsElem.swac_comp.addData(curCard.data_source, [set]);
        }
        setTimeout(reportHeight, 100);
    }
}

/**
 * Bootstraps the control page: injects legend elements, wires buttons and registers message listeners.
 */
function initControlPage() {
    injectLegendElements();

    // Buttons start disabled until the parent confirms a connection
    applyConnectionState(false);

    window.addEventListener('load', function () {
        reportHeight();
        if (window.ResizeObserver) {
            new ResizeObserver(reportHeight).observe(document.body);
        }
    });

    window.addEventListener('message', function (evt) {
        evt.stopPropagation();
        if (!evt.data)
            return;
        if (evt.data.type === 'sm_command_result') {
            handleCommandResult(evt.data.result);
        }
        if (evt.data.type === 'sm_connection_state') {
            applyConnectionState(evt.data.connected);
        }
    });

    document.addEventListener('swac_components_complete', function onReady() {
        document.removeEventListener('swac_components_complete', onReady);
        wireButtons();
        wireToggleButton();
        // Notify parent only after SWAC is done so connection state arrives when the page is ready
        window.parent.postMessage({type: 'sm_ready'}, '*');
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initControlPage);
} else {
    initControlPage();
}