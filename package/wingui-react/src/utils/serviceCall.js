import { useState, useEffect } from 'react';
import axios from 'axios';
import baseURI from '../baseURI';
import { showMessage } from '..';
import { waitOn, waitOff } from '@zionex/utils/waitMe'

export const useServiceCall = (axiosParams) => {
  const [response, setResponse] = useState(undefined);
  const [errCode, setErrCode] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [loading, setLoading] = useState(true);

  const internalAxios = async (params) => {
    try {
      const result = await axios.request(params);
      let res = result.data;
      if (res.errCode) {
        setErrCode(res.errCode);
        setErrMsg(res.errMsg);
      } else {
        setResponse(result.data);
      }
    } catch (error) {
      setErrCode(500);
      setErrMsg(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    internalAxios(axiosParams);
  }, []);

  return { response, errCode, errMsg, loading };
}

const zAxios = axios.create({
  baseURL: baseURI(),
  timeout: 500000
})

zAxios.interceptors.request.use(
  function (config) {

    const CancelToken = axios.CancelToken;
    let cancelFn = null;
    config.cancelToken = new CancelToken(function executor(c) { cancelFn = c; })

    let msg = config.toastMsg ? config.toastMsg : 'Please Wait...'
    config.gridId = vom.active
    let selector = config.fromPopup ? 'body' : 'contentInner-' + config.gridId;
    if (!config || config.waitOn != false) {
      waitOn(selector, msg, cancelFn);
    }
    return config;
  },
  function (error) {
    const { config } = error;
    const selector = config.fromPopup ? 'body' : 'contentInner-' + config.gridId;
    if (!config || config.waitOn != false) {
      waitOff(selector)
    }
    return Promise.reject(error);
  }
)

zAxios.interceptors.response.use(
  function (response) {
    const { config } = response;
    // const selector = config && config.gridId ? config.gridId : 'body'
    const selector = config.fromPopup ? 'body' : 'contentInner-' + config.gridId;
    if(!config || config.waitOn != false) {
      waitOff(selector);
    }

    let data = response.data;
    if (data.errCode) {
      showMessage(transLangKey('WARN'), transLangKey(data.errMsg), { close: false })
      return Promise.reject(data);
    } else if (data.success === false) {
      showMessage(transLangKey('WARN'), transLangKey(data.message), { close: false })
      return Promise.reject(data);
    } else if (data.RESULT_SUCCESS == false) {
      showMessage(transLangKey('WARN'), transLangKey(data.RESULT_MESSAGE), { close: false })
      return Promise.reject(data);
    }
    return response;
  },
  function (error) {
    const { config } = error;
    const selector = config.fromPopup ? 'body' : 'contentInner-' + config.gridId;

    if (!config || config.waitOn != false) {
      waitOff(selector);
    }
    return Promise.reject(error);
  }
)

export { zAxios }