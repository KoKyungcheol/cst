
import React, { useState, useEffect, useRef } from "react";
import PropTypes from 'prop-types';
import PopupDialog from "@zionex/component/PopupDialog";
import { useForm } from "react-hook-form";
import { Box, IconButton } from '@mui/material';
import {
  SearchArea, ButtonArea, RightButtonArea, InputField, BaseGrid, useViewStore, zAxios
} from '@zionex/imports';
import { showMessage } from "@zionex";

let psnzGridItems = [
  { name: "userPrefMstId", dataType: "text", headerText: "USER_PREF_MST_ID", visible: false },
  { name: "grpId", dataType: "text", headerText: "GRP_CD", visible: false },
  { name: "userId", dataType: "text", headerText: "USER_ID", visible: false },
  { name: "fldCd", dataType: "text", headerText: "COLUMN_ID", visible: true, editable: false, width: 200 },
  {
    name: "fldApplyCd", dataType: "text", headerText: "COLUMN_APPLY_ID", visible: true, editable: false, width: 200,
    styleCallback: function (grid, dataCell) {
      let ret = {}
      const applyYn = grid.getValue(dataCell.index.itemIndex, "applyYn");
      if (applyYn == false) {
        ret.editable = false;
        ret.readonly = true;
      }
      return ret;
    }
  },
  {
    name: "fldApplyCdLang", dataType: "text", headerText: "COLUMN_APPLY_NM", visible: true, width: 140,
    displayCallback: function (grid, index, value) {
      return transLangKey(value);
    }
  },
  { name: "fldWidth", dataType: "number", headerText: "COLUMN_WIDTH", visible: true, editable: true, width: 80, positiveOnley: true },
  { name: "fldSeq", dataType: "number", headerText: "COLUMN_SEQ", visible: true, editable: true, width: 80 },
  {
    name: "fldActiveYn", dataType: "boolean", headerText: "COLUMN_ACTIVE_YN", visible: true, editable: true, width: 80,
    styleCallback: function (grid, dataCell) {
      let ret = {}
      const applyYn = grid.getValue(dataCell.index.itemIndex, "applyYn");

      if (applyYn == false) {
        ret.editable = false;
        ret.readonly = true;
      }
      return ret;
    }
  },
  { name: "applyYn", dataType: "boolean", headerText: "APPY_YN", visible: false },
  { name: "referValue", dataType: "text", headerText: "REFER_VALUE", visible: false },
  { name: 'dataKeyYn', dataType: "boolean", headerText: "DATA_KEY_YN", visible: false },
  {
    name: "crosstabItemCd", dataType: "text", headerText: "CROSSTAB_ITEM_CD", visible: false,
    styleCallback: function (grid, dataCell) {
      let ret = {}
      if (dataCell.value === 'GROUP-VERTICAL-VALUES') {
        ret.editable = false;
        ret.readonly = true;
      }

      const crosstabYn = grid.getValue(dataCell.index.itemIndex, "crosstabYn");
      const fldCd = grid.getValue(dataCell.index.itemIndex, "fldCd");
      if (crosstabYn == false && fldCd === 'CATEGORY') {
        ret.editable = false;
        ret.readonly = true;
      }

      return ret;
    }
  },
  { name: "crosstabYn", dataType: "boolean", headerText: "PIVOT_GRID_YN", visible: false },
  { name: "summaryTp", dataType: "text", headerText: "SUMMARY_TP", visible: false },
]

