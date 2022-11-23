package com.zionex.t3series.web.view.v2_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

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

        Element props = new Element("props");

        if (width != null ) props.addContent(new Element("width").setText(width.toString()));
        if (name != null ) props.addContent(new Element("name").setText(name.toString()));
        if (namePosition != null ) props.addContent(new Element("name-position").setText(namePosition.toString()));
        if (placeholder != null ) props.addContent(new Element("placeholder").setText(placeholder.toString()));
        if (editable != null ) props.addContent(new Element("editable").setText(editable.toString()));
        if (enable != null ) props.addContent(new Element("enable").setText(enable.toString()));
        if (lang != null ) props.addContent(new Element("lang").setText(lang.toString()));
        if (selectIndex != null ) props.addContent(new Element("select-index").setText(selectIndex.toString()));
        if (dropdownHeight != null ) props.addContent(new Element("dropdown-height").setText(dropdownHeight.toString()));

        if (!initValueOptions.isEmpty()) {
            Element initValue = new Element("init-value");
            for (Option initValueOption : initValueOptions) {
                initValue.addContent(initValueOption.toElement());
            }
            props.addContent(initValue);
        }

        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");
        Object selectId = getProp("select-id");
        Object ignoreCase = getProp("ignore-case");
        Object tooltip = getProp("tooltip");

        if (valueId != null ) {
            props.addContent(new Element("value-id").setText(valueId.toString()));
        }

        if (textId != null ) {
            Element textIdElement = new Element("text-id");
            textIdElement.setText(textId.toString());

            Object sort = getProp("text-id.sort");
            if (sort != null) {
                textIdElement.setAttribute("sort", sort.toString());
            }
            props.addContent(textIdElement);
        }

        if (selectId != null ) {
            props.addContent(new Element("select-id").setText(selectId.toString()));
        }

        if (ignoreCase != null) {
            props.addContent(new Element("ignore-case").setText(ignoreCase.toString()));
        }

        if (tooltip != null) {
            props.addContent(new Element("tooltip").setText(tooltip.toString()));
        }

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        Object width = getProp("width");
        Object name = getProp("name");
        Object namePosition = getProp("name-position");
        Object placeholder = getProp("placeholder");
        Object editable = getProp("editable");
        Object enable = getProp("enable");
        Object lang = getProp("lang");
        Object selectIndex = getProp("select-index");
        Object dropdownHeight = getProp("dropdown-height");

        StringBuilder propsBuilder = new StringBuilder();

        if(width != null) {
            propsBuilder.append("\"width\":").append('"').append(width).append('"');
        }

        if (name != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"name\":").append('"').append(name).append('"');
        }

        if (namePosition != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"namePosition\":").append('"').append(namePosition).append('"');
        }

        if (placeholder != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"placeholder\":").append('"').append(placeholder).append('"');
        }

        if (editable != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"editable\":").append(editable);
        }

        if (enable != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"enable\":").append(enable);
        }

        if (lang != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"lang\":").append(lang);
        }

        if (selectIndex != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"selectIndex\":").append('"').append(selectIndex).append('"');
        }

        if (dropdownHeight != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"dropdownHeight\":").append('"').append(dropdownHeight).append('"');
        }

        if (!initValueOptions.isEmpty()) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"initValue\":{\"options\":[");
            
            for (int i = 0; i < initValueOptions.size(); i++) {
                Option option = initValueOptions.get(i);

                String json = option.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                
                if (i > 0) {
                    propsBuilder.append(',');
                }
                propsBuilder.append(json);
            }
            propsBuilder.append("]}");
        }

        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");
        Object selectId = getProp("select-id");
        Object ignoreCase = getProp("ignore-case");
        Object tooltip = getProp("tooltip");
        Object sort = getProp("text-id.sort");

        if (valueId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
        }

        if (textId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"textId\":").append('"').append(textId).append('"');
        }

        if (sort != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"textIdSort\":").append('"').append(sort).append('"');
        }

        if (selectId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"selectId\":").append('"').append(selectId).append('"');
        }

        if (ignoreCase != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"ignoreCase\":").append(ignoreCase);
        }

        if (tooltip != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"tooltip\":").append('"').append(tooltip).append('"');
        }

        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"type\":").append('"').append(this.getType()).append('"');

        if (propsBuilder.length() > 0) {
            builder.append(",\"props\":").append('{').append(propsBuilder.toString()).append('}');
        }

        String action = ViewUtil.toJsonAction(this);
        String operation = ViewUtil.toJsonOperation(this);

        if (!action.isEmpty()) builder.append(',').append(action);
        if (!operation.isEmpty()) builder.append(',').append(operation);

        builder.append('}');
        return builder.toString();
    }

}
