import React, { useEffect, Suspense, useState } from "react";
import { useHistory, useLocation } from 'react-router-dom';
import NavBar from './NavBar';
import settings from "../settings";
import Dialog from "../component/Dialog";
import Toast from "../component/Toast";
import LoadingBar from "../component/LoadingBar";
import menu, { getContentDataFromViewId } from "../Menu";
import { CacheSwitch, CacheRoute } from "react-router-cache-route";
import { vom, com, co } from "..";
import { transLangKey } from '../lang/i18n-func';
import { useContentStore, useHistoryModel, useMenuStore } from '../store/contentStore'
import { gridResetSize } from '../utils/common'
import { Box, Typography } from "@mui/material";
import { TabContent } from "./TabContent";
import { ViewPath } from "./ViewPath";
import { useViewStore } from "../imports";

const loading = (
  <div className="pt-3 text-center">
    <div className="sk-spinner sk-spinner-pulse"></div>
  </div>
)

function Content(props) {
  const menus = useMenuStore(state => state.menus)
  const addHistory = useHistoryModel(state => state.addHistory)
  const [getGlobalButtons] = useViewStore(state => [state.getGlobalButtons]);
  const [tabIndex, setTabIndex] = useState();

  let location = useLocation();
  let history = useHistory();
  const [breadCrumbs, setBreadCrumbs] = useState([]);

  let storeState = useContentStore.getState();
  let activeViewId = storeState.activeViewId;
  let setActiveViewId = storeState.setActiveViewId;
  let tabContentData = storeState.contentData;
  let addContentData = storeState.addContentData;

  useEffect(() => {
    if (document.querySelector('.k-animation-container .k-slide-down-enter-active') !== null) {
      window.kendo.jQuery('.k-animation-container').hide()
    }

    let home = '';
    if (settings.authentication != undefined) {
      let defaultUrl = settings.authentication.defaultUrl;
      if (defaultUrl.includes('home')) {
        home = '/home'
      } else {
        home = defaultUrl.replace(baseURI(), '')
      }
    }

    if (location.pathname === '/') {
      if (!activeViewId)
        history.push(home)
      else {
        let activeCont = getContentDataFromViewId(activeViewId);
        if (activeCont) {
          if (activeCont.pathname)
            history.push(activeCont.pathname)
          else
            history.push(home)
        }
        else {
          history.push(home)
        }
      }
    } else {
      addTabContentData(location.pathname);
      addHistory(location.pathname)
    }
  }, [props.settings, location, menus]);

  useEffect(() => {
    gridResetSize();
    let scroll = tabIndex === tabContentData.length - 1 ? $('#tabTemplate').get(0).scrollWidth : (tabIndex * ($('#tabTemplate').get(0).scrollWidth / tabContentData.length)) / 2;
    $('#tabTemplate').scrollLeft(scroll);
  }, [tabIndex]);

  useEffect(() => {
    const el = document.querySelector(".tab-container");
    el.addEventListener('wheel', (event, delta) => {
      let _scrollX = event.deltaY > 0 ? $('#tabTemplate').scrollLeft() + 100 : $('#tabTemplate').scrollLeft() - 100;
      $('#tabTemplate').scrollLeft(_scrollX);
      event.preventDefault();
    }, { passive: true });
  });
  let breadCrumbsArray = [];
  useEffect(() => {
    breadCrumbsArray = [];
    if (Object.keys(menu.navigateObject).indexOf(activeViewId) !== -1) {
      menu.navigateObject[activeViewId].map((m, inx) => {
        menu.activate(m, inx, activeViewId)
        breadCrumbsArray.push(<Typography key={m}>{transLangKey(m)}</Typography>);
      });
      if (JSON.stringify(breadCrumbsArray) !== JSON.stringify(breadCrumbs)) {
        setBreadCrumbs(breadCrumbsArray);
      }
    } else {
      if (JSON.stringify(breadCrumbsArray) !== JSON.stringify(breadCrumbs)) {
        setBreadCrumbs(breadCrumbsArray);
      }
    }
  });
  function addTabContentData(location) {
    menu.views.map((route, idx) => {
      let visibility = route.path === location ? 'visible' : 'hidden';

      if (route.path === location) {
        if (tabContentData.findIndex(i => i.viewId == route.viewId) === -1) {
          let insertContent = { viewId: route.viewId, path: route.path, pathname: route.pathname, type: route.type };
          addContentData(insertContent);
          setTabIndex(tabContentData.length);
        } else {
          setTabIndex(tabContentData.findIndex(i => i.viewId == route.viewId));
        }
        setActiveViewId(route.viewId)
        vom.active = route.viewId;
        com.active = route.viewId;

        document.title = transLangKey(route.viewId)?? "T³SmartSCM";
      }
      if (vom.get(route.viewId)) {
        let viewComponent = com.get(route.viewId);
        for (let componentId in viewComponent.getComponents()) {
          let component = com.get(viewComponent.id).getComponent(componentId);
          if (component.type == 'WINDOW') {
            if (window.kendo.jQuery(component.element).data('kendoWindow')) {
              component.element.parentElement.style.visibility = visibility;
            }
          }
        }
      }
    });
  }
  return (
    <Box className="main">
      <NavBar />
      <TabContent></TabContent>
      <Box role="main" className="content">
        <ViewPath breadCrumbs={breadCrumbs} buttons={getGlobalButtons(vom.active)}></ViewPath>
        <Box className="container-fluid p-0">
          <Suspense fallback={loading}>
            <CacheSwitch>
              {
                menu.views.map((route, idx) => {
                  if (route.path === location.pathname) {
                    vom.active = route.viewId;
                    com.active = route.viewId;

                    if (route.type !== "viewconfig") {
                      co.load(route.viewId, true)
                    }
                  }

                  return route.component && (
                    <CacheRoute
                      key={idx}
                      cacheKey={route.viewId}
                      path={route.path}
                      name={route.name}
                      exact={route.exact}
                      render={props => (
                        <route.component viewId={route.viewId} {...props} />
                      )}
                      behavior={cached => cached ? { style: { display: "none" } } : { style: { height: "100%" } }}
                    />
                  )
                })
              }
            </CacheSwitch>
          </Suspense>
        </Box>
      </Box>
      <Dialog />
      <Toast />
      <LoadingBar />
    </Box>
  )
}

export default Content