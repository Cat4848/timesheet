// window.onload = main;
// function main () {
//     const driverId = document.querySelector("#driver-id").innerHTML;
//     const url = new URL(`http://localhost:3000/office/driverData/${driverId}`);
//     getDriverData(url);
// }
// async function getDriverData (url) {
//     const request = await fetch(url);
//     const response = await request.json();
//     console.log(response);
// }

window.onload = createDateRangePicker;
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
    
    $("#reportrange").on("apply.daterangepicker", (ev, picker) => {
        const startDate = picker.startDate.toISOString();
        const endDate = picker.endDate.toISOString();
    
        getDateRangeInfo(startDate, endDate);
    });
    getDateRangeInfo(start, end);
}

function getDateRangeInfo(startDate, endDate) {
    const driverId = document.querySelector("#driver-id").value;
    const dateRange = { startDate: startDate, endDate: endDate };
    const searchParams = new URLSearchParams(dateRange);
    const url = new URL(`http://localhost:3000/office/driverData/${driverId}`);
    //http://localhost:3000/office/driverData
    //https://timesheet-uk.herokuapp.com/office/driverData
    url.search = searchParams;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("total value",data.totalValue);
            totalHoursWorkedBarChartCreation(data.totalTime);
            totalEarningsBarChartCreation(data.totalValue);
            displayAverageHourlyRate(data.totalTime, data.totalValue, data.driverName);
            parsePieChartData(data.shifts);
            displayError(data.errorMessage);
        })
        .catch((error) => {
            console.error("error", error);
        })
}

// function parseBarChartData(shifts) {
//     let totalTimeFloat = 0;
//     let totalValue = 0;
//     shifts.forEach(shift => {
//         const hours = shift.totalWorkingHours;
//         const minutes = shift.totalWorkingMinutes;
//         const hoursMinutes = toFloat(hours, minutes);
//         totalTimeFloat += hoursMinutes;
//         totalValue += parseFloat(shift.value.$numberDecimal);
//     });
//     totalTimeFloat = parseFloat(totalTimeFloat.toFixed(2));
//     totalValue = parseFloat(totalValue.toFixed(2));

//     totalHoursWorkedBarChartCreation(totalTimeFloat);
//     totalEarningsBarChartCreation(totalValue);
//     displayAverageHourlyRate(totalTimeFloat, totalValue);
// }

function totalHoursWorkedBarChartCreation(totalTimeFloat) {
    if (totalTimeFloat) {
        console.log("total hours worked bar creation function begin");
        console.log(totalTimeFloat);
        const ctx = document.querySelector("#total-hours-bar-chart");
        const data = {
            labels: [""],
            datasets: [{
                label: "Total Hours Worked",
                data: [totalTimeFloat],
                backgroundColor: ["hsl(200, 100%, 50%)"]
            }]
        };
        const options = {
            indexAxis: "y",
            elements: {
                bar: {
                    borderRadius: 4
                }
            },
            title: {
                display: true,
                text: "Total Hours Worked"
            },
            label: {
                display: false
            },
            responsive: true,
            borderSkipped: false,
            plugins: {
                legend: {
                    display: true,
                    position: "top"
                }
            }
        };
        const config = {
            type: "bar",
            data: data,
            options: options
        };
        const chartStatus = Chart.getChart("total-hours-bar-chart");
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }
        const barChart = new Chart(ctx, config);
    }
}

function totalEarningsBarChartCreation(totalValue) {
    if (totalValue) {
        const ctx = document.querySelector("#total-earnings-bar-chart");
        const data = {
            labels: [""],
            datasets: [{
                label: "Total Earnings (£)",
                data: [totalValue],
                backgroundColor: ["hsl(45, 100%, 50%)"]
            }]
        };
        const options = {
            indexAxis: "y",
            elements: {
                bar: {
                    borderRadius: 4
                }
            },
            title: {
                display: true,
                text: "Total Hours Worked"
            },
            label: {
                display: false
            },
            responsive: true,
            borderSkipped: false,
            plugins: {
                legend: {
                    display: true,
                    position: "top"
                }
            }
        };
        const config = {
            type: "bar",
            data: data,
            options: options
        };
        const chartStatus = Chart.getChart("total-earnings-bar-chart");
        if (chartStatus != undefined) {
            chartStatus.destroy();
        }
        const barChart = new Chart(ctx, config);
    }
}

