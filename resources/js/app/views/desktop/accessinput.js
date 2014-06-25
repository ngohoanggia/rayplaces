/**
 * SelectPlace view
 */
define([
    'utilities',
    'underscore',
    'text!../../../../templates/desktop/accessinput.html'
], function (utilities, _, AccessInputTemplate) {
    var config = {
    	ADD_NEW_PLACE_URL : "http://raynavdb-ngohgia.rhcloud.com/rayplaces?query=add_place",
    };

    var vent;
    var place;
    var inputFields;

    var customizedAccessIdx = -1;
    var customizedAccessName = [];
    var customizedAccessDesc = [];

    if(typeof(String.prototype.trim) === "undefined")
    {
        String.prototype.trim = function() 
        {
            return String(this).replace(/^\s+|\s+$/g, '');
        };
    }

    var AccessInputView = Backbone.View.extend({
        initialize: function(options){
            //console.log(options.location);
            vent = options.vent;

            //TODO update the inputFields according to category
            inputFields = ["greetings", "warnings", "staff-assistance", "restroom", "extra-access-input"];

            utilities.applyTemplate($(this.el), AccessInputTemplate,{});
            options.vent.bind('select_place', this.updatePlaceAccessInputs, this);
        },

        events : {
            "click .customized-access-item" : "updateCustomizedAccessInfoInputs",
            "click button[id=submit-place-btn]" : "submitAccessInfo",
            "click button[id=save-customized-access-btn]" : "saveCustomizedAccessInfo",
            "click button[id=reset-customized-access-btn]" : "resetCustomizedAccessInfo",
            "click button[id=remove-customized-access-btn]" : "removeCustomizedAccessInfo",
            "click a[id=new-customized-access-item]" : "addNewCustomizedAccessItem",
            "change input[id=customized-access-name]" : "onCustominzedAccessInputsChange",

            "focus input[id=customized-access-name], input[id=customized-access-desc]": "onCustomized",
        },

        onCustominzedAccessInputsChange: function (){
            customizedAccessName[customizedAccessIdx] = $('#customized-access-name').val();
            customizedAccessDesc[customizedAccessIdx] = $('#customized-access-desc').val();

            if ($('#customized-access-name').val().trim() == ""){
                $(".customized-access-item[data=" + customizedAccessIdx + "]").html("Untitled");
            } else {
                $(".customized-access-item[data=" + customizedAccessIdx + "]").html(
                    $('#customized-access-name').val());
            }
        },

        removeAlerts: function() {
            $("#error-msg-container").empty();
            $(".has-feedback").removeClass('has-error');  
        },

        updatePlaceAccessInputs: function(data){
            place = data;
            var accessInfo = place.accessInfo;
            console.log(accessInfo);

            $('.access-input').val("");
            for (var i= 0; i< accessInfo.length; i++){
                var info = accessInfo[i];

                for (key in info){
                    console.log(key);
                    var input = $('#' + key);

                    if (input.length){
                        input.val(info[key]);
                    }
                }
            }
            //place = data;

            customizedAccessIdx = -1;
            customizedAccessName = [];
            customizedAccessDesc = [];
            this.initCustomizedAccessData(place.customizedAccessInfo);
        },

        initCustomizedAccessData: function(accessData){
            console.log(accessData);

            for (var i= 0; i< accessData.length; i++){
                var info = accessData[i];

                for (key in info){
                    customizedAccessName.push(key);
                    customizedAccessDesc.push(info[key]);
                }
            }

            this.updateCustomizedAccessInfoList();

            if (customizedAccessName.length > 0){
                $(".customized-access-item[data=0]").trigger('click');
            }
        },

        updateCustomizedAccessInfoList: function(){
            $("#customized-access-list").empty();

            for (var i= 0; i< customizedAccessName.length; i++){
                var itemTitle;
                if (customizedAccessName[i].trim() == ""){
                    itemTitle = '<a href="#" class="list-group-item customized-access-item" data=' + i + 
                    '>Untitled</a>'
                } else {
                    itemTitle = '<a href="#" class="list-group-item customized-access-item" data=' + i + 
                    '>' + customizedAccessName[i] + '</a>'
                }

                $("#customized-access-list").append(itemTitle);
            }

            $("#customized-access-list").append(
                '<a href="#" class="list-group-item" id="new-customized-access-item">Add new item</a>'
                );

            $("#customized-access-list-container").height(
                $("#customized-access-container").height());
        },

        updateCustomizedAccessInfoInputs: function(e) {
            e.preventDefault();

            if (this.validNewCustomizedAccessItem()){
                if (customizedAccessIdx != $(e.currentTarget).attr('data')){
                    customizedAccessName[customizedAccessIdx] = $('#customized-access-name').val();
                    customizedAccessDesc[customizedAccessIdx] = $('#customized-access-desc').val();
                }

                customizedAccessIdx = $(e.currentTarget).attr('data');

                $(".customized-access-item").removeClass('active');
                $("#new-customized-access-item").removeClass('active');
                $(e.currentTarget).addClass('active');


                $('#customized-access-name').val(customizedAccessName[customizedAccessIdx]);
                $('#customized-access-desc').val(customizedAccessDesc[customizedAccessIdx]);
            }
        },

        resetCustomizedAccessInfo: function(e) {
            e.preventDefault();

            $('#customized-access-name').val(customizedAccessName[customizedAccessIdx]);
            $('#customized-access-desc').val(customizedAccessDesc[customizedAccessIdx]);
        },

        saveCustomizedAccessInfo: function(e){
            e.preventDefault();

            if (this.validNewCustomizedAccessItem()){
                customizedAccessName[customizedAccessIdx] = $('#customized-access-name').val();
                customizedAccessDesc[customizedAccessIdx] = $('#customized-access-desc').val();
            }
        },

        removeCustomizedAccessInfo: function(e){
            e.preventDefault();

            customizedAccessName.splice(customizedAccessIdx, 1);
            customizedAccessDesc.splice(customizedAccessIdx, 1);

            this.updateCustomizedAccessInfoList();

            if (customizedAccessName.length > 0){
                $(".customized-access-item[data=0]").trigger('click');
            } else {
                $('#customized-access-name').val("");
                $('#customized-access-desc').val("");
            }
        },

        addNewCustomizedAccessItem: function(e) {
            e.preventDefault();

            if (this.validNewCustomizedAccessItem()){
                customizedAccessName[customizedAccessIdx] = $('#customized-access-name').val();
                customizedAccessDesc[customizedAccessIdx] = $('#customized-access-desc').val();

                customizedAccessName.push("");
                customizedAccessDesc.push("");

                customizedAccessIdx =  customizedAccessName.length - 1;

                this.updateCustomizedAccessInfoList();

                $(".customized-access-item").removeClass('active');
                $(".customized-access-item[data=" + customizedAccessIdx + "]").addClass('active');
                $(".customized-access-item[data=" + customizedAccessIdx + "]").trigger('click');

                if ($("#customized-access-list").height() > $("#customized-access-inputs-container").height())
                   $("#customized-accessibility-row").height($("#customized-access-list").height() + 20);

                // If the newly added is the first item
                if (customizedAccessName.length == 1){
                    $("#error-msg-container").empty();
                    $(".has-feedback").removeClass('has-error');
                }
            }
        },

        // When an item on the list is selected, check if the new item is not empty
        validNewCustomizedAccessItem: function(e){
            if (customizedAccessIdx >= 0 && 
                ($("#customized-access-name").val().trim() == "" || 
                $("#customized-access-desc").val().trim() == "")){

                    $("#customized-access-name-container").removeClass("has-error");
                    $("#customized-access-desc-container").removeClass("has-error");
                    
                    $("#customized-access-name-container").addClass("has-error");
                    $("#customized-access-desc-container").addClass("has-error");

                    $("#error-msg-container").empty();
                    $("#error-msg-container").append(
                        '<div class="alert alert-danger">The accessibility item\'s name and description are both required</div>')
                    return false;
            } else {
                $("#error-msg-container").empty();
                $("#customized-access-name-container").removeClass("has-error");
                $("#customized-access-desc-container").removeClass("has-error");

                return true;
            }
        },

        submitAccessInfo: function(e){
            e.preventDefault();

            $("#save-customized-access-btn").trigger('click');

            if ($("#error-msg-container").children().length == 0){
                $("#submit-place-btn").addClass('disabled');
                $("#submit-place-btn").html("Processing");
                var accessInput = [];
                var customizedAccessInfo = [];

                for (var i= 0; i< inputFields.length; i++){
                    var info = {};
                    info[inputFields[i]] = $('#' + inputFields[i]).val();
                    accessInput.push(info);
                };

                for (var i= 0; i< customizedAccessName.length; i++){
                    var info = {};
                    info[customizedAccessName[i]] = customizedAccessDesc[i];
                    customizedAccessInfo.push(info);
                };

                this.submitPlaceToServer(accessInput, customizedAccessInfo);
            }
        },

        submitPlaceToServer: function(accessInput, customizedAccessInfo){
            $('#loading').show();

            console.log(place);
            var placeJSON = {};
            placeJSON.uid = "";         //TODO CHANGE THIS
            placeJSON.created_by = "";  // May be obsolete
            placeJSON.id = place.ray_id;
            placeJSON.google_id = place.google_id;
            placeJSON.google_ref = place.google_ref;
            placeJSON.foursquare_id = place.foursquare_id;
            placeJSON.categories = place.placeinfo.categories;
            placeJSON.phone = place.placeinfo.phone;
            placeJSON.address = place.placeinfo.address;
            placeJSON.lat = place.lat;
            placeJSON.lng = place.lng;
            placeJSON.is_public = true;      // TODO

            placeJSON.name = $('#place-name-input').val();
            placeJSON.address = $('#place-address-input').val();     // Change this on the server
            placeJSON.access_info = accessInput;
            placeJSON.customized_access_info = customizedAccessInfo;
            console.log(JSON.stringify(placeJSON));

            //tmp = {"uid":"","created_by":"","id":"","google_id":"fb75644fc894f25ee0197bc57c30067e5798df1a","google_ref":"CnRvAAAAOwC7dQTwgWxCf4hSJDPg9rqqwx4mXfG3HDUQQ1ZW4zq66APdG66NFbL0hir8AuI85qY67JIWboMDjhO6aCmghU1PuDrR-QuR6JrGCMw0LS5FKRcdOiFPuHHQyETE3QVRwnGmHkbCl6PGhC_z-WnPhRIQfC2WqxieWp55fWjEw8uM9RoUg16P7zlcLndD9ibwHM0wZ0VVptM","foursquare_id":"","type":"establishment","phone":"+972 3-575-5622","lat":32.08415,"lng":34.80135100000007,"ispublic":true,"name":"Alim yerukim","address":"Tuval St 23, Ramat Gan, Israel","access_info":"accessInput"};


            $.ajaxPrefilter( function( options, originalOptions, jqXHR ) {
                options.xhrFields = {
                  withCredentials: true
                };
            });

            var request = $.ajax({
                url: config.ADD_NEW_PLACE_URL,
                type: 'POST',
                contentType: 'application/json; charset=UTF-8',
                dataType: 'text',
                success: function (data) {
                    console.log("Data added successfully");
                },
                data: JSON.stringify(placeJSON),
            });
            
            request.done(function(data){
                $("#submit-place-btn").removeClass('disabled');
                $("#submit-place-btn").html("Submit");

                $('#loading').hide('400');
                $('#new_place_name_alert').text(placeJSON.name);
                $('html,body').animate({
                    scrollTop: $('.accessibility-container').offset().top - 50},
                400);
                $('#new_place_added_alert').show('fast').delay(5000).slideUp('slow');

                vent.trigger('update_places', {});
            });
        },
    });

    return AccessInputView;
});