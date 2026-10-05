  window['route_map_options'] = {
    datadescription: '#routemap_datadescription',
    geoJSONAttr: 'pos',
    lonAttr: 'pos_lon',
    latAttr: 'pos_lat',
    clusterMarkers: true,
    // Activate plugins
    plugins: new Map([
      ['Navigation', {
        id: 'Navigation',
        active: true
      }],
      ['DataShowModal', {
        id: 'DataShowModal',
        active: true
      }]
    ])
  };

  // Create route from all available data
  window["Navigation_route_map_options"] = {
    createRouteFromData: true,
    connectWithLine: true
  };
  // Show pop up to view data
  window["DataShowModal_route_map_options"] = {
    attributeOrder: ['id', 'ts', 'pm2_5', 'pm10_0', 'temp1'],
    attrsFormat: new Map([['ts', 'datetime']]) // set lang format
  };

  // colorcode markers on map
  window["routemap_datadescription_options"] = {
      // initial attribute for coloring map markers
      visuAttribute: 'pm10_0'
  };