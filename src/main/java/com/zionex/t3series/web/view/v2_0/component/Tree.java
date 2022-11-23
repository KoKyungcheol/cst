package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class Tree extends Component {

    public Tree(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object height = getProp("height");
        Object checkbox = getProp("checkbox");

        Element props = new Element("props");

        if (width != null ) props.addContent(new Element("width").setText(width.toString()));
        if (height != null) props.addContent(new Element("height").setText(height.toString()));
        if (checkbox != null) props.addContent(new Element("checkbox").setText(checkbox.toString()));

        Object valueId = getProp("value-id");
        Object valueSort = getProp("value-id.sort");
        Object textId = getProp("text-id");
        Object textSort = getProp("text-id.sort");
        Object getvalueConcat = getProp("getvalue-concat");

        if (valueId != null) {
            Element valueIdElement = new Element("value-id").setText(valueId.toString());
            if (valueSort != null) {
                valueIdElement.setAttribute("sort", valueSort.toString());
            }
            props.addContent(valueIdElement);
        }

        if (textId != null) {
            Element textIdElement = new Element("text-id").setText(textId.toString());
            if (textSort != null) {
                textIdElement.setAttribute("sort", textSort.toString());
            }
            props.addContent(textIdElement);
        }

        if (getvalueConcat != null) props.addContent(new Element("getvalue-concat").setText(getvalueConcat.toString()));

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object width = getProp("width");
        Object height = getProp("height");
        Object checkbox = getProp("checkbox");

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

        if (checkbox != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"checkbox\":").append(checkbox);
        }

        Object valueId = getProp("value-id");
        Object valueSort = getProp("value-id.sort");
        Object textId = getProp("text-id");
        Object textSort = getProp("text-id.sort");
        Object getvalueConcat = getProp("getvalue-concat");

        if (valueId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (valueSort != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"valueSort\":").append('"').append(valueSort).append('"');
        }

        if (textId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"textId\":").append('"').append(textId).append('"');
        }

        if (textSort != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"textSort\":").append('"').append(textSort).append('"');
        }

        if (getvalueConcat != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"getvalueConcat\":").append('"').append(getvalueConcat).append('"');
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
