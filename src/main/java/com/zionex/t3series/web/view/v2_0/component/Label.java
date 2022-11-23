package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class Label extends Component {

    public Label(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object lang = getProp("lang");
        Object position = getProp("position");
        Object tooltip = getProp("tooltip");
        Object icon = getProp("icon");
        Element font = ViewUtil.toFontElement(this);

        Element props = new Element("props");

        if (width != null ) props.addContent(new Element("width").setText(width.toString()));
        if (lang != null) props.addContent(new Element("lang").setText(lang.toString()));
        if (position != null) props.addContent(new Element("position").setText(position.toString()));
        if (tooltip != null) props.addContent(new Element("tooltip").setText(tooltip.toString()));
        if (icon != null) props.addContent(new Element("icon").setText(icon.toString()));
        if (font != null) props.addContent(font);

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object format = getProp("format");

        if (initValue != null) props.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) props.addContent(new Element("value-id").setText(valueId.toString()));
        if (format != null) props.addContent(new Element("format").setText(format.toString()));

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object width = getProp("width");
        Object lang = getProp("lang");
        Object position = getProp("position");
        Object tooltip = getProp("tooltip");
        Object icon = getProp("icon");
        String font = ViewUtil.toFontJson(this);

        StringBuilder propsBuilder = new StringBuilder();

        if (width != null ) {
            propsBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (lang != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"lang\":").append(lang);
        }

        if (position != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"position\":").append('"').append(position).append('"');
        }

        if (tooltip != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"tooltip\":").append('"').append(tooltip).append('"');
        }

        if (icon != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"icon\":").append('"').append(icon).append('"');
        }

        if (font != null && !font.isEmpty()) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"font\":").append(font);
        }

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object format = getProp("format");

        if (initValue != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"initValue\":").append('"').append(initValue).append('"');
        }

        if (valueId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (format != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"format\":").append('"').append(format).append('"');
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
