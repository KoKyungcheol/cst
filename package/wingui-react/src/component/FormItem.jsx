import React, { useState } from "react";
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { useInputStyles } from "./CommonStyle";

export function FormItem(props) {
  const classes = useInputStyles();

  return (
    <>
      {
        (props.label && props.useLabel !== false) ? (
          <Box className={`${classes.wrapBox} ${props.rules && props.rules.required && classes.required}`} style={props.style}>
            <Box className={classes.label} style={props.labelStyle}>{transLangKey(props.label)}</Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap', ...props.inputBoxStyle }}>
              {
                props.children
              }
            </Box>
          </Box>
        )
          : (
            <Box className={classes.wrapBox} style={props.style}>
              <Box style={{ display: 'flex', flexWrap: 'wrap', ...props.inputBoxStyle }}>
                {
                  props.children
                }
              </Box>
            </Box>
          )
      }
    </>
  );
}

FormItem.propTypes = {
  label: PropTypes.string,
  useLabel: PropTypes.bool,
  wrapStyle: PropTypes.any,
  labelStyle: PropTypes.any,
  inputBoxStyle: PropTypes.any,
};

FormItem.displayName = 'FormItem'
