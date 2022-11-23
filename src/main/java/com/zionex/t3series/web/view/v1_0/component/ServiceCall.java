package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;

import org.jdom2.Element;

public class ServiceCall implements Configurable {

    private final String id;
    private final String serviceId;
    private final String serviceTarget;

    private final List<Parameter> parameters = new ArrayList<>();

    private String paramEmptyCheck;
    private String resultDataKey;

    public ServiceCall(String id, String serviceId, String serviceTarget) {
        this.id = id;
        this.serviceId = serviceId;
        this.serviceTarget = serviceTarget;
    }

    public String getId() {
        return id;
    }

    public String getServiceId() {
        return serviceId;
    }

    public String getServiceTarget() {
        return serviceTarget;
    }

    public List<Parameter> getParameters() {
        return Collections.unmodifiableList(parameters);
    }

    public void addParameter(Parameter parameter) {
        parameters.add(parameter);
    }

    public String getParamEmptyCheck() {
        return paramEmptyCheck;
    }

    public void setParamEmptyCheck(String paramEmptyCheck) {
        this.paramEmptyCheck = paramEmptyCheck;
    }

    public String getResultDataKey() {
        return resultDataKey;
    }

    public void setResultDataKey(String resultDataKey) {
        this.resultDataKey = resultDataKey;
    }

    @Override
    public Element toElement() {
        Element serviceCallElement = new Element("service-call");
        serviceCallElement.setAttribute("id", id);

        if (!serviceId.isEmpty()) {
            Element serviceIdElement = new Element("service-id").setText(serviceId);
            serviceCallElement.addContent(serviceIdElement);
        }

        if (!serviceTarget.isEmpty()) {
            Element serviceTargetElement = new Element("service-target").setText(serviceTarget);
            serviceCallElement.addContent(serviceTargetElement);
        }

        if (paramEmptyCheck != null) {
            Element paramEmptyCheckElement = new Element("param-empty-check").setText(paramEmptyCheck);
            serviceCallElement.addContent(paramEmptyCheckElement);
        }

        if (resultDataKey != null) {
            Element resultDataKeyElement = new Element("result-data-key").setText(resultDataKey);
            serviceCallElement.addContent(resultDataKeyElement);
        }

        if (!parameters.isEmpty()) {
            Element parametersElement = new Element("parameters");

            for (Parameter parameter : parameters) {
                parametersElement.addContent(parameter.toElement());
            }

            serviceCallElement.addContent(parametersElement);
        }

        return serviceCallElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
