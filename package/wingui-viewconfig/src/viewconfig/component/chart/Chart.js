
import Component from '../Component';
import {
  callService,
  doReferenceService
} from '../../service/ServiceManager';
import { combine } from '../../util/utils';

export default class Chart extends Component {
  constructor(id, element, viewId) {
    super(id, element, viewId);

    let resultDataObj = {};
    this.resultDataObj = (arg) => {
      if (arg) {
        resultDataObj = Object.assign(resultDataObj, arg);
      } else {
        return resultDataObj;
      }
    };

    let seriesClickEvent = {};
    this.seriesClickEventObj = (arg) => {
      if (arg) {
        seriesClickEvent = arg;
      } else {
        return seriesClickEvent;
      }
    };

    this.created();
  }

  mount() {
    let me = this;
    if (this.isMounted) {
      return;
    }

    this.element.classList.add('kd_chartWrap');

    this.widget = window.kendo.jQuery(this.element);
    this.widget.kendoChart(this.opt(me));

    this.addDefaultEvent();

    this.isMounted = true;
    this.mounted();
  }

  opt(me) {
    let title = transLangKey(vom.get(me.viewId).propTitle(this.id));
    let chartTheme = vom.get(me.viewId).propTheme(this.id) || 'default';
    let chartHeight = parseInt(vom.get(me.viewId).propHeight(this.id));
    let borderWidth = vom.get(me.viewId).propBorderWidth(this.id);
    let borderColor = vom.get(me.viewId).propBorderColor(this.id);
    let legendVisible = vom.get(me.viewId).propLegendVisible(this.id);
    let legendPosition = vom.get(me.viewId).propLegendPosition(this.id);
    let hiddenFieldIds = vom.get(me.viewId).propLegendHiddenFieldId(this.id);
    let sortFieldId = vom.get(me.viewId).propCategoryId(this.id);
    let categorySortDirection = vom.get(me.viewId).propCategorySortDirection(this.id);
    let tooltipFormat = vom.get(me.viewId).propTooltipFormat(this.id);
    let seriesDefaultType = vom.get(me.viewId).propDefaultType(this.id);
    let seriesIds = vom.get(me.viewId).propSeriesIds(this.id);
    let modelSeriesVisible = vom.get(me.viewId).propModelSeriesVisible(this.id);
    let modelSeriesFormat = vom.get(me.viewId).propModelSeriesFormat(this.id);
    let groupFieldId = vom.get(me.viewId).propDataGroupId(this.id);

    let series = (() => {
      const temp = [];
      for (let seriesId of seriesIds) {
        let fieldObj = {};
        let type = vom.get(me.viewId).propSeriesChartType(this.id, seriesId);

        switch (type) {
          case 'bubble':
            fieldObj.xField = vom.get(me.viewId).propSeriesXField(this.id, seriesId);
            fieldObj.yField = vom.get(me.viewId).propSeriesYField(this.id, seriesId);
            fieldObj.sizeField = seriesId;
            fieldObj.categoryField = vom.get(me.viewId).propSeriesCategoryField(this.id, seriesId);
            fieldObj.type = 'bubble';

            break;
          case 'area':
            fieldObj.line = {
              style: vom.get(me.viewId).propSeriesChartTypeLineStyle(this.id, seriesId)
            };

            break;
          default:
            let criteriaAxis = vom.get(me.viewId).propSeriesCriteriaAxis(this.id, seriesId);
            let noteTextFieldId = vom.get(me.viewId).propSeriesNoteTextFieldId(this.id, seriesId);
            let seriesVisible = vom.get(me.viewId).propSeriesVisible(this.id, seriesId);

            fieldObj.field = seriesId;
            fieldObj.name = seriesId;
            fieldObj.stack = vom.get(me.viewId).propSeriesChartTypeStack(this.id, seriesId);
            fieldObj.type = vom.get(me.viewId).propSeriesChartType(this.id, seriesId) === 'bar' ? 'column' : vom.get(me.viewId).propSeriesChartType(this.id, seriesId);

            if (modelSeriesVisible || seriesVisible) {
              fieldObj.labels = {
                visible: true,
                format: modelSeriesFormat || vom.get(me.viewId).propSeriesFormat(this.id, seriesId) || '{0}'
              };
            }

            (criteriaAxis) && (fieldObj.axis = criteriaAxis);
            (noteTextFieldId) && (fieldObj.noteTextField = noteTextFieldId);

            break;
        }

        temp.push(fieldObj);
      }

      return temp;
    })(this.id);

    let toolTips = {
      visible: vom.get(me.viewId).propTooltipVisible(this.id),
      format: tooltipFormat ? tooltipFormat : null,
      template: tooltipFormat ? null : '#= series.name #: #= value #'
    };

    const opt = {
      title: {
        text: title,
        font: '15px Arial,Helvetica,sans-serif'
      },
      legend: {
        item: {
          visual: function (e) {
            let color = e.options.markers.background;
            let labelColor = e.options.labels.color;
            let rect = new kendo.geometry.Rect([0, 0], [150, 50]);

            let layout = new kendo.drawing.Layout(rect, {
              spacing: 5,
              alignItems: 'center'
            });

            let marker = null;
            if (e.series.type === 'line') {
              marker = new kendo.drawing.Path({
                fill: {
                  color: color
                },
                stroke: {
                  color: color
                }
              }).moveTo(10, 0).lineTo(0, 0).close();
            } else {
              marker = new kendo.drawing.Path({
                fill: {
                  color: color
                },
                stroke: {
                  color: 'none'
                }
              }).moveTo(10, 0).lineTo(10, 10).lineTo(0, 10).lineTo(0, 0).close();
            }

            let label = new kendo.drawing.Text(transLangKey(e.series.name), [0, 0], {
              fill: {
                color: labelColor
              }
            });

            layout.append(marker, label);
            layout.reflow()

            return layout;
          }
        },
        labels: {
          template: kendo.template('#: transLangKey(text) #')
        },
        visible: legendVisible,
        position: legendPosition
      },
      chartArea: {
        height: chartHeight,
        border: {
          width: borderWidth,
          color: borderColor || '#cccccc'
        },
        margin: 10
      },
      theme: chartTheme,
      series: series,
      tooltip: toolTips
    };

    switch (seriesDefaultType) {
      case 'bubble':
        opt.xAxis = {
          labels: {
            format: vom.get(me.viewId).propXAxisFormat(this.id) ? '{0:' + vom.get(me.viewId).propXAxisFormat(this.id) + '}' : '{0}'
          },
          axisCrossingValue: vom.get(me.viewId).propXAxisCrossingValue(this.id)
        };

        opt.yAxis = {
          labels: {
            format: vom.get(me.viewId).propYAxisFormat(this.id) ? '{0:' + vom.get(me.viewId).propYAxisFormat(this.id) + '}' : '{0}'
          }
        };

        opt.tooltip = {
          visible: vom.get(me.viewId).propTooltipVisible(this.id),
          format: tooltipFormat ? tooltipFormat : '{3}: {2:N0}',
          template: null
        };

        break;
      default:
        opt.categoryAxis = (() => {
          let catetoryAxisCategoryIds = vom.get(me.viewId).propCategoryAxisCategoryIds(this.id);

          if (catetoryAxisCategoryIds.length > 1) {
            let categoryArr = [];
            let modelCategoryIds = vom.get(me.viewId).propCategoryIds(this.id);

            for (let value of catetoryAxisCategoryIds) {
              let rotation = vom.get(me.viewId).propCategoryAxisRotation(this.id, value);
              let titleText = vom.get(me.viewId).propCategoryAxisTitleText(this.id, value);
              let titleTextColor = vom.get(me.viewId).propCategoryAxisTitleColor(this.id, value);
              let titleTextFont = vom.get(me.viewId).propCategoryAxisTitleFont(this.id, value);
              let format = vom.get(me.viewId).propCategoryFormatById(this.id, value);
              let baseUnit = vom.get(me.viewId).propCategoryBaseUnit(this.id);
              let baseUnitStep = vom.get(me.viewId).propCategoryBaseUnitStep(this.id);
              let dateGroup = vom.get(me.viewId).propCategoryDateGroupById(this.id, value);
              const categoryObj = {
                name: value,
                labels: {
                  rotation: rotation,
                  format: format,
                  position: 'start'
                },
                crosshair: {
                  visible: true
                }
              };

              if (Boolean(titleText)) {
                categoryObj.title = {
                  text: transLangKey(titleText),
                  visible: true
                };

                (titleTextColor) && (categoryObj.title['color'] = titleTextColor);
                (titleTextFont) && (categoryObj.title['font'] = titleTextFont);
              }

              if (modelCategoryIds.includes(value)) {
                categoryObj.field = value;
                categoryObj.type = dateGroup ? 'date' : 'category';
                if(dateGroup) {
                  if (Boolean(baseUnit)) {
                    categoryObj.baseUnit = baseUnit;
                  }
    
                  if (Boolean(baseUnitStep)) {
                    categoryObj.baseUnitStep = baseUnitStep;
                  }
                }
                categoryObj.labels.format = vom.get(me.viewId).propCategoryFormatById(this.id, value);
              }

              categoryArr.push(categoryObj);
            }

            return categoryArr;
          } else {
            let rotation = vom.get(me.viewId).propCategoryAxisRotation(this.id);
            let titleText = vom.get(me.viewId).propCategoryAxisTitleText(this.id);
            let titleTextColor = vom.get(me.viewId).propCategoryAxisTitleColor(this.id);
            let titleTextFont = vom.get(me.viewId).propCategoryAxisTitleFont(this.id);
            let valueAxisValueIds = vom.get(me.viewId).propValueAxisValueIds(this.id);
            let format = vom.get(me.viewId).propCategoryFormat(this.id);
            let baseUnit = vom.get(me.viewId).propCategoryBaseUnit(this.id);
            let baseUnitStep = vom.get(me.viewId).propCategoryBaseUnitStep(this.id);
            let dateGroup = vom.get(me.viewId).propCategoryDateGroup(this.id);

            const categoryObj = {
              field: vom.get(me.viewId).propCategoryId(this.id),
              type: dateGroup ? 'date' : 'category',
              labels: {
                rotation: rotation,
                format: format,
                position: 'start'
              },
              crosshair: {
                visible: true
              }
            };
            if(dateGroup) {
              if (Boolean(baseUnit)) {
                categoryObj.baseUnit = baseUnit;
              }

              if (Boolean(baseUnitStep)) {
                categoryObj.baseUnitStep = baseUnitStep;
              }
            }
            categoryObj.axisCrossingValue = valueAxisValueIds.map((value, index, arr) => vom.get(me.viewId).propValueAxisCrossingValue(this.id, value));

            if (Boolean(titleText)) {
              categoryObj.title = {
                text: transLangKey(titleText),
                visible: true
              };

              (titleTextColor) && (categoryObj.title['color'] = titleTextColor);
              (titleTextFont) && (categoryObj.title['font'] = titleTextFont);
            }

            return categoryObj;
          }
        })();

        opt.valueAxis = (() => {
          let valueAxisValueIds = vom.get(me.viewId).propValueAxisValueIds(this.id);

          if (valueAxisValueIds.length > 0) {
            let valueArr = [];
            for (let value of valueAxisValueIds) {
              let axisVisible = Boolean((vom.get(me.viewId).propValueAxisVisible(this.id, value) || 'true') === 'true');
              let min = vom.get(me.viewId).propValueAxisMin(this.id, value);
              let max = vom.get(me.viewId).propValueAxisMax(this.id, value);
              let titleText = vom.get(me.viewId).propValueAxisTitleText(this.id, value);
              let titleColor = vom.get(me.viewId).propValueAxisTitleColor(this.id, value);
              let titleFont = vom.get(me.viewId).propValueAxisTitleFont(this.id, value);
              let format = vom.get(me.viewId).propValueAxisFormat(this.id, value);

              const valueObj = {
                name: value,
                labels: {
                  format: format ? '{0:' + format + '}' : '{0}'
                },
                visible: axisVisible
              };

              if (Boolean(titleText)) {
                valueObj.title = {
                  text: transLangKey(titleText),
                  visible: true
                };

                (titleColor) && (valueObj.title['color'] = titleColor);
                (titleFont) && (valueObj.title['font'] = titleFont);
              }

              min && (valueObj.min = min);
              max && (valueObj.max = max);

              valueArr.push(valueObj);
            }

            return valueArr;
          } else {
            let titleText = vom.get(me.viewId).propValueAxisTitleText(this.id);
            let titleColor = vom.get(me.viewId).propValueAxisTitleColor(this.id);
            let titleFont = vom.get(me.viewId).propValueAxisTitleFont(this.id);
            let format = vom.get(me.viewId).propValueAxisFormat(this.id);

            const valueObj = {
              labels: {
                format: format ? '{0:' + format + '}' : '{0}'
              }
            };

            if (Boolean(titleText)) {
              valueObj.title = {
                text: transLangKey(titleText),
                visible: true
              };

              (titleColor) && (valueObj.title['color'] = titleColor);
              (titleFont) && (valueObj.title['font'] = titleFont);
            }

            return valueObj;
          }
        })();

        break;
    }

    if (hiddenFieldIds.length > 0) {
      opt.legend.item = {
        visual(e) {
          if (!hiddenFieldIds.includes(e.series.field)) {
            return e.createVisual();
          }
        }
      };
    }

    groupFieldId && (this.resultDataObj({
      group: {
        field: groupFieldId
      }
    }));

    if (vom.get(me.viewId).hasAction(this.id, 'series-click')) {
      opt.seriesClick = function (e) {
        me.seriesClickEventObj(e);

        if (e.originalEvent.type === 'contextmenu') {
          e.originalEvent.preventDefault();
        }

        vsm.get(me.viewId, "operationManager").actionOperation(me.id, 'series-click');
      }
    }

    if (categorySortDirection) {
      this.resultDataObj({
        sort: {
          field: sortFieldId,
          dir: categorySortDirection
        }
      });
    }

    if (!seriesIds) {
      console.error(`Please check configuration. (Missing series field-id: '${this.id}')`);
    }

    return opt;
  }