function displayAverageHourlyRate(totalTime, totalValue, driverName) {
    const averageHourlyRate = parseFloat((totalValue / totalTime).toFixed(2));
    const averageHourlyRateELement = document.querySelector("#average-hourly-rate");
    const message = driverName ? `${driverName}'s average hourly rate is: £${averageHourlyRate} per hour.` : undefined;
    averageHourlyRateELement.textContent = message;
}

function parsePieChartData(shifts = []) {
    if (shifts.length) {
        console.log("shifts", shifts);
        const workplaces = new Map();
        shifts.forEach(shift => {
            const hours = shift.totalWorkingHours;
            const minutes = shift.totalWorkingMinutes;
            const totalTime = toFloat(hours, minutes);
            if (workplaces.get(shift.workplace.name)) {
                workplaces.set(shift.workplace.name, workplaces.get(shift.workplace.name) + totalTime);
            } else {
                workplaces.set(shift.workplace.name, totalTime);
            }
    
        });
        const workplacesNames = Array.from(workplaces.keys());
        const workplacesWorkingTimes = Array.from(workplaces.values());
        const workingTimeSumForSelectedPeriodFloat = workplacesWorkingTimes.reduce((a, b) => a + b);
        const workingTimeSumForSelectedPeriodInHoursAndMinutes = toHoursAndMinutes(workingTimeSumForSelectedPeriodFloat);
        pieChartCreation(workplacesNames, workplacesWorkingTimes, workingTimeSumForSelectedPeriodInHoursAndMinutes);
    }
}

function toFloat(hours, minutes) {
    const floatMinutes = parseFloat((minutes / 60).toFixed(2));
    const totalTimeFloat = hours + floatMinutes;
    return totalTimeFloat;
}

function toHoursAndMinutes(timeFloat) {
    const totalMinutes = timeFloat * 60;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = Math.floor(totalMinutes % 60);
    return `${hours}:${minutes}`;
}

function pieChartCreation(workplacesNames, workplacesWorkingTimes, workingTimeSumForSelectedPeriodInHoursAndMinutes) {
    const ctx = document.querySelector("#pie-chart");
    const data = {
        labels: workplacesNames,
        datasets: [{
            label: "Hours",
            data: workplacesWorkingTimes,
            backgroundColor: ["hsl(150, 100%, 40%)", "hsl(200, 100%, 40%)", "hsl(300, 100%, 40%)", "hsl(400, 100%, 40%)", "hsl(550, 100%, 40%)", "hsl(600, 100%, 40%)", "hsl(700, 100%, 40%)"]
        }]
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true
            }
        }
    };

    const dataInMiddleOfDoughnut = [{
        id: 'text',
        beforeDraw: function(chart, a, b) {
            const width = chart.width,
            height = chart.height,
            ctx = chart.ctx;

            ctx.restore();
            const fontSize = (height / 250).toFixed(2);
            ctx.font = fontSize + "em sans-serif";
            ctx.textBaseline = "middle";

            const text = workingTimeSumForSelectedPeriodInHoursAndMinutes === 0 ? "No Data" : `Total ${workingTimeSumForSelectedPeriodInHoursAndMinutes}`;

            textX = Math.round((width - ctx.measureText(text).width) / 2),
            textY = height / 1.9;

            ctx.fillText(text, textX, textY);
            ctx.save();
        }
    }];

    const config = {
        type: "doughnut",
        data: data,
        options: options,
        plugins: dataInMiddleOfDoughnut
    }
    const chartStatus = Chart.getChart("pie-chart");
    if (chartStatus != undefined) {
        chartStatus.destroy();
    }
    const doughnutChart = new Chart(ctx, config);
}

function displayError(errorMessage) {
    const errorMessageElement = document.querySelector("#error-message");
    errorMessageElement.textContent = errorMessage;
}

