let rootURI;

const baseURI = () => {
  if (!rootURI) {
    let remote = document.querySelector('remote');
    if (remote) {
      rootURI = remote.getAttribute('href');
    } else {
      let tempURI = document.baseURI;
      if (tempURI) {
        rootURI = tempURI;
      } else {
        tempURI = window.location.protocol + '//' + window.location.host + window.location.pathname;
        rootURI = tempURI.substring(0, tempURI.lastIndexOf('/') + 1);
      }
    }
  }
  return rootURI;
};

export default baseURI;
