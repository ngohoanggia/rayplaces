/**
 * SelectPlace view
 */
define([
    'jquery',
    'utilities',
    'underscore',
    'text!../../../../templates/desktop/infoinput.html'
], function ($, utilities, _, InfoInputTemplate) {
    var vent;

    var InfoInputView = Backbone.View.extend({
        initialize: function(options){
            //console.log(options.location);
            vent = options.vent;

            utilities.applyTemplate($(this.el), InfoInputTemplate,{});
            options.vent.bind('select_place', this.updatePlaceInfoInputs, this);
        },

        events : {
            "click .category_item" : "selectCategory"
        },

        selectCategory : function(e){
            e.preventDefault();
        }, 

        updatePlaceInfoInputs : function(place){
            $('html,body').animate({
                scrollTop: $("#placeinfo-container").offset().top - 50},
            'slow');

            if (place.placeinfo.name && place.placeinfo.name != ""){
                $('#place-name-input').val(place.placeinfo.name);
            } else {
                $('#place-name-input').val("");
            }

            if (place.placeinfo.address && place.placeinfo.address != ""){
                $('#place-address-input').val(place.placeinfo.address);
            } else {
                $('#place-address-input').val("");
            }
        }
    });

    return InfoInputView;
});