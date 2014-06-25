/**
 * Home view
 */
define([
    'utilities',
    'app/models/session',
    'app/views/desktop/manager/recordslog',
    'app/views/desktop/manager/logs',
    'text!../../../../templates/desktop/manager.html'
], function (utilities, Session, RecordsLogView, LogsView, ManagerTemplate) {

    var ManagerView = Backbone.View.extend({
        initialize: function() {
            var that = this;
    
            Session.setAuth();
            Session.on('change:auth', function (session) {
                that.render();
            });
        },

        render:function () {
            if (Session.get("auth") == 'admin') {
                utilities.applyTemplate($(this.el),ManagerTemplate,{});
                this.recordsLogView = new RecordsLogView({el: $('#tab-content')});
                this.logsView = new LogsView({el: $('#tab-content')});

                $("li[id='view_logs']").trigger('click');
            } else {
                require('router').navigate("", {trigger: true});
            }
        },

        events: {
            "click li[id='view_logs']" : "viewLogs",
            "click li[id='view_records']" : "viewRecords",
        },

        viewLogs: function(e) {
            e.preventDefault();

            $(".logger-nav li.active").removeClass('active');
            $(e.target).parent().addClass('active');
            $('#tab-content').empty();

            this.logsView.render();
        },

        viewRecords: function(e) {
            e.preventDefault();

            $(".logger-nav li.active").removeClass('active');
            $(e.target).parent().addClass('active');
            $('#tab-content').empty();

            this.recordsLogView.render();
        }
    });

    return ManagerView;
});