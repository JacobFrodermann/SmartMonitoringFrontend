// datamap: instance id of worldmap in map.html
window['datamap_options'] = {
    datadescription: '#datamap_datadescription', // html id of datadescription component
    geoJSONAttr: 'pos',
    lonAttr: 'pos_lon', // Mapping field names from table to component
    latAttr: 'pos_lat',
    clusterMarkers: true,
    plugins: new Map([
        ['Navigation', {
            id: 'navigation',
            active: true
        }],
        ['DataShowModal', {
            id: 'datashowmodal',
            active: true
        }],
        ['Timeline', {
            id: 'timeline',
            active: false
        }],
        ['InterfaceMagicMapper', {
            id: 'interfacemagicmapper',
            active: false
        }],
        ['SearchPlaces', {
            id: 'searchplaces',
            active: false
        }],
        ['FilterMeasurementPoints', {
            id: 'filtermeasurementpoints',
            active: false
        }],
        ['ToggleClickInteractionButton', {
            id: 'toggleclickinteractionbutton',
            active: false
        }],
        ['ToggleLatchOnLocation', {
            id: 'togglelatchonlocation',
            active: false
        }],
        ['Labels', {
            id: 'labels',
            active: false
        }],
        ['Help', {
            id: 'help',
            active: false
        }]
    ])
};

// Create route from all available data
window['navigation_datamap_options'] = {
    createRouteFromData: true,
    connectWithLine: true
};

// Component for in-map pop-up window with data of a point displayed
window['datashowmodal_datamap_options'] = {
    // activeOn: {
    //     fromName: 'tbl_systemconfiguration', // Name of the datatable
    //     fromWheres: {
    //         filter: 'ckey,eq,func_datamap_datashowmodal&filter=active,eq,true'
    //     }
    // },
    attributeOrder: ['measurement_process', 'id', 'ts', 'pm2_5', 'pm10_0', 'temp1'],
    attrsFormat: new Map([['ts', 'datetime']]) // set lang format
};

// colorcode markers on map and provide map legend
window['datamap_datadescription_options'] = {
    // initial attribute for coloring map markers
    visuAttribute: 'pm10_0'
};

// window['datamap_options'].plugins.set('Timeline', {
//     id: 'timeline',
//     active: true,
// });

window['timeline_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_timeline&filter=active,eq,true'
        }
    },
    tsAttr: 'ts',
    startTS: '',
    endTS: '',
    outOfTimeOpacity: 0.2,
    animationStepSize: 1800,
    animationTimeRange: 86400
};

// window['navigation_datamap_options'] = {
//     activeOn: {
//         fromName: 'tbl_systemconfiguration', // Name of the datatable
//         fromWheres: {
//             filter: 'ckey,eq,func_datamap_navigation&filter=active,eq,true'
//         }
//     }
// }

window['interfacemagicmapper_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_magicmapper&filter=active,eq,true'
        }
    }
};

window['searchplaces_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_search&filter=active,eq,true'
        }
    }
};

window['filtermeasurementpoints_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_filter&filter=active,eq,true'
        }
    }
};

window['toggleclickinteractionbutton_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_toggleclickinteraction&filter=active,eq,true'
        }
    }
};

window['togglelatchonlocation_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_togglelatchonlocation&filter=active,eq,true'
        }
    }
};

window['help_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_help&filter=active,eq,true'
        }
    }
};

window['labels_datamap_options'] = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_datamap_labels&filter=active,eq,true'
        }
    },
    datasets: true
};
