package com.zionex.t3series.web.view.v2_0.component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Operation extends Properties implements Configurable {

    private final String id;
    private final List<ServiceCall> serviceCalls = new ArrayList<>();
    private final List<ReferenceServiceCall> referenceServiceCalls = new ArrayList<>();

    private String permissionType;

    public Operation(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public void setPermissionType(String permissionType) {
        this.permissionType = permissionType;
    }

    public String getPermissionType() {
        return permissionType;
    }

    public List<ServiceCall> getServiceCalls() {
        return Collections.unmodifiableList(serviceCalls);
    }

    public void addServiceCall(ServiceCall serviceCall) {
        serviceCalls.add(serviceCall);
    }

    public List<ReferenceServiceCall> getReferenceServiceCalls() {
        return Collections.unmodifiableList(referenceServiceCalls);
    }

    public void addReferenceServiceCall(ReferenceServiceCall referenceServiceCall) {
        referenceServiceCalls.add(referenceServiceCall);
    }

    @Override
    public Element toElement() {
        Element operationElement = new Element("operation");

        operationElement.setAttribute("id", id);

        if (permissionType != null) {
            operationElement.setAttribute("permission-type", permissionType);
        }

        Object position = getProp("position");
        Object editOnCell = getProp("edit-on-cell");
        Object fileName = getProp("file-name");
        Object currentPage = getProp("current-page");
        Object relieveMerge = getProp("relieve-merge");
        Object allColumns = getProp("all-columns");
        Object exportFooter = getProp("export-footer");
        Object exportLookup = getProp("export-lookup");

        if (position != null) operationElement.addContent(new Element("position").setText(position.toString()));
        if (editOnCell != null) operationElement.addContent(new Element("edit-on-cell").setText(editOnCell.toString()));
        if (fileName != null) operationElement.addContent(new Element("file-name").setText(fileName.toString()));
        if (currentPage != null) operationElement.addContent(new Element("current-page").setText(currentPage.toString()));
        if (relieveMerge != null) operationElement.addContent(new Element("relieve-merge").setText(relieveMerge.toString()));
        if (allColumns != null) operationElement.addContent(new Element("all-columns").setText(allColumns.toString()));
        if (exportFooter != null) operationElement.addContent(new Element("export-footer").setText(exportFooter.toString()));
        if (exportLookup != null) operationElement.addContent(new Element("export-lookup").setText(exportLookup.toString()));

        for (ServiceCall serviceCall : serviceCalls) {
            operationElement.addContent(serviceCall.toElement());
        }

        for (ReferenceServiceCall referenceServiceCall : referenceServiceCalls) {
            operationElement.addContent(referenceServiceCall.toElement());
        }

        return operationElement;
    }

    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();

        Object position = getProp("position");
        Object editOnCell = getProp("edit-on-cell");
        Object fileName = getProp("file-name");
        Object currentPage = getProp("current-page");
        Object relieveMerge = getProp("relieve-merge");
        Object allColumns = getProp("all-columns");
        Object exportFooter = getProp("export-footer");
        Object exportLookup = getProp("export-lookup");

        builder.append('{');

        if (permissionType != null) {
            builder.append("\"permissionType\":").append('"').append(permissionType).append('"');
        }

        if (position != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"position\":").append('"').append(position.toString()).append('"');
        }

        if (editOnCell != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"editOnCell\":").append(editOnCell);
        }

        if (fileName != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"fileName\":").append('"').append(fileName.toString()).append('"');
        }

        if (currentPage != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"currentPage\":").append(currentPage.toString());
        }

        if (relieveMerge != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"relieveMerge\":").append(relieveMerge.toString());
        }

        if (allColumns != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"allColumns\":").append(allColumns.toString());
        }

        if (exportFooter != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"exportFooter\":").append(exportFooter.toString());
        }

        if (exportLookup != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"exportLookup\":").append(exportLookup.toString());
        }

        if (!serviceCalls.isEmpty()) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"serviceCalls\":").append('{');

            for (int i = 0; i < serviceCalls.size(); i++) {
                ServiceCall serviceCall = serviceCalls.get(i);
                if (i > 0) {
                    builder.append(',');
                }
                builder.append('"').append(serviceCall.getId()).append("\":").append(serviceCall.toJson());
            }
            builder.append('}');
        }

        if (!referenceServiceCalls.isEmpty()) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"referenceServiceCalls\":").append('[');

            for (int i = 0; i < referenceServiceCalls.size(); i++) {
                ReferenceServiceCall referenceServiceCall = referenceServiceCalls.get(i);

                String json = referenceServiceCall.toJson();
                if (json.isEmpty()) {
                    continue;
                }

                if (i > 0) {
                    builder.append(',');
                }
                builder.append(json);
            }
            builder.append(']');
        }

        builder.append('}');

        return builder.toString();
    }

}
