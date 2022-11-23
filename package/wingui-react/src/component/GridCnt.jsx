import React, { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import { useViewStore } from '../store/viewStore'
import { formatComma, formatString } from "../utils/common";


export function GridCnt(props) {
  const [cnt, setCnt] = useState(0);
  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])

  useEffect(() => {
    if (props.grid) {
      const grdObj = getViewInfo(vom.active, props.grid);
      if (grdObj) {
        if (grdObj.dataProvider) {
          const dataProvider = grdObj.dataProvider;
          if (dataProvider) {
            let prevOnRowCountChanged = dataProvider.onRowCountChanged;
            dataProvider.onRowCountChanged = function (provider, count) {
              setCnt(count)
              if (prevOnRowCountChanged)
                prevOnRowCountChanged(provider, count)
            };
          }
        }
      }
    }
  }, [viewData])

  return <>{props.format ? formatString(props.format, formatComma(cnt)) : formatComma(cnt)}</>
}

GridCnt.propTypes = {
  grid: PropTypes.string
};

GridCnt.displayName = 'GridCnt'