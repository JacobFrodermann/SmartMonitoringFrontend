/**
 * Options for observedobjecttype editor
 */
var tbl_ootype_options = {
    showWhenNoData: true,
    mainSource: 'tbl_ootype',
    notShownAttrs: {
        "tbl_ootype": ['id']
    },
    allowAdd: true,
    allowDel: true,
    fetchDefinitions: true,
    dropAccepts: new Map(),
    dropFunctions: new Map(),
    dropJoinerTargets: new Map()
};
tbl_ootype_options.dropAccepts.set('ootypejoinmtypes', 'measurementtype');
tbl_ootype_options.dropJoinerTargets.set('ootypejoinmtypes', {
    targetSetName: 'observedobjecttypejoinmeasurementtype',
    referenceFromName: 'observedobjectType',
    referenceDropName: 'measurementType'
});

/**
 * Options for measurementtypes editor
 */
var tbl_datatype_options = {
    showWhenNoData: true,
    mainSource: 'tbl_datatype',
    notShownAttrs: {
        ["tbl_datatype"]: ['id']
    },
    allowAdd: true,
    allowDel: true,
    fetchDefinitions: true,
    possibleValues: new Map()
};
tbl_datatype_options.possibleValues.set('type', ['integer', 'float8', 'boolean', 'varchar', 'text', 'timestamp', 'date', 'time', 'interval', 'geometry']);

/**
 * Options for metadatatypes editor
 */
var tbl_metatypes_options = {
    showWhenNoData: true,
    mainSource: 'tbl_metatype',
    notShownAttrs: {
        ["tbl_metatype"]: ['id']
    },
    allowAdd: true,
    allowDel: true,
    fetchDefinitions: true
};

document.addEventListener('swac_tbl_ootype_name_click', function(e) {
    // Find repeatedForSet
    let setElem = e.detail.target;
    while(!setElem.hasAttribute('swac_setid') && setElem.parentElement) {
        setElem = setElem.parentElement;
    }
    let ooset = setElem.swac_dataset;
    
    // Get connections to datatypes
    let datatypesElem = document.querySelector('#tbl_datatype');
    let setElems = datatypesElem.querySelectorAll('.swac_repeatedForSet');
    for(let curSetElem of setElems) {
        if(curSetElem.swac_dataset.ootype_id === ooset.id)
            curSetElem.classList.remove('swac_dontdisplay');
        else
            curSetElem.classList.add('swac_dontdisplay');
    }
    
    // Get connections to metatypes
    let metatypesElem = document.querySelector('#tbl_metatype');
    let metaSetElems = metatypesElem.querySelectorAll('.swac_repeatedForSet');
    for(let curSetElem of metaSetElems) {
        if(curSetElem.swac_dataset.ootype_id === ooset.id)
            curSetElem.classList.remove('swac_dontdisplay');
        else
            curSetElem.classList.add('swac_dontdisplay');
    }
});