var app = window.app || {};

// (function () {

app.model = (new function (ko) {
    /*
     * Latitude and Longitude of Brunswick Maine as returned by Google Maps
     * https://maps.googleapis.com/maps/api/geocode/json?address=brunswick,me&key=KEY
     */
    var self = this;
    var me = {
        init: init,
        getDefaultLocations: getDefaultLocations
    };

    default_locations = [
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

    function getDefaultLocations() {
        return default_locations;
    }

    function init() {
    }

    return me;
}(ko));

app.viewModel = (new function (ko) {
    'use strict';
    var self = this;

    var me = {
        init_app: init_app
    };

    this.map = null;
    this.places_svc = null;
    this.locations = [];

    this.markers = ko.observableArray([]);
    this.markers.extend({rateLimit: 50});

    this.default_zoom = 13;

    this.default_location = {
        lat: 43.9140162,
        lng: -69.96699599999999
    };

    function init_app() {
        app.model.init();
        app.view.init();
        init_map();
    }

    // callback from google maps places api
    // Setup location markers and lists
    function setupLocation(results, status) {
        var marker;
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            self.locations.push(results);

            //TODO: create marker
            marker = new google.maps.Marker({
                position: results[0].geometry.location,
                map: self.map,
                title: results[0].name,
                animation: google.maps.Animation.DROP
            });
            // self.bounds.extend(marker.position);

            marker.addListener('click', function () {
                populateInfoWindow(this, self.infowindow);
            });

            marker.addListener('mouseover', function () {
                self.defaultIcon = this.getIcon();
                this.setIcon(self.highlightedIcon);
            });

            marker.addListener('mouseout', function () {
                this.setIcon(self.defaultIcon);
            });

            self.markers.push(marker);
            console.log("created Marker Title " + self.markers()[self.markers().length - 1].title);
        }
    }

    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
            });
        }
    }

    function init_map() {
        self.default_location = new google.maps.LatLng(self.default_location);

        self.highlightedIcon = app.view.makeMarkerIcon('FFFF24');

        // Creates a new map at the default location and inserts it into the page
        // returns the map handle to caller
        self.map = new google.maps.Map(app.view.getMapLocation(), {
            center: self.default_location,
            zoom: self.default_zoom,
            mapTypeControl: false
        });

        self.places_svc = new google.maps.places.PlacesService(self.map);

        self.infowindow = new google.maps.InfoWindow();
        self.bounds = new google.maps.LatLngBounds();

        // Setup initial locations
        app.model.getDefaultLocations().forEach(function (descr) {
            console.log(descr);
            self.callback = self.setupLocation;
            var request = {
                location: self.default_location,
                radius: '20000',
                name: descr,
            };
            self.places_svc.nearbySearch(request, setupLocation);
        });

        // self.map.fitBounds(self.bounds);

    }

    return me;
}(ko));


app.view = (function ($, ko) {
    'use strict';
    var self = this;
    var me = {
        init: init,
        getMapLocation: getMapLocation,
        makeMarkerIcon: makeMarkerIcon
    };

    function init() {

    }

    // This function takes in a COLOR, and then creates a new marker
    // icon of that color. The icon will be 21 px wide by 34 high, have an origin
    // of 0, 0 and be anchored at 10, 34).
    function makeMarkerIcon(markerColor) {
        var markerImage = new google.maps.MarkerImage(
            'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + markerColor +
            '|40|_|%E2%80%A2',
            new google.maps.Size(21, 34),
            new google.maps.Point(0, 0),
            new google.maps.Point(10, 34),
            new google.maps.Size(21, 34));
        return markerImage;
    }

    function getMapLocation() {
        return $('#map')[0];
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


// Asynchronous callback from the google maps api
    function initMap() {
        // Initialize the ViewModel
        ko.applyBindings(app.viewModel);
        app.viewModel.init_app();
    }

    return me;
};
