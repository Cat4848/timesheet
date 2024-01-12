import { createDateRangePicker } from "../../modules/frontend/utils.js";
import { createCompareDateRange1Picker } from "../../modules/frontend/utils.js";
import { createCompareDateRange2Picker } from "../../modules/frontend/utils.js";
import { localhostBaseUrl, herokuBaseUrl } from "../../../lib/constants.js";

console.log("office Dashboard -> pathname", window.location.pathname);
if (window.location.pathname === "/office") {
  let doughnutData = [];
  console.log("office dashboard");
  function getURL(path) {
    if (path !== "") {
      if (window.location.hostname === "localhost") {
        return new URL(`${localhostBaseUrl}/office/dashboard/${path}`);
      } else {
        return new URL(`${herokuBaseUrl}/office/dashboard/${path}`);
      }
    } else {
      if (window.location.hostname === "localhost") {
        return new URL(`${localhostBaseUrl}/office/dashboard`);
      } else {
        return new URL(`${herokuBaseUrl}/office/dashboard`);
      }
    }
  }

  const getRange = (() => {
    const defaultRange = createDateRangePicker();
    return async (url, range = defaultRange) => {
      const searchParams = new URLSearchParams({
        start: range.start.toISOString(),
        end: range.end.toISOString()
      });
      url.search = searchParams;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          dataTriage(data);
        });
    };
  })();

  //the totals range is not used in the backend.
  //It will return the total number of drivers and workplaces.
  getRange(getURL("totals"));
  getRange(getURL("financial"));
  getRange(getURL("top3drivers"));
  getRange(getURL("top3workplaces"));

  $("#reportrange").on("apply.daterangepicker", (ev, picker) => {
    const start = picker.startDate;
    const end = picker.endDate;
    const customRange = {
      start: start,
      end: end
    };
    getRange(getURL("financial"), customRange);
    getRange(getURL("top3drivers"), customRange);
    getRange(getURL("top3workplaces"), customRange);
    getRange(getURL("compare"), customRange);
  });

  function dataTriage(data) {
    if (data.id === "totals") {
      displayTotals(data);
    }
    if (data.id === "financial") {
      displayFinancialData(data);
    }
    if (data.id === "top3drivers") {
      displayTop3Drivers(data);
    }
    if (data.id === "top3workplaces") {
      displayTop3Workplaces(data);
    }
    // console.log("data triage", data);
  }

  function displayTotals(data) {
    const totalDrivers = document.querySelector("#total-drivers");
    const totalWorkplaces = document.querySelector("#total-workplaces");
    totalDrivers.textContent = data.totalDrivers;
    totalWorkplaces.textContent = data.totalWorkplaces;
  }

  function displayFinancialData(data) {
    const profit = document.querySelector("#profit");
    const moneyIn = document.querySelector("#money-in");
    const moneyOut = document.querySelector("#money-out");
    const totalDriversHours = document.querySelector("#total-drivers-hours");

    if (data.data === "no data") {
      profit.textContent = data.profit;
      moneyIn.textContent = data.moneyIn;
      moneyOut.textContent = data.moneyOut;
      totalDriversHours.textContent = data.driversTotalHours;
    } else {
      profit.textContent = 0;
      const profitInterval = setInterval(() => {
        profit.textContent = Number(profit.textContent) + 10;
        if (Number(profit.textContent) >= data.profit) {
          clearInterval(profitInterval);
          profit.textContent = `£${data.profit.toFixed(2)}`;
        }
      }, 15);

      moneyIn.textContent = 0;
      const moneyInInterval = setInterval(() => {
        moneyIn.textContent = Number(moneyIn.textContent) + 10;
        if (Number(moneyIn.textContent) >= data.moneyIn) {
          clearInterval(moneyInInterval);
          moneyIn.textContent = `£${data.moneyIn.toFixed(2)}`;
        }
      }, 2);

      moneyOut.textContent = 0;
      const moneyOutInterval = setInterval(() => {
        moneyOut.textContent = Number(moneyOut.textContent) + 10;
        if (Number(moneyOut.textContent) >= data.moneyOut) {
          clearInterval(moneyOutInterval);
          moneyOut.textContent = `£${data.moneyOut.toFixed(2)}`;
        }
      }, 2);
      totalDriversHours.textContent = data.driversTotalHours;
    }
  }

  function displayTop3Drivers(data) {
    const noData = document.querySelector("#no-data-drivers");
    const driver1 = document.querySelector("#driver-1");
    const driver2 = document.querySelector("#driver-2");
    const driver3 = document.querySelector("#driver-3");

    noData.textContent = data.noData;
    driver1.textContent = data.driver1;
    driver2.textContent = data.driver2;
    driver3.textContent = data.driver3;
  }

  function displayTop3Workplaces(data) {
    const noData = document.querySelector("#no-data-workplaces");
    const workplace1 = document.querySelector("#workplace-1");
    const workplace2 = document.querySelector("#workplace-2");
    const workplace3 = document.querySelector("#workplace-3");

    noData.textContent = data.noData;
    workplace1.textContent = data.workplace1;
    workplace2.textContent = data.workplace2;
    workplace3.textContent = data.workplace3;
  }

  const getRange1 = (() => {
    const defaultCompareRange1 = createCompareDateRange1Picker();
    return async (url, range = defaultCompareRange1) => {
      const searchParams = new URLSearchParams({
        start: range.start.toISOString(),
        end: range.end.toISOString()
      });
      url.search = searchParams;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          compare1DisplayFinancialData(data);
          doughnutData[0] = data.profit;
          doughnutChartCreation(doughnutData);
        });
    };
  })();
  getRange1(getURL("financial"));

  $("#reportrange1").on("apply.daterangepicker", (ev, picker) => {
    const start = picker.startDate;
    const end = picker.endDate;
    const customRange = {
      start: start,
      end: end
    };
    getRange1(getURL("financial"), customRange);
  });

  function compare1DisplayFinancialData(data) {
    const profit = document.querySelector("#compare1-profit");
    const moneyIn = document.querySelector("#compare1-money-in");
    const moneyOut = document.querySelector("#compare1-money-out");
    const totalDriversHours = document.querySelector(
      "#compare1-total-drivers-hours"
    );

    if (data.data === "no data") {
      profit.textContent = data.profit;
      moneyIn.textContent = data.moneyIn;
      moneyOut.textContent = data.moneyOut;
      totalDriversHours.textContent = data.driversTotalHours;
    } else {
      profit.textContent = `£${data.profit.toFixed(2)}`;
      moneyIn.textContent = `£${data.moneyIn.toFixed(2)}`;
      moneyOut.textContent = `£${data.moneyOut.toFixed(2)}`;
      totalDriversHours.textContent = data.driversTotalHours;
    }
  }

  const getRange2 = (() => {
    const defaultCompareRange2 = createCompareDateRange2Picker();
    return async (url, range = defaultCompareRange2) => {
      const searchParams = new URLSearchParams({
        start: range.start.toISOString(),
        end: range.end.toISOString()
      });
      url.search = searchParams;
      fetch(url)
        .then((res) => res.json())
        .then((data) => {
          compare2DisplayFinancialData(data);
          doughnutData[1] = data.profit;
          doughnutChartCreation(doughnutData);
        });
    };
  })();
  getRange2(getURL("financial"));

  $("#reportrange2").on("apply.daterangepicker", (ev, picker) => {
    console.log("range 1 event handler");
    const start = picker.startDate;
    const end = picker.endDate;
    const customRange = {
      start: start,
      end: end
    };
    getRange2(getURL("financial"), customRange);
  });

  function compare2DisplayFinancialData(data) {
    const profit = document.querySelector("#compare2-profit");
    const moneyIn = document.querySelector("#compare2-money-in");
    const moneyOut = document.querySelector("#compare2-money-out");
    const totalDriversHours = document.querySelector(
      "#compare2-total-drivers-hours"
    );

    if (data.data === "no data") {
      profit.textContent = data.profit;
      moneyIn.textContent = data.moneyIn;
      moneyOut.textContent = data.moneyOut;
      totalDriversHours.textContent = data.driversTotalHours;
    } else {
      profit.textContent = `£${data.profit.toFixed(2)}`;
      moneyIn.textContent = `£${data.moneyIn.toFixed(2)}`;
      moneyOut.textContent = `£${data.moneyOut.toFixed(2)}`;
      totalDriversHours.textContent = data.driversTotalHours;
    }
  }

  function doughnutChartCreation(compareProfits) {
    const ctx = document.querySelector("#pie-chart");
    const data = {
      labels: ["Left Range Profit", "Right Range Profit"],
      datasets: [
        {
          label: "GBP",
          data: compareProfits,
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
}
