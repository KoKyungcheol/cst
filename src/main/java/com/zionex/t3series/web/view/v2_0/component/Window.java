package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class Window extends Component {

    public Window(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object lang = getProp("lang");
        Object title = getProp("title");
        Object width = getProp("width");
        Object height = getProp("height");
        Object visible = getProp("visible");
        Object modal = getProp("modal");
        Object initRender = getProp("init-render");
        Object useButtons = getProp("use-buttons");

        Element props = new Element("props");

        if (lang != null ) {
            props.addContent(new Element("lang").setText(lang.toString()));
        }

        if (title != null) {
            props.addContent(new Element("title").setText(title.toString()));
        }

        if (width != null) {
            props.addContent(new Element("width").setText(width.toString()));
        }

        if (height != null) {
            props.addContent(new Element("height").setText(height.toString()));
        }

        if (visible != null) {
            props.addContent(new Element("visible").setText(visible.toString()));
        }

        if (modal != null) {
            props.addContent(new Element("modal").setText(modal.toString()));
        }

        if (initRender != null) {
            props.addContent(new Element("init-render").setText(initRender.toString()));
        }

        if (useButtons != null) {
            props.addContent(new Element("use-buttons").setText(useButtons.toString()));
        }

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object lang = getProp("lang");
        Object title = getProp("title");
        Object width = getProp("width");
        Object height = getProp("height");
        Object visible = getProp("visible");
        Object modal = getProp("modal");
        Object initRender = getProp("init-render");
        Object useButtons = getProp("use-buttons");

        StringBuilder propsBuilder = new StringBuilder();

        if (lang != null) {
            propsBuilder.append("\"lang\":").append(lang);
        }

        if (title != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"title\":").append('"').append(title).append('"');
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

        if (visible != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"visible\":").append(visible);
        }

        if (modal != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"modal\":").append(modal);
        }

        if (initRender != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"initRender\":").append(initRender);
        }

        if (useButtons != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"useButtons\":").append(useButtons);
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
