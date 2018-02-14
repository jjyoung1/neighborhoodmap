var app = window.app || {};

// (function () {
/*******************************************************************
 * Google Map Code
 *******************************************************************/

app.initMap = function () {
    // Initialize the ViewModel
    ko.applyBindings(new app.ViewModel);
};

var stop = "Stop Here";


app.ViewModel = function () {
    'use strict';
    var self = this;

    var default_locations = [
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

    this.map = null;
    this.places_svc = null;
    this.locations = [];

    // filterSet is used to combine the place types for all the markers
    // filterOptionsArray is created from a filterSet since ko doesn't have an observable Set type
    this.filterSet = new Set();
    this.filterOptionsArray = ko.observableArray(['All']);
    this.selectedFilterValue = ko.observable(this.filterOptionsArray[0]);

    this.markers = ko.observableArray([]);
    this.markers.extend({rateLimit: 50});
    this.visibleMarkers = ko.observableArray([])
    this.visibleMarkers.extend({rateLimit: 50});

    this.default_zoom = 13;
    this.hello = ko.observable('hello');

    this.default_location = {
        lat: 43.9140162,
        lng: -69.96699599999999
    };

    this.selectedFilterValue.subscribe(function (newValue, event) {
        console.log('Filter Selected: ' + newValue);
        filterMarkers(newValue);
    });

    // Check if marker is the specified type
    function isMarkerType(type) {

    }

    // TODO: close any open infowindows
    function filterMarkers(filter) {
        self.visibleMarkers.removeAll();
        self.markers().forEach(function (marker) {
            if (filter==='All' || marker.types.indexOf(filter) >= 0) {
                marker.setVisible(true);
                self.visibleMarkers.push(marker);

            } else {
                marker.setVisible(false);
            }
        });
    }

    // Populate the filter dropdown based on the types of markers returned from places
    function populateFilterList(typeArray) {
        typeArray.forEach(function (elem) {
            if (self.filterOptionsArray.indexOf(elem) < 0) {
                self.filterOptionsArray.push(elem);
            }
        });
    }

    // callback from google maps places api
    // Setup location markers and lists
    function setupLocation(results, status) {
        var marker;
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            self.locations.push(results);

            marker = new google.maps.Marker({
                position: results[0].geometry.location,
                map: self.map,
                title: results[0].name,
                animation: google.maps.Animation.DROP
            });
            // Add the location types for this marker to aid in filtering.
            marker.types = results[0].types;

            self.bounds.extend(marker.position);
            self.map.fitBounds(self.bounds);

            populateFilterList(marker.types);

            marker.addListener('click', function () {
                populateInfoWindow(this, self.infowindow);
                this.setIcon(self.clickedIcon);
            });

            //
            marker.redIcon = marker.getIcon();
            marker.defaultIcon = marker.getIcon();

            marker.addListener('mouseover', function () {

                this.setIcon(self.highlightedIcon);
            });

            marker.addListener('mouseout', function () {
                this.setIcon(this.defaultIcon);
            });

            self.markers.push(marker);
            self.visibleMarkers.push(marker);

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

        self.highlightedIcon = makeMarkerIcon('FFFF24');
        self.clickedIcon = makeMarkerIcon('1E90FF');

        // Creates a new map at the default location and inserts it into the page
        // returns the map handle to caller
        self.map = new google.maps.Map(getMapLocation(), {
            center: self.default_location,
            zoom: self.default_zoom,
            mapTypeControl: false
        });

        self.places_svc = new google.maps.places.PlacesService(self.map);

        self.infowindow = new google.maps.InfoWindow();
        self.bounds = new google.maps.LatLngBounds();

        // Setup initial locations
        default_locations.forEach(function (descr) {
            console.log(descr);
            self.callback = self.setupLocation;
            var request = {
                location: self.default_location,
                radius: '20000',
                name: descr,
            };
            self.places_svc.nearbySearch(request, setupLocation);
        });


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

    init_map();
};


// })();