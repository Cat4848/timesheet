/*
the reason for this front-end JavaScript file is:
1: to provide an interactive user-experience
when the user adds a shift by displaying on the fly the break deduction, min shift,
and total working hours based on the user input.
2: Database purposes - to calculate the hiddenTotalWorkingHoursElement and 
hiddenTotalWorkingMinutesElement.
3: Dashboard purposes: to calculate the hiddenDriverShiftValueElement so when a user
queries the database and wants to see his/her data for past week, month, etc
the total gross earnings will be displayed along with total hours in that
period of time.
4. Dashboard purposes: to calculate the hiddenOfficeShiftValueElement to when the office
wants to view their dashboard, the profit section will be populated by calculating the 
difference between hiddenOfficeShiftValueElement and hiddenDriverShiftValueElement
In other words, the office needs to know what their profit is. 
The agency's profit is calculated by the difference from the pay in rate and pay out rate.
By how much they get paid from the workplace(pay in rate)
and how much they pay the driver (pay out rate).
*/
if (window.location.pathname === "/drivers/addShift") {
  const workplaceElement = document.querySelector("#workplace");
  const startShiftElement = document.querySelector("#startShift");
  const finishShiftElement = document.querySelector("#finishShift");

  workplaceElement.addEventListener("change", databaseRequest);
  startShiftElement.addEventListener("change", databaseRequest);
  finishShiftElement.addEventListener("change", databaseRequest);

  async function databaseRequest() {
    let driverRates = {};
    let officeRates = {};
    const workplaceId = workplaceElement.value;
    const request = await fetch(`/addShiftData/${workplaceId}`);
    const response = await request.json();
    const breakDeduction = response.breakDeduction;
    const minShift = response.minShift;

    driverRates.weekDayRate = parseFloat(
      response.driverWeekDayRate.$numberDecimal
    );
    driverRates.weekNightRate = parseFloat(
      response.driverWeekNightRate.$numberDecimal
    );
    driverRates.saturdayDayRate = parseFloat(
      response.driverSaturdayDayRate.$numberDecimal
    );
    driverRates.saturdayNightRate = parseFloat(
      response.driverSaturdayNightRate.$numberDecimal
    );
    driverRates.sundayDayRate = parseFloat(
      response.driverSundayDayRate.$numberDecimal
    );
    driverRates.sundayNightRate = parseFloat(
      response.driverSundayNightRate.$numberDecimal
    );

    officeRates.weekDayRate = parseFloat(
      response.officeWeekDayRate.$numberDecimal
    );
    officeRates.weekNightRate = parseFloat(
      response.officeWeekNightRate.$numberDecimal
    );
    officeRates.saturdayDayRate = parseFloat(
      response.officeSaturdayDayRate.$numberDecimal
    );
    officeRates.saturdayNightRate = parseFloat(
      response.officeSaturdayNightRate.$numberDecimal
    );
    officeRates.sundayDayRate = parseFloat(
      response.officeSundayDayRate.$numberDecimal
    );
    officeRates.sundayNightRate = parseFloat(
      response.officeSundayNightRate.$numberDecimal
    );

    calculateAddShiftFormValues(
      breakDeduction,
      minShift,
      driverRates,
      officeRates
    );
  }

  function calculateAddShiftFormValues(
    breakDeduction,
    minShift,
    driverRates,
    officeRates
  ) {
    if (startShiftElement.value != "" && finishShiftElement.value != "") {
      const startShift = new Date(startShiftElement.value);
      const finishShift = new Date(finishShiftElement.value);
      const breakDeductionInMs = breakDeduction * 60 * 1000;
      const totalWorkingTimeInMs =
        finishShift - startShift - breakDeductionInMs;

      const hours = Math.floor(totalWorkingTimeInMs / (1000 * 60 * 60));
      const minutes = Math.floor(
        (totalWorkingTimeInMs % (1000 * 60 * 60)) / (1000 * 60)
      );
      const shiftLength = `${hours} hours ${minutes} minutes`;
      const totalShiftLength = minShift > hours ? minShift : shiftLength;
      const { driverTotalShiftPay, officeTotalShiftPay } = calculateShiftValue(
        startShift,
        finishShift,
        driverRates,
        officeRates,
        breakDeduction
      );
      updateAddShiftForm(
        breakDeduction,
        minShift,
        totalShiftLength,
        hours,
        minutes,
        driverTotalShiftPay,
        officeTotalShiftPay
      );
    }
  }

  function calculateShiftValue(
    start,
    finish,
    driverRates,
    officeRates,
    breakDeduction
  ) {
    const startShift = new Date(start);
    const startDay = startShift.getDay();
    const finishShift = new Date(finish);
    //the next line of code explanation:
    //if the shift starts on a Saturday and ends on a Sunday,
    //the code will stop before the for loop because
    //Saturday = 6 and Sunday = 0. Therefore the loop won't proceed
    //because 6 can't be less or equal to 0.
    //My solution is to assign the number 7 to finishDay if the day is a Sunday.
    const finishDay = finishShift.getDay() === 0 ? 7 : finishShift.getDay();
    const currentDate = new Date(startShift);
    const monday = 1;
    const tuesday = 2;
    const wednesday = 3;
    const thursday = 4;
    const friday = 5;
    const saturday = 6;
    const sunday = 0;
    const weekDays = new Set([monday, tuesday, wednesday, thursday, friday]);
    let weekDayTime = 0;
    let weekNightTime = 0;
    let saturdayDayTime = 0;
    let saturdayNightTime = 0;
    let sundayDayTime = 0;
    let sundayNightTime = 0;

    for (let currentDay = startDay; currentDay <= finishDay; currentDay++) {
      const currentDateStart = new Date(currentDate);
      currentDateStart.setHours(0, 0, 0, 0);

      const currentDateFinish = new Date(currentDate);
      currentDateFinish.setHours(24, 0, 0, 0);

      const currentStart = new Date(Math.max(currentDateStart, startShift));
      const currentFinish = new Date(Math.min(currentDateFinish, finishShift));
      const totalLength = currentFinish - currentStart;

      const dayRateTime = new Date(currentStart).setHours(6, 0, 0, 0);
      const nightRateTime = new Date(currentStart).setHours(18, 0, 0, 0);

      const nightAndDayTime = calculateTotalNightTimeAndDayTime(
        currentDateStart,
        currentDateFinish,
        currentStart,
        currentFinish,
        dayRateTime,
        nightRateTime,
        totalLength
      );
      assignNightAndDayTimeToCorrectDayOfWeek(nightAndDayTime);

      function assignNightAndDayTimeToCorrectDayOfWeek() {
        /*
                this function, (assignNightAndDayTimeToCorrectDayOfWeek) is in the namespace of the calculateShiftValue function 
                I placed the function declaration inside the calculateShiftValue function because
                I need access to the following global variables: weekDays, currentDate, weekNightTime, 
                weekDayTime, saturdayNightTime, saturdayDayTime, sundayNightTime, sundayDayTime
                and also the days if the week called in the loop
                */
        if (weekDays.has(currentDate.getDay())) {
          weekNightTime += nightAndDayTime.currentNightTime;
          weekDayTime += nightAndDayTime.currentDayTime;
        } else if (currentDate.getDay() === saturday) {
          saturdayNightTime += nightAndDayTime.currentNightTime;
          saturdayDayTime += nightAndDayTime.currentDayTime;
        } else if (currentDate.getDay() === sunday) {
          sundayNightTime += nightAndDayTime.currentNightTime;
          sundayDayTime += nightAndDayTime.currentDayTime;
        }
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalShiftPay(
      weekDayTime,
      weekNightTime,
      saturdayDayTime,
      saturdayNightTime,
      sundayDayTime,
      sundayNightTime,
      driverRates,
      officeRates,
      breakDeduction
    );
  }

  function calculateTotalNightTimeAndDayTime(
    currentDateStart,
    currentDateFinish,
    currentStart,
    currentFinish,
    dayRateTime,
    nightRateTime,
    totalLength
  ) {
    //called in the loop
    let currentDayTime = 0;
    let currentNightTime = 0;
    let amNightTime = 0;
    let pmNightTime = 0;
    if (
      currentDateStart < currentStart &&
      currentStart < dayRateTime &&
      nightRateTime < currentFinish &&
      currentFinish <= currentDateFinish
    ) {
      //this is when the shift starts and finishes in the same day
      //and the start and finish times are during the night driverRates
      //for example: when I have 12h on day rate
      //and at both ends I have some night rate time
      amNightTime += dayRateTime - currentStart;
      pmNightTime += currentFinish - nightRateTime;
    } else if (currentDateStart < currentStart && currentStart < dayRateTime) {
      //am start time
      amNightTime += dayRateTime - currentStart;
    } else if (
      currentDateStart <= currentFinish &&
      currentFinish < dayRateTime
    ) {
      //am finish time
      amNightTime += currentFinish - currentDateStart;
    } else if (
      nightRateTime <= currentStart &&
      currentStart <= currentDateFinish
    ) {
      //pm start time
      pmNightTime += currentDateFinish - currentStart;
    } else if (
      nightRateTime < currentFinish &&
      currentFinish <= currentDateFinish
    ) {
      //pm finish time
      pmNightTime += currentFinish - nightRateTime;
    } else if (currentStart <= currentDateStart) {
      //am start time when the shift continues from the previous day
      //(this will happen in the second loop)
      amNightTime += dayRateTime - currentStart;
    }
    currentNightTime = amNightTime + pmNightTime;
    currentDayTime = totalLength - currentNightTime;
    return {
      currentNightTime: currentNightTime,
      currentDayTime: currentDayTime
    };
  }

  function totalShiftPay(
    weekDayTime,
    weekNightTime,
    saturdayDayTime,
    saturdayNightTime,
    sundayDayTime,
    sundayNightTime,
    driverRates,
    officeRates,
    breakDeduction
  ) {
    //called after the loop

    const timeLessBreak = calculateBreakDeduction(
      weekDayTime,
      weekNightTime,
      saturdayDayTime,
      saturdayNightTime,
      sundayDayTime,
      sundayNightTime,
      breakDeduction
    );
    const toHours = 1000 * 60 * 60;
    const driverWeekDayPay = parseFloat(
      ((timeLessBreak.weekDayTime / toHours) * driverRates.weekDayRate).toFixed(
        2
      )
    );
    const driverWeekNightPay = parseFloat(
      (
        (timeLessBreak.weekNightTime / toHours) *
        driverRates.weekNightRate
      ).toFixed(2)
    );
    const driverSaturdayDayPay = parseFloat(
      (
        (timeLessBreak.saturdayDayTime / toHours) *
        driverRates.saturdayDayRate
      ).toFixed(2)
    );
    const driverSaturdayNightPay = parseFloat(
      (
        (timeLessBreak.saturdayNightTime / toHours) *
        driverRates.saturdayNightRate
      ).toFixed(2)
    );
    const driverSundayDayPay = parseFloat(
      (
        (timeLessBreak.sundayDayTime / toHours) *
        driverRates.sundayDayRate
      ).toFixed(2)
    );
    const driverSundayNightPay = parseFloat(
      (
        (timeLessBreak.sundayNightTime / toHours) *
        driverRates.sundayNightRate
      ).toFixed(2)
    );
    const driverTotalShiftPay =
      driverWeekDayPay +
      driverWeekNightPay +
      driverSaturdayDayPay +
      driverSaturdayNightPay +
      driverSundayDayPay +
      driverSundayNightPay;

    const officeWeekDayPay = parseFloat(
      ((timeLessBreak.weekDayTime / toHours) * officeRates.weekDayRate).toFixed(
        2
      )
    );
    const officeWeekNightPay = parseFloat(
      (
        (timeLessBreak.weekNightTime / toHours) *
        officeRates.weekNightRate
      ).toFixed(2)
    );
    const officeSaturdayDayPay = parseFloat(
      (
        (timeLessBreak.saturdayDayTime / toHours) *
        officeRates.saturdayDayRate
      ).toFixed(2)
    );
    const officeSaturdayNightPay = parseFloat(
      (
        (timeLessBreak.saturdayNightTime / toHours) *
        officeRates.saturdayNightRate
      ).toFixed(2)
    );
    const officeSundayDayPay = parseFloat(
      (
        (timeLessBreak.sundayDayTime / toHours) *
        officeRates.sundayDayRate
      ).toFixed(2)
    );
    const officeSundayNightPay = parseFloat(
      (
        (timeLessBreak.sundayNightTime / toHours) *
        officeRates.sundayNightRate
      ).toFixed(2)
    );
    const officeTotalShiftPay =
      officeWeekDayPay +
      officeWeekNightPay +
      officeSaturdayDayPay +
      officeSaturdayNightPay +
      officeSundayDayPay +
      officeSundayNightPay;

    return {
      driverTotalShiftPay: driverTotalShiftPay.toFixed(2),
      officeTotalShiftPay: officeTotalShiftPay.toFixed(2)
    };
  }

  function calculateBreakDeduction(
    weekDayTime,
    weekNightTime,
    saturdayDayTime,
    saturdayNightTime,
    sundayDayTime,
    sundayNightTime,
    breakDeduction
  ) {
    //deduct the break from all time sections
    //1: by computing their proportion in the sum of all time sections.
    // 2: subtracting the break time and computing a new total time which is initial total time less the break
    //3: multiply the proportion of each time section by the new sum
    const allTime = [
      weekDayTime,
      weekNightTime,
      saturdayDayTime,
      saturdayNightTime,
      sundayDayTime,
      sundayNightTime
    ];
    const sumAllTime = allTime.reduce((a, b) => a + b);
    const weekDayTimeProportion = weekDayTime / sumAllTime;
    const weekNightTimeProportion = weekNightTime / sumAllTime;
    const saturdayDayTimeProportion = saturdayDayTime / sumAllTime;
    const saturdayNightTimeProportion = saturdayNightTime / sumAllTime;
    const sundayDayTimeProportion = sundayDayTime / sumAllTime;
    const sundayNightTimeProportion = sundayNightTime / sumAllTime;

    const minutesToMilliseconds = 60 * 1000;
    const breakDeductionInMilliseconds = breakDeduction * minutesToMilliseconds;
    const sumAllTimeLessBreakDeduction =
      sumAllTime - breakDeductionInMilliseconds;

    weekDayTime = weekDayTimeProportion * sumAllTimeLessBreakDeduction;
    weekNightTime = weekNightTimeProportion * sumAllTimeLessBreakDeduction;
    saturdayDayTime = saturdayDayTimeProportion * sumAllTimeLessBreakDeduction;
    saturdayNightTime =
      saturdayNightTimeProportion * sumAllTimeLessBreakDeduction;
    sundayDayTime = sundayDayTimeProportion * sumAllTimeLessBreakDeduction;
    sundayNightTime = sundayNightTimeProportion * sumAllTimeLessBreakDeduction;

    return {
      weekDayTime: weekDayTime,
      weekNightTime: weekNightTime,
      saturdayDayTime: saturdayDayTime,
      saturdayNightTime: saturdayNightTime,
      sundayDayTime: sundayDayTime,
      sundayNightTime: sundayNightTime
    };
  }

  function updateAddShiftForm(
    breakDeduction,
    minShift,
    totalShiftLength,
    hours,
    minutes,
    driverShiftValue,
    officeShiftValue
  ) {
    const breakDeductionElement = document.querySelector(
      "#workplaceBreakDeduction"
    );
    const minShiftElement = document.querySelector("#workplaceMinShift");
    const totalWorkingHoursElement =
      document.querySelector("#totalWorkingHours");
    const hiddenTotalWorkingHoursElement = document.querySelector(
      "#hiddenTotalWorkingHours"
    );
    const hiddenTotalWorkingMinutesElement = document.querySelector(
      "#hiddenTotalWorkingMinutes"
    );
    const hiddenDriverShiftValueElement =
      document.querySelector("#driverHiddenValue");
    const hiddenOfficeShiftValueElement =
      document.querySelector("#officeHiddenValue");

    breakDeductionElement.value = breakDeduction;
    minShiftElement.value = minShift;
    totalWorkingHoursElement.value = totalShiftLength;
    hiddenTotalWorkingHoursElement.value = hours;
    hiddenTotalWorkingMinutesElement.value = minutes;
    hiddenDriverShiftValueElement.value = driverShiftValue;
    hiddenOfficeShiftValueElement.value = officeShiftValue;
  }
}
