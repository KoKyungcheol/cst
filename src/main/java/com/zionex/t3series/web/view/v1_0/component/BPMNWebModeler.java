package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

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

        if (height != null) viewModel.addContent(new Element("height").setText(height.toString()));

        if (toolbar != null) {
            viewModel.addContent(toolbar.toElement());
        }

        Object editable = getProp("editable");

        Element model = new Element("model");

        if (editable != null) model.addContent(new Element("editable").setText(editable.toString()));

        if (viewModel.getContentSize() > 0)
            component.addContent(viewModel);
        if (model.getContentSize() > 0)
            component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
