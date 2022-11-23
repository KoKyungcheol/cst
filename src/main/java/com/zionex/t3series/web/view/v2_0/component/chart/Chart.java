package com.zionex.t3series.web.view.v2_0.component.chart;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v2_0.ViewUtil;
import com.zionex.t3series.web.view.v2_0.component.Component;

import org.jdom2.Element;

public class Chart extends Component {

    private List<CategoryAxis> categoryAxises = new ArrayList<>();
    private List<ValueAxis> valueAxises = new ArrayList<>();

    private List<Series> serieses = new ArrayList<>();

    public Chart(String id, String type, String copy) {
        super(id, type, copy);
    }

    public List<CategoryAxis> getCategoryAxises() {
        return Collections.unmodifiableList(categoryAxises);
    }

    public void addCategoryAxis(CategoryAxis categoryAxis) {
        categoryAxises.add(categoryAxis);
    }

    public List<ValueAxis> getValueAxises() {
        return Collections.unmodifiableList(valueAxises);
    }

    public void addValueAxis(ValueAxis valueAxis) {
        valueAxises.add(valueAxis);
    }

    public List<Series> getSerieses() {
        return Collections.unmodifiableList(serieses);
    }

    public void addSeries(Series series) {
        serieses.add(series);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object title = getProp("title");
        Object height = getProp("height");
        Object theme = getProp("theme");
        Object defaultType = getProp("default-type");
        Object seriesWidth = getProp("series-width");
        Object borderWidth = getProp("border", "width");
        Object borderColor = getProp("border", "color");
        Object legendVisible = getProp("legend", "visible");
        Object legendPosition = getProp("legend", "position");
        Object legendHiddenFieldId = getProp("legend", "hidden", "field-id");
        Object tooptipVisible = getProp("tooltip", "visible");
        Object tooptipFormat = getProp("tooltip", "format");

        Element props = new Element("props");

        if (title != null) props.addContent(new Element("title").setText(title.toString()));
        if (height != null) props.addContent(new Element("height").setText(height.toString()));
        if (theme != null) props.addContent(new Element("theme").setText(theme.toString()));
        if (defaultType != null) props.addContent(new Element("default-type").setText(defaultType.toString()));
        if (seriesWidth != null) props.addContent(new Element("series-width").setText(seriesWidth.toString()));

        if (borderWidth != null || borderColor != null) {
            Element borderElement = new Element("border");

            if (borderWidth != null) borderElement.addContent(new Element("width").setText(borderWidth.toString()));
            if (borderWidth != null) borderElement.addContent(new Element("color").setText(borderColor.toString()));

            props.addContent(borderElement);
        }

        if (legendVisible != null || legendPosition != null || legendHiddenFieldId != null) {
            Element legendElement = new Element("legend");

            if (legendVisible != null) legendElement.addContent(new Element("visible").setText(legendVisible.toString()));
            if (legendPosition != null) legendElement.addContent(new Element("position").setText(legendPosition.toString()));
            if (legendHiddenFieldId != null) {
                Element hiddenElement = new Element("hidden");
                hiddenElement.addContent(new Element("field-id").setText(legendHiddenFieldId.toString()));
                legendElement.addContent(hiddenElement);
            }

            props.addContent(legendElement);
        }

        if (tooptipVisible != null || tooptipFormat != null) {
            Element tooptipElement = new Element("tooltip");

            if (tooptipVisible != null) tooptipElement.addContent(new Element("visible").setText(tooptipVisible.toString()));
            if (tooptipFormat != null) tooptipElement.addContent(new Element("format").setText(tooptipFormat.toString()));

            props.addContent(tooptipElement);
        }

        Object categoryAxisText = getProp("category-axis", "title", "text");
        Object categoryAxisFont = getProp("category-axis", "title", "font");
        Object categoryAxisColor = getProp("category-axis", "title", "color");
        Object categoryAxisRotation = getProp("category-axis", "rotation");

        Object valueAxisText = getProp("value-axis", "title", "text");
        Object valueAxisFont = getProp("value-axis", "title", "font");
        Object valueAxisColor = getProp("value-axis", "title", "color");
        Object valueAxisCrossingValue = getProp("value-axis", "axis-crossing-value");
        Object valueAxisFormat = getProp("value-axis", "format");
        Object valueAxisMin = getProp("value-axis", "min");
        Object valueAxisMax = getProp("value-axis", "max");

        Element categoryAxisElement = null;
        Element valueAxisElement = null;

        if (categoryAxisText != null || categoryAxisFont != null || categoryAxisColor != null || categoryAxisRotation != null) {
            categoryAxisElement = new Element("category-axis");

            if (categoryAxisText != null || categoryAxisFont != null || categoryAxisColor != null) {
                Element titleElement = new Element("title");
                if (categoryAxisText != null) titleElement.addContent(new Element("text").setText(categoryAxisText.toString()));
                if (categoryAxisFont != null) titleElement.addContent(new Element("font").setText(categoryAxisFont.toString()));
                if (categoryAxisColor != null) titleElement.addContent(new Element("color").setText(categoryAxisColor.toString()));
                categoryAxisElement.addContent(titleElement);
            }

            if (categoryAxisRotation != null) categoryAxisElement.addContent(new Element("rotation").setText(categoryAxisRotation.toString()));

            props.addContent(categoryAxisElement);
        }

        if (valueAxisText != null || valueAxisFont != null || valueAxisColor != null
                || valueAxisCrossingValue != null || valueAxisFormat != null || valueAxisMin != null || valueAxisMax != null) {

            valueAxisElement = new Element("value-axis");

            if (valueAxisText != null || valueAxisFont != null || valueAxisColor != null) {
                Element titleElement = new Element("title");
                if (valueAxisText != null) titleElement.addContent(new Element("text").setText(valueAxisText.toString()));
                if (valueAxisFont != null) titleElement.addContent(new Element("font").setText(valueAxisFont.toString()));
                if (valueAxisColor != null) titleElement.addContent(new Element("color").setText(valueAxisColor.toString()));
                valueAxisElement.addContent(titleElement);
            }

            if (valueAxisCrossingValue != null) valueAxisElement.addContent(new Element("axis-crossing-value").setText(valueAxisCrossingValue.toString()));
            if (valueAxisFormat != null) valueAxisElement.addContent(new Element("format").setText(valueAxisFormat.toString()));
            if (valueAxisMin != null) valueAxisElement.addContent(new Element("min").setText(valueAxisMin.toString()));
            if (valueAxisMax != null) valueAxisElement.addContent(new Element("max").setText(valueAxisMax.toString()));

            props.addContent(valueAxisElement);
        }

        if (!categoryAxises.isEmpty()) {
            if (categoryAxisElement == null) {
                categoryAxisElement = new Element("category-axis");
                props.addContent(categoryAxisElement);
            }

            for (CategoryAxis categoryAxis : categoryAxises) {
                categoryAxisElement.addContent(categoryAxis.toElement());
            }
        }

        if (!valueAxises.isEmpty()) {
            if (valueAxisElement == null) {
                valueAxisElement = new Element("value-axis");
                props.addContent(valueAxisElement);
            }

            for (ValueAxis valueAxis : valueAxises) {
                valueAxisElement.addContent(valueAxis.toElement());
            }
        }

        if (!serieses.isEmpty()) {
            Element seriesesElement = new Element("serieses");
            for (Series series : serieses) {
                seriesesElement.addContent(series.toElement());
            }
            props.addContent(seriesesElement);
        }

        Object seriesesVisible = getProp("serieses", "visible");
        Object seriesesFormat = getProp("serieses", "format");

        if (seriesesVisible != null || seriesesFormat != null) {
            Element seriesesElement = props.getChild("serieses");
            if (seriesesElement == null) {
                seriesesElement = new Element("serieses");
                props.addContent(seriesesElement);
            }

            if (seriesesFormat != null) seriesesElement.addContent(0, new Element("format").setText(seriesesFormat.toString()));
            if (seriesesVisible != null) seriesesElement.addContent(0, new Element("visible").setText(seriesesVisible.toString()));
        }

        Object xAxisFormat = getProp("x-axis", "format");
        Object xAxisCrossingValue = getProp("x-axis", "axis-crossing-value");
        Object yAxisFormat = getProp("y-axis", "format");

        if (xAxisFormat != null || xAxisCrossingValue != null || yAxisFormat != null) {
            if (xAxisFormat != null || xAxisCrossingValue != null) {
                Element xAxisElement = new Element("x-axis");

                if (xAxisFormat != null) xAxisElement.addContent(new Element("format").setText(xAxisFormat.toString()));
                if (xAxisCrossingValue != null) xAxisElement.addContent(new Element("axis-crossing-value").setText(xAxisCrossingValue.toString()));

                props.addContent(xAxisElement);
            }

            if (yAxisFormat != null) {
                Element yAxisElement = new Element("y-axis");

                if (yAxisFormat != null) yAxisElement.addContent(new Element("format").setText(yAxisFormat.toString()));

                props.addContent(yAxisElement);
            }
        }

        Object dataGroupId = getProp("data-group-id");
        if (dataGroupId != null) {
            props.addContent(new Element("data-group-id").setText(dataGroupId.toString()));
        }

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object title = getProp("title");
        Object height = getProp("height");
        Object theme = getProp("theme");
        Object defaultType = getProp("default-type");
        Object seriesWidth = getProp("series-width");
        Object borderWidth = getProp("border", "width");
        Object borderColor = getProp("border", "color");
        Object legendVisible = getProp("legend", "visible");
        Object legendPosition = getProp("legend", "position");
        Object legendHiddenFieldId = getProp("legend", "hidden", "field-id");
        Object tooptipVisible = getProp("tooltip", "visible");
        Object tooptipFormat = getProp("tooltip", "format");

        StringBuilder propsBuilder = new StringBuilder();

        if (title != null) {
            propsBuilder.append("\"title\":").append('"').append(title).append('"');
        }

        if (height != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (theme != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"theme\":").append('"').append(theme).append('"');
        }

        if (defaultType != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"defaultType\":").append('"').append(defaultType).append('"');
        }

