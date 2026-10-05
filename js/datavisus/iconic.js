function getVisualisationMode() {
    let mode = new URLSearchParams(window.location.search).get('visualisation');
    return ['automatic', 'individual', 'circle', 'thermometer', 'hygrometer', 'progress', 'chart'].includes(mode)
            ? mode : 'automatic';
}

function getVisualisationColumns() {
    let columns = Number(new URLSearchParams(window.location.search).get('visualisation_columns'));
    return Number.isInteger(columns) && columns >= 1 && columns <= 5 ? columns : 2;
}

function getConfiguredVisualisationModes() {
    let value = new URLSearchParams(window.location.search).get('attribute_modes');
    if (!value)
        return null;
    try {
        let modes = JSON.parse(value);
        return modes && typeof modes === 'object' && !Array.isArray(modes) ? modes : null;
    } catch (error) {
        return null;
    }
}

function getSelectedVisualisationAttributes() {
    if (configuredVisualisationModes) {
        return Object.keys(configuredVisualisationModes)
                .filter(attr => configuredVisualisationModes[attr] !== 'none');
    }
    let value = new URLSearchParams(window.location.search).get('attributes');
    if (!value)
        return null;

    return [...new Set(value.split(',').map(attr => attr.trim()).filter(attr => attr))];
}

function isVisualisationAttribute(attr) {
    let excludedAttrs = ['id', 'oo_id', 'pos_accuracy', 'pos_altitude', 'pos_heading', 'pos_speed'];
    return !attr.startsWith('swac_') && !attr.startsWith('pos_') && !excludedAttrs.includes(attr);
}

function isNumericVisualisationValue(value) {
    if (typeof value === 'number')
        return Number.isFinite(value);
    if (typeof value !== 'string' || value.trim() === '')
        return false;
    return Number.isFinite(Number(value));
}

function getVisualisationDisplayName(attr) {
    let names = {
        co2: 'CO₂',
        pm2_5: 'PM2,5',
        pm10_0: 'PM10'
    };
    return names[attr] || attr;
}

let configuredVisualisationModes = getConfiguredVisualisationModes();
let selectedVisualisationAttributes = getSelectedVisualisationAttributes();

function getVisualisationAttributeMode(attr) {
    let mode = getVisualisationMode();
    if (configuredVisualisationModes
            && Object.prototype.hasOwnProperty.call(configuredVisualisationModes, attr)) {
        let configuredMode = configuredVisualisationModes[attr];
        if (['automatic', 'circle', 'thermometer', 'hygrometer', 'progress', 'chart', 'none'].includes(configuredMode))
            return configuredMode;
    }
    if (configuredVisualisationModes)
        return mode === 'individual' ? 'automatic' : mode;
    if (selectedVisualisationAttributes && !selectedVisualisationAttributes.includes(attr))
        return 'none';
    return mode === 'individual' ? 'automatic' : mode;
}

function isSelectedVisualisationAttribute(attr) {
    return isVisualisationAttribute(attr) && getVisualisationAttributeMode(attr) !== 'none';
}

function isCardVisualisationAttribute(attr) {
    let mode = getVisualisationAttributeMode(attr);
    return isSelectedVisualisationAttribute(attr) && mode !== 'chart' && mode !== 'none';
}

function isChartVisualisationAttribute(attr) {
    return isSelectedVisualisationAttribute(attr) && getVisualisationAttributeMode(attr) === 'chart';
}

function getVisualisationDiagramType(attr) {
    let types = {
        circle: 'CircleValue',
        thermometer: 'Thermometer',
        hygrometer: 'Hygrometer',
        progress: 'CircleProgress'
    };
    return types[getVisualisationAttributeMode(attr)] || null;
}

