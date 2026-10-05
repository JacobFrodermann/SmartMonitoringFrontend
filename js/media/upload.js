let urlParams = new URLSearchParams(window.location.search);

// Get table where to get and store medias
let mediaCol = urlParams.get('collection_media');
// If there is no media table given use default one
if(!mediaCol)
    mediaCol = 'media';

// Set options for media upload
window['media_upload_options'] = {
    uploadTargetURL: '/SmartFile/smartfile/file/' + mediaCol,
    docroot: '../../../',
    dbname: mediaCol,
    storeobjectname: mediaCol,
    camcapture: true,
    saveAlongData: {
        oo_id: parseInt(urlParams.get('oo_id'))
    }
};