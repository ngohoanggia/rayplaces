/**
 * Home view
 */
define([
    'utilities',
    'text!../../../../../templates/desktop/logs.html'
], function (utilities, LogsTemplate) {
    var config = {
        LOGS_DB_QUERY : "http://api-rayplaces.rhcloud.com/rayplaces?query=view_logs",
        LOGS_DB_SIZE_QUERY : "http://api-rayplaces.rhcloud.com/rayplaces?query=get_logs_db_size"
    };

    var start;
    var size = 50;
    var count;
    var vent;

    var LogsView = Backbone.View.extend({
        initialize: function(){
            vent = _.extend({}, Backbone.Events);

            vent.bind("retrieve_logs", this.retrieveLogs, this);
            vent.bind("display_logs", this.displayLogs, this);
        },

        render:function () {
            utilities.applyTemplate($(this.el), LogsTemplate,{});
            var getLogsDbSizeURL = config.LOGS_DB_SIZE_QUERY;
            $.ajax({
                type: 'GET',
                url: getLogsDbSizeURL,
                contentType: 'text/plain',
                xhrFields: {
                    withCredentials: true
                },
                headers: {},
            })
            .done(function(data){
                count = Number(data);
                //console.log(data);

                $('#logs_number').text(count);

                start = count - size;
                vent.trigger("retrieve_logs");
            });

            return this;
        },

        events: {
            'click .previous[tbl="logs"]' : "prevPage",
            'click .next[tbl="logs"]' : "nextPage"
        },

        retrieveLogs: function() {
            //console.log("retrieve_logs");
            if (start < 0)
                start = 0;
            if (start > count)
                start = count - size;

            if (start <= 0){
                if (! $('.previous[tbl="logs"]').hasClass('disabled'))
                    $('.previous[tbl="logs"]').addClass('disabled');
            } else {
                if ($('.previous[tbl="logs"]').hasClass('disabled'))
                    $('.previous[tbl="logs"]').removeClass('disabled');
            }

            if (start + size >= count){
                if (! $('.next[tbl="logs"]').hasClass('disabled'))
                    $('.next[tbl="logs"]').addClass('disabled');
            } else {
                if ($('.next[tbl="logs"]').hasClass('disabled'))
                    $('.next[tbl="logs"]').removeClass('disabled');
            }

            var retrieveLogsURL = config.LOGS_DB_QUERY +
                "&start=" + start +
                "&size=" + size;
            //console.log(retrieveLogsURL);
            $.ajax({
                type: 'GET',
                url: retrieveLogsURL,
                contentType: 'text/plain',
                xhrFields: {
                    withCredentials: true
                },
                crossDomain: true,
                headers: {},
            })
            .done(function(data){
                var result = $.parseJSON(data);

                vent.trigger("display_logs", result);
            });
        },

        displayLogs: function(data){
            $("#log-tbl tbody").empty();
            logs = data.result;

            for (var i= 0; i< logs.length; i++){
                var log = logs[i];

                var ts = new Date(log.ts);
                var request = log.request;
                var response = log.response;

                var status = response.status;
                var req_method = request.method;

                var new_row = "<tr";
                if (req_method == "POST")
                    new_row = new_row +  " class=info";
                else if (status != 200)
                    new_row = new_row +  " class=danger";
                new_row += ">";

                new_row = new_row + "<td>" + (start + i + 1) + "</td>";
                new_row = new_row + "<td>" + ts + "</td>";
                new_row = new_row + "<td>" + request.method + "</td>";
                new_row = new_row + "<td>" + request.ip + "</td>";

                var query = request.query;
                new_row = new_row + "<td><abbr title='" + 
                        query + "'>" +
                        query.substring(0, 20) + "</abbr></td>";

                var request_data = request.request_data;
                new_row = new_row + "<td><abbr title='" + 
                         request_data + "'>" +
                         request_data.substring(0, 25) + "</abbr></td>";

                new_row = new_row + "<td>" + response.status + "</td>";
                var response_data = response.response_data;
                new_row = new_row + "<td><abbr title='" + 
                         response_data + "'>" +
                         response_data.substring(0, 25) + "</abbr></td>";

                new_row += "</tr>";
                $("#log-tbl tbody").append(new_row);
            }
        },

        prevPage: function(e){
            e.preventDefault();
            if ( $('.previous[tbl="logs"]').hasClass('disabled') == false){
                start -= size;
                this.retrieveLogs();
            }
        },

        nextPage: function(e){
            e.preventDefault();
            if ( $('.next[tbl="logs"]').hasClass('disabled') == false){
                start += size;
                this.retrieveLogs();
            }
        }
    });

    return LogsView;
});