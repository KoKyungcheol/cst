import React, {useEffect} from "react";

function HeaderUnitSetting (props) {
  useEffect(() => {
    if (props.value) {
      const dropdownEl = document.querySelector(`#${props.id} > ul`);
      for (let li of dropdownEl.children) {
        li.children[0].classList.remove('active');
        if (props.value === li.children[0].text) {
          li.children[0].classList.add('active');
        }
      }
      props.change(props.value);
    }
  }, [props.value]);

  function changeGanttHeaderUnit(e) {
    const value = e.target.text;
    props.change(value);
  }

  return (
    <div id={props.id} className="dropdown d-inline-block">
      <button className="btn btn-pill btn-active-icon me-3 dropdown-toggle" type="button" id="dropdownMenuButton"
              data-bs-toggle="dropdown" aria-haspopup="true" aria-expanded="false" data-bs-display="static" title={transLangKey("FP_HEADER_UNIT")}>
        <Icon.Calendar />
      </button>
      <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="dropdownMenuButton">
        {
          props.units.map(unit =>
            <li key={unit}><a className="dropdown-item" onClick={(e) => changeGanttHeaderUnit(e)}>{unit}</a></li>
          )
        }
      </ul>
    </div>
  )
}

export default HeaderUnitSetting;
