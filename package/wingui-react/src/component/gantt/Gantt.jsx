import React, { useEffect } from 'react';
import GanttActivityDetail from './GanttActivityDetail';

function Gantt(props) {
  useEffect(() => {
    initI18n(localStorage.getItem('languageCode'))
    return () => {
      TGGrids[props.id].Dispose();
      TGDelEvent(null, props.id, null);
    };
  }, []);

  useEffect(() => {
    if (Object.keys(props.initialConfig).length > 0 && !TGGrids[props.id]) {
      initializeGanttChart();
    }
  }, [props.initialConfig]);

  function initializeGanttChart() {
    const source = {
      Layout: {Data: props.initialConfig},
      Data: {Data: {Body: [[]]}},
      Upload: {Format: 'JSON'}
    };
    const gantt = TreeGrid(source, props.id, {id: props.id});
    props.create(gantt);
  }

  return (
    <>
      <div id={props.id} style={{ height: '100%', width: '100%' }} />
      {props.details && (<GanttActivityDetail id={props.id} details={props.details} />)}
    </>
  );
}

export default Gantt;