function getVisualisationRange(attr) {
    let attrName = attr.toLowerCase();
    if (/(temp|temperature)/.test(attrName)) {
        return {
            unit: '°C',
            range: {
                minValue: -20,
                maxValue: 50,
                values: [
                    {maxValue: 10, col: '#56B4E9'},
                    {maxValue: 30, col: '#009E73'},
                    {maxValue: 50, col: '#D55E00'}
                ]
            }
        };
    }
    if (/(humid|humidity|feuchte)/.test(attrName)) {
        return {
            unit: '%',
            range: {
                minValue: 0,
                maxValue: 100,
                values: [
                    {maxValue: 35, col: '#D55E00'},
                    {maxValue: 65, col: '#009E73'},
                    {maxValue: 100, col: '#56B4E9'}
                ]
            }
        };
    }
    if (attrName === 'pm2_5') {
        return {
            name: getVisualisationDisplayName(attr),
            unit: 'µg/m³',
            range: {
                minValue: 0,
                maxValue: 50,
                values: [
                    {maxValue: 5, col: '#2AAD27'},
                    {maxValue: 25, col: '#FFD326'},
                    {maxValue: 50, col: '#CB2B3E'}
                ]
            }
        };
    }
    if (attrName === 'pm10_0') {
        return {
            name: getVisualisationDisplayName(attr),
            unit: 'µg/m³',
            range: {
                minValue: 0,
                maxValue: 90,
                values: [
                    {maxValue: 15, col: '#2AAD27'},
                    {maxValue: 45, col: '#FFD326'},
                    {maxValue: 90, col: '#CB2B3E'}
                ]
            }
        };
    }
    if (/co2/.test(attrName)) {
        return {
            name: getVisualisationDisplayName(attr),
            unit: 'ppm',
            range: {
                minValue: 0,
                maxValue: 2000,
                values: [
                    {maxValue: 800, col: '#2AAD27'},
                    {maxValue: 1400, col: '#FFD326'},
                    {maxValue: 2000, col: '#CB2B3E'}
                ]
            }
        };
    }
    return null;
}

// Options for the observed object selector.
window['oo_change_options'] = {
    selectedParam: 'data_collection',
    keepCurrentParams: ['visualisation', 'visualisation_columns'],
    paramsFromSet: ['data_collection'],
    fixedParams: {
        clearstate: 'true'
    },
    setOoId: false
};

// Automatic diagrams use project specific defaults and ranges.
window['auto_visualisation_options'] = {
    showAttributions: false,
    maxRenderedSets: 1,
    autoVisus: {
        mode: 'automatic',
        excludeAttrs: ['oo_id', 'pos_accuracy', 'pos_altitude', 'pos_heading', 'pos_speed'],
        attributeFilter: function (attr) {
            return isCardVisualisationAttribute(attr);
        },
        typeResolver: function (attr) {
            return getVisualisationDiagramType(attr);
        },
        definitionResolver: function (attr) {
            return getVisualisationRange(attr) || {};
        }
    }
};

// Chart settings for the time based display.
window['visualisation_chart_options'] = {
    showWhenNoData: true,
    xAxisAttrName: 'ts',
    yAxisAttrNames: [],
    plugins: new Map()
};
let visualisationDataManagerOptions = {
    id: 'DataManager',
    active: true,
    excludeAttrs: ['id', 'oo_id'],
    defaultAttrs: selectedVisualisationAttributes
            ? selectedVisualisationAttributes.filter(attr => isChartVisualisationAttribute(attr))
            : undefined,
    displayNames: {
        co2: 'CO₂',
        pm2_5: 'PM2,5',
        pm10_0: 'PM10'
    },
    showSourceNames: false,
    attributeFilter: function (attr) {
        return isChartVisualisationAttribute(attr);
    }
};
window['visualisation_chart_options'].plugins.set('DataManager', visualisationDataManagerOptions);
window['DataManager_visualisation_chart_options'] = visualisationDataManagerOptions;
window['visualisation_chart_options'].plugins.set('Linechart', {
    id: 'Linechart',
    active: true
});

