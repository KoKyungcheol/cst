import React, { useEffect } from 'react';
import './ViewConfig.css';
import co from '../ViewContentLoader';

const ViewConfig = props => {
  useEffect(() => {
    let viewId = props.viewId + "-content"; 
    co.content = null;
    co.content = document.getElementById(viewId);
    Vue.grids = [];
    if(co.content) {
      co.load(props.viewId);
    }

  }, [props.viewId]);
  
  return (
    <div id={props.viewId + "-content"} className="content-area" />
    );
};

export default ViewConfig;