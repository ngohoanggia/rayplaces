/**
 * SelectPlace view
 */
define([
    'utilities',
    'underscore',
    'app/views/desktop/infoinput',
    'text!../../../../templates/desktop/placeinfo.html'
], function (utilities, _, InfoInputView, PlaceInfoTemplate) {
    var PlaceInfoView = Backbone.View.extend({
        initialize: function(options){
            //console.log(options.location);
            this.vent = options.vent;
            utilities.applyTemplate($(this.el), PlaceInfoTemplate,{});

            this.infoinput = new InfoInputView({
                el:$('#infoinput-container'), 
                vent: options.vent,
            });
        },
    });

    return PlaceInfoView;
});