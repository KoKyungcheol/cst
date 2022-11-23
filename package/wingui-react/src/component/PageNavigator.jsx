
import { IconButton } from '@mui/material';
import React, { useState, useEffect } from 'react';
import {Label, NumericTextBox, DropDownList } from '../component/kendo';
import { useStyles } from './CommonStyle';

function PageNavigator(props) {
  const classes = useStyles();
  const [currentPage, setCurrentPage] = useState(0);
  const [perPageSize, setPerPageSize] = useState(500);
  const tooltip = transLangKey('DATA_DISP');
  let comboboxUse = props.settings.comboboxUse;
  let isPaging = (props.settings.totalPages > 0) ? true : false;
  let isFirstPage = props.settings.currentPage <= 1;
  let isLastPage = props.settings.currentPage >= props.settings.totalPages;

  useEffect(() => {
    setCurrentPage(props.settings.currentPage);
    setPerPageSize(props.settings.perPageSize);
    comboboxUse = props.settings.comboboxUse;
    isPaging = (props.settings.totalPages > 0) ? true : false;
    isFirstPage = props.settings.currentPage <= 1;
    isLastPage = props.settings.currentPage >= props.settings.totalPages;
  }, [props.settings]);

  function doSetPageSize(event) {
    setPerPageSize(event.target.value);
    props.onClick(1, event.target.value);
  }
  function doMovePage(page) {
    if (currentPage < 0 || !currentPage) {
      doFirstPage();
    } else if (currentPage > props.settings.totalPages) {
      doLastPage();
    } else {
      props.onClick(page, perPageSize);
    }
  }
  function doMoveCurrentPage(event) {
    let page = event.target.value;
    if (page > 0 || page != null) {
      doMovePage(page);
    }
  }
  function doFirstPage() {
    // 첫 페이지로 이동
    props.onClick(1, perPageSize);
  }
  function doPrevPage()  {
    //이전 페이지로 이동
    doMovePage(currentPage - 1);
  }
  function doNextPage() {
    //다음 페이지로 이동
    doMovePage(currentPage + 1);
  }
  function doLastPage() {
    //마지막 페이지로 이동
    props.onClick(props.settings.totalPages, perPageSize);
  }
  return (
    <div className="wingui_pagingArea">
      {
        comboboxUse ? (
          <div className="parentCon">
            <div className="leftCon" title={tooltip}>
              <DropDownList id="rowsPerPage" value={perPageSize} onChange={doSetPageSize}
                data={props.settings.dataSourceArray} style={{ width: "180px", marginLeft: "5px" }} />
            </div>
            <div className="rightCon">
              <IconButton className={classes.pageNavigator} onClick={doFirstPage} disabled={!isPaging || isFirstPage}>
                <Icon.ChevronLeft />
              </IconButton>
              <IconButton className={classes.pageNavigator} onClick={doPrevPage} disabled={!isPaging || isFirstPage}>
                <Icon.ArrowLeft />
              </IconButton>
              <NumericTextBox className="pagingNumber" min={1} max={props.settings.totalPages}
                value={currentPage} onChange={doMoveCurrentPage} disabled={!isPaging} width="60px" />
              {
                isPaging ? (
                  <Label className="pagingText">{"of " + props.settings.totalPages}</Label>
                ) : (
                  <Label></Label>
                )
              }
              <IconButton className={classes.pageNavigator} onClick={doNextPage} disabled={!isPaging || isLastPage}>
                <Icon.ArrowRight />
              </IconButton>
              <IconButton className={classes.pageNavigator} onClick={doLastPage} disabled={!isPaging || isLastPage}>
                <Icon.ChevronRight />
              </IconButton>
            </div>
          </div>
        ) : (<div></div>)
      }
    </div>
  );
}

export default PageNavigator;
