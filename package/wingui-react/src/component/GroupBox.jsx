import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

export function GroupBox(props) {
  return (
    <Box sx={{ border: '1px solid #efefef', width: '100%', padding: '0px 10px 10px 10px', margin: '10px 4px 0px 4px', ...props.style }}>
      <span style={{ top: '-10px', position: 'relative', background: 'white', ...props.labelStyle }}>{props.label}</span>
      <Box sx={{ width: '100%', padding: '0', margin: '0', ...props.itemBoxStyle }}>{props.children}</Box>
    </Box>
  );
}

GroupBox.propTypes = {
  label: PropTypes.string,
  labelStyle: PropTypes.object,
  itemBoxStyle: PropTypes.object,
};

GroupBox.displayName = 'GroupBox';
