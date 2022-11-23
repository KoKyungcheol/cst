import React from "react";
import { Box, Grid } from "@mui/material";

export function SearchRow(props) {
  let children = null;
  let childrenSx = { flex: "auto" };
  if (Array.isArray(props.children)) {
    children = [];
    props.children.map((child, idx) => {
      childrenSx = child.props.sx in props ? { ...child.props.sx } : childrenSx;
      children.push(<Grid key={idx} item xs="auto" >{child}</Grid>);
    })
  }
  else {
    children = <Grid item xs="auto">{props.children}</Grid>;
  }
  return (
    <Box style={{ padding: 0, margin: 0, display: 'flex', flexDirection: props.direction ? props.direction : 'row', width: '100%', minWidth: '1400px' }} >
      <Grid container style={{ padding: 0, margin: 0 }}>
        {children}
      </Grid>
    </Box>
  )
}
