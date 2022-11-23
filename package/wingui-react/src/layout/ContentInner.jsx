import React from "react";
import { Box } from "@mui/material";
import { useStyles } from "../imports";

function ContentInner(props) {
  const classes = useStyles();
  let contentHeight = "100%";
  if (Array.isArray(props.children)) {
    props.children.forEach(c => {
      if (c && c.type.displayName === 'SearchArea') {
        contentHeight = "95%"
        return;
      }
    })
  }
  return (
    <>
      <Box {...props} id={'contentInner-' + vom.active} className={`${classes.workArea} ${"contentInner"}`} sx={{ display: 'flex', alignContent: 'stretch', alignItems: 'stretch', flexDirection: 'column', }} >
        {props.children}
      </Box>
    </>
  );
}

export default ContentInner