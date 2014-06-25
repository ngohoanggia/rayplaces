define([
  'require',
  'underscore',
  'backbone'
], function(require, _, Backbone) {
  var SessionModel = Backbone.Model.extend({
    urlRoot: 'http://rayusers-ngohgia.rhcloud.com/authenticate?query=getsession',

    initialize: function () {
      var that = this;
      // Hook into jquery
      // Use withCredentials to send the server cookies
      // The server must allow this through response headers
      $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
        options.xhrFields = {
          withCredentials: true
        };
        // If we have a csrf token send it through with the next request
        if(typeof that.get('_csrf') !== 'undefined') {
          jqXHR.setRequestHeader('X-CSRF-Token', that.get('_csrf'));
        }
      });
    },

    login: function(creds) {
      var that = this;
      var loginUrl = 'http://rayusers-ngohgia.rhcloud.com/authenticate?query=signin';

      $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
        options.xhrFields = {
          withCredentials: true
        };
      });

      $.ajax({
            url: loginUrl,
            type: "post",
            data: creds,
      })
      .done(function(data, resp){
        //console.log(resp);
        $("#signin-btn").html("Sign in");
        $("#signin-btn").removeClass('disabled');

        if(resp == "success")
          location.reload();
        else {
          $("#error-msg-container").empty();
          $("#error-msg-container").append(
            '<div class="alert alert-danger">Oops. Invalid email or password.</div>')
        }
      });
    },

    logout: function() {
      var that = this;
      var logoutUrl = 'http://rayusers-ngohgia.rhcloud.com/authenticate?query=signout';
      console.log("try logout");

      $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
        options.xhrFields = {
          withCredentials: true
        };
      });
      
      $.ajax({
        url: logoutUrl,
        type: "post",

        success: function(model, resp){
          that.clearAuth();
          console.log("logout");
        }
      });
    },

    setAuth: function(callback) {
      // getAuth is wrapped around our router
      // before we start any routers let us see if the user is valid
      var that = this;

      this.fetch({
        success: function(model, resp){
          console.log(resp);
          that.set({auth:resp.auth});
          that.set({email:resp.email});
        }
      });
    },

    clearAuth: function(callback) {
      this.set({auth:""});
      this.set({email:""});
    },
  });
  return new SessionModel();

});