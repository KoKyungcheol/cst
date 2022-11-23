import React, { useEffect } from "react";

function NoContent() {
  useEffect(() => {
  },[]);
  return (
    <>
      <div className="row justify-content-md-center">
        <div className="col-md-auto" >
          <Icon.AlertOctagon size={36} className="text-center" />
        </div>
      </div>
      <div className="row justify-content-md-center">
        <div className="col-md-auto" >
          <h3>화면을 찾을 수 없습니다.</h3>
        </div>
      </div>
    </>
  )
}

export default NoContent;