function configureVisualisationRequestor() {
    let mode = getVisualisationMode();
    let automaticVisualisation = document.querySelector('#auto_visualisation');
    let chartVisualisation = document.querySelector('#visualisation_chart');
    let configuredModes = configuredVisualisationModes
            ? Object.values(configuredVisualisationModes) : [];
    let showCards = mode !== 'chart' && (mode !== 'individual'
            || configuredModes.length === 0
            || configuredModes.some(curMode => curMode !== 'chart' && curMode !== 'none'));
    let showChart = mode === 'chart' || (mode === 'individual'
            && configuredModes.includes('chart'));
    if (!showCards && !showChart)
        showCards = true;

    automaticVisualisation.classList.toggle('uk-hidden', !showCards);
    chartVisualisation.classList.toggle('uk-hidden', !showChart);
    if (showCards)
        automaticVisualisation.setAttribute('swa', 'Visualise FROM {{data_collection}} WHERE size=25 AND order=ts,DESC OPTIONS auto_visualisation_options');
    if (showChart)
        chartVisualisation.setAttribute('swa', 'Charts FROM {{data_collection}} WHERE size=250 AND order=ts,DESC OPTIONS visualisation_chart_options');
}

function getVisualisationRequestorFromEvent(evt) {
    if (evt.detail.requestor)
        return evt.detail.requestor;
    if (evt.detail.requestor_id)
        return document.getElementById(evt.detail.requestor_id);
    return null;
}

document.addEventListener('swac_auto_visualisation_complete', function (evt) {
    initialiseVisualisationAttributeSelection(getVisualisationRequestorFromEvent(evt), true);
});

document.addEventListener('swac_visualisation_chart_complete', function (evt) {
    initialiseVisualisationAttributeSelection(getVisualisationRequestorFromEvent(evt), true);
});

document.addEventListener('swac_ready', function () {
    let mode = getVisualisationMode();
    let modeSelect = document.querySelector('#visualisation_mode');
    let columnSelect = document.querySelector('#visualisation_columns');
    let activeVisualisation = document.querySelector('#auto_visualisation[swa]')
            || document.querySelector('#visualisation_chart[swa]');

    modeSelect.value = mode;
    columnSelect.value = String(getVisualisationColumns());
    columnSelect.addEventListener('change', function () {
        setVisualisationColumns(this.value);
    });

    scheduleVisualisationAttributeSelection(activeVisualisation);
});

function setVisualisationColumns(columns) {
    let value = Number(columns);
    if (!Number.isInteger(value) || value < 1 || value > 5)
        value = 2;
    document.querySelector('#auto_visualisation').dataset.columns = String(value);
}

function scheduleVisualisationAttributeSelection(visualisation, attempt = 0) {
    let showEmpty = attempt >= 100;
    if (initialiseVisualisationAttributeSelection(visualisation, showEmpty) || showEmpty)
        return;
    window.setTimeout(function () {
        scheduleVisualisationAttributeSelection(visualisation, attempt + 1);
    }, 100);
}

// Waits until the component has created its attribute values.
function initialiseVisualisationAttributeSelection(visualisation, showEmpty = false) {
    let list = document.querySelector('#visualisation_attribute_list');
    if (!list || list.childElementCount > 0)
        return true;
    if (!visualisation)
        return false;

    let attrs = getAvailableVisualisationAttributes(visualisation);
    if (attrs.length === 0) {
        if (showEmpty)
            showEmptyVisualisationAttributes();
        return false;
    }
    for (let attr of attrs)
        list.appendChild(createVisualisationAttributeInput(attr));

    let modeSelect = document.querySelector('#visualisation_mode');
    let applyButton = document.querySelector('#visualisation_attribute_apply');
    updateVisualisationAttributeControls(list, applyButton);

    modeSelect.addEventListener('change', function () {
        if (this.value !== 'individual') {
            for (let select of list.querySelectorAll('select'))
                select.value = this.value;
        }
        updateVisualisationAttributeControls(list, applyButton);
    });
    list.addEventListener('change', function (evt) {
        if (evt.target.matches('select'))
            modeSelect.value = 'individual';
        updateVisualisationAttributeControls(list, applyButton);
    });
    applyButton.addEventListener('click', function () {
        applyVisualisationAttributes(list, modeSelect, document.querySelector('#visualisation_columns'));
    });
    window.swac?.lang?.translateAll(list);
    return true;
}

