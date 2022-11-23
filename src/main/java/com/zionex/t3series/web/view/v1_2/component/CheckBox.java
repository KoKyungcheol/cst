package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

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

        Element viewModel = new Element("view-model");

        if (name != null ) viewModel.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null) viewModel.addContent(new Element("name-position").setText(namePosition.toString()));
        if (editable != null) viewModel.addContent(new Element("editable").setText(editable.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");

        Element model = new Element("model");

        if (initValue != null) model.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));
        if (textId != null) model.addContent(new Element("text-id").setText(textId.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

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

        StringBuilder viewModelBuilder = new StringBuilder();

        if (name != null) {
            viewModelBuilder.append("\"name\":").append('"').append(name).append('"');
        }

        if (namePosition != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"namePosition\":").append('"').append(namePosition).append('"');
        }

        if (editable != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"editable\":").append(editable);
        }

        if (lang != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"lang\":").append(lang);
        }

        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");

        StringBuilder modelBuilder = new StringBuilder();

        if (initValue != null) {
            modelBuilder.append("\"initValue\":").append(initValue);
        }

        if (valueId != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (textId != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"textId\":").append('"').append(textId).append('"');
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