  doOperation(componentId, operationId, actionParamMap, successFunc, failFunc, completeFunc) {
    let me = this;
    let successFuncs = successFunc;

    if (operationId.startsWith('LOAD')) {
      successFuncs = combine(this.loadProcess, successFunc);
      kendo.ui.progress(this.widget, true);
    } else if (operationId === 'INIT') {
      this.initValue();

      successFunc(this.id, operationId, null);
      completeFunc(this.id, operationId, null);

      return;
    } else if (operationId === 'VALIDATE') {
      return this.loadProcessFlag;
    }

    if (vom.get(me.viewId).isReferenceService(this.id, operationId)) {
      doReferenceService(actionParamMap, this.id, operationId, successFunc, failFunc, completeFunc, me.viewId);
    } else {
      callService(actionParamMap, this.id, operationId, successFuncs, failFunc, completeFunc, me.viewId);
    }
  }

  loadProcess(componentId, operationId, data, serviceCallId) {
    let activeId = componentId.substring(0, componentId.indexOf("-"));
    com.get(activeId).getComponent(componentId).initValue();
    super.setData(componentId, operationId, serviceCallId, data, activeId);
  }

  getActualComponent() {
    return this.widget.data('kendoChart');
  }

  getValue(referenceType) {
    if (referenceType) {
      switch (referenceType) {
        case 'seriesValue':
          return this.seriesClickEventObj().value;
        default:
          console.warn(`The reference type information is not valid. (reference type: ${referenceType})`);
          break;
      }
    } else {
      return this.getActualComponent().dataSource;
    }
  }

