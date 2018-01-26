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
        };
        this.places_svc.textSearch(request, callback);
    }
};


var viewModel = {
    self: this,

    getDefaultLocation: function () {
        return model.default_location;
    },

    getDefaultZoom: function () {
        return model.default_zoom;
    },

    init_app: function () {
        model.init();
        view.init();
    },

    // callback from google maps places api
    // Setup location markers and lists
    setupLocation: function (results, status) {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            model.locations.push(results);

            //TODO: create marker
        }
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