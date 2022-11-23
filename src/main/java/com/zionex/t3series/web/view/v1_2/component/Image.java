package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

import org.jdom2.Element;

public class Image extends Component {

    public Image(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object image = getProp("image");

        Element viewModel = new Element("view-model");

        if (image != null ) viewModel.addContent(new Element("image").setText(image.toString()));

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");

        Element model = new Element("model");

        if (initValue != null) model.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object image = getProp("image");

        StringBuilder viewModelBuilder = new StringBuilder();

        if (image != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"image\":").append('"').append(image).append('"');
        }

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");

        StringBuilder modelBuilder = new StringBuilder();

        if (initValue != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"initValue\":").append('"').append(initValue).append('"');
        }

        if (valueId != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
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
