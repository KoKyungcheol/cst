package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

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

}
