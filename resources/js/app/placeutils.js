define([
    'jquery',
    'app/models/place',
], function($, PlaceModel){
    var DUPLICATION_DIST_THRES = 10.0;
    var LEVENSHSTEIN_DIST_THRES = 5;

    var GENERIC_PLACE_CATEGORIES = [
        "administrative_area_level_1",
        "administrative_area_level_2",
        "administrative_area_level_3",
        "colloquial_area",
        "country",
        "floor",
        "geocode",
        "intersection",
        "locality",
        "natural_feature",
        "neighborhood",
        "political",
        "point_of_interest",
        "post_box",
        "postal_code",
        "postal_code_prefix",
        "postal_town",
        "premise",
        "room",
        "route",
        "street_address",
        "street_number",
        "sublocality",
        "sublocality_level_4",
        "sublocality_level_5",
        "sublocality_level_3",
        "sublocality_level_2",
        "sublocality_level_1",
        "subpremise",
        "transit_station",
    ];

    var placeutils = {
        RAY_PLACES_CODE : 0,
        GOOGLE_PLACES_CODE : 1,
        FOURSQUARE_PLACES_CODE : 2,

        cleanIntPhone : function(number){
            result = number;
            if (result){
                result = result.replace(/-/g, '');
                result = result.replace(/ /g, '');
            } else
                result = "";
            return result;
        },

        cleanGoogleCategories : function(categories){
            result = [];
            for (var i=0; i< categories.length; i++)
                if ($.inArray(categories[i], GENERIC_PLACE_CATEGORIES) == -1)
                    result.push(categories[i].toLowerCase());
            return result;
        },

        cleanFoursquareCategories : function(categories){
            result = [];
            for (var i=0; i< categories.length; i++){

                result.push(categories[i].name.toLowerCase());
            }
            return result;
        },

        combinePlaces: function(rayplaces, gplaces, fsplaces){
            console.log("Ray Places: ");
            console.log(rayplaces.length);

            console.log("Google Places: ");
            console.log(gplaces.length);

            console.log("Foursquare Places: ");
            console.log(fsplaces.length);

            nearbyPlaces = [];
            for (var i= 0 ; i< rayplaces.length; i++){
                nearbyPlaces.push(rayplaces[i]);
            }

            var curSize = rayplaces.length;

            for (var i= 0 ; i< gplaces.length; i++){
                var duplicated = false;
                
                for (var j= 0; j < curSize; j++){
                    if (this.checkDuplicatedPlace(gplaces[i], nearbyPlaces[j])){
                        duplicated = true;
                        break;
                    }
                }

                if (!duplicated)
                    nearbyPlaces.push(gplaces[i]);
            }

            curSize = nearbyPlaces.length;
            for (var i= 0 ; i< fsplaces.length; i++){
                var duplicated = false;
                
                for (var j= 0; j < curSize; j++){
                    if (this.checkDuplicatedPlace(fsplaces[i], nearbyPlaces[j])) {
                        duplicated = true;
                        break;
                    }
                }

                if (!duplicated)
                    nearbyPlaces.push(fsplaces[i]);
            }

            return  nearbyPlaces;
        },

        // Get distance between two sets of coordinates
        getDist : function(lat_1, lon_1, lat_2, lon_2) {
        // source: http://www.movable-type.co.uk/scripts/latlong.html
            var dLon = lon_2 - lon_1;
            var dLat = lat_2 - lat_1;
            lat_1 = this.toRadians(lat_1);
            lon_1 = this.toRadians(lon_1);
            lat_2 = this.toRadians(lat_2);
            lon_2 = this.toRadians(lon_2);
            dLon = this.toRadians(dLon);
            dLat = this.toRadians(dLat);

            var r = 6378137; // km
            var a = Math.sin(dLat/2)*Math.sin(dLat/2) +
                    Math.cos(lat_1)*Math.cos(lat_2) *
                            Math.sin(dLon/2)*Math.sin(dLon/2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
            return c*r;
        },

        toRadians : function(deg){
            return deg * Math.PI / 180.0;
        },

        checkDuplicatedPlace : function(place1, place2){
            var lat1 = place1.lat;
            var lng1 = place1.lng;
            var lat2 = place2.lat;
            var lng2 = place2.lng;

            var name1 = place1.placeinfo.name.toLowerCase();
            var name2 = place2.placeinfo.name.toLowerCase();

            name1 = name1.replace(/ /g, "");
            name1 = name1.replace(/-/g, "");

            name2 = name2.replace(/ /g, "");
            name2 = name2.replace(/-/g, "");

            if (name1.indexOf(name2) > -1)
                return true;
            if (name2.indexOf(name1) > -1)
                return true;

            if (this.getDist(lat1, lng1, lat2, lng2) < DUPLICATION_DIST_THRES){
                return true;
            }

           if (this.getLevenshteinDist(name1, name2) < LEVENSHSTEIN_DIST_THRES){
                return true;
            }

            return false;
        },

        getLevenshteinDist : function(a, b) {
            if(a.length === 0) return b.length; 
            if(b.length === 0) return a.length; 
         
            var matrix = [];
         
            var i;
            for(i = 0; i <= b.length; i++){
                matrix[i] = [i];
            }
         
            var j;
            for(j = 0; j <= a.length; j++){
                matrix[0][j] = j;
            }
         
            for(i = 1; i <= b.length; i++){
                for(j = 1; j <= a.length; j++){
                    if(b.charAt(i-1) == a.charAt(j-1)){
                        matrix[i][j] = matrix[i-1][j-1];
                    } else {
                            matrix[i][j] = Math.min(matrix[i-1][j-1] + 1, // substitution
                                    Math.min(matrix[i][j-1] + 1, // insertion
                                             matrix[i-1][j] + 1)); // deletion
                    }
                }
            }
            return matrix[b.length][a.length];
        }
    }

	return placeutils;
});