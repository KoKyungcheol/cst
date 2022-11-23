package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class Button extends Component {

    public Button(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object name = getProp("name");
        Object tooltip = getProp("tooltip");
        Object icon = getProp("icon");
        Object disable = getProp("disable");
        Object lang = getProp("lang");
        Object background = getProp("background");
        Element font = ViewUtil.toFontElement(this);

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (name != null) viewModel.addContent(new Element("name").setText(name.toString()));
        if (tooltip != null) viewModel.addContent(new Element("tooltip").setText(tooltip.toString()));
        if (icon != null) viewModel.addContent(new Element("icon").setText(icon.toString()));
        if (disable != null) viewModel.addContent(new Element("disable").setText(disable.toString()));
        if (lang != null) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (background != null) viewModel.addContent(new Element("background").setText(background.toString()));
        if (font != null) viewModel.addContent(font);

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
