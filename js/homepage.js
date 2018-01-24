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

    init: function () {

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
    }
};

var view = {
    init: function () {
        // init_map(viewModel.getDefaultLocation(), viewModel.getDefaultZoom());
    },

    initMap: function () {
        var elem = $('map');
        map = new google.maps.Map($('#map')[0], {
            center: viewModel.getDefaultLocation(),
            zoom: viewModel.getDefaultZoom(),
            mapTypeControl: false
        });
    }
}

// function initMap() {
//     var elem = $('map');
//     map = new google.maps.Map($('#map')[0], {
//         center: viewModel.getDefaultLocation(),
//         zoom: viewModel.getDefaultZoom(),
//         mapTypeControl: false
//     });
// }

// })();