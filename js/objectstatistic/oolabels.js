// Options for display of labels list
var list_options = {
    showWhenNoData: true,
    attributeRenames: new Map([['parent_id', 'parent']]),
    customAfterAddSet: getSetsForOoLabel
};
// Options for display of labels chart
var chart_options = {
    showWhenNoData: true,
    xAxisAttrName: 'name',
    yAxisAttrNames: ['joinsetsCount'],
    plugins: new Map()
};
chart_options.plugins.set('Barchart', {
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

/**
 * Gets the sets for the ootype
 * 
 * @returns {undefined}
 */
function getSetsForOoLabel(set, repeateds) {
    // Get the model
    let Model = window.swac.Model;
    let listElem = document.querySelector('#list');
    let count_datasetsElem = listElem.querySelector('[swac_setid="' + set.id + '"] .count_datasets');
    if(!count_datasetsElem) {
        console.error('Output element for count of available datasets not found. Skipping counting.');
        return;
    }
    let labelSets = 0;
    for (let curOo of set['tbl_observedobject']) {
        if (!curOo.data_collection)
            continue;

        // Request data
        let dataPromise = Model.load({
            fromName: curOo.data_collection,
            fromWheres: {
                filter: 'oo_id,neoeq,' + curOo.id,
                countonly: 'true'
            }
        });
        // Wait for data to be loaded
        dataPromise.then(function (data) {
            // Direct access dataset with id 1
            labelSets += data[1].count;
            // Update output element for this type
            count_datasetsElem.innerHTML = labelSets;
        }).catch(function (err) {
            // Handle load error
        });
    }
}

// Show objects on map after click on map link
function showMap(ooids) {
    if (ooids.length === 0) {
        UIkit.modal.alert("Es gibt keine Objekte mit diesem Label.");
        return;
    }

    // Get the model
    let Model = window.swac.Model;
    // Request data
    let dataPromise = Model.load({
        fromName: 'tbl_location_join_oo',
        fromWheres: {
            filter: 'oo_id,in,' + ooids.join(',')
        }
    });

    dataPromise.then(function (data) {
        if (data.length === 0) {
            UIkit.modal.alert(window.swac.lang.dict.app.object_stat_labels_noneformap);
            return;
        }

        let locids = [];
        for (let curSet of data) {
            if (!curSet)
                continue;
            locids.push(curSet.loc_id);
        }
        window.location.href = '../object/map.html?filter=id,in,' + locids.join(',') + ',comps:objectmap';
    }).catch(function (err) {
        // Handle load error
    });
}