import React from "react";
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useStyles } from "../imports";

export function StatusArea(props) {
  const classes = useStyles();
  const { message } = { ...props }

  return props.show ?? <Box component="footer" sx={{ mt: 'auto', maxWidth: "sm", height: "35px" }} className={classes.statusArea} {...props} >
    <Typography sx={{ ml: 1 }} align={"left"}>{message} {props.children}</Typography>
  </Box>
}

StatusArea.propTypes = {
  message: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.func,
  ]),
};


StatusArea.displayName = 'StatusArea'