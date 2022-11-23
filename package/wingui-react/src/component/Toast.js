
import React from "react";
function Toast() {
  return (
    <div className="toast-container position-absolute bottom-0 end-0 p-3" id="toastPlacement">
      <div id="toast" className="toast text-white bg-primary fade hide" role="alert" aria-live="assertive" aria-atomic="true">
        <div className="d-flex">
          <div className="toast-body">
          </div>
          <button type="button" className="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    </div>
  )
}

export default Toast;