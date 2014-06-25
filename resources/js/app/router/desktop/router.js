define("router", [
    'jquery',
    'underscore',
    'configuration',
    'utilities',
    'app/models/session',
    'app/views/desktop/home',
    'app/views/desktop/signup',
    'app/views/desktop/accessibility',
    'app/views/desktop/manager',
    'text!../templates/desktop/main.html',
    'text!../templates/desktop/nav_noauth.html',
],function ($,
            _,
            config,
            utilities,
            Session,
            HomeView,
            SignupView,
            AccessibilityView,
            ManagerView,
            MainTemplate,
            NavbarNoAuthTemplate) {

    $(document).ready(new function() {
       utilities.applyTemplate($('#body-content'), MainTemplate);
       utilities.applyTemplate($('#navbar-container'), NavbarNoAuthTemplate);
       //utilities.viewManager.showView(new HomeView({el:$("#content")}));
    })

    var vent = _.extend({}, Backbone.Events);
    /**
     * The Router class contains all the routes within the application -
     * i.e. URLs and the actions that will be taken as a result.
     *
     * @type {Router}
     */

    var Router = Backbone.Router.extend({
        initialize: function() {
            var that = this;
            //Begin dispatching routes
            //vent.bind('place_selected', this.accessibility, this);
            //Backbone.history.start();
            /*Session.getAuth(function () {});

            var that = this;
            // Bind to the Session auth attribute so we
            // make our view act recordingly when auth changes
            Session.on('change:user', function (session) {
                that.render();
            });*/

            Backbone.history.start();
            //console.log(Session.getAuth());

            /*Session.on('change:auth', function (session) {
                console.log(Session.get('auth'));
                that.render();
            });*/
        },

        routes : {
            "": "home",
            "signup": "signup",
            "newplace": "newplace",
            "access": "access",
            "manager": "manager",
        },

        render: function(){
           
        },

        // home route
        home : function(){
            utilities.viewManager.showView(new HomeView({el:$("#content")}));
        },

        // signup route
        signup : function() {
            utilities.viewManager.showView(new SignupView({el:$("#content")}));
        },

        // accessibility route
        access: function(place) {
            utilities.viewManager.showView(new AccessibilityView({
                el:$("#content"),
                vent: vent}));           
        },

        // manager route
        manager: function() {
            console.log("ManagerView");
            utilities.viewManager.showView(new ManagerView({el:$("#content")}));
        },
    });

    // Create a router instance
    var router = new Router();

    return router;
});