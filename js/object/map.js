/**
 * Example Configuration for the WorldMap2D Component
 */
var objectmap_options = {
    startPointLon: 8.905, //intial longitude of the map
    startPointLat: 52.296, //intial latitude of the map
    zoom: 12, //intial zoom level of the map
    maxZoom: 18, //maximum zoom level of the map
    zoomControl: true, //show zoom control buttons from leaflet
    showTimedDataAtOnce: true,
    customMarkerOptions: {
        opacity: 1
    },
    clusterMarkers: true, //whether to cluster markers together when zoomed out
    idGeolocationComponent: 'worldmap_geolocate', // id of the geolocation component
    // customIconOptions: {
    //     iconSize: [60, 60],
    //     shadowUrl: '../../../SWAC/swac/libs/leaflet/images/marker-shadow.png',
    //     shadowSize: [60, 60],
    //     shadowAnchor: [20, 60],
    //     iconAnchor: [30, 56]
    // },
    // customIconVisited: { //the icon used for visited locations
    //     iconUrl: '../../../SWAC/swac/libs/leaflet/images/marker_icon_custom_visited.svg'
    // },
    // customIconUnvisited: { //the icon used for unvisited locations
    //     iconUrl: '../../../SWAC/swac/libs/leaflet/images/marker_icon_custom_unvisited.svg'
    // },
    // userIcon: { //the icon used for the location of the user
    //     iconUrl: '../../../SWAC/swac/libs/leaflet/images/marker_person.png',
    //     iconSize: [25, 50],
    //     iconAnchor: [12, 25]
    // },
    datasources: new Map([
        ['tbl_location', {
                datacapsule: {
                    fromName: 'tbl_location',
                    fromWheres: {
                        join: 'tbl_observedobject'
                    }
                },
                latitudeAttr: 'coordinates.coordinates.1',
                longitudeAttr: 'coordinates.coordinates.0'
            }]
    ]),
    allowAddModels: true,
    apiActualUrlAttr: 'tbl_observedobject.0.api_actual_url',
    baseLayers: new Map(),
    customMarkerTooltip: new Map()
};
objectmap_options.customMarkerTooltip.set("default", {
            content: '<b>{name} {0.id}</b><br><img swac_hideOnEmpty="{icon}" src="{icon}" widht="200" height="100">',
            options: {direction: 'top', sticky: false, opacity: 0.8, offset: [0, -22]}});
objectmap_options.baseLayers.set("OpenStreetMaps", {
    mapProviderURL: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    mapProviderAttribution: 'Map data © <a href="https://openstreetmap.org">OpenStreetMap</a> contributors',
    active: true});
//objectmap_options.baseLayers.set("LocalAtlas", {
//    mapProviderURL: '/localAtlas/{z}/{x}/{y}.png',
//    mapProviderAttribution: 'Local Atlas',
//    active: true});
//objectmap_options.baseLayers.set("OpenSeaMap", {
//    mapProviderURL: ' https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png',
//    mapProviderAttribution: 'Map data © <a href="https://openseamap.org">OpenSeaMap</a> contributors',
//    active: true});

//add plugins to the worldmap2d component
objectmap_options.plugins = new Map();

/* Plugin >CreateObjectModal< opens when clicked on the map, and lets you create a new measuremt point */
objectmap_options.plugins.set('CreateObjectModal', {
    id: 'createobjectmodal',
    active: true
});

/* Plugin >CreateObjectModal< options */
var createobjectmodal_objectmap_options = {
    objectRequestor: {
        fromName: 'tbl_observedobject'
    },
    locationRequestor: {
        fromName: 'tbl_location'
    },
    joinRequestor: {
        fromName: 'tbl_location_join_oo'
    },
    typesRequestor: {
        fromName: 'tbl_ootype'
    },
    parentRequestor: {
        fromName: 'tbl_observedobject'
    },
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_createobject&filter=active,eq,true'
        }
    }
};

/* Plugin >FilterMeasurementPoints< can be used to filter the points on the map by their type */
objectmap_options.plugins.set('FilterMeasurementPoints', {
    id: 'filtermeasurementpoints',
    active: true
});

/* Plugin >FilterMeasuermentsPoints< options */
var filtermeasurementpoints_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_filter&filter=active,eq,true'
        }
    }
};

/* Plugin >DataAndMediaShowModal< shows all measured data and recorded photos for the mappin that was clicked on */
objectmap_options.plugins.set('DataAndMediaShowModal', {
    id: 'dataandmediashowmodal',
    active: true
});
var dataandmediashowmodal_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_objectdata&filter=active,eq,true'
        }
    },
    table_names: {
        locations_table: {
            table_name: 'tbl_location',
            idAttr: 'id',
            geojsonattr: 'coordinates'
        },
        oo_table: {
            table_name: 'tbl_observedobject',
            idAttr: 'id',
            completed: 'completed'
        },
        file_table: {
            table_name: 'tbl_file',
            idAttr: 'id'
        },
        file_join_oo_table: {
            table_name: 'tbl_file_join_oo',
            idAttr: 'id',
            file_id: 'file_id',
            oo_id: 'oo_id'
        },
        uploadfile_options: {
            uploadTargetURL: '/SmartFile/smartfile/file/map_pictures_Gewaesser',
            docroot: '../../../'
        }
    },
    data_iframelink: '../data/list_iframe.html?oo_id={oo_id}&data_collection={data_collection}',
    meta_iframelink: 'metadata_horizontal.html?oo_id={oo_id}&meta_collection={meta_collection}',
    media_iframelink: '../media/upload.html?oo_id={oo_id}&media_collection={media_collection}'
};

/* Plugin >SearchPlaces< adds a small search box to jump fast to specific pionts instead of scrolling through the map*/
objectmap_options.plugins.set('SearchPlaces', {
    id: 'searchplaces',
    active: true
});

/* Plugin >SearchPlaces< options */
var searchplaces_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_search&filter=active,eq,true'
        }
    }
};

/* Plugin >Navigation< displays routes to points on the map */
objectmap_options.plugins.set('Navigation', {
    id: 'navigation',
    active: true
});

/* Plugin >Navigation< options */
var navigation_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_navigation&filter=active,eq,true'
        }
    }
};

/* Plugin >Labels< adds labels to the map */
objectmap_options.plugins.set('Labels', {
    id: 'labels',
    active: true
});

/* Plugin >Labels< options */
var labels_objectmap_options = {
    activeOn: {
        fromName: 'tbl_systemconfiguration', // Name of the datatable
        fromWheres: {
            filter: 'ckey,eq,func_objectmap_labels&filter=active,eq,true'
        }
    },
    observedobjects: true
};

window['dataandmediashowmodal_labels_options'] = {
    showWhenNoData: true,
    labeledidAttr: 'oo_id',
    labelSource: {
        fromName: 'label_labels',
        fromWheres: {
            filter: 'isavailforobjects,eq,true'
        }
    }
};

window['geolocation_options'] = {
    plugins: new Map()
};
window['geolocation_options'].plugins.set('MagicMapperInterface', {
    id: 'MagicMapperInterface',
    active: true
});
