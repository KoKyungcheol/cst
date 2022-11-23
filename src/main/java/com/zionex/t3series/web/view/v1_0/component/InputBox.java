package com.zionex.t3series.web.view.v1_0.component;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class InputBox extends Component {

    public InputBox(String id, String type, String copy) {
        super(id, type, copy);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object placeholder = getProp("placeholder");
        Object editable = getProp("editable");
        Object hidden = getProp("hidden");
        Object lang = getProp("lang");
        Object background = getProp("background");
        Element font = ViewUtil.toFontElement(this);

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (name != null ) viewModel.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null ) viewModel.addContent(new Element("name-position").setText(namePosition.toString()));
        if (placeholder != null ) viewModel.addContent(new Element("placeholder").setText(placeholder.toString()));
        if (editable != null ) viewModel.addContent(new Element("editable").setText(editable.toString()));
        if (hidden != null ) viewModel.addContent(new Element("hidden").setText(hidden.toString()));
        if (lang != null ) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (background != null ) viewModel.addContent(new Element("background").setText(background.toString()));
        if (font != null ) viewModel.addContent(font);

        Object type = getProp("type");
        Object min = getProp("min");
        Object max = getProp("max");
        Object initValue = getProp("init-value");
        Object valueId = getProp("value-id");

        Element model = new Element("model");

        if (type != null) model.addContent(new Element("type").setText(type.toString()));
        if (min != null) model.addContent(new Element("min").setText(min.toString()));
        if (max != null) model.addContent(new Element("max").setText(min.toString()));
        if (initValue != null) model.addContent(new Element("init-value").setText(initValue.toString()));
        if (valueId != null) model.addContent(new Element("value-id").setText(valueId.toString()));

        if (hasProp("suggest")) {
            Object suggestValueId = getProp("suggest", "value-id");
            Object suggestTextId = getProp("suggest", "text-id"); // you must change it to "description-id".
            Object suggestDescriptionId = getProp("suggest", "description-id");
            Object suggestIgnoreCase = getProp("suggest", "ignore-case");

            Element suggest = new Element("suggest");

            if (suggestValueId != null) suggest.addContent(new Element("value-id").setText(suggestValueId.toString()));
            if (suggestTextId != null) suggest.addContent(new Element("text-id").setText(suggestTextId.toString()));
            if (suggestDescriptionId != null) suggest.addContent(new Element("description-id").setText(suggestDescriptionId.toString()));
            if (suggestIgnoreCase != null) suggest.addContent(new Element("ignore-case").setText(suggestIgnoreCase.toString()));

            model.addContent(suggest);
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
