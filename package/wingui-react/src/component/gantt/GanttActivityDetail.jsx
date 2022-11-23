import React, { useEffect } from 'react';
import { Collapse } from 'bootstrap';
import './GanttActivityDetail.css';

let collapseList = {};

function GanttActivityDetail(props) {
  useEffect(() => {
    document.querySelector(`#${props.id}ActivityDetailOffcanvas`).parentElement.style.position = 'relative';
    const collapseElementList = [].slice.call(document.querySelectorAll(`#${props.id}DetailAccordion .accordion-collapse`));
    collapseList[props.id] = collapseElementList.map(collapseEl => new Collapse(collapseEl, {toggle: true}));
  }, []);

  useEffect(() => {
    if (Object.keys(props.details).length > 0 && Object.keys(props.details[Object.keys(props.details)[0]]).length > 0) {
      let offcanvasElement = document.getElementById(`${props.id}ActivityDetailOffcanvas`);
      if (!offcanvasElement.className.includes('show')) {
        toggleOffcanvas();
      }
      document.querySelectorAll(`#${props.id}DetailAccordion .accordion-button`).forEach((accordion) =>
        accordion.classList.remove('collapsed')
      );
      collapseList[props.id].forEach(collapse => collapse.show());
    }
  }, [props.details]);

  function makeDetailItems(data) {
    return Object.keys(data).map(prop =>
      <ul key={prop} className="d-flex flex-row w-100">
        <li>{transLangKey(prop)}</li>
        <div>
          {
            (typeof data[prop] === 'boolean') ?
              <input type="checkbox" className="align-middle" defaultChecked={data[prop]} onClick={(e) => e.preventDefault()} />
              : data[prop]
          }
        </div>
      </ul>
    );
  }

  function makeDetails() {
    return Object.keys(props.details).map(prop => {
      const prefixId = `${props.id}${prop.charAt(0).toUpperCase()}${prop.slice(1)}`;
      return <div key={prop} className="accordion-item">
        <h2 className="accordion-header" id={`${prefixId}DetailHeading`}>
          <button className="accordion-button fw-bold" style={{padding: '0.7rem 1rem'}} type="button"
                  data-bs-toggle="collapse" data-bs-target={`#${prefixId}DetailCollapse`} aria-expanded="true"
                  aria-controls={`${prefixId}DetailCollapse`}>
            {transLangKey(prop)}
          </button>
        </h2>
        <div id={`${prefixId}DetailCollapse`} className="accordion-collapse collapse"
             aria-labelledby={`${prefixId}DetailHeading`}>
          <div className="accordion-body">
            {makeDetailItems(props.details[prop])}
          </div>
        </div>
      </div>
    });
  }

  function toggleOffcanvas() {
    const id = `${props.id}ActivityDetailOffcanvas`;
    document.querySelector(`a[data-bs-target='#${id}']`).click();
  }

  return (
    <>
      <a className="d-none" data-bs-toggle="offcanvas" data-bs-target={`#${props.id}ActivityDetailOffcanvas`} aria-controls={`${props.id}ActivityDetailOffcanvas`} />
      <div className="offcanvas offcanvas-end offcanvas-shadow position-absolute h-auto p-0" id={`${props.id}ActivityDetailOffcanvas`} data-bs-scroll="true" data-bs-backdrop="false" tabIndex="-1" aria-labelledby={`${props.id}DetailOffcanvasLabel`}>
        <div className="offcanvas-header shadow-lg">
          <h5 className="offcanvas-title" id={`${props.id}DetailOffcanvasLabel`}>{transLangKey("FP_ACTIVITY_DETAIL")}</h5>
          <button type="button" className="btn-close text-reset" onClick={() => toggleOffcanvas()} />
        </div>
        <div className="offcanvas-body">
          <div className="accordion" id={`${props.id}DetailAccordion`}>
            {makeDetails()}
          </div>
        </div>
      </div>
    </>
  )
}

export default GanttActivityDetail;
