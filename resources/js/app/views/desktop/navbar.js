/**
 * SelectPlace view
 */
define([
    'require',
    'app/models/session',
    'utilities',
    'text!../../../../templates/desktop/nav_noauth.html',
    'text!../../../../templates/desktop/nav_authed.html',
    'text!../../../../templates/desktop/nav_manager.html'
], function (require, Session, utilities, NavNoAuthTemplate, NavAuthedTemplate, NavManagerTemplate) {
    var NavBarView = Backbone.View.extend({
        initialize: function(options){
            var that = this;
            
            Session.setAuth();
            Session.on('change:auth', function (session) {
                that.render();
            });

            $("#about-nav").click(function(event) {
                event.preventDefault();
                $("#places_modal").removeClass('hide');
            });
        },

        render:function () {
            if ((typeof Session.get("auth") == 'undefined') ||
                Session.get("auth") == ''){
                utilities.applyTemplate($('#navbar-container'),NavNoAuthTemplate,{});
            } else if (Session.get("auth") == 'user') {
                utilities.applyTemplate($('#navbar-container'),NavAuthedTemplate,{});
                $('#user-dropdown').html(Session.get("email"));
                $("#signout_item").click(function(){
                    Session.logout();
                });
            } else if (Session.get("auth") == 'admin') {
                utilities.applyTemplate($('#navbar-container'),NavManagerTemplate,{});
                $('#user-dropdown').html(Session.get("email"));
                $("#signout_item").click(function(){
                    Session.logout();
                });
                $("#manager_item").click(function(event){
                    event.preventDefault();
                    require('router').navigate('manager', {trigger:true});
                });
            }
        },
    });

    return NavBarView;
});