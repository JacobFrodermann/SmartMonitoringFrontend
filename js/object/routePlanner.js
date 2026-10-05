    // Minimal configuration for useing the navigation plugin
    window['planner_options'] = {
        plugins: new Map([['Navigation', {
            id: 'navigation',
            active: true
        }]])
    };
    // Navigation plugin configuration
    window['navigation_planner_options'] = {
        // Often a proxy is needed. This example uses SmartData proxy
        searchurl: 'http://localhost:8080/SmartData/smartdata/proxy/get?url=https://nominatim.openstreetmap.org/search',
        enableRouteSave: true,
        routeSaveTarget: 'tbl_routes_planned',
        routeIdGenerator: 'timestamp'
    };