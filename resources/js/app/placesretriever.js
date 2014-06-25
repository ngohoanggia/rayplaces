/**
 * Module for the Event model
 */
define([
	'jquery',
    'app/placeutils',
    'app/models/place',
], function ($, placeUtils, PlaceModel) {
    var config = {
    	RAYPLACES_SEARCH_URL : 'http://raynavdb-ngohgia.rhcloud.com/rayplaces?query=search_places',
        RAYPLACES_PUBLIC_ID  : 'public_ray',

        FOURSQUARE_SEARCH_URL : 'https://api.foursquare.com/v2/venues/search?',
        FOURSQUARE_API_CLIENT : 'GTKBNALEWITNCCOJU3QKV4GBSEU1RGPLZAHEHUXGURQA3RJI',
        FOURSQUARE_API_SECRET : 'D0BGDCGSBFT4JH3FE5VIY1R1LGF1UL2PWDMR14BY51Z32ACU',
        FOURSQUARE_VERSION : '20130815',
        FOURSQUARE_MAX_RAD : 100000,
    };

    var PlacesRetriever = {
        retrievePlacesFromRayServer: function(lat, lng, rad, vent) {
            var placesSearchURL = config.RAYPLACES_SEARCH_URL +
                '&lat=' + lat +
                '&lng=' + lng + 
                '&rad=' + rad +
                '&uid=' + config.RAYPLACES_PUBLIC_ID;
            $.ajax({
                type: 'GET',
                url: placesSearchURL,
                contentType: 'text/plain',
                /*
                xhrFields: {
                    withCredentials: true
                },*/
                headers: {},
            })
            .done(function(data){
                console.log("retrieve from Ray: ");
                console.log(data);
                var placesColl = [];
                $.each($.parseJSON(data), function(idx, place){
                    var rayPlace = new PlaceModel();
                    rayPlace.ray_id = place._id.$oid;
                    rayPlace.google_id = place.google_id;
                    rayPlace.foursquare_id = place.foursquare_id;

                    rayPlace.lat = place.lat;
                    rayPlace.lng = place.lng;

                    var typesTmp = [];
                    if (place.types){
                        $.each(place.types, function(idx, type){
                            typesTmp.push(type);
                        });
                    }

                    rayPlace.placeinfo = {
                        name: place.name,
                        phone: place.phone,
                        address : place.address,
                        categories: typesTmp,
                    };

                    rayPlace.accessInfo = place.access_info;
                    rayPlace.customizedAccessInfo = place.customized_access_info;

                    //console.log(rayPlace);
                    placesColl.push(rayPlace);
                });

                //console.log("RayPlaces Retrieved");
                vent.trigger('places_retrieved', 
                        {places: placesColl, code: placeUtils.RAY_PLACES_CODE});
            });
        },

        retrievePlacesFromFoursquare: function(lat, lng, rad, vent) {
            var placesSearchURL = config.FOURSQUARE_SEARCH_URL + 
                    "client_id=" + config.FOURSQUARE_API_CLIENT + 
                    "&client_secret=" + config.FOURSQUARE_API_SECRET +
                    "&ll=" + lat + "," + lng +
                    "&v=" + config.FOURSQUARE_VERSION +
                    "&intent=browse" +
                    "&radius=" + rad;
            var placesColl = [];

            if (rad < config.FOURSQUARE_MAX_RAD){
                $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
                    options.xhrFields = {
                      withCredentials: false
                    };
                  });

                $.ajax({
                    type: 'GET',
                    url: placesSearchURL,
                    contentType: 'text/plain',
                })
                .done(function(data){
                    $.each(data.response.venues, function(idx, place){
                        var rayPlace = new PlaceModel();
                        rayPlace.ray_id = '';
                        rayPlace.google_id = '';
                        rayPlace.foursquare_id = place.id;

                        rayPlace.lat = place.location.lat;
                        rayPlace.lng = place.location.lng;

                        if (place.contact.phone)
                            tmpPhone = placeUtils.cleanIntPhone(place.contact.phone);
                        else
                            tmpPhone = "";

                        rayPlace.placeinfo = {
                            name: place.name,
                            address: place.location.address,
                            phone: tmpPhone,

                            categories: placeUtils.cleanFoursquareCategories(place.categories),
                        };

                        //console.log(place);
                        if (rayPlace.placeinfo.address)
                            placesColl.push(rayPlace);
                        //console.log(rayPlace);
                    });
                    
                    //console.log("Foursquare Places Retrieved");
                    vent.trigger('places_retrieved', 
                            {places: placesColl, code: placeUtils.FOURSQUARE_PLACES_CODE});
                });
            }
        },
    }
    
    return PlacesRetriever;
});