/**
 * Singup view
 */
define([
    'require',
    'utilities',
    'app/models/session',
    'text!../../../../templates/desktop/signup.html'
], function (require, utilities, Session, SignupTemplate) {
    var config = {
        USER_SIGNUP_URL : 'http://users-rayplaces.rhcloud.com/authenticate?query=signup'
    };

    var SignupView = Backbone.View.extend({
        initialize: function() {
            var that = this;
            
            Session.setAuth();
            Session.on('change:auth', function (session) {
                that.render();
            });
        },

        render:function () {
            if ((typeof Session.get("auth") == 'undefined') ||
                Session.get("auth") == ''){
                utilities.applyTemplate($(this.el), SignupTemplate,{});
                return this;
            } else {
                require('router').navigate("access", {trigger: true});
            }
        },

        events: {
        	"click .ray_home_btn": "go_to_ray_home",
            "click .create-acc-btn": "create_acc",
            "focus input": "reset_input"
        },

        go_to_ray_home: function(event) {
            window.location.href="http://www.project-ray.com";	
        },

        validatedInput : function(event){
            var validated = true;

            if ($("#input-password").val() != $("#input-repassword").val()){
                $("#input-password").addClass("has-error");
                $("#input-password").append(
                    '<span class="glyphicon glyphicon-remove form-control-feedback"></span>');

                $("#input-repassword").addClass("has-error");
                $("#input-repassword").append(
                    '<span class="glyphicon glyphicon-remove form-control-feedback"></span>');

                $("#error-msg-container").empty();
                $("#error-msg-container").append(
                    '<div class="alert alert-danger">Your passwords do not match</div>');

                validated = false;
            } else {
                if ($("#input-password").val().length < 6){
                    $("#input-password").addClass("has-error");
                    $("#input-password").append(
                        '<span class="glyphicon glyphicon-remove form-control-feedback"></span>');

                    $("#input-repassword").addClass("has-error");
                    $("#input-repassword").append(
                        '<span class="glyphicon glyphicon-remove form-control-feedback"></span>');

                    $("#error-msg-container").empty();
                    $("#error-msg-container").append(
                        '<div class="alert alert-danger">Your password must have at least 6 characters</div>');

                    validated = false;
                }
            }

            $('input').each(function(){
                if ($(this).val() == ""){
                    var parent = $(this).parents('.form-group');
                    //console.log(parent);
                    $(parent).addClass("has-error");
                    $(parent).append(
                        '<span class="glyphicon glyphicon-remove form-control-feedback"></span>');

                    if ($("#error-msg-container").children('.alert').length == 0){
                        $("#error-msg-container").empty();
                        $("#error-msg-container").append(
                            '<div class="alert alert-danger">All fields are compulsory</div>')
                    }

                    validated = false;
                }
            });

            return validated;
        },

        create_acc: function(event) {
            event.preventDefault();

            if (this.validatedInput()){
                var userJSON = {};
                userJSON.email = $('#input-email').val();
                userJSON.pwd = $('#input-password').val();
                userJSON.business = $('#input-businessname').val();
                userJSON.fname = $('#input-firstname').val();
                userJSON.lname = $('#input-lastname').val();
                userJSON.phone = $('#input-phone').val();

                //console.log(JSON.stringify(userJSON));
                $(event.target).addClass('disabled');

                var request = $.ajax({
                    url: config.USER_SIGNUP_URL,
                    type: 'POST',
                    contentType: 'application/json; charset=UTF-8',

                    success: function (msg, status, jqXHR) {
                        if (msg != ""){
                            $("#error-msg-container").empty();
                            $("#error-msg-container").append(
                                '<div class="alert alert-danger">' + msg + '</div>');
                        }
                    },
                    data: JSON.stringify(userJSON),
                });
                
                request.done(function(data){
                    $(event.target).removeClass('disabled');

                    var creds = {};
                    creds['user'] = $("#input-email").val();
                    creds['pwd'] = $("#input-password").val();
                    Session.login(creds);

                    require('router').navigate('', {trigger:true});
                });

                /*request.done(function(data){
                    $('#loading').hide('400');
                    $('#new_place_name_alert').text(placeJSON.name);
                    $('html,body').animate({
                        scrollTop: $('.accessibility-container').offset().top - 50},
                    400);
                    $('#new_place_added_alert').show('fast').delay(2000).slideUp('slow');
                });*/
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

    });

    return SignupView;
});