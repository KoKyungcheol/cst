import React, { useState, useEffect, useRef } from "react";
import { ResizableBox } from "react-resizable";
import PropTypes from 'prop-types';
import Draggable from "react-draggable";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import Box from "@mui/material/Box";
import DialogActions from "@mui/material/DialogActions";
import DialogTitle from "@mui/material/DialogTitle";
import Paper from "@mui/material/Paper";
import CloseIcon from '@mui/icons-material/Close';
import { useStyles } from "./CommonStyle";

function PaperComponent(props) {
  return (
    <Draggable
      handle="#draggable-dialog-title"
      cancel={'[class*="MuiDialogContent-root"]'}>
      <Paper {...props} />
    </Draggable>
  );
}

export default function PopupDialog(props) {
  const classes = useStyles();

  const dialogTitleSt = { cursor: "move", background: "#404040", height: '50px', color: "white", display: "flex", justifyContent: "space-between", padding: "12px 14px" };
  const dialogActionSt = { height: '50px', display: "flex", justifyContent: "center" };
  const closeIconSt = { float: 'right', minWidth: '0', color: "white", cursor: "pointer" };

  const popupTitle = transLangKey(props.title);
  let type = props.type || 'OKCANCEL';
  let resizable = props.resizable ?? true;

  const dialogProps = {
    "open": props.open,
    "maxWidth": props.maxWidth ?? "xl"
  };

  const resizableBoxProps = {
    "height": props.resizeHeight ?? 300,
    "width": props.resizeWidth ?? 400,
  };

  function getButtons(type) {
    let button = null;
    if (type == 'OKCANCEL') {
      button = <>
        <Button autoFocus onClick={props.onSubmit} variant={'contained'} >{transLangKey("OK")}</Button>
        <Button autoFocus onClick={props.onClose} variant={'contained'} >{transLangKey("CANCEL")}</Button>
      </>
    } else if (type == 'CONFIRM') {
      button = <>
        <Button autoFocus onClick={props.onConfirm} variant={'contained'} >{transLangKey("CONFIRM")}</Button>
      </>
    } else {
      button = <>
        <Button autoFocus onClick={props.onSubmit} variant={'contained'} >{transLangKey("OK")}</Button>
        <Button autoFocus onClick={props.onClose} variant={'contained'} >{transLangKey("CANCEL")}</Button>
      </>
    }
    return (
      type == 'NOBUTTONS' ? <></> : <Box sx={{ justifySelf: 'flex-end', height: '50px' }}>
        <DialogActions style={dialogActionSt}>
          {button}
        </DialogActions>
      </Box>
    )
  }

  return (
    <Dialog {...dialogProps} PaperComponent={PaperComponent} aria-labelledby="draggable-dialog-title">
      {
        resizable ? (
          <ResizableBox {...resizableBoxProps} className={classes.resizable}>
            <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', alignContent: 'stretch', alignItems: 'stretch' }}>
              <DialogTitle style={dialogTitleSt} id="draggable-dialog-title">
                {popupTitle}
                <CloseIcon style={closeIconSt} onClick={props.onClose} />
              </DialogTitle>
              <Box sx={{ m: 2, display: 'flex', height: '100%', flexDirection: 'column', alignContent: 'stretch', alignItems: 'stretch' }}>
                {props.children}
              </Box>
              {getButtons(type)}
            </Box>
          </ResizableBox>
        ) : (
          <Box {...resizableBoxProps} className={classes.resizable}>
            <Box sx={{ display: 'flex', height: '100%', flexDirection: 'column', alignContent: 'stretch', alignItems: 'stretch' }}>
              <DialogTitle style={dialogTitleSt} id="draggable-dialog-title">
                {popupTitle}
                <CloseIcon style={closeIconSt} onClick={props.onClose} />
              </DialogTitle>
              <Box sx={{ m: 2, display: 'flex', height: '100%', flexDirection: 'column', alignContent: 'stretch', alignItems: 'stretch' }}>
                {props.children}
              </Box>
              {getButtons(type)}
            </Box>
          </Box>
        )
      }

    </Dialog>
  );
}

PopupDialog.propTypes = {
  title: PropTypes.string,
  resizeHeight: PropTypes.number,
  resizeWidth: PropTypes.number,
  open: PropTypes.bool,
  maxWidth: PropTypes.oneOf([
    PropTypes.number,
    PropTypes.string
  ]),
  onSubmit: PropTypes.func,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  type: PropTypes.string,
  resizable: PropTypes.bool,
};

PopupDialog.displayName = 'GridCnt';