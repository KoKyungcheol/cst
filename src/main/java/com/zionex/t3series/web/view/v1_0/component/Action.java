package com.zionex.t3series.web.view.v1_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;

import org.jdom2.Element;

public class Action implements Configurable {

    private final String eventType;
    private final List<OperationCall> operationCalls = new ArrayList<>();
    private final List<ReferenceOperationCall> referenceOperationCalls = new ArrayList<>();

    private String actionType;
    private Integer repeatSec;

    public Action(String eventType) {
        this.eventType = eventType;
    }

    public String getEventType() {
        return eventType;
    }

    public void setActionType(String actionType) {
        this.actionType = actionType;
    }

    public void setRepeatSec(Integer repeatSec) {
        this.repeatSec = repeatSec;
    }

    public List<OperationCall> getOperationCalls() {
        return Collections.unmodifiableList(operationCalls);
    }

    public void addOperationCall(OperationCall operationCall) {
        operationCalls.add(operationCall);
    }

    public List<ReferenceOperationCall> getReferenceOperationCalls() {
        return Collections.unmodifiableList(referenceOperationCalls);
    }

    public void addReferenceOperationCall(ReferenceOperationCall referenceOperationCall) {
        referenceOperationCalls.add(referenceOperationCall);
    }

    @Override
    public Element toElement() {
        Element actionElement = new Element("action");
        actionElement.setAttribute("event-type", eventType);

        if (actionType != null) {
            actionElement.setAttribute("action-type", actionType);
        }

        if (repeatSec != null) {
            actionElement.setAttribute("repeat-sec", repeatSec.toString());
        }

        for (OperationCall operationCall : operationCalls) {
            actionElement.addContent(operationCall.toElement());
        }

        for (ReferenceOperationCall referenceOperationCall : referenceOperationCalls) {
            actionElement.addContent(referenceOperationCall.toElement());
        }

        return actionElement;
    }

    @Override
    public String toJson() {
        return "";
    }

}
