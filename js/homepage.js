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

app.Foursquare = function (loc, def_loc) {
    'use strict';
    var self = this;
    var name = loc.name();
    var latlng = loc.location();


    // Initial string for query
    var apiURL = "https://api.foursquare.com/v2/venues/";
    var clientID = "OBNNEB0ELVH2RJLJKBUGCYU25EJ2KKOCIYC0CYX25XZ1LDUG";
    var clientSecret = "5CMBNN3VHMYTYJJHNTF2CBI2DUJCUIEFPV3MSP4OWTMEOL4X";
    var version = "20170912";
    var venueID = "4ac238e5f964a520489820e3";

    var url = apiURL + def_loc.fsq_id + '?client_id=' + clientID + '&client_secret=' + clientSecret + '&v=' + version;

    $.getJSON(url, function (result) {
        loc.fsq_venue(result.response.venue);
        console.log("4Sq Result name: " + loc.fsq_venue().name + " phone: " + loc.fsq_venue().contact.formattedPhone);
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
    this.fsq_venue = ko.observable();
    this.fsq_venue_id = ko.observable();
    this.defaultIcon = null;
    this.hoverIcon = null;
    this.clickedIcon = null;
    this.phone = function () {
        return this.fsq_venue().contact.formattedPhone;
    };

    this.description = function () {
        return this.fsq_venue().description;
    };

    this.url = function () {
        return this.fsq_venue().url;
    };

    this.hours = function () {
        return this.fsq_venue().hours.status
    };

    this.price_tier = function () {
        return this.fsq_venue().price.message;
    };


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

    this.startBounce = function () {
        // if (this.marker.getAnimation() !== null) {
        //     this.marker.setAnimation(null);
        // } else {
        this.marker.setAnimation(google.maps.Animation.BOUNCE);
        // }
        setTimeout(this.stopBounce, 2000, this);

    };

    this.stopBounce = function (loc) {
        loc.marker.setAnimation(null);
    };
};

app.ViewModel = function () {
    'use strict';
    var self = this;

    var default_locations = [
        {
            title: "Wild Oats Bakery & Cafe",
            location: {lat: 43.9149431, lng: -69.9660507},
            fsq_id: "4b9e6089f964a5203bde36e3"
        },
        {title: "Tao Yuan Restaurant", location: {lat: 43.914225, lng: -69.969562}, fsq_id: "4fb6c7f4e4b094ed55f49309"},
        {title: "Frontier", location: {lat: 43.9197608, lng: -69.969129}, fsq_id: "4ac238e5f964a520489820e3"},
        {
            title: "Frosty's Donuts & Coffee Shop",
            location: {lat: 43.917573, lng: -69.9689393},
            fsq_id: "4c2b1dbe57a9c9b6815cf567"
        },
        {title: "Five Guys", location: {lat: 43.9068938, lng: -69.921544}, fsq_id: "51b74f4f498e4f3e65477d99"},
        {
            title: "Fat Boy Drive-In\n",
            location: {lat: 43.9071104, lng: -69.9357459},
            fsq_id: "4ba39203f964a520444838e3"
        },
        {title: "Bangkok Garden", location: {lat: 43.9192555, lng: -69.9698779}, fsq_id: "4c41087eda3dc928515cc8b9"},
        {title: "Scarlet Begonias", location: {lat: 43.911486, lng: -69.9672573}, fsq_id: "4ba13593f964a52051a237e3"},
        {title: "Gurnet Trading Co", location: {lat: 43.8653359, lng: -69.9163381}, fsq_id: "4bc0ce1a920eb713c79a192c"},
        {title: "Big Top Deli", location: {lat: 43.9170172, lng: -69.9686964}, fsq_id: "4b4fb392f964a520851127e3"}
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
    function setupLocation(results, status, def_loc) {
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
                return function () {
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
            app.Foursquare(loc, def_loc);

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
        if (infowindow.marker !== marker) {
            var loc = findLocationForMarker(marker);
            infowindow.marker = marker;
            var content = '<div id="ifw">';
            content += '<h1>' + loc.name() + '</h1>';
            if (loc.phone())
                content += '<p>Phone: ' + loc.phone() + '</p>';
            if (loc.description())
                content += '<p>' + loc.description() + '</p>';
            if (loc.url())
                content += '<a href=' + loc.url() + '>Website</a>';
            if (loc.hours())
                content += '<p>' + loc.hours() + '</p>';
            if (loc.price_tier())
                content += '<p>Price: ' + loc.price_tier() + '</p>';
            content += '</div>';

            // this.getCategories = function () {
            //     return this.place_info.types;
            // };

            infowindow.setContent(content);
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

            self.places_svc.nearbySearch(request, function (def_loc) {
                return function (results, status) {
                    setupLocation(results, status, def_loc);
                }
            }(l));

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