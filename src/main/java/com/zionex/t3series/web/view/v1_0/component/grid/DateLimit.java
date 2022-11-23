package com.zionex.t3series.web.view.v1_0.component.grid;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;
import com.zionex.t3series.web.view.v1_0.component.ReferenceServiceCall;
import com.zionex.t3series.web.view.v1_0.component.ServiceCall;

import org.jdom2.Element;

public class DateLimit extends Properties implements Configurable {

    private ServiceCall serviceCall;
    private ReferenceServiceCall referenceServiceCall;

    public DateLimit() {
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
        Element dateLimitElement = new Element("date-limit");

        Object initMinDate = getProp("init-value", "min-date");
        Object initMaxDate = getProp("init-value", "max-date");

        if (initMinDate != null || initMaxDate != null) {
            Element initValueElement = new Element("init-value");

            if (initMinDate != null) initValueElement.addContent(new Element("min-date").setText(initMinDate.toString()));
            if (initMaxDate != null) initValueElement.addContent(new Element("max-date").setText(initMaxDate.toString()));

            dateLimitElement.addContent(initValueElement);
        }

        Object minDate = getProp("values", "min-date");
        Object maxDate = getProp("values", "max-date");

        if (minDate != null || maxDate != null) {
            Element valuesElement = new Element("values");

            if (minDate != null) valuesElement.addContent(new Element("min-date").setText(minDate.toString()));
            if (maxDate != null) valuesElement.addContent(new Element("max-date").setText(maxDate.toString()));
            if (serviceCall != null) valuesElement.addContent(serviceCall.toElement());
            if (referenceServiceCall != null) valuesElement.addContent(referenceServiceCall.toElement());

            dateLimitElement.addContent(valuesElement);
        }

        return dateLimitElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
