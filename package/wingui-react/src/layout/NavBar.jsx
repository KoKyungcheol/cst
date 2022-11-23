import React, { useState, useEffect } from "react";
import { useContentStore, useMenuStore } from '../store/contentStore'
import { Link } from 'react-router-dom';
import { transLangKey } from '../lang/i18n-func';
import { showMessage } from '../utils/common';
import menu from '../Menu';
import settings from "../settings";
import TopBar from "./TopBar";
import { Tooltip } from "bootstrap";
import { useUserStore } from "../store/userStore";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

function NavBar() {
  const activeViewId = useContentStore(state => state.activeViewId)
  const menus = useMenuStore(state => state.menus)
  const [breadCrumbs, setBreadCrumbs] = useState([]);
  const [username, setUsername] = useState("");
  const [displayName, doLogout] = useUserStore(state => [state.displayName, state.doLogout])
  let breadCrumbsArray = [];
  useEffect(() => {
    menu.deactivate();
    setUsername(displayName);

    breadCrumbsArray = [];
    if (Object.keys(menu.navigateObject).indexOf(activeViewId) !== -1) {
      menu.navigateObject[activeViewId].map((m, inx) => {
        menu.activate(m, inx, activeViewId)
        breadCrumbsArray.push(<li className="breadcrumb-item" key={m}><span>{transLangKey(m)}</span></li>);
      });
      if (JSON.stringify(breadCrumbsArray) !== JSON.stringify(breadCrumbs)) {
        setBreadCrumbs(breadCrumbsArray);
      }
    } else {
      if (JSON.stringify(breadCrumbsArray) !== JSON.stringify(breadCrumbs)) {
        setBreadCrumbs(breadCrumbsArray);
      }
    }
    feather.replace();
  });
  useEffect(() => {
    let tooltipTriggerList = [].slice.call(document.getElementsByClassName('topbar-toggle-icon'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new Tooltip(tooltipTriggerEl);
    })
  }, []);
  function goHome() {
    let home = ''
    if (settings.authentication != undefined) {
      let defaultUrl = settings.authentication.defaultUrl;
      if (defaultUrl.includes('home')) {
        home = '/home'
      } else {
        home = '/' + defaultUrl.replace(baseURI(), '')
      }
    }
    return home;
  }
  function createDropdownMenu() {
    function showLogoutDialog(e) {
      e.preventDefault();
      showMessage(transLangKey('CONFIRMATION'), transLangKey("MSG_LOGOUT"), { close: false }, function (answer) {
        if (answer) {
          doLogout();
        }
      })
    }
    return (
      <div className="dropdown-menu dropdown-menu-right">
        <Link to="/system/profile">
          <div className="dropdown-item"><i className="align-middle mr-1" data-feather="user"></i>{transLangKey("UI_AD_00")}</div>
          <div className="dropdown-divider"></div>
        </Link>
        <a className="dropdown-item" href="#" onClick={showLogoutDialog}>Log out</a>
      </div>
    );
  }
  return (
    <div>
      <nav className="navbar navbar-expand navbar-light navbar-bg">
        <Link to={goHome}>
          <div className="topbar-brand"></div>
        </Link>
        <a className="sidebar-toggle js-sidebar-toggle">
          <i className="hamburger align-self-center"></i>
        </a>
        <div className="col-auto ml-auto text-right mt-n1">
        </div>
        <a className="topbar-toggle js-topbar-toggle">
          <i className="topbar-toggle-icon align-self-center" data-bs-tooltip="tooltip" data-bs-placement="top" title={transLangKey("TOOLTIP_MENU_HIDE")}></i>
        </a>
        <div className="navbar-collapse collapse">
          <ul className="navbar-nav navbar-align navbar-topMenu-toggles">
            <li className="nav-item dropdown" style={{bottom: "2px"}}>
              <a className="nav-flag dropdown-toggle" href="#" id="languageDropdown" data-bs-toggle="dropdown"></a>
              <div id="languages" className="dropdown-menu dropdown-menu-right dropdown-menu-lang" aria-labelledby="languageDropdown"></div>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-flag dropdown-toggle" href="#" id="countryDropdown" data-bs-toggle="dropdown">
              </a>
              <div id="countries" className="dropdown-menu dropdown-menu-right dropdown-menu-lang" aria-labelledby="countryDropdown">
              </div>
            </li>
            <li className="nav-item dropdown">
              <a className="nav-icon dropdown-toggle d-inline-block d-sm-none" href="#" data-bs-toggle="dropdown">
                <i className="align-middle" data-feather="settings"></i>
              </a>
              <a className="nav-link dropdown-toggle d-none d-sm-inline-block" href="#" data-bs-toggle="dropdown">
                <span className="text-dark"><AccountCircleIcon></AccountCircleIcon>{username}</span>
              </a>
              {createDropdownMenu()}
            </li>
          </ul>
        </div>
      </nav>
      <TopBar menus={menus} />
    </div>
  )
}

export default NavBar