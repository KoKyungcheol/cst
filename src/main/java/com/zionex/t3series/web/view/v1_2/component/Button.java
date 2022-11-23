package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

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

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (name != null) viewModel.addContent(new Element("name").setText(name.toString()));
        if (tooltip != null) viewModel.addContent(new Element("tooltip").setText(tooltip.toString()));
        if (icon != null) viewModel.addContent(new Element("icon").setText(icon.toString()));
        if (disable != null) viewModel.addContent(new Element("disable").setText(disable.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (background != null) viewModel.addContent(new Element("background").setText(background.toString()));
        if (font != null) viewModel.addContent(font);
        if (visible != null) viewModel.addContent(new Element("visible").setText(visible.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);

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

        StringBuilder viewModelBuilder = new StringBuilder();

        if (width != null) {
            viewModelBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (name != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"name\":").append('"').append(name).append('"');
        }

        if (tooltip != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"tooltip\":").append('"').append(tooltip).append('"');
        }

        if (icon != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"icon\":").append('"').append(icon).append('"');
        }

        if (disable != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"disable\":").append(disable);
        }

        if (visible != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"visible\":").append(visible);
        }

        if (lang != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"lang\":").append(lang);
        }

        if (background != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"background\":").append('"').append(background).append('"');
        }

        if (font != null && !font.isEmpty()) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"font\":").append(font);
        }

        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"type\":").append('"').append(this.getType()).append('"');

        if (viewModelBuilder.length() > 0) {
            builder.append(",\"viewModel\":").append('{').append(viewModelBuilder.toString()).append('}');
        }
        
        String action = ViewUtil.toJsonAction(this);
        String operation = ViewUtil.toJsonOperation(this);

        if (!action.isEmpty()) builder.append(',').append(action);
        if (!operation.isEmpty()) builder.append(',').append(operation);

        builder.append('}');
        return builder.toString();
    }

}
