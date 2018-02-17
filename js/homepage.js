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

app.Foursquare = function (loc) {
    'use strict';
    var self = this;
    var name = loc.name;
    var latlng = loc.location;

    // Initial string for query
    self.fsquery = "https://api.foursquare.com/v2/venues/search?near=brunswick,maine&radius=5000&intent=match&" +
        "client_id=OBNNEB0ELVH2RJLJKBUGCYU25EJ2KKOCIYC0CYX25XZ1LDUG&" +
        "client_secret=5CMBNN3VHMYTYJJHNTF2CBI2DUJCUIEFPV3MSP4OWTMEOL4X&v=20170912";
    self.response = "";

    self.fsquery += "&query=" + name ;

    $.getJSON(self.fsquery, function (result) {
        console.log("4Sq Result: "  + result.toString());
        // console.log(self.result);
    }).fail(function () {
        console.log("Foursquare Query Failed")
    });
    // TODO: Add error handling here
};

// Currently, this object will contain all of the information returned
// from API calls.  This is done for developmental purpose.  This can be
// optimized for memory footprint once all the required information is
// extracted.
app.Location = function (name, location) {
    // name and location will be overriden by results of places search
    this.name = ko.observable(name);
    this.location = ko.observable(location);
    this.place_info = ko.observable();
    this.marker = ko.observable();
    this.address = ko.observable();
    this.foursquare = ko.observable();
    this.defaultIcon = null;
    this.hoverIcon = null;
    this.clickedIcon = null;

    this.getCategories = function () {
        return this.place_info.types;
    };

    this.setIcon = function (icon) {
        this.marker.setIcon(icon);
    };

    this.setVisible = function (visible) {
        this.marker.setVisible(visible)
    };

    this.isVisible = function () {
        return this.marker.getVisible();
    };

    // Check if location is of the specified type
    this.isType = function (type) {

        var index = this.place_info.types.indexOf(type)
        return index >= 0;
    };

    this.startBounce = function() {
        // if (this.marker.getAnimation() !== null) {
        //     this.marker.setAnimation(null);
        // } else {
            this.marker.setAnimation(google.maps.Animation.BOUNCE);
        // }
        setTimeout(this.stopBounce, 2000, this);

    };

    this.stopBounce = function(loc) {
        loc.marker.setAnimation(null);
    };
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

    // filterSet is used to combine the place types for all the markers
    // filterOptionsArray is created from a filterSet since ko doesn't have an observable Set type
    this.filterSet = new Set();
    this.filterOptionsArray = ko.observableArray(['All']);
    this.selectedFilterValue = ko.observable(this.filterOptionsArray[0]);

    // Setup subscription for filter list
    this.selectedFilterValue.subscribe(function (newValue, event) {
        console.log('Filter Selected: ' + newValue);
        filterLocations(newValue);
    });


    this.locations = ko.observableArray([]);
    this.locations.extend({rateLimit: 50});
    this.visibleLocations = ko.observableArray([]);
    this.visibleLocations.extend({rateLimit: 50});

    this.default_zoom = 13;

    this.default_location = {
        lat: 43.9140162,
        lng: -69.96699599999999
    };

    function filterLocations(filter) {
        self.infowindow.close();
        self.visibleLocations.removeAll();
        self.locations().forEach(function (location) {
            if (filter === 'All' || location.isType(filter)) {
                location.setVisible(true);
                self.visibleLocations.push(location);
            } else {
                location.setVisible(false);
            }
        });
    }

    // Add the contents of the type array to the filter options
    function populateFilterList(typeArray) {
        typeArray.forEach(function (elem) {

            // Only enter a type if it's not already present (no duplicates allowed)
            if (self.filterOptionsArray.indexOf(elem) < 0) {
                self.filterOptionsArray.push(elem);
            }
        });
    }

    // Handle clicks in the options location list
    this.listItemClicked = function (listItem) {
        console.log(listItem.name() + " Clicked!");
    };

    // callback from google maps places api
    // Setup location markers and lists
    function setupLocation(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            var loc = new app.Location(results[0].name, results[0].geometry.location);

            console.log("LocSetup: " + results[0].name + ':' + results[0].geometry.location);

            loc.place_info = results[0];

            // Create marker
            var marker = new google.maps.Marker({
                position: results[0].geometry.location,
                map: self.map,
                title: results[0].name,
                animation: google.maps.Animation.DROP
            });

            // Setup marker behavior
            marker.addListener('click', function (loc) {
                return function() {
                    populateInfoWindow(this, self.infowindow);
                    loc.setIcon(self.clickedIcon);
                    loc.startBounce();
                }
            }(loc));

            marker.addListener('mouseover', function () {
                if (self.infowindow.marker === marker)
                    return;
                resetMarkerIcons();
                this.setIcon(self.highlightedIcon);
            });

            marker.addListener('mouseout', function () {
                resetMarkerIcons();
            });

            // Save marker in location
            loc.marker = marker;

            // Get information from Foursquare.  The callback function will store
            // it into the location object
            app.Foursquare(loc);

            self.bounds.extend(marker.position);
            self.map.fitBounds(self.bounds);

            populateFilterList(loc.place_info.types);

            // Save default icon used by the marker
            loc.defaultIcon = marker.getIcon();

            // TODO self.markers.push(marker);
            // self.visibleMarkers.push(marker);

            // Add constructed location to the list of locations
            self.locations.push(loc);
            self.visibleLocations.push(loc);
        }
    }

    function findLocationForMarker(marker) {
        for (var i = 0; i < self.locations().length; i++) {
            if (self.locations()[i].marker === marker)
                return self.locations()[i];
        }
    }

    function resetMarkerIcons() {
        for (var i = 0; i < self.locations().length; i++) {
            // Reset icon for markers without an open infowindow
            if (self.infowindow.marker !== self.locations()[i].marker)
                self.locations()[i].setIcon(self.defaultIcon);
        }
    }

    function populateInfoWindow(marker, infowindow) {
        if (infowindow.marker != marker) {
            var loc = findLocationForMarker(marker);
            infowindow.marker = marker;
            infowindow.setContent('<div>' + loc.name() + '</div>');
            infowindow.open(map, marker);
            infowindow.addListener('closeclick', function () {
                infowindow.marker = null;
                resetMarkerIcons();
            })
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

        // Setup initial locations...initiate using a Google Places search for each location
        default_locations.forEach(function (l) {
            console.log(l.title);
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