function PopPersonalize(props) {
  const [psnzGrid, setpersonalizeGrid] = useState(null);
  const [codeNameMap, setCodeNameMap] = useState([]);
  const userGroupData = useRef([])
  const [userGroupOptions, setUserGroupOptions] = useState([])

  const [viewData, getViewInfo] = useViewStore(state => [state.viewData, state.getViewInfo])
  const { handleSubmit, getValues, setValue, watch, control, formState: { errors }, clearErrors } = useForm({
    defaultValues: {
      gridNm: '',
      userGrp: props.userGrp
    }
  });

  useEffect(() => {
    const grdObjPopup = getViewInfo(vom.active, 'psnzGrid');
    if (grdObjPopup) {
      setpersonalizeGrid(grdObjPopup);
    }
  }, [viewData]);

  useEffect(() => {
    if (psnzGrid) {
      loadData(getValues());
      setOptions();
    }
  }, [psnzGrid]);

  useEffect(() => {
    if (getValues('userGrp') !== undefined) {
      loadData(getValues());
    }
  }, [getValues('userGrp')]);


  useEffect(() => {
    loadCodeNameMap(props.viewCd);
  }, []);

  const gridNm = watch('gridNm');
  useEffect(() => {
    if (gridNm && props.open) {
      loadData(getValues());
      setOptions();
    }
  }, [gridNm]);

  useEffect(() => {
    if (gridNm && props.open) {
      onGridComboboxChanged(props.viewCd)
      loadPreferenceDetailGroups(gridNm, props.username)
    }
  }, [gridNm, props.username, props.authTpId, props.open]);

  useEffect(() => {
    if (userGroupOptions && userGroupOptions.length > 0) {
      const grpId = getUserGrpID(props.authTpId)
      const opts = userGroupOptions.filter((opt) => (opt.value == grpId))
      if (opts.length > 0) {
        setValue('userGrp', opts[0].value)
      }
      else setValue('userGrp', userGroupOptions[0].value)
    }
  }, [userGroupOptions]);

  const setOptions = () => {
    psnzGrid.gridView.setEditOptions({ insertable: false, appendable: false });

    psnzGrid.gridView.onEditCommit = function (gridView, index, oldValue, newValue) {
      if (index.fieldName === "fldActiveYn") {
        gridView.setValue(index.itemIndex, 'crosstabYn', newValue)
      }
    };

  }
  const onError = (errors, e) => {
    if (typeof errors !== "undefined" && Object.keys(errors).length > 0) {
      $.each(errors, function (key, value) {
        showMessage(transLangKey('WARNING'), `[${value.ref.name}] ${value.message}`);
        clearErrors();
        return false;
      });
    }
  }

  const loadCodeNameMap = (viewCd) => {
    let param = { 'view-cd': viewCd }

    zAxios({
      method: 'get',
      header: { 'content-type': 'application/json' },
      url: 'system/users/preference-masters/code-name-maps',
      params: param
    }).then(function (res) {
      let options = [];
      res.data.map((item, idx) => { options.push({ label: transLangKey(item.name), value: item.id, gridCd: item.code }) })
      setCodeNameMap(options);
      if (options.length > 0) {
        setValue('gridNm', options[0].value)
      }
    })
      .catch(function (err) {
        console.log(err);
      })
  }

  const loadPreferenceDetailGroups = (prefMsgId, username) => {
    if (!prefMsgId || !username) {
      return;
    }

    let param = {
      'pref-mst-id': prefMsgId,
      'username': username
    }
    zAxios({
      method: 'get',
      header: { 'content-type': 'application/json' },
      url: 'system/users/preference-details/groups',
      params: param
    }).then(function (res) {
      let options = []
      if (res.data) {
        userGroupData.current = res.data;
        res.data.map((entry, idx) => { options.push({ label: transLangKey(entry.grpNm), value: entry.id }) })
      }
      setUserGroupOptions(options)
      setValue('userGrp', options[0].value);
    }).catch(function (err) {
      console.log(err);
    })
  }

  const getUserGrpCd = (grpId) => {
    const grpData = userGroupData.current.find(v => v.id === grpId)
    if (grpData) {
      return grpData.grpCd;
    }
  }
  const getUserGrpID = (grpCd) => {
    const grpData = userGroupData.current.find(v => v.grpCd === grpCd)
    if (grpData) {
      return grpData.id;
    }
  }

  const onGridComboboxChanged = function (viewId) {
    let prefrences = new Array();

    if (!props.username) {
      return;
    }

    let localItem = localStorage.getItem('preference-group');
    let userName = props.username;
    let value = getValues('userGrp');

    if (value == undefined || value.length <= 0) {
      value = props.authTpId;
    }
    if (!value) {
      return;
    }

    let idx = -1;
    if (localItem && localItem.length > 0) {
      prefrences = JSON.parse(localItem);
      for (let i in prefrences) {
        let row = prefrences[i];
        if (row.viewId == viewId && row.username == userName) {
          prefrences[i].grpCd = getUserGrpCd(value);
          idx = 0;
        }
      }
    }
    if (idx == -1) {
      let obj = {};
      obj.viewId = viewId;
      obj.grpCd = value;
      obj.username = userName;
      prefrences.push(obj);
    }
    localStorage.setItem('preference-group', JSON.stringify(prefrences));
    reloadPrefInfoCallback(getUserGrpCd(value));
  }

  const initPersonalize = () => {
    showMessage(transLangKey('WARNING'), transLangKey('MSG_5048'), function (answer) {
      if (answer) {
        let param = new URLSearchParams();
        param.append('pref-mst-id', getValues('gridNm'))
        param.append('group-id', getValues('userGrp'))
        param.append('username', props.username)

        zAxios({
          method: 'get',
          header: { 'content-type': 'application/json' },
          url: 'system/users/preferences/init',
          params: param
        }).then(function (res) {
          reloadPrefInfoCallback(getUserGrpCd(grpCd))
        }).catch(function (err) {
          console.log(err);
        }).then(function () {
        });
      }
    })
  }

  const loadData = (data) => {
    if (psnzGrid.isUpdated()) {
      showMessage(transLangKey('WARNING'), transLangKey('MSG_5142'), function (answer) {
        if (answer) {
          loadActual(data)
        }
      })
    }
    else {
      loadActual(data)
    }
  }

  const doAfterSetData = function () {
    let aColumn = psnzGrid.gridView.columnByField('dataKeyYn');
    let filters = [{ name: 'true', criteria: 'value' }, { name: 'false', criteria: 'not value' }];

    psnzGrid.gridView.setColumnFilters('dataKeyYn', filters);
    psnzGrid.gridView.activateColumnFilters(aColumn, ['false'], true);
    psnzGrid.gridView.orderBy(['fldSeq'], ['ascending']);
  }

  const loadActual = (data) => {
    let gridNm = getValues('gridNm')
    let userGrp = getValues('userGrp')

    if (gridNm && userGrp) {
      psnzGrid.gridView.showToast(progressSpinner + 'Load Data...', true);
      let param = new URLSearchParams();
      param.append('pref-mst-id', gridNm);
      param.append('group-id', userGrp);
      param.append('username', props.username);

      zAxios({
        method: 'get',
        header: { 'content-type': 'application/json' },
        url: 'system/users/preferences',
        params: param
      }).then(function (res) {
        psnzGrid.dataProvider.fillJsonData(res.data);
        window.requestAnimationFrame(doAfterSetData)
      }).catch(function (err) {
        console.log(err);
      }).then(function () {
        psnzGrid.gridView.hideToast();
      });
    }
  }

  function reloadPrefInfoCallback(grpCd) {
    const opt = codeNameMap.find(item => item.value == gridNm)
    if (props.resetCallback) {
      const gridCd = opt ? opt.gridCd : undefined
      let targetGrd;
      if (Array.isArray(props.grid)) {
        for (let i = 0; i < props.grid.length; i++) {
          const grd = props.grid[i];
          let grdCd = grd.gridView.gridCd;
          grdCd = grdCd.replace('-', '_')
          if (grdCd.includes(gridCd)) {
            targetGrd = grd;
            break;
          }
        }
      } else {
        targetGrd = props.grid;
      }
      props.resetCallback(props.viewCd, props.username, targetGrd, grpCd, gridCd)
    }
  }

  const saveData = (targetGrid) => {
    targetGrid.gridView.commit(true);

    //일괄 유효성 확인
    let log = targetGrid.gridView.validateCells();
    if (log !== null && log.length > 0) {
      showMessage(transLangKey('WARNING'), log[0].message);
      return;
    }

    let groupId = getValues('userGrp');
    let grpCd = getUserGrpCd(groupId);

    let changeRowData = [];
    let changes = [];

    changes = changes.concat(
      targetGrid.dataProvider.getAllStateRows().created,
      targetGrid.dataProvider.getAllStateRows().updated,
      targetGrid.dataProvider.getAllStateRows().deleted,
      targetGrid.dataProvider.getAllStateRows().createAndDeleted
    );

    changes.forEach(function (row) {
      changeRowData.push(targetGrid.dataProvider.getJsonRow(row));
    });

    if (changeRowData.length === 0) {
      //저장 할 내용이 없습니다.
      showMessage(transLangKey('MSG_CONFIRM'), transLangKey('MSG_5039'), { close: false });
    } else {
      showMessage(transLangKey('MSG_CONFIRM'), transLangKey("MSG_SAVE"), function (answer) {
        if (answer) {
          targetGrid.gridView.showToast(progressSpinner + 'Saving data...', true);

          let param = {
            'pref-info': JSON.stringify(changeRowData),
            'grp-cd': grpCd,
            username: props.username
          }

          zAxios({
            method: 'post',
            header: { 'content-type': 'application/json' },
            url: 'system/users/preferences',
            data: param
          }).then(function (res) {
            loadActual();
            reloadPrefInfoCallback(grpCd);
            if (props.onClose) {
              props.onClose(false);
            }
          }).catch(function (err) {
            console.log(err);
          }).then(function () {
            targetGrid.gridView.hideToast();
          });
        }
      });
    }
  }

  // popup 확인
  const saveSubmit = () => {
    let checkedRows = [];

    psnzGrid.gridView.getCheckedRows().forEach(function (index) {
      checkedRows.push(psnzGrid.dataProvider.getJsonRow(index));
    });
    props.confirm(checkedRows);
    props.onClose(false);
  }

  return (
    <PopupDialog type="NOBUTTONS" open={props.open} onClose={props.onClose} onSubmit={handleSubmit(saveSubmit, onError)} title="PSNZ" resizeHeight={600} resizeWidth={840}>
      <SearchArea displaySize="small" expandButton={false} searchBtn={true}>
        <InputField name="gridNm"
          type="select"
          label={transLangKey("GRID")}
          readonly={false}
          disabled={false}
          control={control}
          options={codeNameMap}
          displaySize="small"
        />
        <InputField
          type="select"
          name="userGrp"
          label={transLangKey("USER_GRP")}
          control={control}
          options={userGroupOptions}
          displaySize="small"
        />
      </SearchArea>
      <Box sx={{ display: "flex", height: "100%", flexDirection: "column", alignContent: "stretch", alignItems: "stretch" }}>
        <ButtonArea title={"COLUMN_PSNZ"}>
          <RightButtonArea>
            <IconButton title={transLangKey("SAVE")} onClick={() => { saveData(psnzGrid) }}><Icon.Save size={20} /></IconButton>
            <IconButton title={transLangKey("RESET")} onClick={() => { initPersonalize() }}><Icon.RefreshCcw size={20} /></IconButton>
          </RightButtonArea>
        </ButtonArea>
        <BaseGrid id="psnzGrid" items={psnzGridItems}></BaseGrid>
      </Box>
    </PopupDialog>
  );
}

PopPersonalize.propTypes = {
  viewCd: PropTypes.string.isRequired,
  AUTH_TP_ID: PropTypes.string,
  USER_ID: PropTypes.string,
  userGrp: PropTypes.string,
};

PopPersonalize.displayName = 'PopPersonalize'


export default PopPersonalize;