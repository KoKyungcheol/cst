const GANTT_CONFIG = {
  Cfg: {
    Code: 'SGCENBMMYKUUYB',
    GanttLap: '1',
    Language: localStorage.getItem('countryCode'),
    FastGantt: '0',
    DateStrings: 'yyyy-MM-dd HH:mm:ss',
    Style: 'BT', // Basic Style
    GanttStyle: 'BG', // Gantt Basic Style
    Sorting: '0',
    Dragging: '0',
    LeftWidth: '0', MidWidth: '949', RightWidth: '808',
    MinLeftWidth: '0', MinMidWidth: '1', MinRightWidth: '0',
    ConstHeight: '1',
    CopyCols: '4',
    SelectingSingle: '1',
    SafeCSS: '0',
    Paging: '2',
    AllPages: '1',
    ChildPaging: '2',
    Expanded: '0',
    UpdateHeightsTimeout: '2',
    SuppressCfg: '1' // 1로 설정 시 cookie에서 이전 설정 정보를 불러오지 않음
  },
  Actions: {
    OnDragGantt: '0',
    OnDragGanttHeader: '1',
    OnClickGanttHeader: '1',
    OnRightClickGanttHeader: '1',
    OnRightDragGanttHeader: '1',
  },
  Toolbar: {
    Visible: '0'
  },
  Panel: {
    Visible: '0'
  },
  Pager: {
    Visible: '0'
  },
  LeftCols: [],
  Cols: [],
  Header: {
  },
  Def: [],
  RightCols: [
    {
      Name: 'GANTT',
      Type: 'Gantt',

      // GanttPaging: '1',

      GanttShowBorder: '1', // 수평선 표시
      GanttAddBackground: '1',
      GanttShowBounds: '0',

      // Gantt Base/Finish Line movable
      GanttBaseCanEdit: '0',
      GanttFinishCanEdit: '0',

      // Gantt Unit Options
      GanttUnits: 'd',
      GanttDataUnits: 'd',
      GanttWidth: '130',
      GanttSize: '0',
      GanttSmoothZoom: '0',
      GanttZoom: 'Day',

      // Gantt Main bar Options
      GanttText: 'text',
      GanttHtml: '*Text*',
      GanttClass: 'None',
      GanttTop: '3',
      GanttTop1: '3',
      GanttBottom: '5',
      GanttBottom1: '5',
      GanttHeight: '21',
      GanttHeight1: '21',
      GanttHtmlShift1: '4',
      GanttCount: '2',
      GanttHtmlDateFormat: 'yyyy-MM-dd',
      GanttIncorrectDependencies: '0',
      GanttDependencyColor: '0',
      GanttDependencyTip: '',

      // Gantt Run bar Options
      GanttRun: 'RUN', // run data name
      GanttRunTop: '3', // add run box margin
      GanttRunHeight: '20',
      GanttRunResize: '',
      GanttRunSelect: '5',
      GanttRunEmpty: '0',
      GanttRunErrors: '0',
      GanttRunNew: '',
      GanttRunErrorsShift: '-2',
      GanttRunAdjust: 'error',
      GanttRunMilestones: '0',
      GanttRunBoxMinWidth: '6',
      GanttRunGroupHover: '0',
      GanttRunStart: 'start',
      GanttRunEnd: 'end',

      GanttEditDisabled: '1',
      MaxWidth: 50000,

      GanttHeaderTrim: 0,
      GanttHeaderHeight1: '20',
      GanttHeaderHeight2: '20',
      GanttHeaderHeight3: '20',
      GanttHeader1: 'M#yyyy/MM',
      GanttHeader2: 'd#%dd',
      GanttBackground: 'd#00:00#2;',
    }
  ],
  Zoom: [
    {
      Name: 'Hour',
      GanttUnits: 'h',
      GanttChartRound: 'd',
      GanttWidth: '24',
      GanttHeader1: 'd#MM/d(ddd)',
      GanttHeader2: 'h#HH',
      GanttBackground: 'h#23:57#2;'
    },
    {
      Name: 'Day',
      GanttUnits: 'h',
      GanttChartRound: 'd',
      GanttWidth: '5',
      GanttHeader1: 'M#yyyy/MM',
      GanttHeader2: 'd#d(ddd)',
      GanttBackground: 'd#23:53:59#2;'
    },
    {
      Name: 'Week',
      GanttUnits: 'd',
      GanttChartRound: 'd',
      GanttWidth: '30',
      GanttHeader1: 'M#yyyy/MM',
      GanttHeader2: 'w#xxx',
      GanttBackground: 'w#12/11/1999 23:30#2;'
    },
    {
      Name: 'Month',
      GanttUnits: 'd',
      GanttChartRound: 'd',
      GanttWidth: '30',
      GanttHeader1: 'y#yyyy',
      GanttHeader3: 'M#yyyy/MM',
      GanttBackground: 'M#12/01/1999#2;'
    }
  ]
};

function cloneGanttObject(object) {
  return JSON.parse(JSON.stringify(object));
}

/**
 * TreeGrid Gantt를 생성한다.
 * @param {String} ganttId TreeGrid Gantt instance id
 * @param {String} tagId Main tag id
 * @param {Object} source layout, data 설정 정보
 */
function createGanttChart (ganttId, tagId, source) {
  if (TGGrids[ganttId]) {
    TGGrids[ganttId].Dispose();
  }

  TGDelEvent(null, ganttId, null);

  return TreeGrid(source, tagId, {id: ganttId});
}

export {
  GANTT_CONFIG, cloneGanttObject, createGanttChart
};
