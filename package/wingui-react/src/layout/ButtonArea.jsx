import React from 'react'
import { Box } from '@mui/material';
import { transLangKey } from "../lang/i18n-func";

export function ButtonArea(props) {
  let buttons;
  if (props.grid) {
    buttons = React.Children.map(props.children, (child, i) => {
      let cProps = { grid: props.grid }
      if (props.format) {
        cProps.format = props.format;
      }
      return React.cloneElement(child, cProps);
    });
  }
  else if (props.gridCount) {
    buttons = React.Children.map(props.children, (child, i) => {
      return React.cloneElement(child, { gridCount: props.gridCount });
    });
  } else {
    buttons = props.children;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: "baseline" }} p={1}>
      {props.title && <span className="gridTitle">{transLangKey(props.title)}</span>}
      {buttons}
    </Box>
  )
}

export function LeftButtonArea(props) {
  return (
    <Box sx={{ flex: 1 }}>
      {props.children}
    </Box>
  )
}

export function RightButtonArea(props) {
  return (
    <Box sx={{ flex: 1 }} style={{ textAlign: "right" }}>
      {props.children}
    </Box>
  )
}
