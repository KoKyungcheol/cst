import React from "react";
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';

const useStyles = makeStyles({
  blockType: { display: 'block', flexDirection: 'row', flexWrap: 'wrap', padding: 0, margin: 0, width: '100%' },
  flexType: { display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: 0, margin: 0, width: '100%' },
  noWrapFlex: { display: 'flex', flexDirection: 'row', padding: 0, margin: 0, width: '100%', overflow: 'hidden', flexWrap: 'nowrap' },
  gridType: { display: 'grid', gridTemplateColumns: 'repeat(4, 364px)', columnGap: '20px', padding: 0, margin: 0, width: '100%' }
});

export function FormRow(props) {
  const classes = useStyles();
  const { sx, style, type, className, ...other } = props;

  const getClassProp = () => {
    if (className)
      return { className: className };
    else
      return { className: type ? classes[type] : classes.flexType }
  }

  return (
    <Box id='FormRow' {...getClassProp()} sx={{ width: '100%', ...sx, ...style }} {...other} >
      {props.children}
    </Box>
  )
}

FormRow.displayName = 'FormRow'