package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class Editor extends Component {

    public Editor(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object height = getProp("height");
        Object lang = getProp("lang");
        Object editable = getProp("editable");
        Object pasteOption = getProp("paste-option");
        Object toolbarUse = getProp("toolbar.use");

        Element props = new Element("props");

        if (width != null ) props.addContent(new Element("width").setText(width.toString()));
        if (height != null) props.addContent(new Element("height").setText(height.toString()));
        if (lang != null) props.addContent(new Element("lang").setText(lang.toString()));
        if (editable != null) props.addContent(new Element("editable").setText(editable.toString()));
        if (pasteOption != null) props.addContent(new Element("paste-option").setText(pasteOption.toString()));
        if (toolbarUse != null) {
            Element toolbarElement = new Element("toolbar");
            toolbarElement.setAttribute("use", toolbarUse.toString());
            props.addContent(toolbarElement);
        }

        Object valueId = getProp("value-id");
        Object valueType = getProp("value-type");
        Object data = getProp("init-value", "data");

        if (valueId != null) props.addContent(new Element("value-id").setText(valueId.toString()));
        if (valueType != null) props.addContent(new Element("value-type").setText(valueType.toString()));
        if (data != null) {
            Element initValueElement = new Element("init-value");
            initValueElement.addContent(new Element("data").setText(data.toString()));
            props.addContent(initValueElement);
        }

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object width = getProp("width");
        Object height = getProp("height");
        Object lang = getProp("lang");
        Object editable = getProp("editable");
        Object pasteOption = getProp("paste-option");
        Object toolbar = getProp("toolbar.use");

        StringBuilder propsBuilder = new StringBuilder();

        if (width != null) {
            propsBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (height != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (lang != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"lang\":").append(lang);
        }

        if (editable != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"editable\":").append(editable);
        }

        if (pasteOption != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"pasteOption\":").append('"').append(pasteOption).append('"');
        }

        if (toolbar != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"toolbar\":").append(toolbar);
        }

        Object valueId = getProp("value-id");
        Object valueType = getProp("value-type");
        Object data = getProp("init-value", "data");

        if (valueId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (valueType != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"valueType\":").append('"').append(valueType).append('"');
        }

        if (data != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"initValue\":").append('"').append(data).append('"');
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
