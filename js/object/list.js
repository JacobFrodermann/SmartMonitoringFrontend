var objectlist_options = {
    showWhenNoData: true,
    attributeRenames: new Map([['parent_id', 'parent']]),
    attributeDefaults: new Map([['manualcapture', 'false']]),
    lazyLoading: 5,
    lazyLoadMode: 'end'
};

document.addEventListener('swac_ready', function () {
    // List of functions to check on this page
    let checkFuncs = ['func_datavisualisation','func_datamap'];

    for (let curCheckFunc of checkFuncs) {
        // check if data visualisation is active
        window.swac.Model.load({
            fromName: 'tbl_systemconfiguration', // Name of the datatable
            fromWheres: {
                filter: 'ckey,eq,'+curCheckFunc+'&filter=active,eq,true'
            }
        }).then(function (res) {
            if (res.length === 0) {
                //Deactivate labeling column
                let labelElems = document.querySelectorAll('.'+curCheckFunc);
                for (let curElem of labelElems) {
                    curElem.remove();
                }
            }
        });
    }
});