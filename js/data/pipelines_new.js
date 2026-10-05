let updateInputPreview = function () {
    // Get the model
    let Model = window.swac.Model;
    // Get oos table name
    let dataPromise = Model.load({
        fromName: 'tbl_observedobject',
        fromWheres: {
            filter: 'id,eq,' + document.getElementById('input_oo').value,
            includes: 'data_collection'
        }
    });
    // Wait for data to be loaded
    dataPromise.then(function (data) {
        console.log(data);
        let set;
        for(let curSet of data) {
            if(!curSet)
                continue;
            set = curSet;
            break;
        }
        
        // Get filter
        let filter = document.getElementById('input_filter').value;
        
       // Build request statement
       let reference = set.data_collection + '?storage=smartmonitoring';
       if(filter) {
           reference += '&' + filter;
       }
       
       // Insert request at preview
       let prevElem = document.getElementById('input_oo_preview');
       prevElem.swac_comp.addDataFromReference('ref://'+reference);
       
       // Update access code
       let codePreElem = document.querySelector('.input_oo_code_pre');
       let code = codePreElem.innerHTML.replace('[reference]',reference);
       let codeElem = document.querySelector('.input_oo_code');
       codeElem.innerHTML = code;
    }).catch(function (err) {
        console.error('Error getting object information',err);
    });
};

var input_oo_options = {
    onChange: updateInputPreview
};

var input_oo_preview_options = {
    showWhenNoData: true
};

document.addEventListener('swac_components_complete', function () {
    // Register action for updateing input filter
    document.getElementById('input_filter').addEventListener('change', updateInputPreview);

    // Register action for pressing save button
    let saveBtn = document.querySelector('.pipelines_save_btn');
    saveBtn.addEventListener('click', function () {
        // Get the model
        let Model = window.swac.Model;
        // Build dataCapsule
        let dataCapsule = {
            fromName: 'datapipelines'
        };
        dataCapsule.data = [{
                name: document.getElementById('name').value,
                desc: document.getElementById('desc').value,
                input_ooid: parseInt(document.getElementById('input_oo').value),
                input_filter: document.getElementById('input_filter').value,
                worker_ooid: parseInt(document.getElementById('worker_oo').value),
                worker_confset: parseInt(document.getElementById('worker_confset').value),
                output_ooid: parseInt(document.getElementById('output_oo').value)
            }];

        Model.save(dataCapsule).then(function (dataCaps) {
            window.location.href = 'pipelines.html';
        }).catch(function () {
            UIkit.modal.alert(SWAC.lang.dict.app.data_pipelinesnew_saveerr);
        });
    });
});