import React, { useEffect } from "react";
import DomURL from "domurl";
import { useContentStore } from "../store/contentStore";

function Settings() {
  const [menuLayout, setMenuLayout, menuType, setMenuType]
    = useContentStore(state => [state.menuLayout, state.setMenuLayout, state.menuType, state.setMenuType])
  const url = new DomURL();

  const settingsPrefix = "";
  const settingsClassName = ".js-settings";
  const settingsToggleClassName = ".js-settings-toggle";
  const settingsResetClassName = ".js-settings-reset";
  const stylesheetClassName = ".js-stylesheet";

  const defaultProps = {
    theme: "default",
    layout: "fluid",
    sidebarPosition: "left",
    sidebarLayout: "default",
    menuType: "defaultMenu"
  }

  const props = {
    theme: ["default", "dark", "light", "colored"],
    layout: ["fluid", "boxed"],
    sidebarPosition: ["left", "right"],
    sidebarLayout: ["default", "compact"],
    menuType: ["defaultMenu", "topMenu"]
  };

  // Used to force reload on dark/light mode switch
  let activeTheme = undefined;

  const initialize = () => {
    // If query parameters are passed (e.g. ?theme=dark)
    if (Object.keys(url.query).length > 0) {
      // Reset current stored config
      resetStoredConfig();

      Object.entries(url.query).forEach(([key, value]) => {
        if (props[key] && props[key].includes(value)) {
          setDomElements(key, value);
          setStoredConfig(key, value);
        }
      });
    }
    else {
      setDomElementsByConfigs();
    }
  }

  const initializeElements = () => {

    bindSidebarEvents();

    bindConfigEvents();

    bindResetEvents();

    bindRadioEvents();

    setSelectedRadios();

    openSidebarOnFirstVisit();

    setDomElementsByConfigs();
  }

  const bindSidebarEvents = () => {
    const settingsElement = document.querySelector(settingsClassName);
    const settingsToggleElements = document.querySelectorAll(settingsToggleClassName);

    settingsToggleElements.forEach(element => {
      element.onclick = e => {
        e.preventDefault();
        settingsElement.classList.toggle("open");
        if (document.querySelector('.controlboard-settingpanel .offcanvas.show') !== null) {
          document.querySelector('.controlboard-settingpanel .offcanvas.show').classList.remove('show')
        }
      };
    })

    document.body.onclick = e => {
      if (!settingsElement.contains(e.target)) {
        settingsElement.classList.remove("open");
      }
    }
  }

  const bindConfigEvents = () => {
    const settingsElement = document.querySelector(settingsClassName);
    const radioElements = settingsElement.querySelectorAll("input[type=radio]");

    radioElements.forEach(element => {
      element.addEventListener("change", e => {
        // Set data attribute on body element
        setDomElements(e.target.name, e.target.value);
        // Save to local storage
        setStoredConfig(e.target.name, e.target.value);
      });
    })
  }

  const bindRadioEvents = () => {
    const settingsRadioElements = document.querySelectorAll('.settings-radio');

    settingsRadioElements.forEach(function (el) {
      let overflowY = (el.id == 'sidebarDefault' ? 'auto' : '');
      el.addEventListener("click", function () {
        if (el.name === "sidebarLayout") {
          document.getElementsByClassName('sidebar-nav')[0].style.overflowY = overflowY;
          if (el.id === 'sidebarCompact') {
            document.querySelectorAll('[data-bs-parent="#sidebar"]').forEach(function (eel) {
              eel.style.overflowY = '';
            })
          }
          setMenuLayout(el.id)
        } else if (el.name === "menuType") {
          setMenuType(el.id)
        }
      })
    })
  }

  const bindResetEvents = () => {
    const settingsResetElement = document.querySelector(settingsResetClassName);

    settingsResetElement.addEventListener("click", () => {
      resetStoredConfig();
      setSelectedRadios();
      setDomElementsByConfigs();
    })
  }

  const setSelectedRadios = () => {
    for (let [key, value] of Object.entries(getConfigs())) {
      const _value = value ? value : defaultProps[key];
      const element = document.querySelector(`input[name="${key}"][value="${_value}"]`);
      if (element) {
        element.checked = true;
      }
    }
  }

  const openSidebarOnFirstVisit = () => {
    setTimeout(() => {
      if (!getStoredConfig("visited")) {
        const settingsElement = document.querySelector(settingsClassName);
        settingsElement.classList.toggle("open");
        setStoredConfig("visited", true)
      }
    }, 1000);
  }

  const setDomElementsByConfigs = () => {
    for (let [key, value] of Object.entries(getConfigs())) {
      const _value = value ? value : defaultProps[key];
      setDomElements(key, _value);
    }
  }

  const setDomElements = (name, value) => {
    // Toggle stylesheet (light/dark)
    if (name === "theme") {
      const theme = value === "dark" ? "dark" : "light";
      const stylesheet = document.querySelector(stylesheetClassName);
      stylesheet.setAttribute("href", `css/${theme}.css`);

      if (activeTheme && activeTheme !== theme) {
        window.location.replace(window.location.pathname);
      }

      activeTheme = theme;
    }

    // Set data attributes on body element
    document.body.dataset[name] = value;
  }

  const getConfigs = () => ({
    sidebarLayout: getStoredConfig("sidebarLayout"),
    menuType: getStoredConfig("menuType")
  })

  const resetStoredConfig = () => {
    removeStoredConfig("sidebarLayout");
    removeStoredConfig("menuType");
  }

  const getStoredConfig = (name) => {
    return localStorage.getItem(`${settingsPrefix}${name}`);
  }

  const setStoredConfig = (name, value) => {
    localStorage.setItem(`${settingsPrefix}${name}`, value);
  }

  const removeStoredConfig = (name) => {
    localStorage.removeItem(`${settingsPrefix}${name}`);
  }

  // Apply settings (from localstorage) once body-element is available
  const documentObserver = new MutationObserver(() => {
    if (document.body) {
      initialize();

      documentObserver.disconnect();
    }
  });
  documentObserver.observe(document.documentElement, { childList: true });
  useEffect(() => {
    initializeElements()
  }, [])
  return (
    <div className="settings js-settings">
      <div className="settings-toggle js-settings-toggle">
        <i className="align-middle" data-feather="more-vertical"></i>
      </div>
      <div className="settings">
        <div className="settings-panel">
          <div className="settings-content">
            <div className="settings-title">
              <button type="button" className="btn-close btn-close-white btn-close-custom float-end js-settings-toggle" aria-label="Close">
                <i className="align-middle" data-feather="x"></i>
              </button>
              <h4 className="mb-0 d-inline-block">Settings</h4>

            </div>

            <div className="settings-options">

              <div className="mb-3">
                <small className="d-block text-uppercase font-weight-bold text-muted mb-2">Menu layout</small>
                <div className="form-check form-switch mb-1">
                  <input type="radio" className="form-check-input settings-radio" name="sidebarLayout" value="default" id="sidebarDefault" defaultChecked={true} />
                  <label className="form-check-label" htmlFor="sidebarDefault">Default</label>
                </div>
                <div className="form-check form-switch mb-1 menulayout-compact">
                  <input type="radio" className="form-check-input settings-radio" name="sidebarLayout" value="compact" id="sidebarCompact" />
                  <label className="form-check-label" htmlFor="sidebarCompact">Compact</label>
                </div>
              </div>

              <hr />

              <div className="mb-3">
                <small className="d-block text-uppercase font-weight-bold text-muted mb-2">Menu Type</small>
                <div className="form-check form-switch mb-1">
                  <input type="radio" className="form-check-input settings-radio" name="menuType" value="defaultMenu" id="defaultMenu" defaultChecked={true} />
                  <label className="form-check-label" htmlFor="defaultMenu">Default Menu</label>
                </div>
                <div className="form-check form-switch mb-1 menutype-top">
                  <input type="radio" className="form-check-input settings-radio" name="menuType" value="topMenu" id="topMenu" />
                  <label className="form-check-label" htmlFor="topMenu">Top Menu</label>
                </div>
              </div>

              <div className="mb-3">
                <a className="btn btn-outline-primary btn-lg js-settings-reset">Reset to Default</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings