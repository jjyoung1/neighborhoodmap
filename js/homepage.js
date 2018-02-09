var app = window.app || {};

// (function () {

app.model = (new function (ko) {
    /*
     * Latitude and Longitude of Brunswick Maine as returned by Google Maps
     * https://maps.googleapis.com/maps/api/geocode/json?address=brunswick,me&key=KEY
     */
    var self = this;
    var me = {
        init: init
    };


    function init() {
    }

    return me;
}(ko));

app.viewModel = (function (ko) {
    'use strict';
    var self = this;

    var me = {
        init_app: init_app
    };

    function init_app() {
        app.model.init();
        app.view.init();
    }

    return me;
}(ko));


app.view = (function ($, ko) {
    'use strict';
    var self = this;
    var me = {
        init: init
    };


    function init() {

    }

    return me;
}(jQuery, ko));

/*******************************************************************
 * Google Map Code
 *******************************************************************/

app.google = (function () {
    var self = this;
    var me = {
        initMap: initMap
    };

    this.map = null;
    this.places_svc = null;
    this.locations = [];

    this.default_locations = [
        "Byrnes Irish Pub",
        "Benchwarmers",
        "Frontier",
        "Coast Bar + Bistro",
        "Toasty's Tavern"
    ];

    this.default_zoom = 13;

    this.default_location = {
        "lat": 43.9140162,
        "lng": -69.96699599999999
    };

// callback from google maps places api
// Setup location markers and lists
    function setupLocation(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            locations.push(results);
        }
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


// Asynchronous callback from the google maps api
    function initMap() {

        // Creates a new map at the default location and inserts it into the page
        // returns the map handle to caller
        places_svc = new google.maps.places.PlacesService(map);
        var elem = $('map');
        self.map = new google.maps.Map($('#map')[0], {
            center: self.default_location,
            zoom: self.default_zoom,
            mapTypeControl: false
        });

        // Setup initial locations
        // default_locations.forEach(function (descr) {
        //     console.log(descr);
        //     self.callback = self.setupLocation;
        //     app.model.findLocationByDescription(descr, function () {
        //         if (status === google.maps.places.PlacesServiceStatus.OK) {
        //             app.model.locations.push(results);
        //
        //             //TODO: create marker
        //         }
        //     });
        // });
    }
    return me;
}());
