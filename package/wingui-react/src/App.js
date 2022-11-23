import React, { useState, useEffect } from 'react';

import './App.css';

import { HashRouter } from 'react-router-dom';
import SideBar from './layout/SideBar';
import Content from './layout/Content';
import { useMenuStore } from './store/contentStore'
import settings, { initSettings } from "./settings";
import Settings from './layout/Settings';
import appTheme from './AppTheme'
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { useUserStore } from './store/userStore';
let initApp = false;

function App() {
  const [menus, initMenu] = useMenuStore(state => [state.menus, state.initMenu])
  const [setUserInfo] = useUserStore(state => [state.setUserInfo])
  const [settingOptions, setSettingOptions] = useState({});

  if (initApp == false) {
    initSettings(function () {
      vom.init();
      com.init();

      initLanguage();
      // authentication.evaluate();

      initMenu(settings.mode)
      setSettingOptions(settings);

      if (localStorage.getItem('preference-group') === null) {
        localStorage.setItem('preference-group', '[]');
      }
      flatpickr.setDefaults({ locale: localStorage.getItem("languageCode") })
      flatpickr.l10ns.default.weekAbbreviation = transLangKey("FP_WEEK_ABBREVIATION");
    });
    initApp = true;
  }
  useEffect(() => {
    setUserInfo();
  }, [])
  return (
    <>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={appTheme}>
          <CssBaseline />
          <HashRouter>
            <SideBar menus={menus} />
            <Content settings={settingOptions} menus={menus} />
            <Settings />
          </HashRouter>
        </ThemeProvider>
      </StyledEngineProvider>
    </>
  );
}

export default App;
