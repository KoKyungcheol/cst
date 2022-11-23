import React, { useEffect } from "react";
import { NavLink } from 'react-router-dom';
import menu from '../Menu';
import { transLangKey } from '../lang/i18n-func';
import './TopBar.css';
import { createUniqueKey } from "../utils/common";

function TopBar(props) {
  useEffect(() => { 
    init()
  }, []);
  function init() {
    const topBarElement = document.getElementsByClassName("topmenu-bar")[0];
    const topBarToggleElement = document.getElementsByClassName("js-topbar-toggle")[0];
    const topBarToggleIconElement = document.getElementsByClassName("topbar-toggle-icon")[0];
    const body = document.getElementsByTagName("body")[0];

    topBarToggleElement.addEventListener("click", () => {
      topBarElement.classList.toggle("collapsed");
      topBarToggleIconElement.classList.toggle("collapsed");
      body.classList.toggle("topbar-collapsed");
      let toolTipTitle = topBarToggleIconElement.classList.contains('collapsed') ? transLangKey("TOOLTIP_MENU_SHOW") : transLangKey("TOOLTIP_MENU_HIDE");
      document.getElementsByClassName('topbar-toggle-icon')[0].setAttribute('data-original-title', toolTipTitle);
    });
  }
  function makeMenuTree(menus) {
    let node =
      <ul id={menus.id + "-topTemplate"} className={menus.id === "" ? "sidebar-nav" : "dropdownMenu-list sidebar-dropdown list-unstyled collapse"} >
        {
          menus.items.map(i => {
            let display = i.id === 'UI_AD_00' ? 'none' : ''
            return <li key={createUniqueKey()} className="sidebar-item sub-menu" style={{ display: display }}>
              {
                i.items.length > 0 ?
                  <a data-toggle="collapse" className={menu.getType(i) === "medium" ? "sidebar-middle dropdown-sidebar-link sidebar-link collapsed top-link" : "sidebar-link collapsed"}>
                    <span className="align-middle">{transLangKey(i.id)}</span>
                    <span className={"sidebar-badge badge bg-danger " + i.id} ></span>
                  </a>
                  :
                  <NavLink key={createUniqueKey()} to={i.path.toLowerCase()} className="dropdown-sidebar-link sidebar-link top-link">
                    {transLangKey(i.id)}
                    <span className={"sidebar-badge badge bg-danger " + i.id}></span>
                  </NavLink>
              }
              {
                makeMenuTree(i)
              }
            </li>
          })
        }
      </ul>;
    if (menu.getType(menus) === "large") {
      node = React.cloneElement(node, { "data-parent": "#sidebar" });
    }
    return node;
  }

  function makeMenuTreeInit(menus) {
    if (!menus)
      return null;

    if (Object.keys(menus).length !== 0) {
      let node =
        <ul id={menus.id + "-topTemplate"} className="navbar-nav">{
          menus.items.map(i => {
            let display = i.id === 'UI_AD_00' ? 'none' : ''
            return <li key={createUniqueKey()} className="topMenuGroup-sidebar-item" style={{ display: display }}>{
              i.items.length > 0 ?
                <a className={menu.getType(i) === "medium" ? "sidebar-middle dropdown-sidebar-link sidebar-link collapsed" : "dropdown-sidebar-link sidebar-link collapsed"}>
                  <span className="align-middle font-weight-bold top-menu-title">{transLangKey(i.id)}</span>
                  <span className={"sidebar-badge badge bg-danger " + i.id} ></span>
                </a>
                :
                <NavLink key={createUniqueKey()} to={i.path} className="sidebar-link">
                  {transLangKey(i.id)}
                  <span className={"sidebar-badge badge bg-danger " + i.id}></span>
                </NavLink>
            }{
                makeMenuTree(i)
              }
            </li>
          })
        }
        </ul>
      if (menu.getType(menus) === "large") {
        node = React.cloneElement(node, { "data-parent": "#sidebar" })
      }
      return node;
    }
  }
  return (
    <div id="topMenu" className={"topmenu-bar"}>
      {makeMenuTreeInit(props.menus)}
    </div>
  )
}

export default TopBar
