import { Box, TextField } from "@mui/material";
import React, { useState, useEffect, useRef } from "react";
import { useInputStyles } from "../../component/CommonStyle";
import { PopupDialog } from "../../imports";
import './iconpicker.css'
function IconPicker(props) {
  const classes = useInputStyles();
  const [iconName, setIconName] = useState("");
  const [icons, setIcons] = useState({});
  useEffect(() => {
    setIcons(Icon)
  }, []);
  function changeIconValue(name) {
    props.confirm(name);
    props.onClose();
    setIconName("");
  }
  function handleChange(event) {
    setIconName(event.target.value);
  }
  function createIconList() {
    let iconList = <ul className="icon-picker-list">
      {
        Object.keys(icons).map(function (name, index) {
          if (name.toLowerCase().indexOf(iconName.toLowerCase()) === 0) {
            return <li key={index} >
              <button value={name} style={{ float: "right", height: "2rem", background: "#e2e2e2" }} onClick={() => changeIconValue(name)} title={name}>{React.createElement(icons[name])}</button>
            </li>
          }
        })
      }
    </ul>
    return iconList
  }
  return (
    <PopupDialog type="NOBUTTONS" open={props.open} onClose={props.onClose} title={transLangKey("SELECT_ICON")} resizeHeight={770} resizeWidth={400}>
      <Box className={classes.inputDiv}><TextField id="iconNm" variant="filled" hiddenLabel={true} InputProps={{ readOnly: false, }} value={iconName} onChange={handleChange} size="small" /></Box>
      <Box style={{ overflowY:"scroll", height: "650px" }}>
        {createIconList()}
      </Box>
    </PopupDialog>
  )
}

export default IconPicker;