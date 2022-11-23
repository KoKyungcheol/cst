import React, { useEffect, useState } from "react";
import NoticeDetails from "./NoticeDetails";

function NoticeList(props) {
  const [certainList, setCertainList] = useState(false);
  const [certain, setCertain] = useState({});
  const [empty, setEmpty] = useState("d-none");
  const [visible, setVisible] = useState("d-none");
  const [max, setMax] = useState(5);

  useEffect(() => {
    loadData();
  }, []);
  function loadData() {
    axios.get(baseURI() + 'noticeboard-home')
      .then(function (res) {
        if (!certainList) {
          setCertainList(res.data);
        }
      })
      .catch(function (err) {
        console.log(err);
      });
  }
  function loadDetails(id) {
    certainList.forEach(function (certain) {
      if (certain.id === id) {
        axios.get(baseURI() + 'noticeboard-file', {
          params: {
            BOARD_ID: id
          }
        })
          .then(function (response) {
            certain.files = response.data;
            setCertain(certain);
            setVisible("show");
          })
          .catch(function (err) {
            console.log(err);
          });
      }
    });
  }
  function setFade(show) {
    setVisible(show);
  }
  function makeTable(certainList, max) {
    if (certainList) {
      if (certainList.length === 0 && empty !== "") setEmpty("")
      let row =
        <tbody>
          {
            certainList.map((i, idx) => {
              if (idx < max) {
                return <tr key={i.id} id={i.id} onClick={() => { loadDetails(i.id) }} style={{ height: '6vh', cursor: 'pointer' }}>
                  <td>{idx + 1}</td>
                  <td>{i.title}</td>
                  <td>{new Date(i.createDttm).format("yyyy-MM-dd")}</td>
                </tr>
              }
            })
          }
        </tbody>
      return row;
    }
  }
  return (
    <div className="w-50 py-4 ps-5">
      <div className="bg-white" style={{ height: "41vh" }}>
        <div className="card flex-fill">
          <NoticeDetails visible={visible} setFade={setFade} content={certain}></NoticeDetails>
          <div className="card-header">
            <div className="card-actions float-end">
            </div>
            <h5 className="card-title mb-0">{transLangKey("NB_NOTICE")}</h5>
          </div>
          <table className="table table-sm table-striped my-0">
            <thead>
              <tr >
                <th>No</th>
                <th>{transLangKey("NB_POST_TITLE")}</th>
                <th>{transLangKey("NB_POST_DATE")}</th>
              </tr>
            </thead>
            {makeTable(certainList, max)}
          </table>
          <table className={empty + " text-center w-100"} style={{ height: "37vh" }}>
            <tbody>
              <tr>
                <td className="align-middle">
                  <i style={{ width: 35, height: 35, color: "gray" }} data-feather={"alert-circle"}></i>
                  <strong className="fs-3 p-2 align-middle">{transLangKey("MSG_WARNING_NO_NOTICE")}</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )

}

export default NoticeList;