import React, { useEffect, useState } from "react";

function NoticeDetails(props) {
  const [index, setIndex] = useState(-1);
  
  useEffect(() => {
    if (props.visible === "show") {
      setIndex(100);
    }
  }, [props]);
  function createContent(contents) {
    let codes = contents;
    return (
      <div className="detailContent" dangerouslySetInnerHTML={{ __html: codes }}></div>
    );
  }
  function createFiles(files) {
    if (files) {
      let codes =
        files.map(((file, idx) => {
          let url = "file-storage/file?ID=" + file.id;
          return <p key={idx}><a href={url}>{file.fileName}</a></p>
        }));
      return codes;
    }
  }
  function handleClick(visible) {
    setIndex(-1);
    props.setFade(visible);
  }
  function getDateFormat(date) {
    if (date) {
      let createTime = new Date(date.substring(0, 19));
      let dateTime =
        createTime.getFullYear() + '/' +
        ('0' + (createTime.getMonth() + 1)).slice(-2) + '/' +
        ('0' + createTime.getDate()).slice(-2) + ' ' +
        ('0' + createTime.getHours()).slice(-2) + ':' +
        ('0' + createTime.getMinutes()).slice(-2) + ':' +
        ('0' + createTime.getSeconds()).slice(-2);

      return dateTime;
    }
  }
  return (
    <div className={"alert popup-shadow min-vw-50 mh-50 position-absolute start-100 border translate-middle alert-primary alert-outline alert-dismissible fade " + props.visible} style={{ zIndex: index, top: "-30%" }}>
      <div className="alert-message">
        <h2 className="alert-heading">{props.content.title}</h2>
        <strong>{transLangKey("NB_POST_DATE")}</strong>
        <span className="px-2">
          {getDateFormat(props.content.createDttm)}
        </span>
        <strong className="ps-2">{transLangKey("WRITER")}</strong>
        <span className="p-2">
          {props.content.createBy}
        </span>
        <hr></hr>
        {createContent(props.content.content)}
        <hr></hr>
        {createFiles(props.content.files)}
        <div className="btn-list d-flex justify-content-center">
          <button style={{ minWidth: 105 }} className="w-10 btn btn-facebook" onClick={() => handleClick(" d-none")} type="button">{transLangKey("OK")}</button>
        </div>
      </div>
    </div>
  )
}

export default NoticeDetails;