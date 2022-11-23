import React from "react";
import Calendar from "./Calendar";
import NoticeList from "./NoticeList";
import './home.css';

function Home(props)  {

  return(
    <div className="container-fluid p-0" style={{minWidth: 1020}}>
      <div className="row position-relative">
        <img className="w-100"  style={{height: "45vh"}} src={baseURI() + "images/common/banner_home.png"}/>
        <div className="position-absolute text-white top-50 text-center start-50 home-image">
          <strong style={{fontSize: "2.25rem"}}>
            Intelligently&ensp;Control&ensp;Your&ensp;Supply&ensp;Chain
          </strong>
        </div>
      </div>
      <div className="row">
        <NoticeList></NoticeList>
        <Calendar></Calendar>
      </div>
    </div>
  )
}

export default Home;