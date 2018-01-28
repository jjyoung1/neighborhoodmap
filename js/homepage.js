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
        };

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


    var viewModel = (function () {
        "use strict";

        var self = this;

        self.init = function () {
            model.init();
            view.init();
        };

        function getDefaultLocation() {
            return model.default_location;
        }

        function getDefaultZoom() {
            return model.default_zoom;
        }

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