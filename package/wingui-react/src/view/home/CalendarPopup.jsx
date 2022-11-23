import React, { useEffect, useState } from "react";
import "flatpickr/dist/l10n";

let flatpickrInstance;

function CalendarPopup(props) {
  const [popSchedules, setPopSchedules] = useState([]);
  const [editable, setEditable] = useState(false);
  const [content, setContent] = useState('');
  const locale = localStorage.getItem("languageCode");

  useEffect(() => {
    if (props.date) {
      initializeFlatpickr(props.date);
      $('#calendarModal').off('show.bs.modal').on('show.bs.modal', function (e) {
        flatpickrInstance.setDate(props.date);
        loadPopCalendarData(new Date(props.date));
      })
    }
    feather.replace();
  }, [props]);
  function initializeFlatpickr(date) {
    if (new Date(date).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)) {
      setEditable(true);
    } else {
      setEditable(false);
    }

    flatpickrInstance = flatpickr("#datepicker-calendar-popup", {
      mode: "range",
      locale: locale,
      allowInput: false,
      defaultDate: date,
      wrap: true,
      static: true,
      onClose: setSchedules,
      onReady: addElement
    });
  }
  function setSchedules(selectedDates, dateStr, instance) {
    setContent('');
    if (selectedDates[0]) {
      loadPopCalendarData(selectedDates[0]);
      if (new Date(selectedDates[0]).getTime() < new Date().setHours(0, 0, 0, 0) && new Date(selectedDates[1]).getTime() < new Date().setHours(0, 0, 0, 0)) {
        setEditable(true);
      } else {
        setEditable(false);
      }
    }
  }
  function addElement(dateObj, dateStr, instance) {
    let wrapper = document.createElement('div');
    wrapper.classList.add('flatpickr-popup-today-button-wrapper');
    let button = document.createElement('a');
    button.classList.add('flatpickr-popup-today-button', 'btn');
    button.textContent = 'Today';
    button.addEventListener('click', function (e) {
      let flatpickr = document.querySelector("#datepicker-calendar-popup")._flatpickr;
      flatpickr.setDate(new Date());
    });
    wrapper.appendChild(button);
    instance.calendarContainer.appendChild(wrapper);
  }
  function createScheduleList() {
    let list =
      <table className="table table-hover table-sm table-striped my-0">
        <tbody>
          {popSchedules.map((i, idx) => {
            let endDate = (i.endDate) ? " ~ " + i.endDate.substring(5).replace("-", ".") : "";
            return <tr key={i.id} id={i.id} style={{ height: '6vh' }}>
              <td style={{ width: "35%" }}><span className="fw-bold">{i.startDate.substring(5).replace("-", ".") + endDate}</span></td>
              <td style={{ width: "55%" }}>{i.content}</td>
              <td style={{ width: "10%" }}>
                <a onClick={() => { deleteData(i) }}><i className="align-middle" data-feather="trash"></i></a>
              </td>
            </tr>
          })
          }
        </tbody>
      </table>
    feather.replace();
    return (popSchedules.length > 0) ? list : null;
  }
  function saveData() {
    let selectedDates = flatpickrInstance.selectedDates;
    if (!selectedDates[0]) {
      showMessage(transLangKey('WARNING'), transLangKey('MSG_0016'), { close: false }, function (answer) { });
      return;
    }
    if (!content.length) {
      showMessage(transLangKey('WARNING'), transLangKey('MSG_WARNING_SCHEDULE'), { close: false }, function (answer) { });
      return;
    }
    let startDate = selectedDates[0].format('yyyy-MM-dd');
    let endDate = selectedDates[1] ? selectedDates[1].format('yyyy-MM-dd') : selectedDates[0].format('yyyy-MM-dd');

    let data = {
      startDate: startDate,
      endDate: (startDate === endDate) ? null : endDate,
      content: content
    }

    axios({
      method: 'post',
      headers: { 'content-type': 'application/json' },
      url: baseURI() + 'calendar',
      data: data
    })
      .then(function (response) { })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        setContent('');
        loadPopCalendarData(selectedDates[0]);
      });
  }
  function deleteData(data) {
    showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_DELETE'), function (answer) {
      if (answer) {
        axios({
          method: 'post',
          url: baseURI() + 'calendar/delete',
          headers: { 'content-type': 'application/json' },
          data: data
        })
          .then(function (response) { })
          .catch(function (err) {
            console.log(err);
          })
          .then(function () {
            if (flatpickrInstance.selectedDates[0]) {
              loadPopCalendarData(flatpickrInstance.selectedDates[0]);
            }
          });
      }
    })
  }
  function loadPopCalendarData(date) {
    axios.get(baseURI() + 'calendar', {
      params: {
        'date': date.format('yyyy-MM-dd')
      }
    })
      .then(function (res) {
        setPopSchedules(res.data);
      })
      .catch(function (err) {
        console.log(err);
      })
      .then(function () {
        feather.replace();
      });
  }
  function handleKeyPress(e) {
    if (e.key === "Enter") {
      saveData();
    }
  }
  function handleChange(e) {
    setContent(e.target.value);
  }
  function hideCalendarPopup(e) {
    setContent('');
    props.hide(new Date(props.date));
    $('#calendarModal').modal('hide');
  }
  return (
    <div className="modal" id="calendarModal" data-bs-backdrop="static" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered mh-50" style={{ maxWidth: 510, height: 0 }}>
        <div className="modal-content popup-shadow" style={{ minHeight: 530, maxHeight: 530 }}>
          <div className="modal-header">
            <h5 className="card-title mb-0 fs-2 text-secondary">{transLangKey("MGMT_SCHEDULE")}</h5>
            <button className="btn p-0" type="button" aria-label="Close" onClick={hideCalendarPopup}><i className="align-middle" data-feather="x" style={{ width: 30, height: 30 }}></i></button>
          </div>
          <div id="modal-body" className="modal-body m-3">
            <div className="d-flex ps-0">
              <div id="datepicker-calendar-popup">
                <input type="text" className="float-start flatpickr-inputBox" data-input />
                <a className="flatpickr-input-button float-start" data-toggle>
                  <i className="align-middle" data-feather="calendar" style={{ width: 16, height: 16 }}></i>
                </a>
              </div>
            </div>
            <hr></hr>
            <input type="text" className="flatpickr-form-control form-control" autoComplete="off" placeholder={transLangKey("INSERT_SCHEDULE")} disabled={editable} value={content} onKeyPress={handleKeyPress} onChange={handleChange}></input>
            <div className="card mt-3" style={{ maxHeight: 290, overflowY: "auto" }}>
              {createScheduleList()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarPopup;