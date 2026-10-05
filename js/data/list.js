// Options for the observed object selector.
window['oo_change_options'] = {
    selectedParam: 'data_collection',
    paramsFromSet: ['data_collection']
};

window['datalist_options'] = {
    showWhenNoData: true,
    plugins: new Map(),
    lazyLoading: 50,
    lazyLoadMode: 'end'
};
window['datalist_options'].plugins.set("TableSort", {
    id: "TableSort",
    active: true
});
window['datalist_options'].plugins.set("TableFilter", {
    id: "TableFilter",
    active: true
});
// Chart configuration.
window['datachart_options'] = {
    showWhenNoData: true,
    xAxisAttrName: 'ts',
    yAxisAttrNames: [],
    guiFilter: true,
    guiAggregation: true,
    guiSeries: true,
    guiComputedColumns: true,
    guiDatasource: true,
    guiTableExport: true,
    guiSettings: true,
    guiRequestor: true,
    plugins: new Map()
};
// DataManager controls the displayed series.
window['datachart_options'].plugins.set('DataManager', {
    id: 'DataManager',
    active: true
});
// Linechart renders the configured series.
window['datachart_options'].plugins.set('Linechart', {
    id: 'Linechart',
    active: true,
    legend: {
        display: false
    }
});
// Air quality specific calculated columns.
var datafilterbarComputedColumns = [
    {
        name: 'Ratio',
        formula: 'pm2_5 / pm10_0',
        requiresAttrs: ['pm2_5', 'pm10_0']
    },
    {
        name: 'ParticleSource',
        labelKey: 'particle_source',
        source: 'Ratio',
        requiresAttrs: ['pm2_5', 'pm10_0'],
        noValueKey: 'unknown',
        noValue: 'Unknown',
        valueRules: [
            {lt: 0, valueKey: 'ratio_inconsistent', value: 'Check measurements'},
            {lt: 0.5, valueKey: 'ratio_coarse', value: 'Likely dust, pollen or abrasion'},
            {lte: 0.7, valueKey: 'ratio_mixed', value: 'Likely mixture of coarse and fine particles'},
            {lte: 1.01, valueKey: 'ratio_fine', value: 'Likely combustion related particulate matter or exhaust'},
            {valueKey: 'ratio_inconsistent', value: 'Check measurements'}
        ]
    }
];
// Keep the configured axis defaults until changed.
window['DataManager_datachart_options'] = {
    showAxisSelectors: true,
    attributeFilter: function (attr) {
        return attr !== 'ParticleSource';
    }
};

window['Datafilterbar_datachart_options'] = {
    defaultComputedColumns: datafilterbarComputedColumns,
    enableMathlive: true
};
// Show the particle note only for compatible sources.
document.addEventListener('swac_Datafilterbar_sourceChanged', function (evt) {
    if (!evt.detail || evt.detail.hostId !== 'datachart')
        return;
    let attrs = evt.detail.attributes || [];
    let desc = document.getElementById('data_list_particle_source_desc');
    if (desc)
        desc.hidden = !(attrs.includes('pm2_5') && attrs.includes('pm10_0'));
});
