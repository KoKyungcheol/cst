import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { useContentStore } from '../store/contentStore'
import { transLangKey } from '../lang/i18n-func';
import ClickAwayListener from '@mui/base/ClickAwayListener';
import Checkbox from '@mui/material/Checkbox';
import CloseIcon from '@mui/icons-material/Close';
import TabIcon from '@mui/icons-material/Tab';

const styles = {
  position: 'absolute',
  top: 28,
  zIndex: 9999999,
  border: '1px solid',
  p: 1,
  bgcolor: 'background.paper',
  height: 400,
  right: 0,
};

export default function TabSetup(props) {

  const [contentData, fireRemoveViewEvnt] = useContentStore(state => [state.contentData, state.fireRemoveViewEvnt])

  const [open, setOpen] = React.useState(false);
  const [checkState, setCheckState] = React.useState({});

  const handleClickAway = () => {
    setOpen(false);
  };

  let tabViews = contentData;

  const checkChanged = (id, checked) => {

    let newCheckState = { ...checkState }
    newCheckState[id] = checked;
    setCheckState(newCheckState);
  }

  const handleClick = (event) => {
    setOpen((previousOpen) => !previousOpen);
  };

  const closeView = (viewId) => {
    fireRemoveViewEvnt(viewId)
  };

  const closeChecked = (event) => {

    let viewIds = []
    for (let i = 0; i < tabViews.length; i++) {
      let view = tabViews[i]
      if (checkState[view.viewId] === true) {
        viewIds.push(view.viewId);
      }
    }
    if (viewIds.length > 0) {
      fireRemoveViewEvnt(viewIds)
    }
    else {
      //alertMessage('선택된 탭이 없습니다.')
    }
  }

  const closeAll = (event) => {

    let viewIds = []
    for (let i = 0; i < tabViews.length; i++) {
      let view = tabViews[i]
      viewIds.push(view.viewId);
    }
    if (viewIds.length > 0) {
      fireRemoveViewEvnt(viewIds)
    }
    else {
      //alertMessage('??')
    }
  }

  return (
    <ClickAwayListener mouseEvent="onMouseDown" touchEvent="onTouchStart" onClickAway={handleClickAway} >
      <Box sx={{ position: 'relative' }}>
        <IconButton aria-label="pageSetup" sx={{ p: 0 }} onClick={handleClick} style={{ margin: "5px 0px" }} src='/images/icons/images/btn_MDI_closeAll_S.png'>
          <TabIcon></TabIcon>
        </IconButton>
        {open ? (
          <Box sx={styles} >
            <Paper sx={{ m: 1, p: 1, height: '100%' }}>
              <Box sx={{ display: 'inline-flex', height: '40px', width: '250px' }} >
                <Stack direction="row" alignItems="center" spacing={1} style={{ margin: '0 32px' }}>
                  <Button onClick={closeChecked} variant='outlined' style={{ marginRight: '6px' }} >
                    <Typography sx={{ p: 1 }} >{transLangKey('SELECT_CLOSE')}</Typography>
                  </Button>
                  <Button onClick={closeAll} variant='outlined'>
                    <Typography sx={{ p: 1 }}>{transLangKey('ALL_CLOSE')}</Typography>
                  </Button>
                </Stack>
              </Box>
              <Paper elevation={0} sx={{ m: 1, p: 0 }} style={{ maxHeight: 'calc(100% - 45px)', overflow: 'auto' }}>
                <List sx={{ pt: 0, width: '250px' }} spacing={0.5}>
                  {tabViews.map((content) => (
                    <ListItem key={content.viewId} size='small' style={{ height: '45px' }}>
                      <Checkbox size="small" onChange={evt => checkChanged(content.viewId, evt.target.checked)} />
                      <ListItemText primary={transLangKey(content.viewId)} />
                      <IconButton onClick={() => closeView(content.viewId)} >
                        <CloseIcon size='small' />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Paper>
          </Box>
        ) : null}
      </Box>
    </ClickAwayListener>
  );
}

TabSetup.displayName = 'TabSetup'
