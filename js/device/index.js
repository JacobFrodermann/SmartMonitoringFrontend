window['command_options'] = {
    commandTimer: [],
    deviceNameSource: '.device_name',
    attributeOrder: [
        "id", "ts", "synced",
        "temp1", "temp2", "temp3",
        "pm2_5", "pm10_0",
        "pos", "pos_accuracy", "pos_altitude", "pos_altitude_accuracy", "pos_heading", "pos_speed",
        "inn_temp", "inn_pres", "inn_hum",
        "co2",
        "measurement_process", "measurement_name"
    ]};

window['bluetooth_options'] = {
    deviceNameSource: '.device_name'
};

/**
 * Listens for iframe resize and sm_ready messages, then responds with the current connection state.
 *
 * @param {MessageEvent} evt - The message event received from the iframe.
 */
window.addEventListener('message', function (evt) {
    if (!evt.data)
        return;
    if (evt.data.type === 'sm_resize') {
        const iframe = document.getElementById('dataframe');
        if (iframe)
            iframe.style.height = evt.data.height + 'px';
    }
    if (evt.data.type === 'sm_ready') {
        // control.js is fully wired — send current state so the toggle button is correctly enabled
        notifyConnectionState(isConnected());
        if (isConnected())
            queryMeasuringStatus();
    }
});

/**
 * Forwards a command result object to the iframe via postMessage.
 *
 * @param {*} raw - The raw result object to forward.
 */
function forwardToIframe(raw) {
    const iframe = document.getElementById('dataframe');
    if (iframe && iframe.contentWindow)
        iframe.contentWindow.postMessage({type: 'sm_command_result', result: raw}, '*');
}

/**
 * Posts the current connection state to the iframe so it can enable or disable its controls.
 *
 * @param {boolean} connected - True if a BLE or WebSocket connection is currently active.
 */
function notifyConnectionState(connected) {
    const iframe = document.getElementById('dataframe');
    if (iframe && iframe.contentWindow)
        iframe.contentWindow.postMessage({type: 'sm_connection_state', connected: connected}, '*');
}

/**
 * Returns true if either the WebSocket or the Bluetooth connection is currently active.
 *
 * @returns {boolean}
 */
function isConnected() {
    // WebSocket: check computed style because SWAC may use inline or CSS to hide the button
    const wsBtn = document.querySelector('[id^="websocket_state_"] .uk-label-success');
    const wsConnected = wsBtn
            ? window.getComputedStyle(wsBtn).display !== 'none'
            : false;

    // Bluetooth: uk-label-success is only present on the button when actively connected
    const btBtn = document.querySelector('[id^="bluetooth_"] .uk-label-success');
    const btConnected = btBtn !== null;

    return wsConnected || btConnected;
}

var _lastConnected = false;

/**
 * Polls the DOM every 2 seconds and notifies the iframe whenever the connection state changes.
 */
setInterval(function () {
    const connected = isConnected();
    if (connected !== _lastConnected) {
        _lastConnected = connected;
        notifyConnectionState(connected);
        if (connected)
            queryMeasuringStatus();
    }
}, 2000);

var _swacReady = false;

/**
 * Sends the smartMobile_measuring_status command to the CommandRouter to fetch the current measuring state.
 */
function queryMeasuringStatus() {
    if (!_swacReady)
        return;
    const routerElem = document.querySelector('#commands');
    if (!routerElem || !routerElem.swac_comp)
        return;
    routerElem.swac_comp.executeCommand('smartMobile_measuring_status', null, true, false);
}

/**
 * Bootstraps the index page once SWAC is ready and registers the command result forwarding listener.
 */
document.addEventListener('swac_components_complete', function onReady() {
    document.removeEventListener('swac_components_complete', onReady);

    _swacReady = true;

    const routerElem = document.querySelector('#commands');
    if (!routerElem)
        return;

    // Forward every executed command result to the iframe
    document.addEventListener('swac_' + routerElem.id + '_commandrouter_executed', function (evt) {
        const raw = evt.detail && evt.detail.result;
        if (raw)
            forwardToIframe(raw);
    });

    // Auto update height of frame
    function updateIframeHeight() {
        const iframe = document.getElementById("dataframe");
        if (iframe) {
            const innerDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (!innerDoc || !innerDoc.body)
                return;

            const newHeight = innerDoc.body.scrollHeight + "px";
            if (iframe.style.height !== newHeight) {
                iframe.style.height = newHeight;
            }
        }
    }
    setInterval(updateIframeHeight, 1500);
});