import { createDateRangePicker } from "../../modules/frontend/utils.js";
import { localhostBaseUrl, herokuBaseUrl } from "../../../lib/constants.js";

if (window.location.href.includes("/office/drivers")) {
  window.onload = main;
  function main() {
    const driverId = document.querySelector("#driver-id").innerHTML;
    const url = new URL(`http://localhost:3000/office/driverData/${driverId}`);
    getDriverData(url);
  }
  async function getDriverData(url) {
    const request = await fetch(url);
    const response = await request.json();
  }

  function getURL() {
    const driverId = document.querySelector("#driver-id").value;
    if (window.location.hostname === "localhost") {
      return new URL(`${localhostBaseUrl}/office/driverData/${driverId}`);
    } else {
      return new URL(`${herokuBaseUrl}/office/driverData/${driverId}`);
    }
  }

  function getDateRangeInfo(range, url = getURL()) {
    const searchParams = new URLSearchParams({
      start: range.start.toISOString(),
      end: range.end.toISOString()
    });
    url.search = searchParams;
    fetch(url)
      .then((response) => response.json())
      .then((data) => {
        totalHoursWorkedBarChartCreation(data.totalTime);
        totalEarningsBarChartCreation(data.totalValue);
        displayAverageHourlyRate(
          data.totalTime,
          data.totalValue,
          data.driverName
        );
        parsePieChartData(data.shifts);
        displayError(data.errorMessage);
      })
      .catch((error) => {
      });
  }
  const defaultRange = createDateRangePicker();
  getDateRangeInfo(defaultRange);

  $("#reportrange").on("apply.daterangepicker", (ev, picker) => {
    const start = picker.startDate;
    const end = picker.endDate;
    const customRange = {
      start: start,
      end: end
    };
    getDateRangeInfo(customRange);
  });

  function totalHoursWorkedBarChartCreation(totalTimeFloat) {
    if (totalTimeFloat) {
      const ctx = document.querySelector("#total-hours-bar-chart");
      const data = {
        labels: [""],
        datasets: [
          {
            label: "Total Hours Worked",
            data: [totalTimeFloat],
            backgroundColor: ["hsl(200, 100%, 50%)"]
          }
        ]
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
        datasets: [
          {
            label: "Total Earnings (£)",
            data: [totalValue],
            backgroundColor: ["hsl(45, 100%, 50%)"]
          }
        ]
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
    const averageHourlyRateELement = document.querySelector(
      "#average-hourly-rate"
    );
    const message = driverName
      ? `${driverName}'s average hourly rate is: £${averageHourlyRate} per hour.`
      : undefined;
    averageHourlyRateELement.textContent = message;
  }

  function parsePieChartData(shifts = []) {
    if (shifts.length) {
      const workplaces = new Map();
      shifts.forEach((shift) => {
        const hours = shift.totalWorkingHours;
        const minutes = shift.totalWorkingMinutes;
        const totalTime = toFloat(hours, minutes);
        if (workplaces.get(shift.workplace.name)) {
          workplaces.set(
            shift.workplace.name,
            workplaces.get(shift.workplace.name) + totalTime
          );
        } else {
          workplaces.set(shift.workplace.name, totalTime);
        }
      });
      const workplacesNames = Array.from(workplaces.keys());
      const workplacesWorkingTimes = Array.from(workplaces.values());
      const workingTimeSumForSelectedPeriodFloat =
        workplacesWorkingTimes.reduce((a, b) => a + b);
      const workingTimeSumForSelectedPeriodInHoursAndMinutes =
        toHoursAndMinutes(workingTimeSumForSelectedPeriodFloat);
      pieChartCreation(
        workplacesNames,
        workplacesWorkingTimes,
        workingTimeSumForSelectedPeriodInHoursAndMinutes
      );
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

  function pieChartCreation(workplacesNames, workplacesWorkingTimes) {
    const ctx = document.querySelector("#pie-chart");
    const data = {
      labels: workplacesNames,
      datasets: [
        {
          label: "Hours",
          data: workplacesWorkingTimes,
          backgroundColor: [
            "hsl(150, 100%, 40%)",
            "hsl(200, 100%, 40%)",
            "hsl(300, 100%, 40%)",
            "hsl(400, 100%, 40%)",
            "hsl(550, 100%, 40%)",
            "hsl(600, 100%, 40%)",
            "hsl(700, 100%, 40%)"
          ]
        }
      ]
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          display: true
        }
      }
    };
    const config = {
      type: "doughnut",
      data: data,
      options: options
    };
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
}
