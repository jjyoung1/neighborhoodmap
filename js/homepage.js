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

app.google = new function () {
    var self = this;
    var me = {
        initMap: initMap
    };

    this.map = null;
    this.places_svc = null;
    this.locations = [];
    this.markers = [];

    this.default_locations = [
        "Hannafords",
        "Byrnes Irish Pub",
        "Benchwarmers",
        "Frontier",
        "Coast Bar + Bistro",
        "Toasty's Tavern",
        "Walmart",
        "Little Dog",
        "Lowes",
        "Bowdoin College",
        "School",
        "Bar"
    ];

    this.default_zoom = 13;

    this.default_location = {
        lat: 43.9140162,
        lng: -69.96699599999999
    };

// callback from google maps places api
// Setup location markers and lists
    function setupLocation(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            self.locations.push(results);

            //TODO: create marker
            self.markers.push(new google.maps.Marker({
                position: results[0].geometry.location,
                map: self.map
            }))

            Look = "Look here";
        }
    }

// Performs asynchronous call to google maps places api
    function findLocationByDescription(descr, callback) {
    }


// Asynchronous callback from the google maps api
    function initMap() {
        var elem = $('map');

        this.default_location = new google.maps.LatLng(self.default_location);

        // Creates a new map at the default location and inserts it into the page
        // returns the map handle to caller
        self.map = new google.maps.Map($('#map')[0], {
            center: self.default_location,
            zoom: self.default_zoom,
            mapTypeControl: false
        });

        self.places_svc = new google.maps.places.PlacesService(self.map);

        // Setup initial locations
        self.default_locations.forEach(function (descr) {
            console.log(descr);
            self.callback = self.setupLocation;
            var request = {
                location: self.default_location,
                radius: '20000',
                name: descr
            };
            self.places_svc.nearbySearch(request, setupLocation);
        });
    }

    return me;
};
