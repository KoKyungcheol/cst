
import Chart from './Chart';

export default class PieChart extends Chart {
  constructor(id, element, viewId) {
    super(id, element, viewId);
    this.created();
  }

  opt() {
    let title = transLangKey(vom.get(this.viewId).propTitle(this.id));
    let titlePosition = vom.get(this.viewId).propTitlePosition(this.id);
    let borderWidth = vom.get(this.viewId).propBorderWidth(this.id);
    let borderColor = vom.get(this.viewId).propBorderColor(this.id);
    let chartHeight = parseInt(vom.get(this.viewId).propHeight(this.id));
    let chartTheme = vom.get(this.viewId).propTheme(this.id) ? vom.get(this.viewId).propTheme(this.id) : 'default';
    let legendPosition = vom.get(this.viewId).propLegendPosition(this.id);
    let legendVisible = vom.get(this.viewId).propLegendVisible(this.id);
    let tooltipVisible = vom.get(this.viewId).propTooltipVisible(this.id);
    let tooltipFormat = vom.get(this.viewId).propTooltipFormat(this.id);
    let seriesDefaultsType = 'pie';
    let seriesDefaultsLabelVisible = vom.get(this.viewId).propLabelVisible(this.id);
    let seriesDefaultsLabelBackground = 'transparent';
    let seriesDefaultsLabelPosition = vom.get(this.viewId).propLabelPosition(this.id);
    let seriesDefaultsLabelPercentage = vom.get(this.viewId).propLabelPercentage(this.id);
    let seriesIds = vom.get(this.viewId).propSeriesIds(this.id);

    if (vom.get(this.viewId).getChartSeriesCount(this.id) >= 2) {
      seriesDefaultsType = 'donut';
    }

    let series = (() => {
      const temp = [];
      for (let seriesId of seriesIds) {
        let fieldObj = {};
        fieldObj.startAngle = 0;
        fieldObj.field = seriesId;
        fieldObj.name = seriesId;
        fieldObj.categoryField = vom.get(this.viewId).propSeriesCategoryField(this.id, seriesId);
        temp.push(fieldObj);
      }

      return temp;
    })(this.id);

    let resultData = {};

    const opt = {
      title: {
        position: titlePosition,
        text: title
      },
      chartArea: {
        height: chartHeight,
        background: '',
        border: {
          width: borderWidth,
          color: borderColor || '#cccccc'
        },
        margin: 10
      },
      theme: chartTheme,
      legend: {
        labels: {
          template: kendo.template('#: transLangKey(text) #')
        },
        visible: legendVisible,
        position: legendPosition
      },
      dataSource: resultData,
      seriesDefaults: {
        type: seriesDefaultsType,
        labels: {
          visible: seriesDefaultsLabelVisible,
          background: seriesDefaultsLabelBackground,
          position: seriesDefaultsLabelPosition,
          template: seriesDefaultsLabelPercentage ? kendo.template('#: category + " : " + kendo.toString((percentage * 100), "0.00")#%') : '#= category # : #= value#'
        }
      },
      series: series,
      tooltip: {
        visible: tooltipVisible,
        format: tooltipFormat,
        template: '#= category # : #= value + " (" + kendo.toString((percentage * 100), "0.00") + "%)" #'
      }
    };

    if (vom.get(this.viewId).hasAction(this.id, 'series-click')) {
      const me = this;

      opt.seriesClick = function (e) {
        me.seriesClickEventObj(e);

        if (e.originalEvent.type === 'contextmenu') {
          e.originalEvent.preventDefault();
        }

        vsm.get(me.viewId, "operationManager").actionOperation(me.id, 'series-click');
      }
    }

    return opt;
  }

  initValue() {
    this.getValue().data('');
  }
}
