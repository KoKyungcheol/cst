package com.zionex.t3series.web.view.v2_0.component;

import java.util.ArrayList;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;

import org.jdom2.Element;

public class ServiceCall implements Configurable {

    private final String id;

    private String serviceId;
    private String serviceTarget;

    private String serviceUrl;
    private String serviceMethod;

    private final List<Parameter> parameters = new ArrayList<>();

    private String paramEmptyCheck;
    private String resultDataKey;

    private Boolean editOnCell;
    private String position;

    public ServiceCall(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setServiceId(String serviceId) {
        this.serviceId = serviceId;
    }

    public void setServiceTarget(String serviceTarget) {
        this.serviceTarget = serviceTarget;
    }

    public void setServiceUrl(String serviceUrl) {
        this.serviceUrl = serviceUrl;
    }

    public void setServiceMethod(String serviceMethod) {
        this.serviceMethod = serviceMethod;
    }

    public void addParameter(Parameter parameter) {
        parameters.add(parameter);
    }

    public void setParamEmptyCheck(String paramEmptyCheck) {
        this.paramEmptyCheck = paramEmptyCheck;
    }

    public void setResultDataKey(String resultDataKey) {
        this.resultDataKey = resultDataKey;
    }

    public void setEditOnCell(Boolean editOnCell) {
        this.editOnCell = editOnCell;
    }

    public void setPosition(String position) {
        this.position = position;
    }

    @Override
    public Element toElement() {
        Element serviceCallElement = new Element("service-call");
        serviceCallElement.setAttribute("id", id);

        if (serviceId != null) {
            Element serviceIdElement = new Element("service-id").setText(serviceId);
            serviceCallElement.addContent(serviceIdElement);
        }

        if (serviceTarget != null) {
            Element serviceTargetElement = new Element("service-target").setText(serviceTarget);
            serviceCallElement.addContent(serviceTargetElement);
        }

        if (serviceUrl != null) {
            Element serviceUrlElement = new Element("url").setText(serviceUrl);
            serviceCallElement.addContent(serviceUrlElement);
        }

        if (serviceMethod != null) {
            Element serviceMethodElement = new Element("method").setText(serviceMethod);
            serviceCallElement.addContent(serviceMethodElement);
        }

        if (paramEmptyCheck != null) {
            Element paramEmptyCheckElement = new Element("param-empty-check").setText(paramEmptyCheck);
            serviceCallElement.addContent(paramEmptyCheckElement);
        }

        if (resultDataKey != null) {
            Element resultDataKeyElement = new Element("result-data-key").setText(resultDataKey);
            serviceCallElement.addContent(resultDataKeyElement);
        }

        if (editOnCell != null) {
            Element editOnCellElement = new Element("edit-on-cell").setText(editOnCell.toString());
            serviceCallElement.addContent(editOnCellElement);
        }

        if (position != null) {
            Element positionElement = new Element("position").setText(position);
            serviceCallElement.addContent(positionElement);
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
        StringBuilder builder = new StringBuilder();

        builder.append('{');

        if (serviceId != null) {
            builder.append("\"serviceId\":").append('"').append(serviceId).append('"');
        }

        if (serviceTarget != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"serviceTarget\":").append('"').append(serviceTarget).append('"');
        }

        if (serviceUrl != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"url\":").append('"').append(serviceUrl).append('"');
        }

        if (serviceMethod != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"method\":").append('"').append(serviceMethod).append('"');
        }

        if (paramEmptyCheck != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"paramEmptyCheck\":").append('"').append(paramEmptyCheck).append('"');
        }

        if (resultDataKey != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"resultDataKey\":").append('"').append(resultDataKey).append('"');
        }

        if (editOnCell != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"editOnCell\":").append(editOnCell);
        }

        if (position != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"position\":").append('"').append(position).append('"');
        }

        if (!parameters.isEmpty()) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"parameters\":").append('{');

            for (int i = 0; i < parameters.size(); i++) {
                Parameter parameter = parameters.get(i);
                if (i > 0) {
                    builder.append(',');
                }
                builder.append('"').append(parameter.getId()).append("\":").append(parameter.toJson());
            }
            builder.append('}');
        }

        builder.append('}');

        return builder.toString();
    }

}
