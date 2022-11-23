package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_0.ViewUtil;

import org.jdom2.Element;

public class ComboBox extends Component {

    private List<Option> initValueOptions = new ArrayList<>();

    public ComboBox(String id, String type, String copy) {
        super(id, type, copy);
    }

    public List<Option> getInitValueOptions() {
        return Collections.unmodifiableList(initValueOptions);
    }

    public void addInitValueOption(Option initValueOption) {
        initValueOptions.add(initValueOption);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Object width = getProp("width");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object placeholder = getProp("placeholder");
        Object editable = getProp("editable");
        Object enable = getProp("enable");
        Object lang = getProp("lang");
        Object selectIndex = getProp("select-index");
        Object dropdownHeight = getProp("dropdown-height");

        Element viewModel = new Element("view-model");

        if (width != null ) viewModel.addContent(new Element("width").setText(width.toString()));
        if (name != null ) viewModel.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null ) viewModel.addContent(new Element("name-position").setText(namePosition.toString()));
        if (placeholder != null ) viewModel.addContent(new Element("placeholder").setText(placeholder.toString()));
        if (editable != null ) viewModel.addContent(new Element("editable").setText(editable.toString()));
        if (enable != null ) viewModel.addContent(new Element("enable").setText(enable.toString()));
        if (lang != null ) viewModel.addContent(new Element("lang").setText(lang.toString()));
        if (selectIndex != null ) viewModel.addContent(new Element("select-index").setText(selectIndex.toString()));
        if (dropdownHeight != null ) viewModel.addContent(new Element("dropdown-height").setText(dropdownHeight.toString()));

        Element model = new Element("model");

        if (!initValueOptions.isEmpty()) {
            Element initValue = new Element("init-value");
            for (Option initValueOption : initValueOptions) {
                initValue.addContent(initValueOption.toElement());
            }
            model.addContent(initValue);
        }

        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");
        Object selectId = getProp("select-id");
        Object ignoreCase = getProp("ignore-case");
        Object tooltip = getProp("tooltip");

        if (valueId != null ) {
            model.addContent(new Element("value-id").setText(valueId.toString()));
        }

        if (textId != null ) {
            Element textIdElement = new Element("text-id");
            textIdElement.setText(textId.toString());

            Object sort = getProp("text-id.sort");
            if (sort != null) {
                textIdElement.setAttribute("sort", sort.toString());
            }
            model.addContent(textIdElement);
        }

        if (selectId != null ) {
            model.addContent(new Element("select-id").setText(selectId.toString()));
        }

        if (ignoreCase != null) {
            model.addContent(new Element("ignore-case").setText(ignoreCase.toString()));
        }

        if (tooltip != null) {
            model.addContent(new Element("tooltip").setText(tooltip.toString()));
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

}
