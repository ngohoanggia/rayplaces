/**
 * SelectPlace view
 */
define([
    'utilities',
    'underscore',
    'app/models/place',
    'app/collections/places',
    'app/views/desktop/mapview',
    'app/views/desktop/placesearchbar',
    'app/placeutils',
    'text!../../../../templates/desktop/selectplace.html'
], function (utilities, _, PlaceModel, PlacesCollection, MapView, PlaceSearchView, placeUtils, 
    SelectPlaceTemplate) {
    var vent;

    var SelectPlaceView = Backbone.View.extend({
        address: '',
        lat: 0.0, 
        lng: 0.0,

        initialize: function(options){
            //console.log(options.location);
            vent = options.vent;
            this.selectedPlace = new PlaceModel();
            
            this.nearbyPlacesColl = [];
            this.rayPlacesColl = [];
            this.googlePlacesColl = [];
            this.foursquarePlacesColl = [];

            this.rayplaces_done = false
            this.googleplaces_done = false;
            this.foursquareplaces_done = false;

            // Map markers
            this.markers = [];

            utilities.applyTemplate($(this.el), SelectPlaceTemplate,{});

            this.mapView = new MapView({el:$('#map-canvas-holder'), vent: options.vent});
            this.mapView.render();

            this.placesSearchView = new PlaceSearchView({
                el:$('#place-search-bar-holder'), 
                vent: options.vent,
                newplace: this.selectedPlace,
            });
            this.placesSearchView.render();

            vent.bind('places_retrieved', this.addNearbyPlaces, this);
            vent.bind('places_added', this.combinePlaces, this);
            vent.bind('update_places', this.updatePlaces, this);
            
            //_.bindAll(this, 'new_place');
        },

        events : {
            "click .submit-place" : "submitPlace"
        },

        render:function () {
            //console.log('render')
        },

        selectPlace: function(place){
            this.selectedPlace = place;

            //this.updateLocation(new google.maps.LatLng(place.lat, place.lng));
            if ($('#submit-place-btn').hasClass('disabled'))
                $('#submit-place-btn').removeClass('disabled');
            //console.log(this.selectedPlace);
        },

        submitPlace: function(e) {
            e.preventDefault();
            
            //console.log(this.selectedPlace);
        },

        updatePlaces: function(data){
            console.log("Places reset");
            this.rayplaces_done = false;
            this.googleplaces_done = false;
            this.foursquareplaces_done = false;

            this.rayPlacesColl = [];
            this.googlePlacesColl = [];
            this.foursquarePlacesColl = [];
            this.nearbyPlacesColl = [];

            this.mapView.clearMarkers(this.markers);
            this.markers = [];

            this.mapView.updatePlaces(data);
        },

        combinePlaces : function(code){
            if (code == placeUtils.RAY_PLACES_CODE){
                this.rayplaces_done = true;
            } else if (code == placeUtils.GOOGLE_PLACES_CODE){
                this.googleplaces_done = true;
            } else if (code == placeUtils.FOURSQUARE_PLACES_CODE) {
                this.foursquareplaces_done = true;
            }

            if (this.rayplaces_done && this.googleplaces_done && this.foursquareplaces_done){
                var nearbyPlaces = placeUtils.combinePlaces(this.rayPlacesColl, this.googlePlacesColl, this.foursquarePlacesColl);

                this.mapView.showMarkers(this.markers, nearbyPlaces);
            }
        },

        addNearbyPlaces : function(data){
            places = data.places;
            code = data.code;

            for (var i= 0; i< places.length; i++){
                if (places[i]){
                    if (code == placeUtils.RAY_PLACES_CODE)
                        this.rayPlacesColl.push(places[i]);
                    else if (code == placeUtils.GOOGLE_PLACES_CODE)
                        this.googlePlacesColl.push(places[i]);
                    else if (code == placeUtils.FOURSQUARE_PLACES_CODE)
                        this.foursquarePlacesColl.push(places[i]);
                }
            }

            vent.trigger('places_added', code);
        }
    });

    return SelectPlaceView;
});