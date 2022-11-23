import React, { useState } from "react";
import { useHistory, useLocation, Prompt } from 'react-router-dom';
import vo from '../ViewObject';

function PromptMessage() {
  const [confirmedNavigation, setConfirmedNavigation] = useState(false);
  let location = useLocation();
  let history = useHistory();

  const checkChanges = () => {
    let returnValue = false;

    if (vo.includeVue()) {
      Object.keys(Vue.grids).forEach(gridId => {
        let gridView = Vue.grids[gridId].gridView;
        if (gridView && Object.keys(gridView).length > 0) {
          gridView.commit(true);

          let dataProvider = gridView.getDataProvider();
          let statRows = dataProvider.getAllStateRows();

          let stats = Object.getOwnPropertyNames(statRows);
          for (let i = 0, n = stats.length; i < n; i++) {
            let stat = statRows[stats[i]];
            if (stat.length > 0) {
              returnValue = true;
            }
          }
        }
      });
    } else {
      if (vo.type !== "viewconfig") {
        
      } else {
        return com.checkChanges();
      }
    }
    return returnValue;
  }
  const handlePrompt = (nextLocation) => {
    if (nextLocation.pathname == location.pathname) {
      return false;
    }

    if (confirmedNavigation) {
      setConfirmedNavigation(false);
      return true;
    } else {
      if (checkChanges()) {
        showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5142'), function (answer) {
          if (answer) {
            setConfirmedNavigation(true);
            history.push(nextLocation.pathname);
          }
        });
        return false;
      } else {
        return true;
      }
    }
  }
  return (
    <Prompt when={true} message={handlePrompt} />
  );
}

export default PromptMessage