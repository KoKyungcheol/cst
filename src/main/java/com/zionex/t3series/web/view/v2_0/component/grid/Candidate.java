package com.zionex.t3series.web.view.v2_0.component.grid;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;
import com.zionex.t3series.web.view.v2_0.component.Option;
import com.zionex.t3series.web.view.v2_0.component.ReferenceServiceCall;
import com.zionex.t3series.web.view.v2_0.component.ServiceCall;

import org.jdom2.Element;

public class Candidate extends Properties implements Configurable {

    private List<Option> initValueOptions = new ArrayList<>();

    private ServiceCall serviceCall;
    private ReferenceServiceCall referenceServiceCall;

    public Candidate() {
    }

    public List<Option> getInitValueOptions() {
        return Collections.unmodifiableList(initValueOptions);
    }

    public void addInitValueOption(Option initValueOption) {
        initValueOptions.add(initValueOption);
    }

    public ServiceCall getServiceCall() {
        return serviceCall;
    }

    public void setServiceCall(ServiceCall serviceCall) {
        this.serviceCall = serviceCall;
    }

    public ReferenceServiceCall getReferenceServiceCall() {
        return referenceServiceCall;
    }

    public void setReferenceServiceCall(ReferenceServiceCall referenceServiceCall) {
        this.referenceServiceCall = referenceServiceCall;
    }

    @Override
    public Element toElement() {
        Element candidateElement = new Element("candidate");

        Object dropDownCount = getProp("drop-down-count");
        Object referenceColumn = getProp("reference-column");
        Object valueId = getProp("values", "value-id");
        Object textId = getProp("values", "text-id");

        if (dropDownCount != null) candidateElement.addContent(new Element("drop-down-count").setText(dropDownCount.toString()));
        if (referenceColumn != null) candidateElement.addContent(new Element("reference-column").setText(referenceColumn.toString()));

        if (!initValueOptions.isEmpty()) {
            Element initValueElement = new Element("init-value");
            for (Option initValueOption : initValueOptions) {
                initValueElement.addContent(initValueOption.toElement());
            }
            candidateElement.addContent(initValueElement);
        }

        if (valueId != null || textId != null || serviceCall != null || referenceServiceCall != null) {
            Element valuesElement = new Element("values");

            if (valueId != null) valuesElement.addContent(new Element("value-id").setText(valueId.toString()));
            if (textId != null) valuesElement.addContent(new Element("text-id").setText(textId.toString()));
            if (serviceCall != null) valuesElement.addContent(serviceCall.toElement());
            if (referenceServiceCall != null) valuesElement.addContent(referenceServiceCall.toElement());

            candidateElement.addContent(valuesElement);
        }

        return candidateElement;
    }

    @Override
    public String toJson() {
        Object dropDownCount = getProp("drop-down-count");
        Object referenceColumn = getProp("reference-column");

        StringBuilder builder = new StringBuilder();
        builder.append('{');

        if (dropDownCount != null) {
            builder.append("\"dropDownCount\":").append('"').append(dropDownCount).append('"');
        }

        if (referenceColumn != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"referenceColumn\":").append('"').append(referenceColumn).append('"');
        }

        if (!initValueOptions.isEmpty()) {
            if (builder.length() > 1) {
                builder.append(',');
            }

            builder.append("\"initValue\":{\"options\":[");

            for (int i = 0; i < initValueOptions.size(); i++) {
                Option option = initValueOptions.get(i);

                String json = option.toJson();
                if (json.isEmpty()) {
                    continue;
                }

                if (i > 0) {
                    builder.append(',');
                }
                builder.append(json);
            }
            builder.append("]}");
        }

        Object valueId = getProp("values", "value-id");
        Object textId = getProp("values", "text-id");

        StringBuilder valuesBuilder = new StringBuilder();

        if (valueId != null || textId != null || serviceCall != null || referenceServiceCall != null) {

            if (valueId != null) {
                valuesBuilder.append("\"valueId\":").append('"').append(valueId).append('"');
            }

            if (textId != null) {
                if (valuesBuilder.length() > 0) {
                    valuesBuilder.append(',');
                }
                valuesBuilder.append("\"textId\":").append('"').append(textId).append('"');
            }

            if (serviceCall != null) {
                if (valuesBuilder.length() > 0) {
                    valuesBuilder.append(',');
                }
                valuesBuilder.append("\"serviceCalls\":").append('{');
                valuesBuilder.append('"').append(serviceCall.getId()).append("\":").append(serviceCall.toJson()).append('}');
            }

            if (referenceServiceCall != null) {
                if (valuesBuilder.length() > 0) {
                    valuesBuilder.append(',');
                }
                valuesBuilder.append("\"referenceServiceCalls\":").append('[').append(referenceServiceCall.toJson()).append("]");
            }
        }

        if (valuesBuilder.length() > 0) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"values\":").append('{').append(valuesBuilder.toString()).append('}');
        }

        builder.append('}');
        return builder.toString();
    }

}
