const getCookie = (name) => document.cookie.split('; ').reduce((r, v) => {
  const parts = v.split('=');
  return parts[0] === name ? decodeURIComponent(parts[1]) : r;
}, '');

const getHeaders = (headers = {}, xsrfToken = false) => {
  if (xsrfToken) {
    const cookie = getCookie('XSRF-TOKEN');
    if (cookie) {
      headers['X-XSRF-TOKEN'] = cookie;
    }
  }

  const authToken = localStorage.getItem('X-AUTH-TOKEN');
  if (authToken) {
    headers['X-AUTH-TOKEN'] = authToken;
  }

  return headers;
};

export { getCookie };

export default getHeaders;
