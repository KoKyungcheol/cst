import React, { useState, useRef, useEffect } from "react";
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { TextField, } from "@mui/material";
import ClickAwayListener from '@mui/base/ClickAwayListener';
import MoreVertOutlinedIcon from '@mui/icons-material/MoreVertOutlined';
import InputAdornment from '@mui/material/InputAdornment';
import { getBrowserSize } from '@zionex/utils/common'
import { useInputStyles } from "./CommonStyle";

const defPopOverstyles = {
  position: 'absolute',
  top: 40,
  left: 0,
  zIndex: 9999999,
  border: '1px solid rgba(50, 50, 50, 0.3)',
  boxShadow: 'rgb(0 0 0 / 50%) 1px 2px 5px',
  boxSizing: 'border-box',
  backgroundColor: 'white',
  padding: '4px'
};

export default function PopoverInput(props) {

  const { inputStyle, inputStyle2, ...other } = props;

  const boxRef = useRef(null)
  const [popOverstyles, setPopOverStyle] = useState(defPopOverstyles)
  const [openPopover, setOpenPopover] = useState(false);
  const [value, setValue] = useState(props.value);

  const classes = useInputStyles();

  useEffect(() => {
    if (inputStyle2) {
      let s = { ...popOverstyles, ...inputStyle2 }
      setPopOverStyle(s)
    }
  }, [inputStyle2])

  const handleClickAway = () => {
    setOpenPopover(false);
  };

  const closePopover = () => setOpenPopover(false);

  const handleClick = (event) => {
    setOpenPopover((previousOpen) => !previousOpen);
  };

  const changeValue = (val) => {
    setValue(val)
    if (props.onChange)
      props.onChange(val)
  }

  if (boxRef.current) {

    const offsetLeft = boxRef.current.offsetLeft;
    const offsetTop = boxRef.current.offsetTop;
    const clientHeight = boxRef.current.clientHeight;
    const browserSize = getBrowserSize();

    let top = clientHeight > 0 ? clientHeight : 40;
    let left = 0;

    let t = offsetTop + clientHeight;
    let h = t + parseInt(popOverstyles.height);
    let w = offsetLeft + parseInt(popOverstyles.width);
    if (h > browserSize.innerHeight) {
      top = top - (browserSize.innerHeight - h)
    }
    if (w > browserSize.innerWidth) {
      left = left - (browserSize.innerWidth - w)
    }
    popOverstyles.top = top;
    popOverstyles.left = left;
  }

  return (
    <ClickAwayListener
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
      onClickAway={handleClickAway}
    >
      <Box className={classes.inputZDate} sx={{ position: 'relative' }} ref={boxRef}>
        {
          props.renderInput ? React.cloneElement(props.renderInput, { onClick: handleClick }) :
            <TextField
              fullWidth
              hiddenLabel={true}
              inputProps={{
                readOnly: props.readonly ? props.readonly : false,
              }}
              InputProps={{
                className: (props.readOnly) ? 'Mui-disabled' : undefined,
                endAdornment: (
                  <InputAdornment position="end">
                    <MoreVertOutlinedIcon />
                  </InputAdornment>
                ),
              }}
              disabled={props.disabled ? props.disabled : false}
              size="small"
              onChange={changeValue}
              type={props.type === 'number' ? 'number' : 'text'}
              value={value || ''}
              onKeyPress={props.onKeyPress}
              style={{ width: "inherit", ...inputStyle }}
              onClick={handleClick}
            />
        }
        {openPopover ? (
          <Box sx={popOverstyles} style={inputStyle2} >
            <Paper sx={{ m: 1, p: 1 }}>
              <Box sx={{ display: 'block', width: '100%' }}>
                {
                  props.childComponent ? React.cloneElement(props.childComponent, { setValue: changeValue, closePopover: closePopover }) : null
                }
              </Box>
            </Paper>
          </Box>
        ) : null}

      </Box>
    </ClickAwayListener>
  );
}

PopoverInput.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
};

PopoverInput.displayName = 'PopoverInput'
