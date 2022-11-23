import React, { useState, useEffect } from "react";
import "flatpickr/dist/l10n";
import CalendarPopup from "./CalendarPopup";
import { useUserStore } from "../../store/userStore";

let flatpickrInstance;

function Calendar(props) {
  const [systemAdmin] = useUserStore(state => [state.systemAdmin])
  const [schedules, setSchedules] = useState([]);
  const [date, setDate] = useState();
  const [checkAdminFlag, setCheckAdminFlag] = useState("d-none");
  const locale = localStorage.getItem("languageCode");
  let scheduledDate = [];

  useEffect(() => {
    initializeFlatpickr();
    loadCalendarData(new Date());
  }, []);
  function initializeFlatpickr() {
    flatpickrInstance = flatpickr("#datepicker-calendar",
      {
        inline: true,
        locale: locale,
        prevArrow: "<span title=\"Previous month\"><i class='fa fa-chevron-left'></i></span>",
        nextArrow: "<span title=\"Next month\"><i class='fa fa-chevron-right'></i></span>",
        defaultDate: new Date(),
        onDayCreate: createDay,
        onMonthChange: changeMonth,
        onYearChange: changeMonth,
        onChange: changeDate,
        onReady: addElement
      }
    );
  }
  function createDay(dObj, dStr, fp, dayElem) {
    let date = dayElem.dateObj.format('yyyy-MM-dd');
    if (scheduledDate.indexOf(date) !== -1) {
      dayElem.className += ' schedule';
    }
  }
  function changeDate(selectedDates, dateStr, instance) {
    let current = new Date(selectedDates);
    setDate(current.format('yyyy-MM-dd'));
  }
  function changeMonth(selectedDates, dateStr, instance) {
    let current = new Date(instance.currentYear, instance.currentMonth, 1);
    loadCalendarData(current);
  }
  function addElement(dateObj, dateStr, instance) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('flatpickr-today-button-wrapper');
    let button = document.createElement('a');
    button.classList.add('flatpickr-today-button', 'btn');
    button.textContent = 'Today';
    button.addEventListener('click', function (e) {
      let flatpickr = document.querySelector("#datepicker-calendar")._flatpickr;
      flatpickr.changeMonth(new Date().getMonth(), false);
      flatpickr.setDate(new Date());
    });
    wrapper.appendChild(button);
    instance.calendarContainer.appendChild(wrapper);
  }
  function loadCalendarData(date) {
    let popupDate = "";
    axios.get(baseURI() + 'calendar', {
      params: {
        'date': date.format('yyyy-MM-dd')
      }
    })
      .then(function (res) {
        setSchedules(res.data);
        popupDate = (date.format('yyyy-MM') === new Date(flatpickrInstance.latestSelectedDateObj).format("yyyy-MM")) ? new Date(flatpickrInstance.latestSelectedDateObj).format("yyyy-MM-dd") : date.format('yyyy-MM-dd');
        setDate(popupDate);
        extractScheduledDate(res.data);
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        if (systemAdmin) {
          setCheckAdminFlag("");
        }
      })
  }
  function extractScheduledDate(schedules) {
    scheduledDate = [];
    schedules.forEach((schedule, index) => {
      if (schedule.endDate) {
        let currentDate = new Date(schedule.startDate);
        while (currentDate <= new Date(schedule.endDate)) {
          if (scheduledDate.indexOf(currentDate.format('yyyy-MM-dd')) === -1) {
            scheduledDate.push(currentDate.format('yyyy-MM-dd'));
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }
      if (scheduledDate.indexOf(schedule.startDate) === -1) {
        scheduledDate.push(schedule.startDate);
      }
    })
    flatpickrInstance.redraw();
  }
  function replaceDate(schedule) {
    let start = schedule.startDate.substring(5).replace("-", ".");
    let end = (schedule.endDate) ? " ~ " + schedule.endDate.substring(5).replace("-", ".") : "";
    return start + end;
  }
  function makeScheduleList() {
    let list = schedules.map((schedule, idx) => (
      <li key={schedule.id} className="list-group-item list-group-item-action">
        <div className="w-100 d-table">
          <span className="d-table-cell fw-bold" style={{ width: '35%' }}>
            {replaceDate(schedule)}
          </span>
          <span className="d-table-cell text-break" style={{ width: '65%' }}>
            {schedule.content}
          </span>
        </div>
      </li>
    ));
    return (schedules.length > 0) ? list : <li className="list-group-item">{transLangKey("MSG_NO_CALENDAR_DATA")}</li>;
  }
  function showCalendarPopup() {
    let calendarModal = $('#calendarModal');
    calendarModal.modal('show');
  }
  function reLoadCalendar(date) {
    flatpickrInstance.changeMonth(date.getMonth(), false);
  }
  return (
    <div className="home-calendar w-50 py-4 pe-5">
      <div className="w-100 card" style={{ height: "41vh" }}>
        <div className="card-header">
          <div className="card-actions float-end">
            <div className={"dropdown show " + checkAdminFlag}>
              <a href="#" data-bs-toggle="dropdown" data-bs-display="static">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-more-horizontal align-middle"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
              </a>
              <div className="dropdown-menu dropdown-menu-end dropdown-shadow" data-bs-popper="static">
                <a className="dropdown-item" onClick={() => { showCalendarPopup() }}>{transLangKey("MGMT_SCHEDULE")}</a>
              </div>
            </div>
          </div>
          <h5 className="card-title mb-0">{transLangKey("CALENDAR")}</h5>
        </div>
        <div className="d-flex">
          <div style={{ width: '45%' }}>
            <div className="px-2 pb-2">
              <div id="datepicker-calendar" className="calendar"></div>
            </div>
          </div>
          <div className="overflow-auto" style={{ width: '55%', height: '360px' }}>
            <ul className="list-group list-group-flush">
              {makeScheduleList()}
            </ul>
          </div>
        </div>
      </div>
      <CalendarPopup date={date} hide={reLoadCalendar} />
    </div>
  )
}

export default Calendar;