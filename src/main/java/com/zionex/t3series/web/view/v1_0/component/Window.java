package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

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

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
