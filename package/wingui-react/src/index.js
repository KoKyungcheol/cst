import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import React from 'react';
import ReactDOM from 'react-dom/client';
import '../node_modules/realgrid/dist/realgrid-style.css'
import '../node_modules/choices.js/public/assets/styles/choices.css'
import App from './App';
import * as serviceWorker from './serviceWorker';
import lo from './lang/LanguageObject';
import authentication from './Authentication'
import baseURI from './baseURI';
import co from './ViewContentLoader';
import com from './ViewComponentManager'
import vom from './ViewObjectManager';
import vsm from './ViewServiceManager';
import menu from './Menu';
import getHeaders, { getCookie } from './getHeaders';
import settings, { initSettings } from './settings';
import axios from 'axios';
import permission from './Permission';
import feather from 'feather-icons';
import flatpickr from "flatpickr";
import * as Icon from 'react-feather';
import { setLoadingBar } from "./Loading"; 
import {
  Chart as ChartJS, RadialLinearScale, ArcElement, Tooltip, Legend
} from 'chart.js';
ChartJS.register(RadialLinearScale, ArcElement, Tooltip, Legend);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

export * from './const';
export * from './utils/common';
export * from './utils/grid';
export * from './utils/gantt';
export * from './component/kendo'
export * from './lang/i18n-func';
export {
  Icon,
  authentication,
  baseURI,
  co,
  com,
  vom,
  vsm,
  lo,
  menu,
  getHeaders,
  settings,
  initSettings,
  permission,
  axios,
  feather,
  flatpickr,
  getCookie,
  setLoadingBar
};
