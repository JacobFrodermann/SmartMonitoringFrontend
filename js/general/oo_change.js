function findOoChangeSetByAttribute(comp, attribute, value) {
    if (!attribute || !value)
        return null;

    let source = comp.getData()[comp.options.fromName];
    if (!source)
        return null;

    let sets = source.getSets();
    for (let curSet of sets) {
        if (curSet && String(curSet[attribute]).trim().toLowerCase()
                === String(value).trim().toLowerCase())
            return curSet;
    }
    return null;
}

/**
 * Applies the station from the URL to the observed object selector.
 *
 * @returns {undefined}
 */
function syncOoChangeSelection() {
    let elem = document.querySelector('#oo_change');
    if (!elem || !elem.swac_comp)
        return;

    let selectedParam = elem.swac_comp.options.selectedParam;
    let selectedParamValue = selectedParam
            ? new URLSearchParams(window.location.search).get(selectedParam) : null;
    let selectedSet = findOoChangeSetByAttribute(elem.swac_comp, selectedParam, selectedParamValue);
    let selectedId = selectedSet ? selectedSet.id
            : new URLSearchParams(window.location.search).get('id')
                    || new URLSearchParams(window.location.search).get('oo_id');
    if (!selectedId)
        return;

    let inputs = {};
    inputs[selectedId] = true;
    elem.swac_comp.setInputs(inputs);
    elem.swac_comp.requestor.value = String(selectedId);
}

function getOoChangeSet(comp, selected) {
    if (!selected || typeof selected === 'object')
        return null;
    return comp.getData()[comp.options.fromName].getSet(parseInt(selected));
}

function changeOoPage(comp, selected) {
    if (!selected || typeof selected === 'object')
        return;

    let selectedSet = getOoChangeSet(comp, selected);

    // Start with a clean page URL and add the selected parameters.
    let currentUrl = new URL(window.location.href);
    let url = new URL(window.location.href.split('?')[0]);

    if (!selectedSet) {
        document.location = url.href;
        return;
    }

    let keepCurrentParams = comp.options.keepCurrentParams || [];
    for (let curParam of keepCurrentParams) {
        if (currentUrl.searchParams.has(curParam))
            url.searchParams.set(curParam, currentUrl.searchParams.get(curParam));
    }

    let paramsFromSet = comp.options.paramsFromSet || Object.keys(selectedSet);
    for (let curParam of paramsFromSet) {
        if (curParam.startsWith('swac_'))
            continue;
        if (keepCurrentParams.includes(curParam))
            continue;
        if (typeof selectedSet[curParam] === 'undefined')
            continue;
        url.searchParams.set(curParam, selectedSet[curParam]);
    }
    // Keep older pages working that expect oo_id.
    if (selectedSet.id && comp.options.setOoId !== false)
        url.searchParams.set('oo_id', selectedSet.id);

    let fixedParams = comp.options.fixedParams || {};
    for (let curParam of Object.keys(fixedParams)) {
        url.searchParams.set(curParam, fixedParams[curParam]);
    }

    document.location = url.href;
}

/**
 * Default options for the observed object selector.
 */
let ooChangeDefaultOptions = {
    rememberSelection: false,
    onChange: function (evt, value) {
        let selected = value || this.requestor.value;
        if (!selected) {
            for (let curInput of this.getInputs()) {
                selected = curInput.value;
            }
        }

        changeOoPage(this, selected);
    }
};

window['oo_change_options'] = Object.assign(ooChangeDefaultOptions, window['oo_change_options'] || {});

document.addEventListener('swac_oo_change_selection_changed', function (evt) {
    let comp = evt.detail.requestor;
    let selected = evt.detail.value;
    changeOoPage(comp, selected);
});

document.addEventListener('swac_oo_change_complete', function (evt) {
    // Select the entry that matches the current URL.
    let elem = document.querySelector('#oo_change');
    if (!elem || !elem.swac_comp)
        return;
    syncOoChangeSelection();

    // Ignore the placeholder option and the repeat template.
    if (elem.swac_comp.countOptions() - 2 <= 1) {
        elem.style.display = 'none';
    }
});

// URL parameters take precedence over selections restored from local storage.
document.addEventListener('swac_components_complete', syncOoChangeSelection);
