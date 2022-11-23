package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class CheckBox extends Component {

    public CheckBox(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object editable = getProp("editable");
        Object lang = getProp("lang");

        Element props = new Element("props");

        if (name != null ) props.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null) props.addContent(new Element("name-position").setText(namePosition.toString()));
        if (editable != null) props.addContent(new Element("editable").setText(editable.toString()));
        if (lang != null) props.addContent(new Element("lang").setText(lang.toString()));

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");

        if (initValue != null) props.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) props.addContent(new Element("value-id").setText(valueId.toString()));
        if (textId != null) props.addContent(new Element("text-id").setText(textId.toString()));

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson(){
        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object editable = getProp("editable");
        Object lang = getProp("lang");

        StringBuilder propsBuilder = new StringBuilder();

        if (name != null) {
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

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");

        if (initValue != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"initValue\":").append(initValue);
        }

        if (valueId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (textId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"textId\":").append('"').append(textId).append('"');
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
