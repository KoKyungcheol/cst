package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class URLPage extends Component {

    public URLPage(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object url = getProp("url");
        Object width = getProp("width");
        Object height = getProp("height");
        Object scroll = getProp("scroll");

        Element props = new Element("props");

        if (url != null ) props.addContent(new Element("url").setText(url.toString()));
        if (width != null) props.addContent(new Element("width").setText(width.toString()));
        if (height != null) props.addContent(new Element("height").setText(height.toString()));
        if (scroll != null) props.addContent(new Element("scroll").setText(scroll.toString()));

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object url = getProp("url");
        Object width = getProp("width");
        Object height = getProp("height");
        Object scroll = getProp("scroll");

        StringBuilder propsBuilder = new StringBuilder();

        if (url != null) {
            propsBuilder.append("\"url\":").append('"').append(url).append('"');
        }

        if (width != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (height != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (scroll != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"scroll\":").append(scroll);
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