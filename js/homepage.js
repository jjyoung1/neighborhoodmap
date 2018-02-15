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

app.Foursquare = function (name) {
    'use strict';
    var self = this;

    // Initial string for query
    self.fsquery = "https://api.foursquare.com/v2/venues/search?near=brunswick,maine&radius=5000&intent=match&" +
        "client_id=OBNNEB0ELVH2RJLJKBUGCYU25EJ2KKOCIYC0CYX25XZ1LDUG&" +
        "client_secret=5CMBNN3VHMYTYJJHNTF2CBI2DUJCUIEFPV3MSP4OWTMEOL4X&v=20170912&query=";
    self.response = "";

    self.fsquery += name;

    $.getJSON(self.fsquery, function (result) {
        console.log(name);
        console.log(result);

    });
};


app.ViewModel = function () {
    'use strict';
    var self = this;

    var default_locations = [
        {title: "Hannaford Supermarket", location: {lat: 43.9118349, lng: -69.96696600000001}},
        {title: "Byrnes Irish Pub", location: {lat: 43.91133, lng: -69.96522299999998}},
        {title: "Benchwarmers", location: {lat: 43.9113643, lng: -69.96348669999998}},
        {title: "Frontier", location: {lat: 43.919757, lng: -69.96693499999998}},
        {title: "Coast Bar + Bistro", location: {lat: 43.9189497, lng: -69.9637538}},
        {title: "Toasty's Tavern", location: {lat: 43.9100464, lng: -69.90944639999998}},
        {title: "Walmart Supercenter", location: {lat: 43.9069916, lng: -69.90759509999998}},
        {title: "Little Dog Coffee Shop", location: {lat: 43.9165556, lng: -69.96557439999998}},
        {title: "Lowe's Home Improvement", location: {lat: 43.90817, lng: -69.90450299999998}}
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

    function filterMarkers(filter) {
        self.infowindow.close();
        self.visibleMarkers.removeAll();
        self.markers().forEach(function (marker) {
            if (filter === 'All' || marker.types.indexOf(filter) >= 0) {
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

    // Handle clicks in the options location list
    this.listItemClicked = function (listItem) {
        console.log(listItem.title + " Clicked!");
    };

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
            console.log(results[0].name + ':' + results[0].geometry.location);

            // Add the location types for this marker to aid in filtering.
            marker.types = results[0].types;
            marker.foursquare = new app.Foursquare(results[0].name);

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
                if(self.infowindow.marker === marker)
                    return;
                resetMarkerIcons();
                this.setIcon(self.highlightedIcon);
            });

            marker.addListener('mouseout', function () {
                resetMarkerIcons();
            });

            self.markers.push(marker);
            self.visibleMarkers.push(marker);

        }
    }

    function resetMarkerIcons() {
        for (var i=0; i< self.markers().length; i++) {
            if(self.infowindow.marker === self.markers()[i])
                continue;
            self.markers()[i].setIcon(self.defaultIcon);
        }
    }

    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent('<div>' + marker.title + '</div>');
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
                resetMarkerIcons();
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
        default_locations.forEach(function (l) {
            console.log(l.title);
            self.callback = self.setupLocation;
            var request = {
                location: l.location,
                radius: '100',  // Short radius since precise location specified
                name: l.title
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