
import React from "react";

function LoadingBar() {
  return (
    <div id="content-loading-bar" className="d-none justify-content-center loading-bar">
      <div className="content-loading spinner-border text-primary" role="status">
        <span className="visually-hidden"></span>
      </div>
    </div>
  )
}

export default LoadingBar;