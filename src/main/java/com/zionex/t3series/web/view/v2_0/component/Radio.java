package com.zionex.t3series.web.view.v2_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v2_0.ViewUtil;

import org.jdom2.Element;

public class Radio extends Component {

    private List<Option> initValueOptions = new ArrayList<>();

    public Radio(String id, String type, String copy) {
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

        Object name = getProp("name");
        Object lang = getProp("lang");
        Object optionDeployment = getProp("option-deployment");

        Element props = new Element("props");

        if (name != null ) props.addContent(new Element("name").setText(name.toString()));
        if (lang != null) props.addContent(new Element("lang").setText(lang.toString()));
        if (optionDeployment != null) props.addContent(new Element("option-deployment").setText(optionDeployment.toString()));

        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");
        Object selectId = getProp("select-id");

        if (!initValueOptions.isEmpty()) {
            Element initValue = new Element("init-value");
            for (Option initValueOption : initValueOptions) {
                initValue.addContent(initValueOption.toElement());
            }
            props.addContent(initValue);
        }

        if (valueId != null) props.addContent(new Element("value-id").setText(valueId.toString()));
        if (textId != null) props.addContent(new Element("text-id").setText(textId.toString()));
        if (selectId != null) props.addContent(new Element("select-id").setText(selectId.toString()));

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson(){
        Object name = getProp("name");
        Object lang = getProp("lang");
        Object optionDeployment = getProp("option-deployment");

        StringBuilder propsBuilder = new StringBuilder();

        if (name != null) {
            propsBuilder.append("\"name\":").append('"').append(name).append('"');
        }

        if (lang != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"lang\":").append(lang);
        }

        if (optionDeployment != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"optionDeployment\":").append('"').append(optionDeployment).append('"');
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

                if (i > 0){
                    propsBuilder.append(',');
                }
                propsBuilder.append(json);
            }
            propsBuilder.append("]}");
        }

        Object valueId = getProp("value-id");
        Object textId = getProp("text-id");
        Object selectId = getProp("select-id");

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

        if (selectId != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"selectId\":").append('"').append(selectId).append('"');
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
