var collections_list_options = {
    showWhenNoData: true,
    plugins: new Map()
};
collections_list_options.plugins.set('TableSort', {
    id: 'TableSort',
    active: true
});

document.addEventListener('swac_collections_list_complete', function () {
    let listElem = document.querySelector('#collections_list');

    // Stat variables
    let collections = 0;
    let collectionsElem = document.querySelector('.cols');
    let sets_whole = 0;
    let setsWholeElem = document.querySelector('.sets_whole');
    let sets_oldest = null;
    let oldestElem = document.querySelector('.sets_oldest');
    let oldestColElem = document.querySelector('.sets_oldestcol');
    let sets_newest = null;
    let newestElem = document.querySelector('.sets_newest');
    let newestElemCol = document.querySelector('.sets_newestcol');
    let size_now = 0;
    let sizeNowElem = document.querySelector('.size_now');
    let size_1y = 0;
    let size1yElem = document.querySelector('.size_1y');

    // Get the model
    let Model = window.swac.Model;
    let ooProm = Model.load({
        fromName: 'tbl_observedobject',
        fromWheres: {
            filter: 'data_collection,nis',
            includes: 'name,id,data_collection,measurerate,measuredaylystart,measuredaylyend'
        },
        idAttr: 'id'
    });
    ooProm.then(function (oos) {
        for (let curOo of oos) {
            if (!curOo)
                continue;
            // Call statistic
            let stProm = Model.load({
                fromName: '/SmartDataLyser/smartdatalyser/statistic/whole',
                fromWheres: {
                    smartdataurl: window.swac.config.globalparams.smartdataurl,
                    collection: curOo.data_collection,
                    storage: 'smartmonitoring',
                    dateattribute: 'ts'
                },
                idAttr: 'id'
            });
            stProm.then(function (data) {
                // Create stat set
                curOo.byte = bytesToSize(data[1].byte);
                curOo.count = data[1].count;
                curOo.firstset = data[1].firstset.replace(' ','T');
                curOo.lastset = data[1].lastset.replace(' ','T');
                // Transform dates
                let firstsetDate = new Date(curOo.firstset);
                let lastsetDate = new Date(curOo.lastset);
                let days = Math.abs(lastsetDate - firstsetDate) / (1000 * 3600 * 24);
                curOo.days = Math.round(days);
                if (curOo.measuredaylystart && curOo.measuredaylyend) {
                    let measureDayStartT = curOo.measuredaylystart.split(':');
                    let measureDayEndT = curOo.measuredaylyend.split(':');
                    let measureDayStart = new Date(2024, 4, 1, measureDayStartT[0], measureDayStartT[1], 0);
                    let measureDayEnd = new Date(2024, 4, 1, measureDayEndT[0], measureDayEndT[1], 0);
                    curOo.expehours = Math.abs(measureDayEnd - measureDayStart) / (1000 * 60 * 60);
                    curOo.hours = Math.abs(lastsetDate - firstsetDate) / (1000 * 60 * 60);
                    // The measured hours minus the not working hours for every full day
                    curOo.hours = curOo.hours - (curOo.days * (24 - curOo.expehours));
                } else {
                    curOo.expehours = 24;
                    curOo.hours = Math.abs(lastsetDate - firstsetDate) / (1000 * 60 * 60);
                }
                // Gathered by day
                curOo.setsperday = (curOo.count / days).toFixed(2);
                // Expected per hour
                curOo.expeperhour = 3600 / curOo.measurerate;
                curOo.expeperday = (60 * 60 * curOo.expehours) / curOo.measurerate;
                // Completeness factor
                if (days < 1) {
                    curOo.complfact = ((curOo.count / curOo.hours) / (curOo.expeperhour) * 100).toFixed(2);
                } else {
                    curOo.complfact = ((curOo.count / days / curOo.expehours) / (curOo.expeperhour) * 100).toFixed(2);
                }
                // Add statset
                listElem.swac_comp.addSet('statlist', curOo);

                // Update stat numbers
                collections++;
                collectionsElem.innerHTML = collections;
                sets_whole += curOo.count;
                setsWholeElem.innerHTML = sets_whole;
                if (!sets_oldest || sets_oldest > firstsetDate) {
                    sets_oldest = firstsetDate;
                    oldestElem.innerHTML = sets_oldest;
                    oldestColElem.innerHTML = curOo.data_collection;
                }
                if (!sets_newest || sets_newest < lastsetDate) {
                    sets_newest = lastsetDate;
                    newestElem.innerHTML = sets_newest;
                    newestElemCol.innerHTML = curOo.data_collection;
                }

                size_now += data[1].byte;
                sizeNowElem.innerHTML = bytesToSize(size_now);

                // Calculate bytes per day
                let bytesPerDay = data[1].byte / curOo.days;
                if (!isNaN(bytesPerDay) && bytesPerDay !== Number.POSITIVE_INFINITY && bytesPerDay !== Number.NEGATIVE_INFINITY) {
                    size_1y += (data[1].byte + (bytesPerDay * 365));
                    size1yElem.innerHTML = bytesToSize(size_1y);
                }
            }).catch(function (err) {
                console.error('Could not get statistic for oo >' + curOo.id + '< Error: ', err);
            });
        }
    }).catch(function (err) {
        console.log(err);
    });
});

function bytesToSize(bytes, decimals = 2) {
    if (!Number(bytes))
        return '0 Bytes';
    const kbToBytes = 1000;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const index = Math.floor(Math.log(bytes) / Math.log(kbToBytes));
    return `${parseFloat((bytes / Math.pow(kbToBytes, index)).toFixed(dm))} ${sizes[index]}`;
}