        if (seriesWidth != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"seriesWidth\":").append(seriesWidth);
        }

        if (borderWidth != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"borderWidth\":").append('"').append(borderWidth).append('"');
        }

        if (borderColor != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"borderColor\":").append('"').append(borderColor).append('"');
        }

        if (legendVisible != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"legendVisible\":").append(legendVisible);
        }

        if (legendPosition != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"legendPosition\":").append('"').append(legendPosition).append('"');
        }

        if (legendHiddenFieldId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"legendHiddenFieldId\":").append('"').append(legendHiddenFieldId).append('"');
        }

        if (tooptipVisible != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"tooptipVisible\":").append(tooptipVisible);
        }

        if (tooptipFormat != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            tooptipFormat = tooptipFormat.toString().replace("\\", "\\\\");
            propsBuilder.append("\"tooptipFormat\":").append('"').append(tooptipFormat).append('"');
        }

        Object categoryAxisText = getProp("category-axis", "title", "text");
        Object categoryAxisFont = getProp("category-axis", "title", "font");
        Object categoryAxisColor = getProp("category-axis", "title", "color");
        Object categoryAxisRotation = getProp("category-axis", "rotation");

        Object valueAxisText = getProp("value-axis", "title", "text");
        Object valueAxisFont = getProp("value-axis", "title", "font");
        Object valueAxisColor = getProp("value-axis", "title", "color");
        Object valueAxisCrossingValue = getProp("value-axis", "axis-crossing-value");
        Object valueAxisFormat = getProp("value-axis", "format");
        Object valueAxisMin = getProp("value-axis", "min");
        Object valueAxisMax = getProp("value-axis", "max");

        StringBuilder categoryAxisBuilder = new StringBuilder();
        StringBuilder valueAxisBuilder = new StringBuilder();

        if (categoryAxisText != null || categoryAxisFont != null || categoryAxisColor != null || categoryAxisRotation != null) {
            if (categoryAxisText != null) {
                categoryAxisBuilder.append("\"titleText\":").append('"').append(categoryAxisText).append('"');
            }

            if (categoryAxisFont != null) {
                if (categoryAxisBuilder.length() > 0) {
                    categoryAxisBuilder.append(',');
                }
                categoryAxisBuilder.append("\"titleFont\":").append('"').append(categoryAxisFont).append('"');
            }

            if (categoryAxisColor != null) {
                if (categoryAxisBuilder.length() > 0) {
                    categoryAxisBuilder.append(',');
                }
                categoryAxisBuilder.append("\"titleColor\":").append('"').append(categoryAxisColor).append('"');
            }

            if (categoryAxisRotation != null) {
                if (categoryAxisBuilder.length() > 0) {
                    categoryAxisBuilder.append(',');
                }
                categoryAxisBuilder.append("\"rotation\":").append('"').append(categoryAxisRotation).append('"');
            }
        }

        if (valueAxisText != null || valueAxisFont != null || valueAxisColor != null || valueAxisCrossingValue != null
                || valueAxisFormat != null || valueAxisMin != null || valueAxisMax != null) {

            if (valueAxisText != null) {
                valueAxisBuilder.append("\"titleText\":").append('"').append(valueAxisText).append('"');
            }

            if (valueAxisFont != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisBuilder.append("\"titleFont\":").append('"').append(valueAxisFont).append('"');
            }

            if (valueAxisColor != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisBuilder.append("\"titleColor\":").append('"').append(valueAxisColor).append('"');
            }

            if (valueAxisCrossingValue != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisBuilder.append("\"axisCrossingValue\":").append('"').append(valueAxisCrossingValue).append('"');
            }

            if (valueAxisFormat != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisFormat = valueAxisFormat.toString().replace("\\", "\\\\");
                valueAxisBuilder.append("\"format\":").append('"').append(valueAxisFormat).append('"');
            }

            if (valueAxisMin != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisBuilder.append("\"min\":").append('"').append(valueAxisMin).append('"');
            }

            if (valueAxisMax != null) {
                if (valueAxisBuilder.length() > 0) {
                    valueAxisBuilder.append(',');
                }
                valueAxisBuilder.append("\"max\":").append('"').append(valueAxisMax).append('"');
            }
        }

        if (!categoryAxises.isEmpty()) {
            if (categoryAxisBuilder.length() > 0) {
                categoryAxisBuilder.append(',');
            }

            for (int i = 0; i < categoryAxises.size(); i++) {
                CategoryAxis categoryAxis = categoryAxises.get(i);

                if (i > 0) {
                    categoryAxisBuilder.append(',');
                }

                String json = categoryAxis.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                categoryAxisBuilder.append('"').append(categoryAxis.getId()).append('"').append(':').append(json);
            }
        }

        if (!valueAxises.isEmpty()) {
            if (valueAxisBuilder.length() > 0) {
                valueAxisBuilder.append(',');
            }

            for (int i = 0; i < valueAxises.size(); i++) {
                ValueAxis valueAxis = valueAxises.get(i);

                if (i > 0) {
                    valueAxisBuilder.append(',');
                }

                String json = valueAxis.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                valueAxisBuilder.append('"').append(valueAxis.getId()).append('"').append(':').append(json);
            }
        }

        StringBuilder seriesesBuilder = new StringBuilder();

        Object seriesesVisible = getProp("serieses", "visible");
        Object seriesesFormat = getProp("serieses", "format");

        if (seriesesVisible != null) {
            seriesesBuilder.append("\"visible\":").append(seriesesVisible);
        }

        if (seriesesFormat != null) {
            if (seriesesBuilder.length() > 0) {
                seriesesBuilder.append(',');
            }
            seriesesFormat = seriesesFormat.toString().replace("\\", "\\\\");
            seriesesBuilder.append("\"format\":").append('"').append(seriesesFormat).append('"');
        }

        if (!serieses.isEmpty()) {
            if (seriesesBuilder.length() > 0) {
                seriesesBuilder.append(',');
            }

            for (int i = 0; i < serieses.size(); i++) {
                Series series = serieses.get(i);

                if (i > 0) {
                    seriesesBuilder.append(',');
                }

                String json = series.toJson();
                if (json.isEmpty()) {
                    continue;
                }

                seriesesBuilder.append('"').append(series.getId()).append('"').append(':').append(json);
            }
        }

        StringBuilder xAxisBuilder = new StringBuilder();
        StringBuilder yAxisBuilder = new StringBuilder();

        Object xAxisFormat = getProp("labels", "x-axis", "format");
        Object xAxisCrossingValue = getProp("labels", "x-axis", "axis-crossing-value");
        Object yAxisFormat = getProp("labels", "y-axis", "format");

        if (xAxisFormat != null || xAxisCrossingValue != null || yAxisFormat != null) {

            if (xAxisFormat != null) {
                if (xAxisBuilder.length() > 0) {
                    xAxisBuilder.append(',');
                }
                xAxisFormat = xAxisFormat.toString().replace("\\", "\\\\");
                xAxisBuilder.append("\"format\":").append('"').append(xAxisFormat).append('"');
            }

            if (xAxisCrossingValue != null) {
                if (xAxisBuilder.length() > 0) {
                    xAxisBuilder.append(',');
                }
                xAxisBuilder.append("\"axisCrossingValue\":").append('"').append(xAxisCrossingValue).append('"');
            }

            if (yAxisFormat != null) {
                if (yAxisBuilder.length() > 0) {
                    yAxisBuilder.append(',');
                }
                yAxisFormat = yAxisFormat.toString().replace("\\", "\\\\");
                yAxisBuilder.append("\"format\":").append('"').append(yAxisFormat).append('"');
            }
        }

        if (categoryAxisBuilder.length() > 0) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"categoryAxis\":{").append(categoryAxisBuilder.toString()).append('}');
        }

        if (valueAxisBuilder.length() > 0) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"valueAxis\":{").append(valueAxisBuilder.toString()).append('}');
        }

        if (seriesesBuilder.length() > 0) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"series\":{").append(seriesesBuilder.toString()).append('}');
        }

        if (xAxisBuilder.length() > 0) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"xAxis\":{").append(xAxisBuilder.toString()).append('}');
        }

        if (yAxisBuilder.length() > 0) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"yAxis\":{").append(yAxisBuilder.toString()).append('}');
        }

        Object dataGroupId = getProp("data-group-id");
        if (dataGroupId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"dataGroupId\":").append('"').append(dataGroupId).append('"');
        }

        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"type\":").append('"').append(this.getType()).append('"');

        if (propsBuilder.length() > 0) {
            builder.append(",\"props\":").append('{').append(propsBuilder.toString()).append('}');
        }

        String action = ViewUtil.toJsonAction(this);
        String operation = ViewUtil.toJsonOperation(this);

        if (!action.isEmpty()) builder.append(',').append(action);
        if (!operation.isEmpty()) builder.append(',').append(operation);

        builder.append('}');
        return builder.toString();
    }

}
