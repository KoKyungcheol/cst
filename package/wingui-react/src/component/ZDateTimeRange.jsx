import React, { useState,useEffect } from "react";
import { Grid, Box, ButtonGroup, Button, Paper } from '@mui/material';
import { useContentStore } from '@zionex/store/contentStore'
import PropTypes from 'prop-types';
import { ZDateTimePicker } from "@zionex/component/ZDateTimePicker";
import { useInputStyles } from "./CommonStyle";

function getDateValue(d) {
  try {
  if(typeof d ==='string')
    return new Date(d)
  else if(typeof d ==='number')
    return new Date(d)
  else
    return d;
  }
  catch (e){
    console.log(e)
  }
}
export function ZDateTimeRange({onChange, value, readonly,disabled,min,max, minTime, maxTime,
  inputStyle,includeDaysOfWeek,...otherProps}) {
  
  const languageCode = useContentStore(state => state.languageCode);
  const classes = useInputStyles();
  const [fromDate, setFromDate] = useState(value && value.length > 0 ? getDateValue(value[0]) : new Date())
  const [toDate, setToDate] = useState(value && value.length ==2 ? getDateValue(value[1]) : new Date())
 

  const changeDate1=(val) => {
    setFromDate(val)
    if(onChange)
      onChange([val, toDate])
  }
  const changeDate2=(val) => {
    setToDate(val)
    if(onChange)
      onChange([fromDate, val])
  }

  useEffect(()=> {
    if(onChange)
      onChange([fromDate, toDate])
  },[])

  useEffect(()=> {
    if(value && value.length > 0) {
      setFromDate(getDateValue(value[0]))
    }

    if(value && value.length ==2) {
      setToDate(getDateValue(value[1]))
    }
  },[value])

  let readOnly1=false;
  let readOnly2=false;
  if(readonly) {
    if(Array.isArray(readonly)) {
      readOnly1 = readonly.length > 0 ? readonly[0] : false;
      readOnly2 = readonly.length ==2 ? readonly[1] : false;
    }
    else
    {
      readOnly1 = readOnly2 = readonly
    }
  }
  let disabled1=false;
  let disabled2=false;
  if(disabled) {
    if(Array.isArray(disabled)) {
      disabled1 = disabled.length > 0 ? disabled[0] : false;
      disabled2 = disabled.length ==2 ? disabled[1] : false;
    }
    else
    {
      disabled1 = disabled2 = disabled
    }
  }

  let min1=undefined;
  let min2=undefined;
  if(min) {
    if(Array.isArray(min)) {
      min1 = min.length > 0 ? min[0] : undefined;
      min2 = min.length ==2 ? min[1] : undefined;
    }
    else
    {
      min1 = min2 = min
    }
  }

  let max1=undefined;
  let max2=undefined;
  if(max) {
    if(Array.isArray(max)) {
      max1 = max.length > 0 ? max[0] : undefined;
      max2 = max.length ==2 ? max[1] : undefined;
    }
    else
    {
      max1 = max2 = max
    }
  }


  let minTime1=undefined;
  let minTime2=undefined;
  if(minTime) {
    if(Array.isArray(minTime)) {
      minTime1 = minTime.length > 0 ? minTime[0] : undefined;
      minTime2 = minTime.length ==2 ? minTime[1] : undefined;
    }
    else
    {
      minTime1 = minTime2 = minTime
    }
  }

  let maxTime1=undefined;
  let maxTime2=undefined;
  if(maxTime) {
    if(Array.isArray(maxTime)) {
      maxTime1 = maxTime.length > 0 ? maxTime[0] : undefined;
      maxTime2 = maxTime.length ==2 ? maxTime[1] : undefined;
    }
    else
    {
      maxTime1 = maxTime2 = maxTime
    }
  }
  let includeDaysOfWeek1=undefined;
  let includeDaysOfWeek2=undefined;

  if(includeDaysOfWeek && includeDaysOfWeek.length > 0) {
    includeDaysOfWeek1= includeDaysOfWeek[0];
    includeDaysOfWeek2 = includeDaysOfWeek.length > 1 ? includeDaysOfWeek[1] : undefined;
  }

  return (
    <Box className={classes.inputZDate} style={{display:'inline-flex'}}>
    <ZDateTimePicker
        className={classes.zDateTimePickerRangeCss}
        {...otherProps}
        style={inputStyle}
        onChange={changeDate1}
        value={fromDate}
        startDate={fromDate}
        endDate={toDate}
        minTime={minTime1}
        maxTime={maxTime1}
        min={min1}
        max={max1}
        readOnly={readOnly1}
        disabled={disabled1}
        rangeyn='Y'
        includeDaysOfWeek={includeDaysOfWeek1 ? includeDaysOfWeek1 : undefined}
    />
    <Box sx={{ display:'inline-flex', alignItems:'center', margin: '0px 4px 0px 4px'}}> - </Box>
    <ZDateTimePicker
        className={classes.zDateTimePickerRangeCss}
        {...otherProps}
        style={inputStyle}
        onChange={changeDate2}
        value={toDate}
        startDate={fromDate}
        endDate={toDate}
        minTime={minTime2}
        maxTime={maxTime2}
        min={min2}
        max={max2}
        readOnly={readOnly2}
        disabled={disabled2}
        rangeyn='Y'
        includeDaysOfWeek={includeDaysOfWeek2? includeDaysOfWeek2 : undefined}
      />
    </Box>
  )
  
}

ZDateTimeRange.propTypes = {
  value:PropTypes.array,
  onChange: PropTypes.func,
  includeDaysOfWeek: PropTypes.array,
};

ZDateTimeRange.displayName='ZDateTimeRange'