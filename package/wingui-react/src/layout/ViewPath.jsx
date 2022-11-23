import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import { Checkbox, Link, Grid, Breadcrumbs, Stack, Divider, IconButton, Avatar, Box } from '@mui/material';
import { useStyles } from "../component/CommonStyle";
import { useContentStore, useMenuStore } from "../store/contentStore";
import { Icon } from "..";
import { useViewStore, SearchButton, RefreshButton, SaveButton } from "@zionex/imports";
import { PersonalButton } from "../component/CommonButton";
import { useHistory } from "react-router-dom";

export function ViewPath(props) {
  let history = useHistory();
  function getButtonProp(name, type) {
    let returnValue;
    props.buttons.forEach(p => {
      if (p.name === name) {
        if (type === "action") {
          returnValue = p.action()
        } else {
          returnValue = p[type]
        }
      }
    })
    return returnValue
  }
  function existButtons() {
    return props.buttons.length > 0
  }

  const classes = useStyles();
  const [addBookMark, deleteBookMark, isBookMarked] = useMenuStore(state => [state.addBookMark, state.deleteBookMark, state.isBookMarked])
  const [getViewIsUpdated] = useViewStore(state => [state.getViewIsUpdated])
  const activeViewId = useContentStore(state => state.activeViewId)
  const changeFavorite = (evt) => {
    if (evt.target.checked) {
      addBookMark(activeViewId);
    }
    else {
      deleteBookMark(activeViewId)
    }
  };
  const onSubmit = () => {
    if(getButtonProp('search', 'disable')) {
      return
    }
    if (getViewIsUpdated(vom.active)) {
      let msg = "변경된 데이타가 있습니다. 저장하지 않고 진행하시겠습니까?"
      showMessage(transLangKey('WARNING'), msg, function (answer) {
        if (answer) {
          getButtonProp('search', 'action')
        }
      });
    }
    else {
      getButtonProp('search', 'action')
    }
  }
  return (
    <Box className={classes.viewPath} >
      <Grid container direction="row" alignItems="center">
        <Grid item xs={6} >
          <Breadcrumbs separator="›" aria-label="breadcrumb">
            <Checkbox icon={<Icon.Star size={18} stroke="#e6e6e6" />} checkedIcon={<Icon.Star size={18} fill="#f1cc68" stroke="#f1cc68" />} checked={isBookMarked(activeViewId)} onChange={changeFavorite} />
            <Link underline="hover" sx={{ display: 'flex', alignItems: 'center' }} color="inherit" onClick={() => { history.push('/home') }}>
              <Icon.Home size={18} stroke="#404040" />
            </Link>
            {props.breadCrumbs}
          </Breadcrumbs>
        </Grid>
        <Grid item xs={6}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
            <SearchButton onClick={onSubmit} style={{ 'display': (getButtonProp('search', 'visible') ? "" : "none") }} disabled={getButtonProp('search', 'disable')}  />
            <SaveButton type="icon" onClick={() => getButtonProp('save', 'action')} style={{ 'display': (getButtonProp('save', 'visible') ? "" : "none") }} disabled={getButtonProp('save', 'disable')}></SaveButton>
            <Divider orientation="vertical" style={{ height: "20px", width: "1px", backgroundColor: 'black', display: existButtons() ? "" : "none" }} />
            <RefreshButton onClick={() => getButtonProp('refresh', 'action')} style={{ 'display': (getButtonProp('refresh', 'visible') ? "" : "none") }} disabled={getButtonProp('refresh', 'disable')}  />
            <PersonalButton onClick={() => getButtonProp('personalizaion', 'action')} style={{ 'display': (getButtonProp('personalizaion', 'visible') ? "" : "none") }} disabled={getButtonProp('personalizaion', 'disable')}  />
          </Stack>
        </Grid>
      </Grid>
    </Box>
  )
}

ViewPath.propTypes = {
  newhandler: PropTypes.func,
  savehandler: PropTypes.func,
  deletehandler: PropTypes.func,
  printhandler: PropTypes.func,
  exceldownhandler: PropTypes.func,
  refreshhandler: PropTypes.func,
  settingBtn: PropTypes.object,
  grids: PropTypes.array,  //엑셀로 다운로드할 grid 목록, 이값이 설정되면 printhandler 무시
  exceloptions: PropTypes.object
};

ViewPath.displayName = 'ViewPath'