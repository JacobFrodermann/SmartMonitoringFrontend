// Options for display of list
var nearobject_list_options = {
    showWhenNoData: true,
    attributeRenames: new Map([['parent_id', 'parent']])
};
// General enable / disable of functions based on systemconfiguration
document.addEventListener('swac_ready', function () {
    // List of functions to check on this page
    let checkFuncs = [];

    for (let curCheckFunc of checkFuncs) {
        // check if function is active
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

    // Get first SmartData source
    let sdsource;
    for (let curSource of window.swac.config.datasources) {
        let index = curSource.url.indexOf('/smartdata/');
        if (index > 0) {
            sdsource = curSource.url.substring(0, index + 11);
            break;
        }
    }
    sdsource = sdsource.replace('/smartdata/','');

    // Get list of near objects
    // Get the model
    let Model = window.swac.Model;
    let dataPromise = Model.load({
        fromName: '/SmartDataLyser/smartdatalyser/geo/neargeometries',
        fromWheres: {
            smartdataurl: sdsource,
            storage1: 'smartmonitoring',
            collection1: 'tbl_location',
            geomattr1: 'coordinates',
            storage2: 'smartmonitoring',
            collection2: 'tbl_location',
            geomattr2: 'coordinates',
            distance: 1
        }
    });
// Wait for data to be loaded
    dataPromise.then(function (data) {
        let nearSets = [];
        // Iterate over available datasets
        try {
            let detailProms = [];
            for (let curSet of data) {
                if (!curSet)
                    continue;
                detailProms.push(getObjectDetails(curSet.a, nearSets, curSet.b, curSet.dist));
                detailProms.push(getObjectDetails(curSet.b, nearSets, curSet.a, curSet.dist));
            }
            Promise.all(detailProms).then(function () {
                let nearList = document.querySelector('#nearobject_list');
                nearList.swac_comp.addData('nearObjects', nearSets);
            });
        } catch (e) {
            console.log('Error occured getting the near objects: ' + e);
        }
    }).catch(function (err) {
        console.log('Error occured getting the near objects: ' + err);
    });
});

/**
 * Get details for an observedobject
 * 
 * @param {int} oo_id       Objects id
 * @param {int[]} nearSets  List of previous loaded information
 * @param {int} parent      Parent objects id
 * @param {int} dist        Distance in meter
 * @returns {Boolean}
 */
async function getObjectDetails(oo_id, nearSets, parent, dist) {
    // Do not get details twice
    if (nearSets[oo_id])
        return true;
    // Request data
    let Model = window.swac.Model;
    let data = await Model.load({
        fromName: 'tbl_observedobject',
        fromWheres: {
            filter: 'id,eq,' + oo_id,
            includes: 'id,name,description,ootype_id'
        },
        idAttr: 'id'
    });
    for (let curSet of data) {
        if (!curSet)
            continue
        // Note distance at object
        curSet.dist = dist;
        // Do not use tbl_observedobjects parent information here, but the near parent information
        curSet.parent = parent;
        // Do not use tbl_observedobject here because data was modified
        curSet.swac_fromName = 'nearObjects';
        nearSets[oo_id] = curSet;
        return true;
    }
}


// Show objects on map after click on map link
function showMap(ooids) {
    if (ooids.length === 0) {
        UIkit.modal.alert("Dieses Objekt gibt es nicht.");
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
        window.location.href = 'map.html?filter=id,in,' + locids.join(',') + ',comps:objectmap';
    }).catch(function (err) {
        // Handle load error
    });
}