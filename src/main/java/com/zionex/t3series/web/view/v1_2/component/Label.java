package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

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

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (position != null) viewModel.addContent(new Element("position").setText(position.toString()));
        if (tooltip != null) viewModel.addContent(new Element("tooltip").setText(tooltip.toString()));
        if (icon != null) viewModel.addContent(new Element("icon").setText(icon.toString()));
        if (font != null) viewModel.addContent(font);

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object format = getProp("format");

        Element model = new Element("model");

        if (initValue != null) model.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));
        if (format != null) model.addContent(new Element("format").setText(format.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

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

        StringBuilder viewModelBuilder = new StringBuilder();

        if (width != null ) {
            viewModelBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (lang != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"lang\":").append(lang);
        }

        if (position != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"position\":").append('"').append(position).append('"');
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

        if (font != null && !font.isEmpty()) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"font\":").append(font);
        }

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object format = getProp("format");

        StringBuilder modelBuilder = new StringBuilder();

        if (initValue != null) {
            modelBuilder.append("\"initValue\":").append('"').append(initValue).append('"');
        }

        if (valueId != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (format != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"format\":").append('"').append(format).append('"');
        }

        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"type\":").append('"').append(this.getType()).append('"');

        if (viewModelBuilder.length() > 0) {
            builder.append(",\"viewModel\":").append('{').append(viewModelBuilder.toString()).append('}');
        }

        if (modelBuilder.length() > 0) {
            builder.append(",\"model\":").append('{').append(modelBuilder.toString()).append('}');
        }

        String action = ViewUtil.toJsonAction(this);
        String operation = ViewUtil.toJsonOperation(this);

        if (!action.isEmpty()) builder.append(',').append(action);
        if (!operation.isEmpty()) builder.append(',').append(operation);

        builder.append('}');
        return builder.toString();
    }

}
