
import React from "react";
import { transLangKey } from "../lang/i18n-func";
import vom from "../ViewObjectManager";
function Dialog() {
  return (
    <div className="modal" id={vom.active + "-dialog"} role="dialog" data-bs-backdrop="static" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 id="modal-title" className="modal-title"></h5>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close">
            </button>
          </div>
          <div id="modal-body" className="modal-body m-3"></div>
          <div className="modal-footer">
            <button id="confirm" type="button" className="btn btn-primary">{transLangKey('MSG_CONFIRM')}</button>
            <button id="cancel" type="button" className="btn btn-secondary" data-bs-dismiss="modal">{transLangKey('CANCEL')}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dialog;