package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

import org.jdom2.Element;

public class BPMNWebModeler extends Component {

    private Toolbar toolbar;

    public BPMNWebModeler(String id, String type, String copy) {
        super(id, type, copy);
    }

    public Toolbar getToolbar() {
        return toolbar;
    }

    public void setToolbar(Toolbar toolbar) {
        this.toolbar = toolbar;
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object height = getProp("height");

        Element viewModel = new Element("view-model");

        if (height != null ) viewModel.addContent(new Element("height").setText(height.toString()));

        if (toolbar != null) {
            viewModel.addContent(toolbar.toElement());
        }

        Object editable = getProp("editable");

        Element model = new Element("model");

        if (editable != null) model.addContent(new Element("editable").setText(editable.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object height = getProp("height");

        StringBuilder viewModelBuilder = new StringBuilder();

        if (height != null) {
            viewModelBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (toolbar != null) {
            String toolbarJson = toolbar.toJson();
            if (!toolbarJson.isEmpty()) {
                if (viewModelBuilder.length() > 0) {
                    viewModelBuilder.append(',');
                }
                viewModelBuilder.append(toolbarJson);
            }
        }

        Object editable = getProp("editable");

        StringBuilder modelBuilder = new StringBuilder();

        if (editable != null) {
            modelBuilder.append("\"editable\":").append(editable);
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
