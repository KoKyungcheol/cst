package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

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

        Element viewModel = new Element("view-model");

        if (lang != null ) {
            viewModel.addContent(new Element("lang").setText(lang.toString()));
        }

        if (title != null) {
            viewModel.addContent(new Element("title").setText(title.toString()));
        }

        if (width != null) {
            viewModel.addContent(new Element("width").setText(width.toString()));
        }

        if (height != null) {
            viewModel.addContent(new Element("height").setText(height.toString()));
        }

        if (visible != null) {
            viewModel.addContent(new Element("visible").setText(visible.toString()));
        }

        if (modal != null) {
            viewModel.addContent(new Element("modal").setText(modal.toString()));
        }

        if (initRender != null) {
            viewModel.addContent(new Element("init-render").setText(initRender.toString()));
        }

        if (useButtons != null) {
            viewModel.addContent(new Element("use-buttons").setText(useButtons.toString()));
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);

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

        StringBuilder viewModelBuilder = new StringBuilder();

        if (lang != null) {
            viewModelBuilder.append("\"lang\":").append(lang);
        }

        if (title != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"title\":").append('"').append(title).append('"');
        }

        if (width != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (height != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (visible != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"visible\":").append(visible);
        }

        if (modal != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"modal\":").append(modal);
        }

        if (initRender != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"initRender\":").append(initRender);
        }

        if (useButtons != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"useButtons\":").append(useButtons);
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