  setValue(resultData) {
    let me = this;
    let categoryAxisField = vom.get(me.viewId).propCategoryId(this.id);
    let sortFieldId = categoryAxisField;
    let categorySortDirection = vom.get(me.viewId).propCategorySortDirection(this.id);
    let groupFieldId = vom.get(me.viewId).propDataGroupId(this.id);
    let categoryType = vom.get(me.viewId).propCategoryType(this.id);
    let fieldsInfo = {};

    kendo.ui.progress($('#' + this.id), false);

    if (categoryType === 'date' || categoryType === 'datetime') {
      fieldsInfo[categoryAxisField] = {
        type: 'date'
      };
    }

    const resultDataObj = {
      data: resultData,
      schema: {
        model: {
          fields: fieldsInfo
        }
      }
    };

    if (categorySortDirection) {
      resultDataObj.sort = {
        field: sortFieldId,
        dir: categorySortDirection
      };
    }

    if (groupFieldId) {
      resultDataObj.group = {
        field: groupFieldId
      };
    }

    let chart = this.getActualComponent();
    let chartDataSource = new kendo.data.DataSource(resultDataObj);

    chartDataSource = this.onChartDataFillReady(me.viewId, this.id, chart, chartDataSource);
    chart.setDataSource(chartDataSource);

    window.requestAnimationFrame((() => {
      let dataSourceLength = chart.dataSource.options.data.length;
      let seriesLength = chart.options.series.length;
      let seriesWidth = vom.get(me.viewId).propSeriesWidth(me.id);

      if (seriesWidth) {
        let chartElement = $(me.element);

        let parentWidth = chartElement.parent().width();
        let calculatedWidth = seriesWidth * seriesLength * dataSourceLength;

        chart.options.chartArea.width = parentWidth < calculatedWidth ? calculatedWidth : parentWidth;
        chart.redraw();

        chartElement.parent().css('overflow', 'auto');
      }
    }));
  }

  initValue() {
    this.getValue().data('');
  }

  onChartDataFillReady(viewId, componentId, chart, dataSource) {
    return dataSource;
  }
}
