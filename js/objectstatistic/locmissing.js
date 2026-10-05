// Options for display of labels list
var list_options = {
    showWhenNoData: true,
    attributeRenames: new Map([['parent_id', 'parent']]),
//    parentIdAttr: 'oo_id',
    lazyLoading: 5,
    lazyLoadMode: 'end',
    respectLoadingOrder: true
};

let onChangeFunc = function(evt) {
    // You are inside the component here
    let inputs = this.getInputs();
    let value;
    // Look at each input that was made (if you only need value(s) use this.requestor.value
    for(let curInput of inputs) {
        value = curInput.value;
    }
    // When nothing is selected stop
    if(!value)
        return;
    // Get list element
    let listElem = document.querySelector('#list');
    listElem.swac_comp.removeAllData();
    listElem.swac_comp.addDataFromReference("ref://view_oo_without_location?filter=parent_id,eq,"+value+"&storage=smartmonitoring");
};
var list_parentfilter_options = {onChange: onChangeFunc};

