var app = window.app || {};

// (function () {

app.model = (new function (ko) {
    /*
     * Latitude and Longitude of Brunswick Maine as returned by Google Maps
     * https://maps.googleapis.com/maps/api/geocode/json?address=brunswick,me&key=KEY
     */
    var self = this;
    var me;
    var default_zoom = 13;

    var default_location = {
        "lat": 43.9140162,
        "lng": -69.96699599999999
    };

    this.map = null;
    this.places_svc = null;
    this.locations = [];

    me = {
        init: init,
        findLocationByDescription: findLocationByDescription,
        mapInit: mapInit
    };

    function init() {
    }

    function mapInit(map) {
        self.map = map;
        self.places_svc = new google.maps.places.PlacesService(map);
    }

    // Performs asynchronous call to google maps places api
    function findLocationByDescription(descr, callback) {
        var request = {
            location: app.model.default_location,
            radius: '20',
            query: descr
        };
        self.places_svc.textSearch(request, callback);
    }
    return me;
}(ko));


app.viewModel = (function (ko) {
    'use strict';
    var self = this;

    var me = {
        init_app: init_app,
        initMap: initMap,
        getDefaultLocation: getDefaultLocation,
        getDefaultZoom: getDefaultZoom
    };

    var default_locations = [
        "Byrnes Irish Pub",
        "Benchwarmers",
        "Frontier",
        "Coast Bar + Bistro",
        "Toasty's Tavern"
    ];

    function getDefaultLocation() {
        return app.model.default_location;
    }

    function getDefaultZoom() {
        return app.model.default_zoom;
    }

    function init_app() {
        app.model.init();
        app.view.init();
    }

    // callback from google maps places api
    // Setup location markers and lists
    function setupLocation(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            app.model.locations.push(results);

            //TODO: create marker
        }
    }

    // Asynchronous callback from the google maps api
    function initMap() {
        app.model.mapInit(app.view.setupMap());

        // Setup initial locations
        default_locations.forEach(function (descr) {
            console.log(descr);
            self.callback = self.setupLocation;
            app.model.findLocationByDescription(descr, function () {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    app.model.locations.push(results);

                    //TODO: create marker
                }
            });
        });
    }

    return me;
}(ko));

app.view = (function ($, ko) {
    'use strict';
    var self = this;

    var me = {
        init: init,
        setupMap: setupMap
    };

    function init() {

    }

    // Creates a new map at the default location and inserts it into the page
    // returns the map handle to caller
    function setupMap() {
        // $('#map').height($('body').clientHeight())
        var elem = $('map');
        return (new google.maps.Map($('#map')[0], {
            center: app.viewModel.getDefaultLocation(),
            zoom: app.viewModel.getDefaultZoom(),
            mapTypeControl: false
        }));
    }
    return me;
}(jQuery, ko));

