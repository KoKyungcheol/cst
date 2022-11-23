import React, { useEffect } from "react";
import { useHistory, useLocation, Link } from 'react-router-dom';
import settings from "../settings";
import menu from "../Menu";
import { dropByCacheKey } from "react-router-cache-route";
import { vom, com, vsm } from "..";
import { transLangKey } from '../lang/i18n-func';
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useContentStore } from '../store/contentStore'
import { createUniqueKey, checkGridState } from '../utils/common'
import { useViewStore } from '../store/viewStore'
import TabSetup from "../component/TabSetup";
import { IconButton } from "@mui/material";
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';


export function TabContent(props) {
  const rmViewDataEvnt = useContentStore(state => state.rmViewDataEvnt)
  const getViewIsUpdated = useViewStore(state => state.getViewIsUpdated)
  const removeViewData = useViewStore(state => state.removeViewData)

  let location = useLocation();
  let history = useHistory();

  let storeState = useContentStore.getState();
  let activeViewId = storeState.activeViewId;
  let setActiveViewId = storeState.setActiveViewId;
  let tabContentData = storeState.contentData;
  let setContentData = storeState.setContentData;

  useEffect(() => {
    if (rmViewDataEvnt.length > 0) {
      deleteTabView(rmViewDataEvnt, null, true)
    }
  }, [rmViewDataEvnt]);

  const handleChange = (result) => {
    if (!result.destination) return;
    const items = [...tabContentData];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    let selectItemPath = items[result.destination.index].path;
    if (location.pathname !== selectItemPath) {
      history.push(selectItemPath);
    }
    setContentData(items);
  };
  function isViewUpdated(viewId) {

    if (getViewIsUpdated(viewId) == true) {
      return true;
    }

    if (tabContentData) {
      for (let i = 0; i < tabContentData.length; i++) {
        let tab = tabContentData[i];
        if (tab.viewId == viewId && tab.isViewUpdated) {
          return true;
        }
        else if (tab.viewId == viewId && tab.gridStatus) {
          let updated = false;
          Object.keys(tab.gridStatus).forEach((gridStat) => {
            if (tab.gridStatus[gridStat] == true)
              updated = true;
          })
          return updated;
        }
      }
    }
    if (checkGridState(viewId) || com.checkWaitStatus(viewId)) {
      return true;
    }
    return false;
  }
  function openTab(url) {
    if (url !== location.pathname) {
      history.push(url)
      doGridResize(vom.active)
    }
  }

  function addShowTab(event, viewId) {
    setActiveViewId(viewId);
    vom.active = viewId;
    com.active = viewId;
  }

  function scrolling(e, header) {
    let w = $('#tabTemplate').get(0).scrollWidth;
    let l = $('#tabTemplate').get(0).scrollLeft;
    let tabScroll = l;

    let offset = 0;
    const sunit = 120;

    if (header) {
      let nw = tabScroll + sunit
      tabScroll = nw > w ? w : nw;
      offset = tabScroll;
    }
    else {
      let nw = tabScroll - sunit;
      tabScroll = nw < 0 ? 0 : nw;
      offset = tabScroll;
    }

    //let offset = header ? $('#tabTemplate').get(0).scrollWidth : 0;
    $('#tabTemplate').stop().animate({
      scrollLeft: offset
    }, 200);
  }
  function handleCloseView(viewId, event) {
    deleteTabView(viewId, event);
  }
  function deleteTabView(viewId, event, resetRemoveViewEvnt) {

    let filteringId = [];
    if (Array.isArray(viewId)) {
      filteringId = [...viewId]

      let updated = false

      for (let i = 0; i < viewId.length; i++) {
        let vid = viewId[i];
        if (isViewUpdated(vid)) {
          updated = true;
          break;
        }
      }

      if (updated) {
        let message = (com.checkWaitStatus(vid)) ? 'TAB_DELETE_ERROR_MSG_0001' : 'MSG_5142';
        if (confirm(transLangKey(message))) {
          _deleteTabs(viewId, event, filteringId, resetRemoveViewEvnt)
        }
      } else {
        _deleteTabs(viewId, event, filteringId, resetRemoveViewEvnt)
      }
    }
    else {
      filteringId = [viewId];

      if (isViewUpdated(viewId)) {
        let message = (com.checkWaitStatus(viewId)) ? 'TAB_DELETE_ERROR_MSG_0001' : 'MSG_5142';
        if (confirm(transLangKey(message))) {
          _deleteTabs(viewId, event, filteringId, resetRemoveViewEvnt)
        }

      } else {
        _deleteTabs(viewId, event, filteringId, resetRemoveViewEvnt)
      }
    }

    if (event) {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
    }
  }
  function _deleteTabs(viewIds, event, filteringId, resetRemoveViewEvnt) {
    if (Array.isArray(viewIds)) {
      for (let i = 0; i < viewIds.length; i++) {
        removeTab(viewIds[i]);
        dropByCacheKey(viewIds[i]);
      }
    }
    else {
      removeTab(viewIds, event);
      dropByCacheKey(viewIds);
    }
    realDeleteTabView(filteringId, resetRemoveViewEvnt)
  }
  function realDeleteTabView(filteringId, resetRemoveViewEvnt) {
    let afterRemoveContent = tabContentData.filter(data => {
      for (let i = 0; i < filteringId.length; i++)
        if (data.viewId === filteringId[i])
          return false;

      return true;
    });

    let defaultUrl = settings.authentication.defaultUrl;
    let homePath = defaultUrl.includes('home') ? '/home' : defaultUrl.replace(baseURI(), '');

    let activeIndex = afterRemoveContent.findIndex(i => i.viewId == activeViewId);
    if (activeIndex < 0)
      activeIndex = 0;
    if (afterRemoveContent.length == 0) {
      let defMenu = menu.getDefaultMenu();
      afterRemoveContent.push(defMenu)
    }
    setContentData(afterRemoveContent, resetRemoveViewEvnt);
    let replacePath = afterRemoveContent.length === 0 ? homePath : afterRemoveContent[activeIndex].path;
    history.replace(replacePath);
  }

  function removeTab(viewId) {
    removeViewData(viewId);

    vom.remove(viewId);
    com.remove(viewId);
    permission.remove(viewId);
    vsm.remove(viewId);
  }

  function createTabContent(contentData) {
    if (contentData) {
      let tab = [];

      tab.push(
        <div key={createUniqueKey()} className={"tab-container"}>
          <div className="MuiTabScrollButton MuiTabScrollButton-footer" >
            <span style={{ width: '30px', height: '30px' }}>
              <IconButton aria-label="scrollingLeft" sx={{ p: 0 }} style={{ margin: "5px 0px" }} onClick={(e) => { scrolling(e, false) }}>
                <KeyboardArrowLeftIcon></KeyboardArrowLeftIcon>
              </IconButton>
            </span>
            <span style={{ width: '30px', height: '30px' }}>
              <IconButton aria-label="scrollingRight" sx={{ p: 0 }} style={{ margin: "5px 0px" }} onClick={(e) => { scrolling(e, true) }}>
                <KeyboardArrowRightIcon></KeyboardArrowRightIcon>
              </IconButton>
            </span>
            <span style={{ width: '30px', height: '30px' }}><TabSetup /></span>
          </div>
          <DragDropContext onDragEnd={handleChange}>
            <Droppable droppableId="contentData" direction="horizontal">
              {(provided) => (
                <ul id="tabTemplate"
                  className="contentData nav nav-tabs"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  style={{ display: 'flex' }}
                  {...provided.droppableProps}
                >
                  {contentData.map((data, index) => (
                    <Draggable key={index} draggableId={index.toString()} index={index}>
                      {(provided) => (
                        <li ref={provided.innerRef}
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          key={index} className="inner nav-item" onClick={(event) => { addShowTab(event, data.viewId) }}>
                          <Link onClick={() => { openTab(data.path) }} className={activeViewId !== data.viewId ? data.viewId + " inner nav-link" : data.viewId + " inner nav-link active"} to={'#'} replace >
                            {com.checkWaitStatus(data.viewId) ? <i className="fa fa-spinner" style={{ marginRight: 5 }}></i> : false}
                            {data.viewId !== "HOME" ? transLangKey(data.viewId) : data.viewId}
                            <button onClick={(event) => { handleCloseView(data.viewId, event) }}>
                              <i className="fa fa-times" style={{ paddingBottom: 2 }}></i>
                            </button>
                          </Link>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )
      return tab;
    }
  }

  return (
    <>
      {createTabContent(tabContentData)}
    </>
  )
}
TabContent.displayName = 'TabContent'