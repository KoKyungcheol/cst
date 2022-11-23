import ContentInner from "./layout/ContentInner";
import { SearchArea } from "./layout/SearchArea";
import { SearchRow } from "./layout/SearchRow";
import { ResultArea } from "./layout/ResultArea";
import { ButtonArea, LeftButtonArea, RightButtonArea } from "./layout/ButtonArea";
import { StatusArea } from "@zionex/layout/StatusArea"
import { CommonButton, SearchButton, RefreshButton, SaveButton } from "./component/CommonButton";
import { GridAddRowButton, GridDeleteRowButton, GridSaveButton, GridExcelExportButton, GridExcelImportButton } from "./component/GridButton";
import { LargeExcelDownload, LargeExcelUpload } from './component/LargeExcelButton';
import InputField from "./component/InputField";
// import { LabelInputField } from "./component/LabelInputField";
import BaseGrid from './component/BaseGrid';
import TreeGrid from './component/TreeGrid';
import PageNavigator from './component/PageNavigator';
import PopupDialog from './component/PopupDialog';
import { GridCnt } from '@zionex/component/GridCnt';
import { useViewStore } from "./store/viewStore";
import { zAxios } from "@zionex/utils/serviceCall";
import { getAppSettings } from "@zionex/utils/common";
import { FormArea } from "@zionex/component/FormArea";
import { FormItem } from "@zionex/component/FormItem";
import { FormRow } from "@zionex/component/FormRow";
import { GroupBox } from "@zionex/component/GroupBox";

let projectCode = getAppSettings('projectCode');
const useStyles = require('@zionex/component/' + projectCode + 'CommonStyle').useStyles;
const useIconStyles = require('@zionex/component/' + projectCode + 'CommonStyle').useIconStyles;

export {
  ContentInner, SearchArea, ResultArea, ButtonArea, LeftButtonArea, RightButtonArea, SearchRow,
  InputField, BaseGrid, TreeGrid, CommonButton, SearchButton, RefreshButton, SaveButton, StatusArea,
  GridExcelImportButton, GridExcelExportButton, LargeExcelDownload, LargeExcelUpload,
  GridAddRowButton, GridDeleteRowButton, GridSaveButton, GridCnt, PageNavigator, PopupDialog,
  useStyles, useIconStyles, useViewStore, FormArea, FormRow, FormItem, GroupBox,
  zAxios
}
