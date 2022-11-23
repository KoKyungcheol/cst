import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { Box } from "@mui/material";


function Item(props) {
  const { sx, ...other } = props;
  return (
    <Box
      sx={{
        bgcolor: '#f4f6fb',
        fontSize: '13px',
        fontFamily: 'Noto Sans KR',
        fontWeight: '400',
        padding: '2px',
        paddingRight: '8px',
        ...sx,
      }}
      {...other}
    />
  );
}

Item.propTypes = {
  sx: PropTypes.oneOfType([
    PropTypes.arrayOf(
      PropTypes.oneOfType([PropTypes.func, PropTypes.object, PropTypes.bool]),
    ),
    PropTypes.func,
    PropTypes.object,
  ]),
};

export function FormArea(props) {
  const [children, setChildren] = useState([]);

  const { sx, style, className, ...other } = props;

  const getClassProp = () => {
    return className ? { className: className } : null
  }
  useEffect(() => {
    const childrens = React.Children.map(props.children, (child, idx) => {
      return (<Box>{child}</Box>);
    });
    setChildren(childrens)
  }, [])

  return (
    <Box id='FormArea' {...getClassProp()} sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', padding: 0, margin: 0, backgroundColor: "#fff", ...sx, ...style }} {...other}>
      {props.children}
    </Box>
  )
}

FormArea.propTypes = {
};

FormArea.displayName = 'FormArea'
