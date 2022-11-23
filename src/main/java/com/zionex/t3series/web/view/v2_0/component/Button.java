package com.zionex.t3series.web.view.v2_0.component;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class Button extends Component {

    public Button(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object name = getProp("name");
        Object tooltip = getProp("tooltip");
        Object icon = getProp("icon");
        Object disable = getProp("disable");
        Object lang = getProp("lang");
        Object background = getProp("background");
        Object visible = getProp("visible");
        Element font = ViewUtil.toFontElement(this);

        Element props = new Element("props");

        if (width != null ) props.addContent(new Element("width").setText(width.toString()));
        if (name != null) props.addContent(new Element("name").setText(name.toString()));
        if (tooltip != null) props.addContent(new Element("tooltip").setText(tooltip.toString()));
        if (icon != null) props.addContent(new Element("icon").setText(icon.toString()));
        if (disable != null) props.addContent(new Element("disable").setText(disable.toString()));
        if (lang != null) props.addContent(new Element("lang").setText(lang.toString()));
        if (background != null) props.addContent(new Element("background").setText(background.toString()));
        if (font != null) props.addContent(font);
        if (visible != null) props.addContent(new Element("visible").setText(visible.toString()));

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object width = getProp("width");
        Object name = getProp("name");
        Object tooltip = getProp("tooltip");
        Object icon = getProp("icon");
        Object disable = getProp("disable");
        Object lang = getProp("lang");
        Object background = getProp("background");
        String font = ViewUtil.toFontJson(this);
        Object visible = getProp("visible");

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

        if (disable != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"disable\":").append(disable);
        }

        if (visible != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"visible\":").append(visible);
        }

        if (lang != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"lang\":").append(lang);
        }

        if (background != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"background\":").append('"').append(background).append('"');
        }

        if (font != null && !font.isEmpty()) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"font\":").append(font);
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
