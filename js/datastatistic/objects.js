// Options for display of labels list
var objectlist_options = {
    showWhenNoData: true,
    attributeRenames: new Map([['parent_id', 'parent']]),
    lazyLoading: 4,
    lazyLoadMode: 'end'
};
// Options for display of data chart
data_chart_options = {
    showWhenNoData: true,
    xAxisAttrName: 'name',
    yAxisAttrNames: ['joinsetsCount'],
    plugins: new Map(),
    lazyLoading: 4
};
data_chart_options.plugins.set('Barchart', {
    id: 'Barchart',
    active: true
});

// General enable / disable of functions based on systemconfiguration
document.addEventListener('swac_ready', function () {
    // List of functions to check on this page
    let checkFuncs = ['func_datavisualisation', 'func_datamap'];

    for (let curCheckFunc of checkFuncs) {
        // check if data visualisation is active
        window.swac.Model.load({
            fromName: 'tbl_systemconfiguration', // Name of the datatable
            fromWheres: {
                filter: 'ckey,eq,' + curCheckFunc + '&filter=active,eq,true'
            }
        }).then(function (res) {
            if (res.length === 0) {
                //Deactivate labeling column
                let labelElems = document.querySelectorAll('.' + curCheckFunc);
                for (let curElem of labelElems) {
                    curElem.remove();
                }
            }
        });
    }
});