package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

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

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (height != null) viewModel.addContent(new Element("height").setText(height.toString()));
        if (checkbox != null) viewModel.addContent(new Element("checkbox").setText(checkbox.toString()));

        Object valueId = getProp("value-id");
        Object valueSort = getProp("value-id.sort");
        Object textId = getProp("text-id");
        Object textSort = getProp("text-id.sort");
        Object getvalueConcat = getProp("getvalue-concat");

        Element model = new Element("model");

        if (valueId != null) {
            Element valueIdElement = new Element("value-id").setText(valueId.toString());
            if (valueSort != null) {
                valueIdElement.setAttribute("sort", valueSort.toString());
            }
            model.addContent(valueIdElement);
        }

        if (textId != null) {
            Element textIdElement = new Element("text-id").setText(textId.toString());
            if (textSort != null) {
                textIdElement.setAttribute("sort", textSort.toString());
            }
            model.addContent(textIdElement);
        }

        if (getvalueConcat != null) model.addContent(new Element("getvalue-concat").setText(getvalueConcat.toString()));

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
        Object checkbox = getProp("checkbox");

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

        if (checkbox != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"checkbox\":").append(checkbox);
        }

        Object valueId = getProp("value-id");
        Object valueSort = getProp("value-id.sort");
        Object textId = getProp("text-id");
        Object textSort = getProp("text-id.sort");
        Object getvalueConcat = getProp("getvalue-concat");

        StringBuilder modelBuilder = new StringBuilder();

        if (valueId != null) {
            modelBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (valueSort != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"valueSort\":").append('"').append(valueSort).append('"');
        }

        if (textId != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"textId\":").append('"').append(textId).append('"');
        }

        if (textSort != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"textSort\":").append('"').append(textSort).append('"');
        }

        if (getvalueConcat != null) {
            if (modelBuilder.length() > 0) {
                modelBuilder.append(',');
            }
            modelBuilder.append("\"getvalueConcat\":").append('"').append(getvalueConcat).append('"');
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
