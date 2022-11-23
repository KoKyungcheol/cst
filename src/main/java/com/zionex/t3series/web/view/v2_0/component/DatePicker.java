package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class DatePicker extends Component {

    public DatePicker(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object editable = getProp("editable");
        Object lang = getProp("lang");
        Object dateType = getProp("date-type");
        Object dateFormat = getProp("date-format");

        Element props = new Element("props");

        if (width != null ) props.addContent(new Element("width").setText(width.toString()));
        if (name != null) props.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null) props.addContent(new Element("name-position").setText(namePosition.toString()));
        if (editable != null) props.addContent(new Element("editable").setText(editable.toString()));
        if (lang != null) props.addContent(new Element("lang").setText(lang.toString()));
        if (dateType != null) props.addContent(new Element("date-type").setText(dateType.toString()));
        if (dateFormat != null) props.addContent(new Element("date-format").setText(dateFormat.toString()));

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object baseValue = getProp("base-value");

        if (initValue != null) props.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) props.addContent(new Element("value-id").setText(valueId.toString()));
        if (baseValue != null) props.addContent(new Element("base-value").setText(baseValue.toString()));

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object width = getProp("width");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object editable = getProp("editable");
        Object lang = getProp("lang");
        Object dateType = getProp("date-type");
        Object dateFormat = getProp("date-format");

        StringBuilder propsBuilder = new StringBuilder();

        if (width != null) {
            propsBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (name != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"name\":").append('"').append(name).append('"');
        }

        if (namePosition != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"namePosition\":").append('"').append(namePosition).append('"');
        }

        if (editable != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"editable\":").append(editable);
        }

        if (lang != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"lang\":").append(lang);
        }

        if (dateType != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"dateType\":").append('"').append(dateType).append('"');
        }

        if (dateFormat != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"dateFormat\":").append('"').append(dateFormat).append('"');
        }

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object baseValue = getProp("base-value");

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

        if (baseValue != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"baseValue\":").append('"').append(baseValue).append('"');
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
