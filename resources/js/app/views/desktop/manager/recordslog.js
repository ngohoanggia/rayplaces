/**
 * Home view
 */
define([
    'utilities',
    'text!../../../../../templates/desktop/recordslog.html'
], function (utilities, RecordsLogTemplate) {
    var config = {
        RECORDS_DB_QUERY : "http://api-rayplaces.rhcloud.com/rayplaces?query=view_recordings",
        RECORDS_SIZE_QUERY : "http://api-rayplaces.rhcloud.com/rayplaces?query=get_records_db_size"
    };

    var start;
    var size = 50;
    var count;
    var vent;

    var RecordsLogView = Backbone.View.extend({
        initialize: function(){
            vent = _.extend({}, Backbone.Events);

            vent.bind("retrieve_records", this.retrieveRecords, this);
            vent.bind("display_records", this.displayRecords, this);
        },

        render:function () {
            utilities.applyTemplate($(this.el), RecordsLogTemplate,{});
            var getRecordsDbSizeURL = config.RECORDS_SIZE_QUERY;
            $.ajax({
                type: 'GET',
                url: getRecordsDbSizeURL,
                contentType: 'text/plain',
                xhrFields: {
                    withCredentials: false
                },
                headers: {},
            })
            .done(function(data){
                count = Number(data);
                //console.log(data);

                $('#records_number').text(count);

                start = count - size;
                vent.trigger("retrieve_records");
            });

            return this;
        },

        events: {
            'click .previous[tbl="records"]' : "prevPage",
            'click .next[tbl="records"]' : "nextPage"
        },

        retrieveRecords: function() {
            if (start < 0)
                start = 0;
            if (start > count)
                start = count - size;

            if (start <= 0){
                if (! $('.previous[tbl="records"]').hasClass('disabled'))
                    $('.previous[tbl="records"]').addClass('disabled');
            } else {
                if ($('.previous[tbl="records"]').hasClass('disabled'))
                    $('.previous[tbl="records"]').removeClass('disabled');
            }

            if (start + size - 1 >= count){
                if (! $('.next[tbl="records"]').hasClass('disabled'))
                    $('.next[tbl="records"]').addClass('disabled');
            } else {
                if ($('.next[tbl="records"]').hasClass('disabled'))
                    $('.next[tbl="records"]').removeClass('disabled');
            }

            var retrieveRecordsURL = config.RECORDS_DB_QUERY +
                "&start=" + start +
                "&size=" + size;
            $.ajax({
                type: 'GET',
                url: retrieveRecordsURL,
                contentType: 'text/plain',
                xhrFields: {
                    withCredentials: false
                },
                headers: {},
            })
            .done(function(data){
                console.log(data);
                var result = $.parseJSON(data);

                vent.trigger("display_records", result);
            });
        },

        displayRecords: function(data){
            $("#log-tbl tbody").empty();
            records = data.result;
            //console.log(records);

            for (var i= 0; i< records.length; i++){
                var new_row = "<tr>";
                var record = records[i];

                var ts = new Date(record.ts);
                new_row = new_row + "<td>" + (start + i + 1) + "</td>";
                new_row = new_row + "<td>" + ts + "</td>";
                new_row = new_row + "<td>" + record._id["$oid"] + "</td>";
                new_row = new_row + "<td>" + record.userId + "</td>";
                new_row = new_row + "<td>" + record.placeId + "</td>";
                new_row = new_row + "<td>" + "</td>";

                new_row += "</tr>";
                $("#log-tbl tbody").append(new_row);
            }
        },

        prevPage: function(e){
            e.preventDefault();

            if ($('.previous[tbl="records"]').hasClass('disabled') == false){
                start -= size;
                this.retrieveRecords();
            }
        },

        nextPage: function(e){
            e.preventDefault();
            if ($('.next[tbl="records"]').hasClass('disabled') == false){
                start += size;
                this.retrieveRecords();
            }
        }
    });

    return RecordsLogView;
});