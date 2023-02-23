//the reason for this front-end JavaScript file is:
//1: to provide an interactive user-experience
//when the user adds a shift by displaying on the fly the break deduction, min shift,
//and total working hours based on the user input.
//2: Database purposes - to calculate the hiddenTotalWorkingHoursElement and 
//hiddenTotalWorkingMinutesElement.
//3: Dashboard purposes: to calculate the hiddenShiftValueElement so when a user
//queries the database and wants to see his/her data for past week, month, etc
//the total gross earnings will be displayed along with total hours in that
//period of time.

const workplaceElement = document.querySelector("#workplace");
const startShiftElement = document.querySelector("#startShift");
const finishShiftElement = document.querySelector("#finishShift");

workplaceElement.addEventListener("change", databaseRequest);
startShiftElement.addEventListener("change", databaseRequest);
finishShiftElement.addEventListener("change", databaseRequest);

async function databaseRequest() {
    let rates = {};
    console.log("beginning of updateForm");
    const workplaceId = workplaceElement.value;
    const request = await fetch(`/addShiftData/${workplaceId}`);
    const response = await request.json();
    console.log(response);
    const breakDeduction = response.breakDeduction;
    const minShift = response.minShift;
    
    rates.weekDayRate = parseFloat(response.weekDayRate.$numberDecimal);
    rates.weekNightRate = parseFloat(response.weekNightRate.$numberDecimal);
    rates.saturdayDayRate = parseFloat(response.saturdayDayRate.$numberDecimal);
    rates.saturdayNightRate = parseFloat(response.saturdayNightRate.$numberDecimal);
    rates.sundayDayRate = parseFloat(response.sundayDayRate.$numberDecimal);
    rates.sundayNightRate = parseFloat(response.sundayNightRate.$numberDecimal);

    calculateAddShiftFormValues(breakDeduction, minShift, rates);   
}

function calculateAddShiftFormValues(breakDeduction, minShift, rates) {
    if (startShiftElement.value != "" && finishShiftElement.value != "") {
        console.log("beginning if statement");
        const startShift = new Date(startShiftElement.value);
        const finishShift = new Date(finishShiftElement.value);
        const breakDeductionInMs = breakDeduction * 60 * 1000;
        const totalWorkingTimeInMs = (finishShift - startShift) - breakDeductionInMs;

        const hours = Math.floor(totalWorkingTimeInMs / (1000 * 60 * 60));
        const minutes = Math.floor((totalWorkingTimeInMs % (1000 * 60 * 60) / (1000 * 60)));
        const shiftLength = `${hours} hours ${minutes} minutes`;
        const totalShiftLength = minShift > hours ? minShift : shiftLength;
        const shiftValue = calculateShiftValue(startShift, finishShift, rates);
        updateAddShiftForm(breakDeduction, minShift, totalShiftLength, hours, minutes, shiftValue);
    }
}

