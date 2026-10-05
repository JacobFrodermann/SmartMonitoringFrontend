let urlParams = new URLSearchParams(window.location.search);
window['metadata_edit_options'] = {
    inputsVisibility: [
        {
            hide: ['id','oo_id','bauwerk_id','is_legacy']
        }
    ],
    allowAdd: true,
    fetchDefinitions: true,
    saveAlongData: {
        oo_id: urlParams.get('oo_id')
    }
};