package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

import org.jdom2.Element;

public class Textarea extends Component {

    public Textarea(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object height = getProp("height");
        Object lang = getProp("lang");
        Object editable = getProp("editable");
        Object placeholder = getProp("placeholder");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (height != null) viewModel.addContent(new Element("height").setText(height.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (editable != null) viewModel.addContent(new Element("editable").setText(editable.toString()));
        if (placeholder != null) viewModel.addContent(new Element("placeholder").setText(placeholder.toString()));
        if (name != null) viewModel.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null) viewModel.addContent(new Element("name-position").setText(namePosition.toString()));

        Object valueId = getProp("value-id");
        Object data = getProp("init-value", "data");

        Element model = new Element("model");

        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));
        if (data != null) {
            Element initValueElement = new Element("init-value");
            initValueElement.addContent(new Element("data").setText(data.toString()));
            model.addContent(initValueElement);
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

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
        Object placeholder = getProp("placeholder");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");

        StringBuilder viewModelBuilder = new StringBuilder();

        if (width != null) {
            viewModelBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (height != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (lang != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"lang\":").append(lang);
        }

        if (editable != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"editable\":").append(editable);
        }

        if (placeholder != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"placeholder\":").append('"').append(placeholder).append('"');
        }

        if (name != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"name\":").append('"').append(name).append('"');
        }

        if (namePosition != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"namePosition\":").append('"').append(namePosition).append('"');
        }

        Object valueId = getProp("value-id");
        Object data = getProp("init-value", "data");

        StringBuilder modelBuilder = new StringBuilder();

        if (valueId != null) {
            modelBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (data != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"initValue\":").append('"').append(data).append('"');
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
