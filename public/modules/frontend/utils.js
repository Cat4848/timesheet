function createDateRangePicker() {
    moment.updateLocale('en', {
        week: {
          dow : 1, // Monday is the first day of the week.
        }
    });
    
    const start = moment().startOf("month");
    const end = moment();
    
    function cb(start, end) {
        $("#reportrange span").html(start.format("Do MMMM YYYY") + " - " + end.format("Do MMMM YYYY"));
    }
    
    $("#reportrange").daterangepicker({
        startDate: start,
        endDate: end,
        autoApply: true,
        linkedCalendars: false,
        ranges: {
            "This Week": [moment().startOf("week"), moment()],
            "Last Week": [moment().subtract(1, "week").startOf("week"), moment().subtract(1, "week").endOf("week")],
            "This Month": [moment().startOf("month"), moment().endOf("month")],
            "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")]
        }
    }, cb);
    
    cb(start, end);
    
    const rangeFromDefault = {
        start: start,
        end: end
    };
    return rangeFromDefault;
}

function createCompareDateRange1Picker() {
    moment.updateLocale('en', {
        week: {
          dow : 1, // Monday is the first day of the week.
        }
    });
    
    const start = moment().subtract(1, "month").startOf("month");
    const end = moment().subtract(1, "month").endOf("month");
    
    function cb(start, end) {
        $("#reportrange1 span").html(start.format("Do MMMM YYYY") + " - " + end.format("Do MMMM YYYY"));
    }
    
    $("#reportrange1").daterangepicker({
        startDate: start,
        endDate: end,
        autoApply: true,
        linkedCalendars: false,
        ranges: {
            "Last Week": [moment().subtract(1, "week").startOf("week"), moment().subtract(1, "week").endOf("week")],
            "Last Month": [moment().subtract(1, "month").startOf("month"), moment().subtract(1, "month").endOf("month")],
            "Last Year": [moment().subtract(1, "year").startOf("year"), moment().subtract(1, "year").endOf("year")]
        }
    }, cb);
    
    cb(start, end);
    
    const rangeFromDefault = {
        start: start,
        end: end
    };
    return rangeFromDefault;
}

function createCompareDateRange2Picker() {
    moment.updateLocale('en', {
        week: {
          dow : 1, // Monday is the first day of the week.
        }
    });
    
    const start = moment().startOf("month");
    const end = moment();
    
    function cb(start, end) {
        $("#reportrange2 span").html(start.format("Do MMMM YYYY") + " - " + end.format("Do MMMM YYYY"));
    }
    
    $("#reportrange2").daterangepicker({
        startDate: start,
        endDate: end,
        autoApply: true,
        linkedCalendars: false,
        ranges: {
            "This Week": [moment().startOf("week"), moment()],
            "This Month": [moment().startOf("month"), moment().endOf("month")],
            "This Year": [moment().startOf("year"), moment()]
        }
    }, cb);
    
    cb(start, end);
    
    const rangeFromDefault = {
        start: start,
        end: end
    };
    return rangeFromDefault;
}

export {
    createDateRangePicker, 
    createCompareDateRange1Picker,
    createCompareDateRange2Picker,
};