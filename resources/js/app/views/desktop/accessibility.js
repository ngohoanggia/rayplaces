/**
 * SelectPlace view
 */
define([
    'utilities',
    'underscore',
    'app/models/session',
    'app/models/place',
    'app/views/desktop/selectplace',
    'app/views/desktop/placeinfo',
    'app/views/desktop/accessinput',
    'app/views/desktop/navbar',
    'text!../../../../templates/desktop/accessibility.html'
], function (utilities, _, Session, PlaceModel, SelectPlaceView, PlaceInfoView, AccessibilityInputView, NavBarView, AccessibilityTemplate) {
    var vent;
    var AccessbilityView = Backbone.View.extend({
        initialize: function(options){
            var that = this;

            this.navBarView = new NavBarView();

            Session.setAuth();
            Session.on('change:auth', function (session) {
                that.render();
            });

            vent = options.vent;
        },

        render: function(){
            if ((typeof Session.get("auth") == 'undefined') ||
                Session.get("auth") == ''){
                require('router').navigate("", {trigger: true});
            } else {
                utilities.applyTemplate($(this.el), AccessibilityTemplate,{});
                this.selectPlaceView = new SelectPlaceView({
                    el: $("#selectplace-container"),
                    vent: vent
                });

                this.placeInfoView = new PlaceInfoView({
                    el: $('#placeinfo-container'),
                    vent: vent
                });

                this.accessInputView = new AccessibilityInputView({
                    el: $('#access-container'),
                    vent: vent
                });
            }
        }
    });

    return AccessbilityView;
});