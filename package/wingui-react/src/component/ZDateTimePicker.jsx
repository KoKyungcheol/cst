import React, { useState, useEffect, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from 'prop-types';
import { TextField, Box } from "@mui/material";
import InputAdornment from '@mui/material/InputAdornment';
import InsertInvitationOutlinedIcon from '@mui/icons-material/InsertInvitationOutlined';
import { createUniqueKey, createCSSSelector, JSonToStyleString, deleteCSSSelector, isDateDayEqual } from '@zionex/utils/common'
import { showMessage } from "@zionex";
import { useInputStyles } from "./CommonStyle";

function getDateValue(d) {
  try {
    if (typeof d === 'string')
      return new Date(d)
    else if (typeof d === 'number')
      return new Date(d)
    else
      return d;
  }
  catch (e) {
    console.log(e)
  }
}

createCSSSelector('dateSelected', JSonToStyleString({
  'background-color': "#ffb2b2",
  color: 'white',
  "&:hover, &:focus": {
    'background-color': 'grey'
  },
  'border-top-left-radius': "50%",
  'border-bottom-left-radius': "50%",
  'border-top-right-radius': "50%",
  'border-bottom-right-radius': "50%"
}));

const CustomTimeInput = ({ date, onChangeCustom }) => {
  const value = date instanceof Date && !isNaN(date)
    ? // Getting time from Date beacuse `value` comes here without seconds
    date.toLocaleTimeString('it-IT')
    : '';

  return (
    <input
      //className=""
      type="time"
      step="1"
      value={value}
      onChange={(event) => onChangeCustom(date, event.target.value)}
    />);
};

const CustomTexInput = React.forwardRef(({ value, onClick, readOnly, disabled, displaySize, label, variant,  ...others }, ref) => {
  const classes = useInputStyles({ displaySize: displaySize });

  return (
    <TextField {...others}
      variant={variant}
      className={others.rangeyn == 'Y' ? classes.inputZDateRange : classes.inputZDate}
      onClick={onClick}
      ref={ref}
      value={value}
      hiddenLabel={true}
      label={label}
      inputProps={{
        readOnly: readOnly ? readOnly : false,
      }}
      InputProps={{
        className: (readOnly) ? 'Mui-disabled' : undefined,
        disableUnderline: true,
        endAdornment: (
          <InputAdornment position="end">
            <InsertInvitationOutlinedIcon />
          </InputAdornment>
        ),
      }}
      disabled={disabled ? disabled : false}
      size="small"
    />
  )
});

export const ZDateTimePicker = React.forwardRef((props, ref) => {

  const { value, onChange, useCustomTime, min, max, dateFormat, dateformat, placeholderText,
    readonly, readOnly, rangeyn, openTo, selectedDays, selectDayStyle, includeDaysOfWeek, label, variant,
    ...other } = props
  const [selectedDate, setSelectedDate] = useState(value ? getDateValue(value) : new Date())
  const dynamicCSS = useRef([])
  const refselectDayStyle = useRef(null);

  const classes = useInputStyles(props);

  const changeDate = (val) => {
    if (includeDaysOfWeek && includeDaysOfWeek.length > 0) {
      if (!includeDaysOfWeek.includes(val.getDay())) {
        showMessage(transLangKey('WARNING'), transLangKey('해당요일은 선택할 수 없습니다'), { close: false });
        return;
      }
    }
    setSelectedDate(val)
    if (onChange)
      onChange(val)
  }

  useEffect(() => {
    if (onChange)
      onChange(selectedDate)
  }, [])

  useEffect(() => {
    if (selectedDate != getDateValue(value))
      setSelectedDate(getDateValue(value))
  }, [value])

  const handleChangeTime = (date, time) => {
    const [hh, mm, ss] = time.split(':');
    const targetDate = date instanceof Date && !isNaN(date) ? date : new Date();
    targetDate.setHours(Number(hh) || 0, Number(mm) || 0, Number(ss) || 0);
    setSelectedDate(targetDate);
  };


  function dynamicCSSSelector(styles, name) {
    let selectorName;

    if (!name)
      selectorName = `dynamic_${createUniqueKey()}_styles`
    else
      selectorName = name;

    selectorName = selectorName.replace(/[,\.-]/gi, '_')
    if (typeof styles === 'string')
      createCSSSelector(selectorName, styles);
    else
      createCSSSelector(selectorName, JSonToStyleString(styles));

    if (dynamicCSS.current.findIndex(v => v === selectorName) < 0)
      dynamicCSS.current.push(selectorName);
    return selectorName;
  }

  function clearCSSSelector(selectorName) {
    if (selectorName) {
      deleteCSSSelector(selectorName);
      let idx = dynamicCSS.current.findIndex(v => v === selectorName)
      if (idx >= 0) {
        dynamicCSS.current.splice(idx, 1);
      }
    }
    else {
      for (let i = 0; i < dynamicCSS.current.length; i++) {
        deleteCSSSelector(dynamicCSS.current[i]);
      }
      dynamicCSS.current.splice(0, dynamicCSS.current.length)
    }
  }

  useEffect(() => {
    //unmount
    return () => {
      clearCSSSelector();
    }
  }, [])


  let transParam = {}
  let textParam = {}
  if (useCustomTime) {
    transParam.showTimeInput = true
    transParam.customTimeInput = <CustomTimeInput onChangeCustom={handleChangeTime} />
  }
  if (min) {
    transParam.minDate = min
  }
  if (max) {
    transParam.maxDate = max
  }
  if (dateFormat || dateformat) {
    transParam.dateFormat = dateFormat || dateformat;
  }
  else {
    transParam.dateFormat = 'yyyy-MM-dd'
  }

  if(variant && label) {
    textParam.label = label
  }

  if(variant) {
    textParam.variant = variant
  } else {
    textParam.variant = 'outlined'
  }

  if (placeholderText)
    transParam.placeholderText = placeholderText
  else
    transParam.placeholderText = transParam.dateFormat

  if (readonly || readOnly) {
    transParam.readOnly = readonly || readOnly;
    textParam.readOnly = transParam.readOnly;
  }

  if (rangeyn) {
    textParam.rangeyn = 'Y'
  }
  if (openTo) {
    if (openTo == 'month') {
      transParam.showMonthYearPicker = true;
      transParam.dateFormat = props.dateformat || props.dateFormat || 'yyyy-MM'
    }
    if (openTo == 'year') {
      transParam.showYearPicker = true;
      transParam.dateFormat = props.dateformat || props.dateFormat || 'yyyy'
    }
  }
  if (other.displaySize) {
    textParam.displaySize = other.displaySize
  }

  if (selectDayStyle && refselectDayStyle.current != selectDayStyle) {
    refselectDayStyle.current = selectDayStyle;
    clearCSSSelector();
    dynamicCSSSelector(selectDayStyle)
  }


  if (selectedDays) {
    let styleNM = "dateSelected"
    if (selectDayStyle && dynamicCSS.current.length > 0)
      styleNM = dynamicCSS.current[0];

    transParam.dayClassName = (date) => {
      const idx = selectedDays.findIndex(d => isDateDayEqual(d, date));
      return idx >= 0 ? styleNM : undefined
    }
  }

  return (
    <Box className={classes.inputZDate}>
      <DatePicker
        className={props.className ? props.className : classes.zDateTimePickerCss}
        {...transParam}
        {...other}
        selected={selectedDate}
        onChange={(date) => changeDate(date)}
        customInput={<CustomTexInput {...textParam} />}
      />
    </Box>
  )
});

ZDateTimePicker.propTypes = {
  value: PropTypes.any,
  onChange: PropTypes.func,
};

ZDateTimePicker.displayName = 'ZDateTimePicker'