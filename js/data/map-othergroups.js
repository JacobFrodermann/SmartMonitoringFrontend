window['datamap_options'] = {
    datadescription: '#datamap_datadescription',
    plugins: new Map(),
    geoJSONAttr: 'pos',
    clusterMarkers: true,
    liveMode: 10,
    allowAddModels: true,
    baseLayers: new Map()
}
window['datamap_options'].baseLayers.set("OpenStreetMaps", {
    mapProviderURL: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    mapProviderAttribution: 'Map data © <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
    active: true})
window['datamap_options'].baseLayers.set("LocalAtlas", {
    mapProviderURL: '/localAtlas/{z}/{x}/{y}.png',
    mapProviderAttribution: 'Local Atlas',
    active: true})

window['datamap_options'].plugins.set('DataShowModal', {
    id: 'datashowmodal',
    active: true
})

window['datashowmodal_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_data_show&filter=active,eq,true'
        }
    }
}

window['datamap_options'].plugins.set('Timeline', {
    id: 'timeline',
    active: true
})

window['timeline_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_timeline&filter=active,eq,true'
        }
    }
}

window['datamap_options'].plugins.set('Navigation', {
    id: 'navigation',
    active: true
})

window['navigation_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_navigation&filter=active,eq,true'
        }
    }
}

window['datamap_options'].plugins.set('SearchPlaces', {
    id: 'searchplaces',
    active: true
})

window['searchplaces_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_search&filter=active,eq,true'
        }
    }
}

window['datamap_options'].plugins.set('FilterMeasurementPoints', {
    id: 'filtermeasurementpoints',
    active: true
})

window['filtermeasurementpoints_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_filter&filter=active,eq,true'
        }
    }
}

window['datamap_options'].plugins.set('ToggleClickInteractionButton', {
    id: 'toggleclickinteractionbutton',
    active: true
})

window['toggleclickinteractionbutton_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_toggleclickinteraction&filter=active,eq,true'
        }
    }
}

window['datamap_options'].plugins.set('ToggleLatchOnLocation', {
    id: 'togglelatchonlocation',
    active: true
})

window['togglelatchonlocation_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_togglelatchonlocation&filter=active,eq,true'
        }
    }
}

window['datamap_options'].plugins.set('Help', {
    id: 'help',
    active: true
})

window['help_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_help&filter=active,eq,true'
        }
    }
}

window['datamap_options'].plugins.set('Labels', {
    id: 'labels',
    active: true
})

window['labels_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_labels&filter=active,eq,true'
        }
    },
    datasets: true
}
