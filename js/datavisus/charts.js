// Options for the observed object selector.
window['oo_change_options'] = {
    selectedParam: 'data_collection',
    keepCurrentParams: [],
    paramsFromSet: ['data_collection'],
    fixedParams: {
        clearstate: 'true'
    },
    setOoId: false
};

// Time based chart with configurable series and data transformations.
window['charts_options'] = {
    showWhenNoData: true,
    xAxisAttrName: 'ts',
    yAxisAttrNames: [],
    guiFilter: true,
    guiAggregation: true,
    guiSeries: true,
    guiComputedColumns: false,
    guiDatasource: true,
    guiSettings: true,
    guiRequestor: true,
    plugins: new Map()
};
let chartsDataManagerOptions = {
    id: 'DataManager',
    active: true,
    excludeAttrs: ['id', 'oo_id'],
    displayNames: {
        co2: 'CO₂',
        pm2_5: 'PM2,5',
        pm10_0: 'PM10'
    },
    showSourceNames: false,
    attributeFilter: function (attr) {
        return !attr.startsWith('pos_');
    }
};
window['charts_options'].plugins.set('DataManager', chartsDataManagerOptions);
window['charts_options'].plugins.set('Linechart', {
    id: 'Linechart',
    active: true
});
// Exclude technical location values from selectable chart series.
window['DataManager_charts_options'] = chartsDataManagerOptions;

// The chart page has no table target for its filter settings.
window['Datafilterbar_charts_options'] = {
    filterTarget: 'chart',
    filterSameSource: false,
    showTargetSelection: false
};
