window['map_options'] = {
    geoJSONAttr: "pos",
    plugins: new Map([
        ['DataShowModal', {
                id: 'DataShowModal',
                active: true
            }]
    ])
};
window["DataShowModal_map_options"] = {
    allowDelete: false,
    attrsFormat: new Map([['ts', 'datetime']])
};

window['chart_options'] = {
    xAxisAttrName: 'ts',
    yAxisAttrNames: ['pm2_5'],
    plugins: new Map([
        ['Linechart', {
                id: 'Linechart',
                active: true
            }
        ]
    ])
};
window['measurements_list_options'] = {
    showWhenNoData: true
};

// When there is at least one dataset with a pos show map
document.addEventListener('swac_Component_map_setAdded', function (evt) {
    if (evt.detail.set.pos) {
        evt.detail.requestor.classList.remove('swac_dontdisplay');
    }
});

// When user clicks on a measurement go to measurement detail page
document.addEventListener('swac_measurements_list_repeatedForSet', function (evt) {
    let repeatedElem = evt.detail.repeateds[0];
    repeatedElem.addEventListener('click', function () {
        let setid = repeatedElem.getAttribute('swac_setid');
        window.location.href = 'measurement.html?setid=' + setid;
    });
});