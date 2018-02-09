<<<<<<< HEAD
(function () {

    var model = (function () {
        var self = this;

        this.init = function () {
        };

        /*
         * Latitude and Longitude of Brunswick Maine as returned by Google Maps
         * https://maps.googleapis.com/maps/api/geocode/json?address=brunswick,me&key=KEY
         */
        this.default_zoom = 13;

        this.default_location = {
            "lat": 43.9140162,
            "lng": -69.96699599999999
        };

        this.map = null;
        this.places_svc = null;
        this.locations = [];

        this.mapInit = function (map) {
            this.map = map;
            this.places_svc = new google.maps.places.PlacesService(map);
||||||| merged common ancestors
// (function () {

var model = {
    /*
     * Latitude and Longitude of Brunswick Maine as returned by Google Maps
     * https://maps.googleapis.com/maps/api/geocode/json?address=brunswick,me&key=KEY
     */
    default_zoom: 13,

    default_location: {
        "lat": 43.9140162,
        "lng": -69.96699599999999
    },

    map: null,
    places_svc: null,
    locations: [],

    init: function () {
    },

    mapInit: function (map) {
        this.map = map;
        this.places_svc = new google.maps.places.PlacesService(map);
    },

    // Performs asynchronous call to google maps places api
    findLocationByDescription: function (descr, callback) {
        var request = {
            location: model.default_location,
            radius: '20',
            query: descr
=======
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
>>>>>>> master
        };
<<<<<<< HEAD
||||||| merged common ancestors
        this.places_svc.textSearch(request, callback);
    }
};
=======
        self.places_svc.textSearch(request, callback);
    }
    return me;
}(ko));
>>>>>>> master

        // Performs asynchronous call to google maps places api
        this.findLocationByDescription = function (descr, callback) {
            var request = {
                location: self.default_location,
                radius: '20',
                query: descr
            };
            this.places_svc.textSearch(request, callback);
        }
    })();

<<<<<<< HEAD
||||||| merged common ancestors
var viewModel = {
    self: this,
=======
app.viewModel = (function (ko) {
    'use strict';
    var self = this;
>>>>>>> master

<<<<<<< HEAD
    var viewModel = (function () {
        "use strict";
||||||| merged common ancestors
    getDefaultLocation: function () {
        return model.default_location;
    },
=======
    var me = {
        init_app: init_app,
        initMap: initMap,
        getDefaultLocation: getDefaultLocation,
        getDefaultZoom: getDefaultZoom
    };
>>>>>>> master

<<<<<<< HEAD
        var self = this;
||||||| merged common ancestors
    getDefaultZoom: function () {
        return model.default_zoom;
    },
=======
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
>>>>>>> master

<<<<<<< HEAD
        self.init = function () {
            model.init();
            view.init();
        };
||||||| merged common ancestors
    init_app: function () {
        model.init();
        view.init();
    },
=======
    function getDefaultZoom() {
        return app.model.default_zoom;
    }

    function init_app() {
        app.model.init();
        app.view.init();
    }
>>>>>>> master

<<<<<<< HEAD
        function getDefaultLocation() {
            return model.default_location;
        }
||||||| merged common ancestors
    // callback from google maps places api
    // Setup location markers and lists
    setupLocation: function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            model.locations.push(results);
=======
    // callback from google maps places api
    // Setup location markers and lists
    function setupLocation(results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            app.model.locations.push(results);
>>>>>>> master

        function getDefaultZoom() {
            return model.default_zoom;
        }
<<<<<<< HEAD

        // callback from google maps places api
        // Setup location markers and lists
        function setupLocation(results, status) {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                model.locations.push(results);

                //TODO: create marker
            }
        }

        var default_locations = [
            "Byrnes Irish Pub",
            "Benchwarmers",
            "Frontier",
            "Coast Bar + Bistro",
            "Toasty's Tavern"
        ];

        // Asynchronous callback from the google maps api
        function initMap() {
            model.mapInit(view.setupMap());

            // Setup initial locations
            self.default_locations.forEach(function (descr) {
                console.log(descr);
                var callback = self.setupLocation;
                model.findLocationByDescription(descr, function () {
                    self.setupLocation()
                });
            });
        }
    })();

    var view = (function () {
        var self = this;

        function init() {
            console.log("view.init()");
        }

        // Creates a new map at the default location and inserts it into the page
        // returns the map handle to caller
        function setupMap() {
            var elem = $('map');
            return (new google.maps.Map($('#map')[0], {
                center: viewModel.getDefaultLocation(),
                zoom: viewModel.getDefaultZoom(),
                mapTypeControl: false
            }));
        }
    })();

    ko.applyBindings(viewModel);

})();
||||||| merged common ancestors
    },

    default_locations: [
        "Byrnes Irish Pub",
        "Benchwarmers",
        "Frontier",
        "Coast Bar + Bistro",
        "Toasty's Tavern"
    ],

    // Asynchronous callback from the google maps api
    initMap: function () {
        model.mapInit(view.setupMap());

        // Setup initial locations
        this.default_locations.forEach(function (descr){
            console.log(descr);
            callback = this.setupLocation();
            model.findLocationByDescription(descr, function(){viewModel.setupLocation});
        });


    }
};

var view = {
    init: function () {

    },

    // Creates a new map at the default location and inserts it into the page
    // returns the map handle to caller
    setupMap: function () {
        var elem = $('map');
        return (new google.maps.Map($('#map')[0], {
            center: viewModel.getDefaultLocation(),
            zoom: viewModel.getDefaultZoom(),
            mapTypeControl: false
        }));
    }
};

// })();
=======
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

>>>>>>> master
