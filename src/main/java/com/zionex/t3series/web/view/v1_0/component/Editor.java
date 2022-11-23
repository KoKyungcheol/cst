package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class Editor extends Component {

    public Editor(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object height = getProp("height");
        Object lang = getProp("lang");
        Object editable = getProp("editable");
        Object pasteOption = getProp("paste-option");
        Object toolbarUse = getProp("toolbar.use");

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (height != null) viewModel.addContent(new Element("height").setText(height.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (editable != null) viewModel.addContent(new Element("editable").setText(editable.toString()));
        if (pasteOption != null) viewModel.addContent(new Element("paste-option").setText(pasteOption.toString()));
        if (toolbarUse != null) {
            Element toolbarElement = new Element("toolbar");
            toolbarElement.setAttribute("use", toolbarUse.toString());
            viewModel.addContent(toolbarElement);
        }

        Object valueId = getProp("value-id");
        Object valueType = getProp("value-type");
        Object data = getProp("init-value", "data");

        Element model = new Element("model");

        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));
        if (valueType != null) model.addContent(new Element("value-type").setText(valueType.toString()));
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

}
