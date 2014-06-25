/**
 * Home view
 */
define([
    'app/views/desktop/navbar',
    'app/models/session',
    'utilities',
    'text!../../../../templates/desktop/home.html'
], function (NavBarView, Session, utilities, HomeTemplate) {

    var HomeView = Backbone.View.extend({
        initialize: function() {
            var that = this;

            this.navBarView = new NavBarView();
            
            Session.setAuth();
            Session.on('change:auth', function (session) {
                that.render();
            });
        },

        render:function () {
            this.setTemplate();

            $('#more_info_btn').click(function(event) {
                event.preventDefault();
                $("#places_modal").removeClass('hide');
            });
        },

        setTemplate: function(){
            var that = this;

            if ((typeof Session.get("auth") == 'undefined') ||
                Session.get("auth") == ''){
                utilities.applyTemplate($(that.el),HomeTemplate,{});
            } else if ((Session.get("auth") == 'user') || (Session.get("auth") == 'admin')){
                require('router').navigate("access", {trigger: true});
            }
        },

        events: {
        	"click button[id=signin-btn]": "signin",
            "focus input[type=text]": "reset_input",
            "focus input[type=password]": "reset_input",
            "click .new-acc-btn": "go_to_new_acc",
        },

        signin: function(event) {
        	event.preventDefault();
            var input_email = $("#input-email");
            var input_password = $("#input-password");

            var valid_input = true;

        	if (input_email.val() == ""){
                $("#userid-form-group").addClass("has-error");
                $("#userid-form-group").append(
                    '<span class="glyphicon glyphicon-remove form-control-feedback"></span>');

                if ($("#error-msg-container").children(".alert").length == 0)
                $("#error-msg-container").append(
                    '<div class="alert alert-danger">Please enter your User ID</div>')
                valid_input = false;
        	}

            if (input_password.val() == ""){
                $("#password-form-group").addClass("has-error");
                $("#password-form-group").append(
                    '<span class="glyphicon glyphicon-remove form-control-feedback"></span>');
                
                if ($("#error-msg-container").children(".alert").length == 0)
                $("#error-msg-container").append(
                    '<div class="alert alert-danger">Please enter your password</div>')
                valid_input = false;
            }

            if (valid_input == true){
                var creds = {};
                creds['email'] = input_email.val();
                creds['pwd'] = input_password.val();

                $("#signin-btn").html("Processing");
                $("#signin-btn").addClass('disabled');
                Session.login(creds);
            }
        },

        reset_input: function(event) {
            var cur = $(event.currentTarget);
            var form_group = cur.closest('.form-group');
            if (form_group.hasClass('has-error')) {
                form_group.removeClass('has-error');
                form_group.children('.form-control-feedback').remove();
            }

            $("#error-msg-container").empty();
        },

        go_to_new_acc: function(event) {
            event.preventDefault();

            require('router').navigate('signup', {trigger:true});
        },
    });

    return HomeView;
});