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

    init: function () {
    },

    mapInit: function (map) {
        this.map = map;
        this.places_svc = new google.maps.places.PlacesService(map);
        var request = {
            location: this.default_location,
            radius: '20',
            query: 'Benchwarmers'
        };
        this.places_svc.textSearch(request, function (results, status) {
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                for (var i = 0; i < results.length; i++) {
                    place = results[i];
                }
            }
        });
    }


};

var viewModel = {
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

    // Asynchronous callback from the google maps api
    initMap: function () {
        model.mapInit(view.setupMap());
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
}

// })();