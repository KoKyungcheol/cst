import React, { useEffect } from "react";
import { transLangKey } from '../lang/i18n-func';
import { NavLink, Link } from 'react-router-dom';
import menu from '../Menu';
import { Tooltip } from "bootstrap";
import { createUniqueKey } from "../utils/common";
import { Icon } from "..";

function SideBar(props) {
  let menusItems = props.menus;
  let parentMenu = [];

  useEffect(() => {
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-tooltip="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
      return new Tooltip(tooltipTriggerEl);
    })
  });
  function createNavigateObject(i) {
    if (menu.getType(i) === "large") {
      parentMenu = [i.id];
    } else {
      if (i.items.length > 0) {
        if (parentMenu.indexOf(i.parentId) !== parentMenu.length - 1) {
          parentMenu = parentMenu.slice(0, parentMenu.indexOf(i.parentId) + 1);
        }
        parentMenu.push(i.id);
      } else {
        let breadCrumbs = parentMenu.slice(0, parentMenu.indexOf(i.parentId) + 1);
        breadCrumbs.push(i.id);
        menu.navigateObject[i.id] = breadCrumbs;
      }
    }
  }
  function createMenuTree() {
    if (menusItems && menusItems.items) {
      let menus = makeMenuTree(props.menus);
      return menus;
    }
  }
  function createIcon(iconName) {
    let iconNode = <></>
    if (Icon[iconName] !== undefined) {
      iconNode = React.createElement(Icon[iconName], { size: "18" })
    }
    return iconNode
  }
  function makeMenuTree(menus) {
    let node =
      <ul id={menus.id} className={menus.id === "" ? "sidebar-nav" : "sidebar-dropdown list-unstyled collapse"} style={document.body.dataset.sidebarLayout === "compact" ? { overflowY: "" } : menus.id === "" ? { overflowY: "auto" } : { overflowY: "hidden" }}>
        {
          menus.items.map(i => {
            let display = i.id === 'UI_AD_00' ? 'none' : ''
            return <li key={createUniqueKey()} className="sidebar-item" style={{ display: display }}>
              {
                i.items.length > 0 ?
                  <a data-bs-target={"#" + i.id} data-bs-toggle="collapse" className={menu.getType(i) === "medium" ? "sidebar-middle sidebar-link collapsed" : "sidebar-link collapsed"} data-bs-tooltip="tooltip" data-bs-placement="top" title={menu.getType(i) === "large" ? transLangKey(i.id) : ""}>
                    {
                      menu.getType(i) === "large" ? <>{createIcon(i.icon)}<span className="align-middle">{transLangKey(i.id)}</span></> : transLangKey(i.id)
                    }
                    <span className={"sidebar-badge badge bg-danger " + i.id} ></span>
                  </a>
                  :
                  <NavLink key={createUniqueKey()} to={i.path.toLowerCase()} className="sidebar-link" activeClassName="active">
                    {transLangKey(i.id)}
                    <span className={"sidebar-badge badge bg-danger " + i.id}></span>
                  </NavLink>
              }
              {
                createNavigateObject(i)
              }
              {
                makeMenuTree(i)
              }
              {
                menu.addRoute(i)
              }
            </li>
          })
        }
      </ul>;
    if (menu.getType(menus) === "large") {
      node = React.cloneElement(node, { "data-bs-parent": "#sidebar" })
    }
    return node;
  }
  return (
    <>
      {
        props.menus.items !== undefined ? <nav id="sidebar" className="sidebar js-sidebar">
          <div className="sidebar-content js-simplebar">
            <Link className="sidebar-brand" to={menu.goHome}></Link>
            {createMenuTree(props.menus)}
          </div>
        </nav> : <></>
      }
    </>

  )
}

export default SideBar
