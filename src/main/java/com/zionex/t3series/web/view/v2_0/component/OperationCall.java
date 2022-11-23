package com.zionex.t3series.web.view.v2_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;

import org.jdom2.Element;

public class OperationCall implements Configurable {

    private final String id;

    private final String componentId;
    private final String operationId;

    private final List<Parameter> parameters = new ArrayList<>();
    private final List<Condition> conditions = new ArrayList<>();

    private final List<OperationCall> successOperationCalls = new ArrayList<>();
    private final List<OperationCall> failOperationCalls = new ArrayList<>();
    private final List<OperationCall> completeOperationCalls = new ArrayList<>();

    public OperationCall(String id, String componentId, String operationId) {
        this.id = id;
        this.componentId = componentId;
        this.operationId = operationId;
    }

    public String getId() {
        return id;
    }

    public String getComponentId() {
        return componentId;
    }

    public String getOperationId() {
        return operationId;
    }

    public List<Parameter> getParameters() {
        return Collections.unmodifiableList(parameters);
    }

    public void addParameter(Parameter parameter) {
        parameters.add(parameter);
    }

    public List<Condition> getConditions() {
        return Collections.unmodifiableList(conditions);
    }

    public void addCondition(Condition condition) {
        conditions.add(condition);
    }

    public List<OperationCall> getSuccessOperationCalls() {
        return Collections.unmodifiableList(successOperationCalls);
    }

    public void addSuccessOperationCall(OperationCall successOperationCall) {
        successOperationCalls.add(successOperationCall);
    }

    public List<OperationCall> getFailOperationCalls() {
        return Collections.unmodifiableList(failOperationCalls);
    }

    public void addFailOperationCall(OperationCall failOperationCall) {
        failOperationCalls.add(failOperationCall);
    }

    public List<OperationCall> getCompleteOperationCalls() {
        return Collections.unmodifiableList(completeOperationCalls);
    }

    public void addCompleteOperationCall(OperationCall completeOperationCall) {
        completeOperationCalls.add(completeOperationCall);
    }

    @Override
    public Element toElement() {
        Element operationCallElement = new Element("operation-call");
        operationCallElement.setAttribute("id", id);

        Element componentIdElement = new Element("component-id").setText(componentId);
        Element operationIdElement = new Element("operation-id").setText(operationId);

        operationCallElement.addContent(componentIdElement);
        operationCallElement.addContent(operationIdElement);

        if (!parameters.isEmpty()) {
            Element parametersElement = new Element("parameters");

            for (Parameter parameter : parameters) {
                parametersElement.addContent(parameter.toElement());
            }

            operationCallElement.addContent(parametersElement);
        }

        if (!conditions.isEmpty()) {
            Element conditionsElement = new Element("conditions");

            for (Condition condition : conditions) {
                conditionsElement.addContent(condition.toElement());
            }

            operationCallElement.addContent(conditionsElement);
        }

        if (!successOperationCalls.isEmpty()) {
            Element successElement = new Element("success");

            for (OperationCall successOperationCall : successOperationCalls) {
                successElement.addContent(successOperationCall.toElement());
            }

            operationCallElement.addContent(successElement);
        }

        if (!failOperationCalls.isEmpty()) {
            Element failElement = new Element("fail");

            for (OperationCall failOperationCall : failOperationCalls) {
                failElement.addContent(failOperationCall.toElement());
            }

            operationCallElement.addContent(failElement);
        }

        if (!completeOperationCalls.isEmpty()) {
            Element completeElement = new Element("complete");

            for (OperationCall completeOperationCall : completeOperationCalls) {
                completeElement.addContent(completeOperationCall.toElement());
            }

            operationCallElement.addContent(completeElement);
        }

        return operationCallElement;
    }
   
    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"componentId\":").append('"').append(componentId).append('"').append(',');
        builder.append("\"operationId\":").append('"').append(operationId).append('"');

        if (!parameters.isEmpty()) {
            builder.append(',').append("\"parameters\":").append('{');
            for (int i = 0; i < parameters.size(); i++) {
                Parameter parameter = parameters.get(i);
                if (i > 0) {
                    builder.append(',');
                }
                builder.append('"').append(parameter.getId()).append("\":").append(parameter.toJson());
            }
            builder.append('}');
        }

        if (!conditions.isEmpty()) {
            builder.append(',').append("\"conditions\":").append('{');
            for (int i = 0; i < conditions.size(); i++) {
                Condition condition = conditions.get(i);
                if (i > 0) {
                    builder.append(',');
                }
                builder.append('"').append(condition.getId()).append("\":").append(condition.toJson());
            }
            builder.append('}');
        }

        if (!successOperationCalls.isEmpty()) {
            builder.append(',').append("\"success\":").append('{');
            for (int i = 0; i < successOperationCalls.size(); i++) {
                OperationCall successOperationCall = successOperationCalls.get(i);
                if (i > 0) {
                    builder.append(',');
                }
                builder.append('"').append(successOperationCall.getId()).append("\":").append(successOperationCall.toJson());
            }
            builder.append('}');
        }

        if (!failOperationCalls.isEmpty()) {
            builder.append(',').append("\"fail\":").append('{');
            for (int i = 0; i < failOperationCalls.size(); i++) {
                OperationCall failOperationCall = failOperationCalls.get(i);
                if (i > 0) {
                    builder.append(',');
                }
                builder.append('"').append(failOperationCall.getId()).append("\":").append(failOperationCall.toJson());
            }
            builder.append('}');
        }

        if (!completeOperationCalls.isEmpty()) {
            builder.append(',').append("\"complete\":").append('{');
            for (int i = 0; i < completeOperationCalls.size(); i++) {
                OperationCall completeOperationCall = completeOperationCalls.get(i);
                if (i > 0) {
                    builder.append(',');
                }
                builder.append('"').append(completeOperationCall.getId()).append("\":").append(completeOperationCall.toJson());
            }
            builder.append('}');
        }

        builder.append('}');
        return builder.toString();
    }

}
