package com.zionex.t3series.web.view.v1_2.component;

import com.zionex.t3series.web.view.v1_2.ViewUtil;

import org.jdom2.Element;

public class URLPage extends Component {

    public URLPage(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object url = getProp("url");
        Object width = getProp("width");
        Object height = getProp("height");
        Object scroll = getProp("scroll");

        Element viewModel = new Element("view-model");

        if (url != null ) viewModel.addContent(new Element("url").setText(url.toString()));
        if (width != null) viewModel.addContent(new Element("width").setText(width.toString()));
        if (height != null) viewModel.addContent(new Element("height").setText(height.toString()));
        if (scroll != null) viewModel.addContent(new Element("scroll").setText(scroll.toString()));

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object url = getProp("url");
        Object width = getProp("width");
        Object height = getProp("height");
        Object scroll = getProp("scroll");

        StringBuilder viewModelBuilder = new StringBuilder();

        if (url != null) {
            viewModelBuilder.append("\"url\":").append('"').append(url).append('"');
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

        if (scroll != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"scroll\":").append(scroll);
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