function showEmptyVisualisationAttributes() {
    let applyButton = document.querySelector('#visualisation_attribute_apply');
    let emptyMessage = document.querySelector('#visualisation_attribute_empty');
    applyButton.disabled = true;
    emptyMessage.hidden = false;
}

function getAvailableVisualisationAttributes(requestor) {
    let attrs = new Set();
    let component = requestor.swac_comp;
    if (component?.getData) {
        let source = component.getData()?.[component.options.fromName];
        let sets = source?.getSets ? source.getSets() : [];
        for (let set of sets) {
            for (let attr in set) {
                if (isVisualisationAttribute(attr) && isNumericVisualisationValue(set[attr]))
                    attrs.add(attr);
            }
        }
    }

    for (let value of requestor.querySelectorAll('.swac_repeatedForValue[swac_attrname]')) {
        let attr = value.getAttribute('swac_attrname');
        if (isVisualisationAttribute(attr))
            attrs.add(attr);
    }

    return [...attrs].sort((attrA, attrB) => attrA.localeCompare(attrB));
}

function createVisualisationAttributeInput(attr) {
    let label = document.createElement('label');
    label.classList.add('visualisation-attribute-option');

    let name = document.createElement('span');
    name.classList.add('uk-form-label');
    name.textContent = getVisualisationDisplayName(attr);
    name.title = getVisualisationDisplayName(attr);

    let select = document.createElement('select');
    select.classList.add('uk-select');
    select.dataset.attribute = attr;
    for (let mode of getVisualisationModeOptions()) {
        let option = document.createElement('option');
        option.value = mode.value;
        option.textContent = mode.text;
        option.setAttribute('swac_lang', mode.lang);
        select.appendChild(option);
    }
    select.value = getVisualisationAttributeMode(attr);
    label.appendChild(name);
    label.appendChild(select);
    return label;
}

function getVisualisationModeOptions() {
    return [
        {value: 'automatic', lang: 'data_visualisation_mode_automatic', text: 'Automatisch'},
        {value: 'circle', lang: 'data_visualisation_mode_circle', text: 'Kreiswert'},
        {value: 'thermometer', lang: 'data_visualisation_mode_thermometer', text: 'Thermometer'},
        {value: 'hygrometer', lang: 'data_visualisation_mode_hygrometer', text: 'Hygrometer'},
        {value: 'progress', lang: 'data_visualisation_mode_progress', text: 'Kreisfortschritt'},
        {value: 'chart', lang: 'data_visualisation_mode_chart', text: 'Zeitverlauf'},
        {value: 'none', lang: 'data_visualisation_mode_none', text: 'Keine Darstellung'}
    ];
}

function updateVisualisationAttributeControls(list, applyButton) {
    let selects = [...list.querySelectorAll('select')];
    applyButton.disabled = !selects.some(select => select.value !== 'none');
}

function applyVisualisationAttributes(list, modeSelect, columnSelect) {
    let modes = {};
    for (let select of list.querySelectorAll('select'))
        modes[select.dataset.attribute] = select.value;

    let visibleModes = Object.values(modes).filter(mode => mode !== 'none');
    if (visibleModes.length === 0)
        return;

    let uniqueModes = new Set(Object.values(modes));
    let mode = modeSelect.value;
    if (uniqueModes.size === 1 && !uniqueModes.has('none'))
        mode = uniqueModes.values().next().value;
    else
        mode = 'individual';

    let url = new URL(window.location.href);
    url.searchParams.set('visualisation', mode);
    url.searchParams.set('visualisation_columns', columnSelect.value);
    url.searchParams.set('attribute_modes', JSON.stringify(modes));
    url.searchParams.delete('attributes');
    url.searchParams.set('clearstate', 'true');
    window.location.href = url.href;
}

setVisualisationColumns(getVisualisationColumns());
configureVisualisationRequestor();
