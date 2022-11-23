package com.zionex.t3series.web.view.v2_0.component.chart;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v2_0.ViewUtil;
import com.zionex.t3series.web.view.v2_0.component.Component;

import org.jdom2.Element;

public class PieChart extends Component {

    private List<PieSeries> serieses = new ArrayList<>();

    public PieChart(String id, String type, String copy) {
        super(id, type, copy);
    }

    public List<PieSeries> getPieSerieses() {
        return Collections.unmodifiableList(serieses);
    }

    public void addPieSeries(PieSeries series) {
        serieses.add(series);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object title = getProp("title");
        Object titlePosition = getProp("title-position");
        Object height = getProp("height");
        Object theme = getProp("theme");
        Object borderWidth = getProp("border", "width");
        Object borderColor = getProp("border", "color");
        Object legendVisible = getProp("legend", "visible");
        Object legendPosition = getProp("legend", "position");
        Object labelsVisible = getProp("labels", "visible");
        Object labelsPosition = getProp("labels", "position");
        Object labelsPercentage = getProp("labels", "percentage");
        Object tooptipVisible = getProp("tooltip", "visible");
        Object tooptipFormat = getProp("tooltip", "format");

        Element props = new Element("props");

        if (title != null) props.addContent(new Element("title").setText(title.toString()));
        if (titlePosition != null) props.addContent(new Element("title-position").setText(titlePosition.toString()));
        if (height != null) props.addContent(new Element("height").setText(height.toString()));
        if (theme != null) props.addContent(new Element("theme").setText(theme.toString()));

        if (borderWidth != null || borderColor != null) {
            Element borderElement = new Element("border");

            if (borderWidth != null) borderElement.addContent(new Element("width").setText(borderWidth.toString()));
            if (borderWidth != null) borderElement.addContent(new Element("color").setText(borderColor.toString()));

            props.addContent(borderElement);
        }

        if (legendVisible != null || legendPosition != null) {
            Element legendElement = new Element("legend");

            if (legendVisible != null) legendElement.addContent(new Element("visible").setText(legendVisible.toString()));
            if (legendPosition != null) legendElement.addContent(new Element("position").setText(legendPosition.toString()));

            props.addContent(legendElement);
        }

        if (labelsVisible != null || labelsPosition != null || labelsPercentage != null) {
            Element labelsElement = new Element("labels");

            if (labelsVisible != null) labelsElement.addContent(new Element("visible").setText(labelsVisible.toString()));
            if (labelsPosition != null) labelsElement.addContent(new Element("position").setText(labelsPosition.toString()));
            if (labelsPercentage != null) labelsElement.addContent(new Element("percentage").setText(labelsPercentage.toString()));

            props.addContent(labelsElement);
        }

        if (tooptipVisible != null || tooptipFormat != null) {
            Element tooptipElement = new Element("tooltip");

            if (tooptipVisible != null) tooptipElement.addContent(new Element("visible").setText(tooptipVisible.toString()));
            if (tooptipFormat != null) tooptipElement.addContent(new Element("format").setText(tooptipFormat.toString()));

            props.addContent(tooptipElement);
        }

        if (!serieses.isEmpty()) {
            Element seriesesElement = new Element("serieses");
            for (PieSeries series : serieses) {
                seriesesElement.addContent(series.toElement());
            }
            props.addContent(seriesesElement);
        }

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object title = getProp("title");
        Object titlePosition = getProp("title-position");
        Object height = getProp("height");
        Object theme = getProp("theme");
        Object borderWidth = getProp("border", "width");
        Object borderColor = getProp("border", "color");
        Object legendVisible = getProp("legend", "visible");
        Object legendPosition = getProp("legend", "position");
        Object labelsVisible = getProp("labels", "visible");
        Object labelsPosition = getProp("labels", "position");
        Object labelsPercentage = getProp("labels", "percentage");
        Object tooptipVisible = getProp("tooltip", "visible");
        Object tooptipFormat = getProp("tooltip", "format");

        StringBuilder propsBuilder = new StringBuilder();

        if (title != null) {
            propsBuilder.append("\"title\":").append('"').append(title).append('"');
        }

        if (titlePosition != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"titlePosition\":").append('"').append(titlePosition).append('"');
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

        if (labelsVisible != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"labelsVisible\":").append(labelsVisible);
        }

        if (labelsPosition != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"labelsPosition\":").append('"').append(labelsPosition).append('"');
        }

        if (labelsPercentage != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"labelsPercentage\":").append('"').append(labelsPercentage).append('"');
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

        if (!serieses.isEmpty()) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"series\":").append('{');

            int count = 0;
            for (PieSeries series : serieses) {
                String json = series.toJson();
                if (json.isEmpty()) {
                    continue;
                }

                if (count > 0) {
                    propsBuilder.append(',');
                }
                count++;

                propsBuilder.append('\"').append(series.getId()).append("\":").append(json);
            }

            propsBuilder.append('}');
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
