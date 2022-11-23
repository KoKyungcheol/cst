package com.zionex.t3series.web.view.v1_2.component.grid;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.v1_2.component.Condition;

import org.jdom2.Element;

public class CellAttribute implements Configurable {

    private final String id;

    private List<Condition> conditions = new ArrayList<>();
    private List<Apply> applies = new ArrayList<>();

    public CellAttribute(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public List<Condition> getConditions() {
        return Collections.unmodifiableList(conditions);
    }

    public void addCondition(Condition condition) {
        conditions.add(condition);
    }

    public List<Apply> getApplies() {
        return Collections.unmodifiableList(applies);
    }

    public void addApply(Apply apply) {
        applies.add(apply);
    }

    @Override
    public Element toElement() {
        Element cellAttributeElement = new Element("cell-attribute");

        cellAttributeElement.setAttribute("id", id);

        if (!conditions.isEmpty()) {
            Element conditionsElement = new Element("conditions");
            for (Condition condition : conditions) {
                conditionsElement.addContent(condition.toElement());
            }
            cellAttributeElement.addContent(conditionsElement);
        }

        if (!applies.isEmpty()) {
            Element appliesElement = new Element("applies");
            for (Apply apply : applies) {
                appliesElement.addContent(apply.toElement());
            }
            cellAttributeElement.addContent(appliesElement);
        }

        return cellAttributeElement;
    }

    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');

        if (!conditions.isEmpty()) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"conditions\":").append('{');
            for (int i = 0; i < conditions.size(); i++) {
                Condition condition = conditions.get(i);
                if (i > 0) {
                    builder.append(',');
                }

                String json = condition.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                builder.append('"').append(condition.getId()).append("\":").append(json);
            }
            builder.append('}');
        }

        if (!applies.isEmpty()) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"applies\":").append('{');
            for (int i = 0; i < applies.size(); i++) {
                Apply apply = applies.get(i);
                if (i > 0) {
                    builder.append(',');
                }

                String json = apply.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                builder.append('"').append(apply.getId()).append("\":").append(json);
            }
            builder.append('}');
        }

        builder.append('}');
        return builder.toString();
    }

}
