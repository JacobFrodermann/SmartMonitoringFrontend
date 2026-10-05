window['sync_options'] = {
    syncedFlagAttribute: 'synced',
    syncModeRequestor: {
        fromName: 'cmd://datajobs',
        fromWheres: {
            "filter": "name,eq,checkHSBIServer"
        }
    },
    syncStateAttribute: 'active',
    syncStateRunningValue: true,
    syncStartRequestor: {
        fromName: 'cmd://action=smartMobile_on_synchronisation'
    },
    syncStopRequestor: {
        fromName: 'cmd://action=smartMobile_off_synchronisation'
    },
    syncStartResponseAttribute: '[1].status',
    syncStartResponseSuccsessValue: '200',
    syncStopResponseAttribute: '[1].status',
    syncStopResponseSuccsessValue: '204'
};