function calculateShiftValue(start, finish, rates) {   
    console.log("beginning calculate shift value");
    const startShift = new Date (start);
    const startDay = startShift.getDay();
    const finishShift = new Date (finish);
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
        let currentDayTime = 0;
        let currentNightTime = 0;
        let amNightTime = 0;
        let pmNightTime = 0;
        console.log("loops");
        const currentDateStart = new Date(currentDate);
        currentDateStart.setHours(0,0,0,0);
        
        const currentDateFinish = new Date(currentDate);
        currentDateFinish.setHours(24, 0, 0, 0);
        
        const currentStart = new Date(Math.max(currentDateStart, startShift));
        const currentFinish = new Date(Math.min(currentDateFinish, finishShift));
        const totalLength = currentFinish - currentStart;

        const dayRateTime = new Date(currentStart).setHours(6,0,0,0);
        const nightRateTime = new Date(currentStart).setHours(18,0,0,0);

        if ((currentDateStart < currentStart && currentStart < dayRateTime) && (nightRateTime < currentFinish && currentFinish <= currentDateFinish)) {
            //this is when the shift starts and finishes in the same day
            //and the start and finish times are during the night rates
            //for example: when I have 12h on day rate
            //and at both ends I have some night rate time
            console.log("night at both ends");
            amNightTime += dayRateTime - currentStart;
            pmNightTime += currentFinish - nightRateTime;
        } else if (currentDateStart < currentStart && currentStart < dayRateTime) {
            //am start time
            console.log("am start time");
            amNightTime += dayRateTime - currentStart;
        } else if (currentDateStart <= currentFinish && currentFinish < dayRateTime) {
            //am finish time
            console.log("am finish time");
            amNightTime += currentFinish - currentDateStart;
        } else if (nightRateTime <= currentStart && currentStart<= currentDateFinish) {
            //pm start time
            console.log("pm start time");
            pmNightTime += currentDateFinish - currentStart;
        } else if (nightRateTime < currentFinish && currentFinish <= currentDateFinish) {
            //pm finish time
            console.log("pm finish time");
            pmNightTime += currentFinish - nightRateTime;
        } else if (currentStart <= currentDateStart) {
            //am start time when the shift continues from the previous day 
            //(this will happen in the second loop)
            console.log("am start second loop");
            amNightTime += dayRateTime - currentStart;
        }
        currentNightTime = amNightTime + pmNightTime;
        currentDayTime = totalLength - currentNightTime;

        if (weekDays.has(currentDate.getDay())) {
            console.log("week day");
            weekNightTime += currentNightTime;
            weekDayTime += currentDayTime;
        } else if (currentDate.getDay() === saturday) {
            console.log("saturday");
            saturdayNightTime += currentNightTime;
            saturdayDayTime += currentDayTime;
        } else if (currentDate.getDay() === sunday) {
            console.log("sunday");
            sundayNightTime += currentNightTime;
            sundayDayTime += currentDayTime;
        }
        console.log("am night time", amNightTime / (1000 * 60 * 60));
        console.log("pm night time", pmNightTime / (1000 * 60 * 60));
        console.log("total length", totalLength / (1000 * 60 * 60));
        console.log("night time", currentNightTime / (1000 * 60 * 60));
        console.log("day time", currentDayTime / (1000 * 60 * 60));
        console.log("week day time", weekDayTime / (1000 * 60 * 60));
        console.log("week day rate", rates.weekDayRate);
        console.log("week night time", weekNightTime / (1000 * 60 * 60));
        console.log("week night rate", rates.weekNightRate);
        console.log("saturday day time", saturdayDayTime / (1000 * 60 * 60));
        console.log("saturday day rate", rates.saturdayDayRate);
        console.log("saturday night time", saturdayNightTime / (1000 * 60 * 60));
        console.log("saturday night rate", rates.saturdayNightRate);
        console.log("sunday day time", sundayDayTime / (1000 * 60 * 60));
        console.log("sunday day rate", rates.sundayDayRate);
        console.log("sunday night time", sundayNightTime / (1000 * 60 * 60));
        console.log("sunday night rate", rates.sundayNightRate);        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    const toHours = 1000 * 60 * 60;
    const weekDayPay = parseFloat(((weekDayTime / toHours) * rates.weekDayRate).toFixed(2));
    const weekNightPay = parseFloat(((weekNightTime / toHours) * rates.weekNightRate).toFixed(2));
    const saturdayDayPay = parseFloat(((saturdayDayTime / toHours) * rates.saturdayDayRate).toFixed(2));
    const saturdayNightPay = parseFloat(((saturdayNightTime / toHours) * rates.saturdayNightRate).toFixed(2));
    const sundayDayPay = parseFloat(((sundayDayTime / toHours) * rates.sundayDayRate).toFixed(2));
    const sundayNightPay = parseFloat(((sundayNightTime / toHours) * rates.sundayNightRate).toFixed(2));
    const totalShiftPay = weekDayPay + weekNightPay + saturdayDayPay + saturdayNightPay + sundayDayPay + sundayNightPay;
    console.log("week day pay", weekDayPay);
    console.log("week night pay", weekNightPay);
    console.log("saturday day pay", saturdayDayPay);
    console.log("saturday night pay", saturdayNightPay);
    console.log("sunday day pay", sundayDayPay);
    console.log("sunday night pay", sundayNightPay);
    console.log("total pay", totalShiftPay);
    return totalShiftPay;
}

function updateAddShiftForm(breakDeduction, minShift, totalShiftLength, hours, minutes, shiftValue) {
    console.log("update add shift form");
    const breakDeductionElement = document.querySelector("#workplaceBreakDeduction");
    const minShiftElement = document.querySelector("#workplaceMinShift");        
    const totalWorkingHoursElement = document.querySelector("#totalWorkingHours");
    breakDeductionElement.value = breakDeduction;
    minShiftElement.value = minShift;
    totalWorkingHoursElement.value = totalShiftLength;

    const hiddenTotalWorkingHoursElement = document.querySelector("#hiddenTotalWorkingHours");
    const hiddenTotalWorkingMinutesElement = document.querySelector("#hiddenTotalWorkingMinutes");
    const hiddenShiftValueElement = document.querySelector("#hiddenValue");
    hiddenTotalWorkingHoursElement.value = hours;
    hiddenTotalWorkingMinutesElement.value = minutes;
    hiddenShiftValueElement.value = shiftValue;
}