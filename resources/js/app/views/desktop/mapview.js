define([
    'jquery',
    'underscore',
    'utilities',
    'backbone',
    'gmap',
    'app/models/place',
    'app/placesretriever',
    'app/placeutils',
    'libs/infobox',
    'text!../../../../templates/desktop/map.html'
], function($, _, utilities, Backbone, GoogleMap, PlaceModel, PlacesRetriever, placeUtils, InfoBox, MapTemplate){
    var vent;
    var infowindow = new google.maps.InfoWindow();
    var ZOOM_LVL = 17;

    var blindFriendlyIcon = 'resources/img/blind_friendly.png';
    var blindUnfriendlyIcon = 'resources/img/blind_unfriendly.png';
    var blindFriendlyIconSel = 'resources/img/blind_friendly_sel.png';
    var blindUnfriendlyIconSel = 'resources/img/blind_unfriendly_sel.png';

    var MapView = Backbone.View.extend({
        initialize: function(options){
            vent = options.vent;
            vent.bind('googlerefs_done', this.extractFromGooglePlaces, this);
            vent.bind('get_google_place_details', this.getGooglePlaceDetails, this);

            vent.bind('new_location', this.updateMap, this);

            utilities.applyTemplate($(this.el), MapTemplate,{});

            this.map = new google.maps.Map($('.map-canvas')[0], {
                zoom: ZOOM_LVL,
                position: new google.maps.LatLng(null, null),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            });

            this.placesService = new google.maps.places.PlacesService(this.map);

            var ibOptions = {
                content: "",
                disableAutoPan: false,
                maxWidth: 0,
                pixelOffset: new google.maps.Size(-140, 0),
                zIndex: null,
                boxStyle: { 
                  opacity: 1.0,
                  width: "280px",
                },
                closeBoxMargin: "11px 5px 5px 5px",
                closeBoxURL: "http://www.google.com/intl/en_us/mapfiles/close.gif",
                infoBoxClearance: new google.maps.Size(1, 1),
                disableAutoPan: true,
                isHidden: false,
                pane: "floatPane",
                enableEventPropagation: false,
            };
            this.infoBox = new InfoBox(ibOptions);
            
            var map = this.map;

            google.maps.event.addListener(map, 'center_changed', function() {
                //$('#loading').show();
            });

            google.maps.event.addListener(this.map, 'tilesloaded', function() { 
                var bounds = map.getBounds();

                var center = bounds.getCenter();
                var ne = bounds.getNorthEast();
                var searchRad = placeUtils.getDist(center.lat(), center.lng(), ne.lat(), ne.lng());
                console.log("Search rad: " + searchRad);

                vent.trigger('update_places', {location: center, rad: searchRad});
            });
        },

        render: function(){
            //console.log(thiplacesService);

            if (navigator && navigator.geolocation) {
                var map = this.map;
            

                navigator.geolocation.getCurrentPosition(
                    function(position) {
                        var pos = new google.maps.LatLng(
                            position.coords.latitude,
                            position.coords.longitude
                        );
                        map.setCenter(pos);
                    }, function(e) {
                        switch(e){
                            case 1:
                                console.log('The user denied the request for location information.');
                                break;
                            case 2:
                                console.log('Your location information is unavailable.');
                                break;
                            case 3:
                                console.log('The request to get your location timed out.');
                                break;
                            default:
                                console.log('default');
                        }
                    });
            }
        },

        updateMap:function(location){
            if (!location){
                c = this.map.getCenter();
                location = new google.maps.LatLng(c.lat(), c.lng());
            } else {
                console.log("Update map")
                console.log(location)   

                this.map.setCenter( location);
                this.map.setZoom(ZOOM_LVL);
            }
        },

        updatePlaces: function(data){
            var location = data.location;
            var searchRad = data.rad;
            
            if (!location){
                c = this.map.getCenter();
                location = new google.maps.LatLng(c.lat(), c.lng());
            }

            if (searchRad == null || searchRad == 0)
                searchRad = 500;

            console.log(location);
            console.log(searchRad);
            placesRequest = {
                location: location,
                radius: searchRad,
                type: []
            }

            this.placesService.nearbySearch(placesRequest, this.retrievePlacesFromGoogle);
            PlacesRetriever.retrievePlacesFromRayServer(location.lat(), location.lng(), searchRad, vent);
            PlacesRetriever.retrievePlacesFromFoursquare(location.lat(), location.lng(), searchRad, vent);
        },

        retrievePlacesFromGoogle: function(places, status){
            var placesColl = [];
            if (status == google.maps.places.PlacesServiceStatus.OK) {
                $.each(places, function(idx, place){
                    var rayPlace = new PlaceModel();
                    rayPlace.ray_id = "";
                    rayPlace.google_id = place.id;
                    rayPlace.google_ref = place.reference;
                    rayPlace.foursquare_id = "";

                    rayPlace.lat = place.geometry.location.lat();
                    rayPlace.lng = place.geometry.location.lng();

                    rayPlace.placeinfo = {
                        name: place.name,
                        phone: "",
                        address : "",       //TODO CHANGE THIS ON THE SERVER
                        categories: placeUtils.cleanGoogleCategories(place.types),
                    }

                    placesColl.push(rayPlace);
                }); 

                vent.trigger('places_retrieved', 
                    {places: placesColl, code: placeUtils.GOOGLE_PLACES_CODE});
            }
        },

        showMarkers : function(markers, places){
            for (var i= 0; i< places.length; i++){
                var icon;
                var accessible;
                if (places[i].ray_id == ""){
                    icon = blindUnfriendlyIcon;
                    accessible = false;
                } else {
                    icon = blindFriendlyIcon;
                    accessible = true;
                }

                var place = places[i];

                var marker = new google.maps.Marker({
                    icon: icon,
                    position: new google.maps.LatLng(places[i].lat, places[i].lng),
                    map: this.map,
                    //animation: google.maps.Animation.DROP,
                    //title: place.placeinfo.name,
                    accessible: accessible,
                    selected: false,
                });

                google.maps.event.addListener(marker, 'click', 
                    this.selectPlaceCallback(place, marker, markers));
                google.maps.event.addListener(marker, 'mouseover', 
                    this.getPlaceInfoCallback(this.map, this.placesService, place, marker, this.infoBox));
                google.maps.event.addListener(marker, 'mouseout', 
                    this.setMouseOutMarkerCallback(marker));

                markers.push(marker);
                marker.setMap(this.map);
            }

            //console.log($('#loading'));
            //$('#loading').hide('400');
        },

        getGooglePlaceDetails : function(places){
            for (var i= 0; i< places.length; i++){
                var request = {
                    reference : places[i].google_ref,
                }
            }
        },

        selectPlaceCallback : function(place, sel_marker, markers){
            return function(){
                for (var i= 0; i< markers.length; i++){
                    if (markers[i].accessible == true){
                        markers[i].setIcon(blindFriendlyIcon);
                        markers[i].selected = false;
                    } else {
                        markers[i].setIcon(blindUnfriendlyIcon);
                        markers[i].selected = false;
                    }
                }

                if (sel_marker.accessible == true){
                    sel_marker.setIcon(blindFriendlyIconSel);
                    sel_marker.selected = true;
                } else {
                    sel_marker.setIcon(blindUnfriendlyIconSel);
                    sel_marker.selected = true;
                }

                vent.trigger('select_place', place);
            }
        },

        setMouseOutMarkerCallback : function(marker){
            return function(){
                if (marker.selected == false){
                    if (marker.accessible == true)
                        marker.setIcon(blindFriendlyIcon);
                    else
                        marker.setIcon(blindUnfriendlyIcon);
                }
            }
        },

        getPlaceInfoCallback : function(map, placesService, place, marker, infobox){
            return function(){
                setMouseOverMarker(marker, blindFriendlyIconSel, blindUnfriendlyIconSel);

                if (place.google_ref == ""){
                    showPlaceInfo(map, place, marker, infobox);
                } else {
                    var request = {
                        reference: place.google_ref,
                    }

                    placesService.getDetails(request, function(placeDetails, status) {
                        if (status == google.maps.places.PlacesServiceStatus.OK) {
                            place.placeinfo.phone = placeDetails.international_phone_number;
                            place.placeinfo.address = placeDetails.formatted_address;

                            showPlaceInfo(map, place, marker, infobox);
                            //vent.trigger('show_place_info', {place: place, marker: marker, iw: iw});
                        }
                    });
                }

                function setMouseOverMarker(marker){
                    
                    if (marker.accessible == true){
                        marker.setIcon(blindFriendlyIconSel);
                    } else {
                        marker.setIcon(blindUnfriendlyIconSel);
                    }
                }

                function showPlaceInfo(map, place, marker, infoBox){
                    //vent.trigger('select_place', place);
                    var contentString = 
                        '<div class="arrow"></div>' +
                        '<div class="place-infobox">' +
                            '<div class="infobox-content">'+
                                '<p><b>' + place.placeinfo.name + '</b></p>'+
                                '<div id="bodyContent">';
                    if (marker.accessible == true){   
                        contentString += '<div class="accessible">' +         
                                '<p><span class="glyphicon glyphicon-ok-sign infobox-glyph"></span>' +
                                'Accessibility information available</p>' +
                                '</div>';
                    } else {
                        contentString += '<div class="not-accessible">' +         
                                '<p><span class="glyphicon glyphicon-exclamation-sign infobox-glyph"></span>' +
                                'Enter accessibility information</p>' +
                                '</div>';
                    }

                    if (place.placeinfo.address != "")
                        contentString += 
                                ('<p>Address: ' + place.placeinfo.address + '</p>');
                    if (place.placeinfo.phone != "")
                        contentString += 
                                ('<p>Tel: ' + place.placeinfo.phone + '</p>');

                    contentString += '<p><muted> Retrieved from: ';
                    var sources = [];
                    if (place.ray_id != "")
                        sources.push('Ray Places');
                    if (place.google_id != "")
                        sources.push('Google Places');
                    if (place.foursquare_id != "")
                        sources.push('Foursquare');
                    contentString += sources.join(", ");
                    contentString += '</muted></p>';

                    contentString += 
                                ('</div>' + 
                            '</div>' +
                        '</div>');

                    //infowindow.content = "Hello";

                    infoBox.setContent(contentString);
                    infoBox.open(map, marker);
                }
            };
        },


        clearMarkers : function(markers){
            for (var i= 0; i< markers.length; i++)
                markers[i].setMap(null);
        }
    });

    return MapView;
});
