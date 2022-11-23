import { Window, WindowInstaller } from '@progress/kendo-window-vue-wrapper';
import {
  Chart,
  ChartSeriesItem,
  SotckChart,
  Sparkline,
  SparklineSeriesItem,
  ChartInstaller
} from '@progress/kendo-charts-vue-wrapper';
import {
  AutoComplete,
  ComboBox,
  DropDownList,
  MultiSelect,
  MultiColumnComboBox,
  MultiColumnComboBoxColumn,
  DropdownsInstaller
} from '@progress/kendo-dropdowns-vue-wrapper';
import {
  Button,
  ButtonGroup,
  ButtonGroupButton,
  ToolBar,
  ToolBarItem,
  ButtonsInstaller
} from '@progress/kendo-buttons-vue-wrapper';
import {
  MaskedTextBox,
  NumericTextBox,
  ColorPicker,
  Slider,
  RangeSlider,
  Switch,
  InputsInstaller
} from '@progress/kendo-inputs-vue-wrapper';
import {
  DateinputsInstaller,
  Calendar,
  DateInput,
  DatePicker,
  DateRangePicker,
  DateTimePicker,
  TimePicker,
  MultiViewCalendar
} from '@progress/kendo-dateinputs-vue-wrapper';
import {Dialog, DialogInstaller} from '@progress/kendo-dialog-vue-wrapper';
import {
  Editor,
  EditorTool,
  EditorInstaller
} from '@progress/kendo-editor-vue-wrapper';
import {
  LinearGauge,
  LinearGaugePointer,
  RadialGauge,
  RadialGaugePointer,
  ArcGauge,
  ArcGaugeColor,
  GaugesInstaller
} from '@progress/kendo-gauges-vue-wrapper';
import {
  Grid,
  GridColumn,
  GridInstaller
} from '@progress/kendo-grid-vue-wrapper';
import {
  Menu,
  MenuItem,
  ContextMenu,
  PanelBar,
  PanelBarItem,
  TabStrip,
  Splitter,
  SplitterPane,
  LayoutInstaller
} from '@progress/kendo-layout-vue-wrapper';
import {
  ListView,
  Pager,
  ListViewInstaller
} from '@progress/kendo-listview-vue-wrapper';
import {
  TreeView,
  TreeViewItem,
  TreeViewInstaller
} from '@progress/kendo-treeview-vue-wrapper';
import {Upload, UploadInstaller} from '@progress/kendo-upload-vue-wrapper';

import {
  DataSource,
  HierarchicalDataSource,
  GanttDataSource,
  GanttDependencyDataSource,
  PivotDataSource,
  SchedulerDataSource,
  TreeListDataSource,
  DataSourceInstaller
} from '@progress/kendo-datasource-vue-wrapper';

import { Scheduler, SchedulerResource, SchedulerView, SchedulerInstaller } from '@progress/kendo-scheduler-vue-wrapper'

Vue.use(InputsInstaller);
Vue.use(ButtonsInstaller);
Vue.use(WindowInstaller);
Vue.use(ChartInstaller);
Vue.use(DropdownsInstaller);
Vue.use(DateinputsInstaller);
Vue.use(DialogInstaller);
Vue.use(EditorInstaller);
Vue.use(GaugesInstaller);
Vue.use(GridInstaller);
Vue.use(LayoutInstaller);
Vue.use(ListViewInstaller);
Vue.use(TreeViewInstaller);
Vue.use(UploadInstaller);
Vue.use(DataSourceInstaller);
Vue.use(SchedulerInstaller);
