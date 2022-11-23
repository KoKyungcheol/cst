package com.zionex.t3series.web.view.v1_0;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.ElementUtil;
import com.zionex.t3series.web.view.util.ViewCreator;
import com.zionex.t3series.web.view.v1_0.component.Action;
import com.zionex.t3series.web.view.v1_0.component.BPMNWebModeler;
import com.zionex.t3series.web.view.v1_0.component.Button;
import com.zionex.t3series.web.view.v1_0.component.CheckBox;
import com.zionex.t3series.web.view.v1_0.component.ComboBox;
import com.zionex.t3series.web.view.v1_0.component.Component;
import com.zionex.t3series.web.view.v1_0.component.Condition;
import com.zionex.t3series.web.view.v1_0.component.Container;
import com.zionex.t3series.web.view.v1_0.component.ContainerItem;
import com.zionex.t3series.web.view.v1_0.component.Data;
import com.zionex.t3series.web.view.v1_0.component.DatePicker;
import com.zionex.t3series.web.view.v1_0.component.Editor;
import com.zionex.t3series.web.view.v1_0.component.FileUpload;
import com.zionex.t3series.web.view.v1_0.component.Image;
import com.zionex.t3series.web.view.v1_0.component.InputBox;
import com.zionex.t3series.web.view.v1_0.component.KFileUpload;
import com.zionex.t3series.web.view.v1_0.component.Label;
import com.zionex.t3series.web.view.v1_0.component.Operation;
import com.zionex.t3series.web.view.v1_0.component.OperationCall;
import com.zionex.t3series.web.view.v1_0.component.Option;
import com.zionex.t3series.web.view.v1_0.component.Parameter;
import com.zionex.t3series.web.view.v1_0.component.Radio;
import com.zionex.t3series.web.view.v1_0.component.ReferenceOperationCall;
import com.zionex.t3series.web.view.v1_0.component.ReferenceServiceCall;
import com.zionex.t3series.web.view.v1_0.component.Scheduler;
import com.zionex.t3series.web.view.v1_0.component.ServiceCall;
import com.zionex.t3series.web.view.v1_0.component.Split;
import com.zionex.t3series.web.view.v1_0.component.SplitItem;
import com.zionex.t3series.web.view.v1_0.component.Tab;
import com.zionex.t3series.web.view.v1_0.component.TabItem;
import com.zionex.t3series.web.view.v1_0.component.Textarea;
import com.zionex.t3series.web.view.v1_0.component.Toolbar;
import com.zionex.t3series.web.view.v1_0.component.ToolbarButton;
import com.zionex.t3series.web.view.v1_0.component.Tree;
import com.zionex.t3series.web.view.v1_0.component.UIOperation;
import com.zionex.t3series.web.view.v1_0.component.URLPage;
import com.zionex.t3series.web.view.v1_0.component.Window;
import com.zionex.t3series.web.view.v1_0.component.chart.Category;
import com.zionex.t3series.web.view.v1_0.component.chart.CategoryAxis;
import com.zionex.t3series.web.view.v1_0.component.chart.Chart;
import com.zionex.t3series.web.view.v1_0.component.chart.LabelsSeries;
import com.zionex.t3series.web.view.v1_0.component.chart.PieChart;
import com.zionex.t3series.web.view.v1_0.component.chart.Series;
import com.zionex.t3series.web.view.v1_0.component.chart.ValueAxis;
import com.zionex.t3series.web.view.v1_0.component.grid.Apply;
import com.zionex.t3series.web.view.v1_0.component.grid.Candidate;
import com.zionex.t3series.web.view.v1_0.component.grid.CellAttribute;
import com.zionex.t3series.web.view.v1_0.component.grid.Column;
import com.zionex.t3series.web.view.v1_0.component.grid.DateLimit;
import com.zionex.t3series.web.view.v1_0.component.grid.Grid;
import com.zionex.t3series.web.view.v1_0.component.grid.Iteration;
import com.zionex.t3series.web.view.v1_0.component.grid.TreeGrid;
import com.zionex.t3series.web.view.v1_0.component.grid.Validation;

import org.jdom2.Element;

public class ViewFactory implements ViewCreator {

    private ViewFactory() {
    }

    public static ViewFactory getViewFactory() {
        return LazyHolder.INSTANCE;
    }

    private static class LazyHolder {
        private static final ViewFactory INSTANCE = new ViewFactory();
    }

    @Override
    public View create(Element root) {
        String id = root.getAttributeValue("id");
        String template = root.getAttributeValue("template");
        String copyfrom = root.getAttributeValue("copyfrom");
        String description = root.getAttributeValue("description");

        Element publishElement = root.getChild("publish");

        Publish publish = null;
        if (publishElement != null) {
            boolean open = Boolean.parseBoolean(publishElement.getAttributeValue("open"));
            int seq = Integer.parseInt(publishElement.getAttributeValue("seq"));

            publish = new Publish(open, seq);

            String parent = publishElement.getAttributeValue("parent");
            if (parent != null) {
                publish.setParent(parent);
            }

            String icon = publishElement.getAttributeValue("icon");
            if (icon != null) {
                publish.setIcon(icon);
            }
        }

        View view = new View(id, template, copyfrom, description, publish);

        Element aliases = root.getChild("service-target-aliases");
        if (aliases != null) {
            for (Element alias : aliases.getChildren("alias")) {
                String from = alias.getAttributeValue("from");
                String to = alias.getAttributeValue("to");
                if (from != null && to != null) {
                    view.addServiceTargetAlias(new ServiceTargetAlias(from, to));
                }
            }
        }

        for (Element element : root.getChildren("component")) {
            Component component = createComponent(element);
            if (component == null) {
                continue;
            }

            List<Action> actions = createActions(element);
            if (actions != null) {
                for (Action action : actions) {
                    component.addAction(action);
                }
            }

            List<Operation> operations = createOperations(element);
            if (operations != null) {
                for (Operation operation : operations) {
                    component.addOperation(operation);
                }
            }

            view.addComponent(component);
        }
        return view;
    }

    public Component createComponent(Element element) {
        String type = element.getAttributeValue("type");
        switch (type) {
            case "SCHEDULER":
                return createScheduler(element);

            case "DATA":
                return createData(element);

            case "IMG":
                return createImage(element);

            case "LABEL":
                return createLabel(element);

            case "INPUTBOX":
                return createInputBox(element);

            case "BUTTON":
                return createButton(element);

            case "COMBOBOX":
                return createComboBox(element);

            case "CHECKBOX":
                return createCheckBox(element);

            case "RADIO":
                return createRadio(element);

            case "DATEPICKER":
                return createDatePicker(element);

            case "FILEUPLOAD":
                return createFileUpload(element);

            case "K_FILEUPLOAD":
                return createKFileUpload(element);

            case "TEXTAREA":
                return createTextarea(element);

            case "EDITOR":
                return createEditor(element);

            case "TREE":
                return createTree(element);

            case "CHART":
                return createChart(element);

            case "CHART_PIE":
                return createPieChart(element);

            case "R_GRID":
                return createGrid(element);

            case "R_TREE":
                return createTreeGrid(element);

            case "BPMN_WEB_MODELER":
                return createBPMNWebModeler(element);

            case "TAB":
                return createTab(element);

            case "CONTAINER":
                return createContainer(element);

            case "SPLIT":
                return createSplit(element);

            case "URL_PAGE":
                return createURLPage(element);

            case "WINDOW":
                return createWindow(element);
        }

        return null;
    }

    public List<Option> createInitValueOptions(Element initValueElement) {
        List<Option> initValueOptions = new ArrayList<>();
        for (Element optionElement : initValueElement.getChildren("option")) {
            String value = optionElement.getAttributeValue("value");
            if (value == null) {
                continue;
            }

            Option option = new Option(value);

            option.setProp(".text", ElementUtil.findString(optionElement, ".text"));
            option.setProp(".text-position", ElementUtil.findString(optionElement, ".text-position"));
            option.setProp(".selected", ElementUtil.findBoolean(optionElement, ".selected"));

            initValueOptions.add(option);
        }
        return initValueOptions;
    }

    public List<Parameter> createParameters(Element parametersElement) {
        List<Parameter> parameters = new ArrayList<>();
        for (Element parameterElement : parametersElement.getChildren("parameter")) {
            String id = parameterElement.getAttributeValue("id");
            if (id != null) {
                Parameter parameter = new Parameter(id);

                parameter.setProp(".value", ElementUtil.findString(parameterElement, ".value"));
                parameter.setProp(".reference-id", ElementUtil.findString(parameterElement, ".reference-id"));
                parameter.setProp(".reference-data", ElementUtil.findString(parameterElement, ".reference-data"));
                parameter.setProp(".extract-by", ElementUtil.findString(parameterElement, ".extract-by"));
                parameter.setProp(".row-extract", ElementUtil.findString(parameterElement, ".row-extract"));
                parameter.setProp(".delimiter", ElementUtil.findString(parameterElement, ".delimiter"));
                parameter.setProp(".default-value", ElementUtil.findString(parameterElement, ".default-value"));

                parameters.add(parameter);
            }
        }
        return parameters;
    }

    public List<Condition> createConditions(Element conditionsElement) {
        List<Condition> conditions = new ArrayList<>();
        for (Element conditionElement : conditionsElement.getChildren("condition")) {
            String id = conditionElement.getAttributeValue("id");
            if (id == null) {
                continue;
            }

            Condition condition = new Condition(id);

            condition.setProp(".group", ElementUtil.findString(conditionElement, ".group"));
            condition.setProp("component", ElementUtil.findString(conditionElement, "component"));
            condition.setProp("key", ElementUtil.findString(conditionElement, "key"));
            condition.setProp("on-column", ElementUtil.findString(conditionElement, "on-column"));
            condition.setProp("column", ElementUtil.findString(conditionElement, "column"));
            condition.setProp("operator", ElementUtil.findString(conditionElement, "operator"));
            condition.setProp("value", ElementUtil.findString(conditionElement, "value"));
            condition.setProp("extract-by", ElementUtil.findString(conditionElement, "extract-by"));
            condition.setProp("msg", ElementUtil.findString(conditionElement, "msg"));

            conditions.add(condition);
        }
        return conditions;
    }

    public List<Apply> createApplies(Element appliesElement) {
        List<Apply> applies = new ArrayList<>();
        for (Element applyElement : appliesElement.getChildren("apply")) {
            String id = applyElement.getAttributeValue("id");
            if (id == null) {
                continue;
            }

            Apply apply = new Apply(id);

            apply.setProp("column", ElementUtil.findString(applyElement, "column"));
            apply.setProp(new String[] { "attrs", "editable" }, ElementUtil.findBoolean(applyElement, "attrs", "editable"));
            apply.setProp(new String[] { "attrs", "background" }, ElementUtil.findString(applyElement, "attrs", "background"));
            apply.setProp(new String[] { "attrs", "foreground" }, ElementUtil.findString(applyElement, "attrs", "foreground"));
            apply.setProp(new String[] { "attrs", "fontSize" }, ElementUtil.findString(applyElement, "attrs", "fontSize"));
            apply.setProp(new String[] { "attrs", "fontBold" }, ElementUtil.findString(applyElement, "attrs", "fontBold"));
            apply.setProp(new String[] { "attrs", "textAlignment" }, ElementUtil.findString(applyElement, "attrs", "textAlignment"));

            applies.add(apply);
        }
        return applies;
    }

    public List<ToolbarButton> createToolbarButtons(Element toolbarElement) {
        List<ToolbarButton> toolbarButtons = new ArrayList<>();
        for (Element toolbarButtonElement : toolbarElement.getChildren("toolbar-button")) {
            String operationId = toolbarButtonElement.getAttributeValue("operation-id");
            if (operationId == null) {
                continue;
            }

            ToolbarButton toolbarButton = new ToolbarButton(operationId);

            toolbarButton.setProp(".action-type", ElementUtil.findString(toolbarButtonElement, ".action-type"));
            toolbarButton.setProp(".enable", ElementUtil.findBoolean(toolbarButtonElement, ".enable"));
            toolbarButton.setProp(".visible", ElementUtil.findBoolean(toolbarButtonElement, ".visible"));
            toolbarButton.setProp(".position", ElementUtil.findString(toolbarButtonElement, ".position"));
            toolbarButton.setProp(".tooltip", ElementUtil.findString(toolbarButtonElement, ".tooltip"));

            Element successElement = toolbarButtonElement.getChild("success");
            if (successElement != null) {
                List<OperationCall> operationCalls = createOperationCalls(successElement);
                for (OperationCall operationCall : operationCalls) {
                    toolbarButton.addSuccessOperationCall(operationCall);
                }
            }

            Element failElement = toolbarButtonElement.getChild("fail");
            if (failElement != null) {
                List<OperationCall> operationCalls = createOperationCalls(failElement);
                for (OperationCall operationCall : operationCalls) {
                    toolbarButton.addFailOperationCall(operationCall);
                }
            }

            Element completeElement = toolbarButtonElement.getChild("complete");
            if (completeElement != null) {
                List<OperationCall> operationCalls = createOperationCalls(completeElement);
                for (OperationCall operationCall : operationCalls) {
                    toolbarButton.addCompleteOperationCall(operationCall);
                }
            }

            toolbarButtons.add(toolbarButton);
        }
        return toolbarButtons;
    }

    public List<Column> createColumns(Element columnsElement, boolean isTreeColumn) {
        if (columnsElement == null) {
            return Collections.emptyList();
        }

        List<Column> columns = new ArrayList<>();
        for (Element columnElement : columnsElement.getChildren("column")) {
            String id = columnElement.getAttributeValue("id");
            if (id == null) {
                continue;
            }

            Column column = new Column(id);

            column.setTreeColumn(isTreeColumn);

            column.setProp(".title", columnElement.getAttributeValue("title"));
            column.setProp(".type", columnElement.getAttributeValue("type"));

            if (!isTreeColumn) {
                column.setProp(".sort", columnElement.getAttributeValue("sort"));
            }

            column.setProp(".use-number-comparer", columnElement.getAttributeValue("use-number-comparer"));

            column.setProp("width", ElementUtil.findString(columnElement, "width"));
            column.setProp("visible", ElementUtil.findBoolean(columnElement, "visible"));
            column.setProp("editable", ElementUtil.findBoolean(columnElement, "editable"));
            column.setProp("text-alignment", ElementUtil.findString(columnElement, "text-alignment"));
            column.setProp("button", ElementUtil.findBoolean(columnElement, "button"));
            column.setProp("lang", ElementUtil.findBoolean(columnElement, "lang"));
            column.setProp("fix", ElementUtil.findBoolean(columnElement, "fix"));
            column.setProp("font-bold", ElementUtil.findBoolean(columnElement, "font-bold"));
            column.setProp("background", ElementUtil.findString(columnElement, "background"));
            column.setProp("foreground", ElementUtil.findString(columnElement, "foreground"));
            column.setProp("header-background", ElementUtil.findString(columnElement, "header-background"));
            column.setProp("header-foreground", ElementUtil.findString(columnElement, "header-foreground"));
            column.setProp("masking", ElementUtil.findBoolean(columnElement, "masking"));

            if (!isTreeColumn) {
                column.setProp("merge", ElementUtil.findBoolean(columnElement, "merge"));
            }

            column.setProp("filterable", ElementUtil.findBoolean(columnElement, "filterable"));
            column.setProp("tooltip", ElementUtil.findString(columnElement, "tooltip"));
            column.setProp("lookup", ElementUtil.findString(columnElement, "lookup"));
            column.setProp("calc", ElementUtil.findString(columnElement, "calc"));
            column.setProp("format", ElementUtil.findString(columnElement, "format"));
            column.setProp("positive-only", ElementUtil.findString(columnElement, "positive-only"));
            column.setProp("datepicker", ElementUtil.findBoolean(columnElement, "datepicker"));
            column.setProp("excel-format", ElementUtil.findString(columnElement, "excel-format"));
            column.setProp("header-checkable", ElementUtil.findBoolean(columnElement, "header-checkable"));
            column.setProp("header-checker-position", ElementUtil.findString(columnElement, "header-checker-position"));
            column.setProp("check-exclusive", ElementUtil.findString(columnElement, "check-exclusive"));
            column.setProp("groups", ElementUtil.findString(columnElement, "groups"));

            if (!isTreeColumn) {
                column.setProp("init-group-order", ElementUtil.findString(columnElement, "init-group-order"));
            }

            column.setProp("grid-summary-exp", ElementUtil.findString(columnElement, "grid-summary-exp"));

            if (!isTreeColumn) {
                column.setProp("group-summary-exp", ElementUtil.findString(columnElement, "group-summary-exp"));
            }

            Element candidateElement = columnElement.getChild("candidate");
            if (candidateElement != null && candidateElement.getContentSize() > 0) {
                Candidate candidate = createCandidate(candidateElement);
                column.setCandidate(candidate);
            }

            Element dateLimitElement = columnElement.getChild("date-limit");
            if (dateLimitElement != null && dateLimitElement.getContentSize() > 0) {
                DateLimit dateLimit = createDateLimit(dateLimitElement);
                column.setDateLimit(dateLimit);
            }

            Element iterationElement = columnElement.getChild("iteration");
            if (iterationElement != null && iterationElement.getContentSize() > 0) {
                Iteration iteration = createIteration(iterationElement);
                column.setIteration(iteration);
            }

            Element validationsElement = columnElement.getChild("validations");
            if (validationsElement != null) {
                List<Validation> validations = createValidations(validationsElement);
                for (Validation validation : validations) {
                    column.addValidation(validation);
                }
            }

            columns.add(column);
        }
        return columns;
    }

    public Candidate createCandidate(Element candidateElement) {
        Candidate candidate = new Candidate();

        Element initValueElement = candidateElement.getChild("init-value");
        if (initValueElement != null) {
            List<Option> initValueOptions = createInitValueOptions(initValueElement);
            for (Option initValueOption : initValueOptions) {
                candidate.addInitValueOption(initValueOption);
            }
        }

        Element valuesElement = candidateElement.getChild("values");
        if (valuesElement != null) {
            candidate.setProp(new String[] { "values", "value-id" }, ElementUtil.findString(candidateElement, "values", "value-id"));
            candidate.setProp(new String[] { "values", "text-id" }, ElementUtil.findString(candidateElement, "values", "text-id"));

            List<ServiceCall> serviceCalls = createServiceCalls(valuesElement);
            if (!serviceCalls.isEmpty()) {
                candidate.setServiceCall(serviceCalls.get(0));
            }

            List<ReferenceServiceCall> referenceServiceCalls = createReferenceServiceCalls(valuesElement);
            if (!referenceServiceCalls.isEmpty()) {
                candidate.setReferenceServiceCall(referenceServiceCalls.get(0));
            }
        }

        candidate.setProp("drop-down-count", ElementUtil.findString(candidateElement, "drop-down-count"));
        candidate.setProp("reference-column", ElementUtil.findString(candidateElement, "reference-column"));

        return candidate;
    }

    public DateLimit createDateLimit(Element dateLimitElement) {
        DateLimit dateLimit = new DateLimit();

        dateLimit.setProp(new String[] { "init-value", "min-date" }, ElementUtil.findString(dateLimitElement, "init-value", "min-date"));
        dateLimit.setProp(new String[] { "init-value", "max-date" }, ElementUtil.findString(dateLimitElement, "init-value", "max-date"));

        Element valuesElement = dateLimitElement.getChild("values");
        if (valuesElement != null) {
            dateLimit.setProp(new String[] { "values", "min-date" }, ElementUtil.findString(valuesElement, "min-date"));
            dateLimit.setProp(new String[] { "values", "max-date" }, ElementUtil.findString(valuesElement, "max-date"));

            List<ServiceCall> serviceCalls = createServiceCalls(valuesElement);
            if (!serviceCalls.isEmpty()) {
                dateLimit.setServiceCall(serviceCalls.get(0));
            }

            List<ReferenceServiceCall> referenceServiceCalls = createReferenceServiceCalls(valuesElement);
            if (!referenceServiceCalls.isEmpty()) {
                dateLimit.setReferenceServiceCall(referenceServiceCalls.get(0));
            }
        }
        return dateLimit;
    }

    public Iteration createIteration(Element iterationElement) {
        Iteration iteration = new Iteration();

        for (Element prefixElement : iterationElement.getChildren("prefix")) {
            String prefix = prefixElement.getText();

            String remove = prefixElement.getAttributeValue("remove");
            if (remove == null) {
                iteration.addPrefixInfo(new Object[] { prefix });
            } else {
                iteration.addPrefixInfo(new Object[] { prefix, Boolean.valueOf(remove) });
            }
        }

        for (Element postfixElement : iterationElement.getChildren("postfix")) {
            String postfix = postfixElement.getText();

            String remove = postfixElement.getAttributeValue("remove");
            if (remove == null) {
                iteration.addPostfixInfo(new Object[] { postfix });
            } else {
                iteration.addPostfixInfo(new Object[] { postfix, Boolean.valueOf(remove) });
            }
        }

        iteration.setProp("delimiter", ElementUtil.findString(iterationElement, "delimiter"));
        iteration.setProp("header-seq", ElementUtil.findString(iterationElement, "header-seq"));
        iteration.setProp("group", ElementUtil.findString(iterationElement, "group"));
        iteration.setProp("groups", ElementUtil.findString(iterationElement, "groups"));
        iteration.setProp("apply-color", ElementUtil.findString(iterationElement, "apply-color"));

        return iteration;
    }

    public List<Validation> createValidations(Element validationsElement) {
        List<Validation> validations = new ArrayList<>();
        for (Element validationElement : validationsElement.getChildren("validation")) {
            String id = validationElement.getAttributeValue("id");
            if (id == null) {
                continue;
            }

            Validation validation = new Validation(id);

            validation.setProp("operator", ElementUtil.findString(validationElement, "operator"));
            validation.setProp("value", ElementUtil.findString(validationElement, "value"));
            validation.setProp("message", ElementUtil.findString(validationElement, "message"));

            validations.add(validation);
        }
        return validations;
    }

    public List<OperationCall> createOperationCalls(Element targetElement) {
        List<OperationCall> operationCalls = new ArrayList<>();
        for (Element operationCallElement : targetElement.getChildren("operation-call")) {
            String id = operationCallElement.getAttributeValue("id");
            String componentId = operationCallElement.getChildText("component-id");
            String operationId = operationCallElement.getChildText("operation-id");

            if (id != null && componentId != null && operationId != null) {
                OperationCall operationCall = new OperationCall(id, componentId, operationId);

                Element parametersElement = operationCallElement.getChild("parameters");
                if (parametersElement != null) {
                    List<Parameter> parameters = createParameters(parametersElement);
                    for (Parameter parameter : parameters) {
                        operationCall.addParameter(parameter);
                    }
                }

                Element conditionsElement = operationCallElement.getChild("conditions");
                if (conditionsElement != null) {
                    List<Condition> conditions = createConditions(conditionsElement);
                    for (Condition condition : conditions) {
                        operationCall.addCondition(condition);
                    }
                }

                Element successElement = operationCallElement.getChild("success");
                if (successElement != null) {
                    List<OperationCall> successOperationCalls = createOperationCalls(successElement);
                    for (OperationCall successOperationCall : successOperationCalls) {
                        operationCall.addSuccessOperationCall(successOperationCall);
                    }
                }

                Element failElement = operationCallElement.getChild("fail");
                if (failElement != null) {
                    List<OperationCall> failOperationCalls = createOperationCalls(failElement);
                    for (OperationCall failOperationCall : failOperationCalls) {
                        operationCall.addFailOperationCall(failOperationCall);
                    }
                }

                Element completeElement = operationCallElement.getChild("complete");
                if (completeElement != null) {
                    List<OperationCall> completeOperationCalls = createOperationCalls(completeElement);
                    for (OperationCall completeOperationCall : completeOperationCalls) {
                        operationCall.addCompleteOperationCall(completeOperationCall);
                    }
                }

                operationCalls.add(operationCall);
            }
        }
        return operationCalls;
    }

    public List<ReferenceOperationCall> createReferenceOperationCalls(Element targetElement) {
        List<ReferenceOperationCall> referenceOperationCalls = new ArrayList<>();
        for (Element operationCallElement : targetElement.getChildren("reference-operation-call")) {
            String id = operationCallElement.getAttributeValue("id");
            if (id != null) {
                referenceOperationCalls.add(new ReferenceOperationCall(id));
            }
        }
        return referenceOperationCalls;
    }

    public List<ServiceCall> createServiceCalls(Element targetElement) {
        List<ServiceCall> serviceCalls = new ArrayList<>();
        for (Element serviceCallElement : targetElement.getChildren("service-call")) {
            String id = serviceCallElement.getAttributeValue("id");
            String serviceId = serviceCallElement.getChildText("service-id");
            String serviceTarget = serviceCallElement.getChildText("service-target");

            if (id != null) {
                if (serviceId == null) {
                    serviceId = "";
                }

                if (serviceTarget == null) {
                    serviceTarget = "";
                }

                ServiceCall serviceCall = new ServiceCall(id, serviceId, serviceTarget);

                Element parametersElement = serviceCallElement.getChild("parameters");
                if (parametersElement != null) {
                    List<Parameter> parameters = createParameters(parametersElement);
                    for (Parameter parameter : parameters) {
                        serviceCall.addParameter(parameter);
                    }
                }

                String paramEmptyCheck = serviceCallElement.getChildText("param-empty-check");
                if (paramEmptyCheck != null) {
                    serviceCall.setParamEmptyCheck(paramEmptyCheck);
                }

                String resultDataKey = serviceCallElement.getChildText("result-data-key");
                if (resultDataKey != null) {
                    serviceCall.setResultDataKey(resultDataKey);
                }

                serviceCalls.add(serviceCall);
            }
        }
        return serviceCalls;
    }

    public List<ReferenceServiceCall> createReferenceServiceCalls(Element targetElement) {
        List<ReferenceServiceCall> referenceServiceCalls = new ArrayList<>();
        for (Element referenceServiceCallElement : targetElement.getChildren("reference-service-call")) {
            String id = referenceServiceCallElement.getAttributeValue("id");
            if (id == null) {
                continue;
            }

            ReferenceServiceCall feferenceServiceCall = new ReferenceServiceCall(id);

            String extract = referenceServiceCallElement.getAttributeValue("extract");
            String resultDataKey = ElementUtil.findString(referenceServiceCallElement, "result-data-key");

            feferenceServiceCall.setExtract(extract);
            feferenceServiceCall.setResultDataKey(resultDataKey);

            referenceServiceCalls.add(feferenceServiceCall);
        }
        return referenceServiceCalls;
    }

    public List<UIOperation> createUIOperations(Element targetElement) {
        List<UIOperation> uiOperations = new ArrayList<>();
        for (Element uiOperationElement : targetElement.getChildren("ui-operation")) {
            String id = uiOperationElement.getAttributeValue("id");

            if (id != null) {
                UIOperation uiOperation = new UIOperation(id);

                Element parametersElement = uiOperationElement.getChild("parameters");
                if (parametersElement != null) {
                    List<Parameter> parameters = createParameters(parametersElement);
                    for (Parameter parameter : parameters) {
                        uiOperation.addParameter(parameter);
                    }
                }

                String editOnCell = uiOperationElement.getChildText("edit-on-cell");
                if (editOnCell != null) {
                    uiOperation.setEditOnCell(Boolean.valueOf(editOnCell));
                }

                String position = uiOperationElement.getChildText("position");
                if (position != null) {
                    uiOperation.setPosition(position);
                }

                uiOperations.add(uiOperation);
            }
        }
        return uiOperations;
    }

    public List<Action> createActions(Element element) {
        Element actionsElements = element.getChild("actions");
        if (actionsElements == null) {
            return null;
        }

        List<Action> actions = new ArrayList<>();
        for (Element actionElement : actionsElements.getChildren("action")) {
            String eventType = actionElement.getAttributeValue("event-type");
            if (eventType == null) {
                continue;
            }

            Action action = new Action(eventType);

            String actionType = actionElement.getAttributeValue("action-type");
            if (actionType != null) {
                action.setActionType(actionType);
            }

            String repeatSec = actionElement.getAttributeValue("repeat-sec");
            if (repeatSec != null) {
                action.setRepeatSec(Integer.valueOf(repeatSec));
            }

            List<OperationCall> operationCalls = createOperationCalls(actionElement);
            for (OperationCall operationCall : operationCalls) {
                action.addOperationCall(operationCall);
            }

            List<ReferenceOperationCall> referenceOperationCalls = createReferenceOperationCalls(actionElement);
            for (ReferenceOperationCall referenceOperationCall : referenceOperationCalls) {
                action.addReferenceOperationCall(referenceOperationCall);
            }

            actions.add(action);
        }
        return actions;
    }

    public List<Operation> createOperations(Element element) {
        Element operationsElement = element.getChild("operations");
        if (operationsElement == null) {
            return null;
        }

        List<Operation> operations = new ArrayList<>();
        for (Element operationElement : operationsElement.getChildren("operation")) {
            String id = operationElement.getAttributeValue("id");
            if ("INIT".equalsIgnoreCase(id)) {
                continue;
            }

            String type = operationElement.getAttributeValue("operation-type");

            Operation operation = new Operation(id);

            if (type != null) operation.setType(type);

            operation.setProp("position", ElementUtil.findString(operationElement, "position"));
            operation.setProp("edit-on-cell", ElementUtil.findBoolean(operationElement, "edit-on-cell"));
            operation.setProp("file-name", ElementUtil.findString(operationElement, "file-name"));
            operation.setProp("current-page", ElementUtil.findBoolean(operationElement, "current-page"));
            operation.setProp("relieve-merge", ElementUtil.findBoolean(operationElement, "relieve-merge"));
            operation.setProp("all-columns", ElementUtil.findBoolean(operationElement, "all-columns"));
            operation.setProp("export-footer", ElementUtil.findBoolean(operationElement, "export-footer"));
            operation.setProp("export-lookup", ElementUtil.findBoolean(operationElement, "export-lookup"));

            List<ServiceCall> serviceCalls = createServiceCalls(operationElement);
            for (ServiceCall serviceCall : serviceCalls) {
                operation.addServiceCall(serviceCall);
            }

            for (Element serviceCallElement : operationElement.getChildren("service-call")) {
                List<ReferenceServiceCall> refServiceCalls = createReferenceServiceCalls(serviceCallElement);
                for (ReferenceServiceCall refServiceCall : refServiceCalls) {
                    operation.addReferenceServiceCall(refServiceCall);
                }

                if (!refServiceCalls.isEmpty()) {
                    String serviceCallId = serviceCallElement.getAttributeValue("id");
                    operation.removeServiceCall(serviceCallId);
                }
            }

            List<ReferenceServiceCall> referenceServiceCalls = createReferenceServiceCalls(operationElement);
            for (ReferenceServiceCall referenceServiceCall : referenceServiceCalls) {
                operation.addReferenceServiceCall(referenceServiceCall);
            }

            List<UIOperation> uiOperations = createUIOperations(operationElement);
            for (UIOperation uiOperation : uiOperations) {
                operation.addUIOperation(uiOperation);
            }

            Element serviceSetElement = operationElement.getChild("service-set");
            if (serviceSetElement != null) {
                serviceCalls = createServiceCalls(serviceSetElement);
                for (ServiceCall serviceCall : serviceCalls) {
                    operation.addServiceCall(serviceCall);
                }

                for (Element serviceCallElement : serviceSetElement.getChildren("service-call")) {
                    List<ReferenceServiceCall> refServiceCalls = createReferenceServiceCalls(serviceCallElement);
                    for (ReferenceServiceCall refServiceCall : refServiceCalls) {
                        operation.addReferenceServiceCall(refServiceCall);
                    }
                }

                referenceServiceCalls = createReferenceServiceCalls(serviceSetElement);
                for (ReferenceServiceCall referenceServiceCall : referenceServiceCalls) {
                    operation.addReferenceServiceCall(referenceServiceCall);
                }

                uiOperations = createUIOperations(serviceSetElement);
                for (UIOperation uiOperation : uiOperations) {
                    operation.addUIOperation(uiOperation);
                }
            }

            operations.add(operation);
        }
        return operations;
    }

    public Scheduler createScheduler(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        return new Scheduler(id, type, copy);
    }

    public Data createData(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Data data = new Data(id, type, copy);
        return data;
    }

    public Image createImage(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Image image = new Image(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            image.setProp("image", ElementUtil.findString(viewModel, "image"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            image.setProp("init-value", ElementUtil.findString(model, "init-value"));
            image.setProp("value-id", ElementUtil.findString(model, "value-id"));
        }

        return image;
    }

    public Label createLabel(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Label label = new Label(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            label.setProp("width", ElementUtil.findString(viewModel, "width"));
            label.setProp("lang", ElementUtil.findBoolean(viewModel, "lang"));
            label.setProp("position", ElementUtil.findString(viewModel, "position"));
            label.setProp("tooltip", ElementUtil.findString(viewModel, "tooltip"));
            label.setProp("icon", ElementUtil.findString(viewModel, "icon"));

            label.setProp(new String[] { "font", "bold" }, ElementUtil.findBoolean(viewModel, "font", "bold"));
            label.setProp(new String[] { "font", "italic" }, ElementUtil.findBoolean(viewModel, "font", "italic"));
            label.setProp(new String[] { "font", "size" }, ElementUtil.findInteger(viewModel, "font", "size"));
            label.setProp(new String[] { "font", "color" }, ElementUtil.findString(viewModel, "font", "color"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            label.setProp("init-value", ElementUtil.findString(model, "init-value"));
            label.setProp("value-id", ElementUtil.findString(model, "value-id"));
            label.setProp("format", ElementUtil.findString(model, "format"));
        }

        return label;
    }

    public InputBox createInputBox(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        InputBox inputBox = new InputBox(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            inputBox.setProp("width", ElementUtil.findString(viewModel, "width"));
            inputBox.setProp("name", ElementUtil.findString(viewModel, "name"));
            inputBox.setProp("name-position", ElementUtil.findString(viewModel, "name-position"));
            inputBox.setProp("placeholder", ElementUtil.findString(viewModel, "placeholder"));
            inputBox.setProp("editable", ElementUtil.findBoolean(viewModel, "editable"));
            inputBox.setProp("hidden", ElementUtil.findBoolean(viewModel, "hidden"));
            inputBox.setProp("lang", ElementUtil.findBoolean(viewModel, "lang"));
            inputBox.setProp("background", ElementUtil.findString(viewModel, "background"));

            inputBox.setProp(new String[] { "font", "bold" }, ElementUtil.findBoolean(viewModel, "font", "bold"));
            inputBox.setProp(new String[] { "font", "italic" }, ElementUtil.findBoolean(viewModel, "font", "italic"));
            inputBox.setProp(new String[] { "font", "size" }, ElementUtil.findInteger(viewModel, "font", "size"));
            inputBox.setProp(new String[] { "font", "color" }, ElementUtil.findString(viewModel, "font", "color"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            inputBox.setProp("type", ElementUtil.findString(model, "type"));
            inputBox.setProp("min", ElementUtil.findString(model, "min"));
            inputBox.setProp("max", ElementUtil.findString(model, "max"));
            inputBox.setProp("init-value", ElementUtil.findString(model, "init-value"));
            inputBox.setProp("value-id", ElementUtil.findString(model, "value-id"));

            inputBox.setProp(new String[] { "suggest", "value-id" }, ElementUtil.findString(model, "suggest", "value-id"));
            inputBox.setProp(new String[] { "suggest", "text-id" }, ElementUtil.findString(model, "suggest", "text-id")); // you must change it to "description-id".
            inputBox.setProp(new String[] { "suggest", "description-id" }, ElementUtil.findString(model, "suggest", "description-id"));
            inputBox.setProp(new String[] { "suggest", "ignore-case" }, ElementUtil.findBoolean(model, "suggest", "ignore-case"));
        }

        return inputBox;
    }

    public Button createButton(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Button button = new Button(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            button.setProp("width", ElementUtil.findString(viewModel, "width"));
            button.setProp("name", ElementUtil.findString(viewModel, "name"));
            button.setProp("tooltip", ElementUtil.findString(viewModel, "tooltip"));
            button.setProp("icon", ElementUtil.findString(viewModel, "icon"));
            button.setProp("disable", ElementUtil.findBoolean(viewModel, "disable"));
            button.setProp("lang", ElementUtil.findBoolean(viewModel, "lang"));
            button.setProp("background", ElementUtil.findString(viewModel, "background"));

            button.setProp(new String[] { "font", "bold" }, ElementUtil.findBoolean(viewModel, "font", "bold"));
            button.setProp(new String[] { "font", "italic" }, ElementUtil.findBoolean(viewModel, "font", "italic"));
            button.setProp(new String[] { "font", "size" }, ElementUtil.findInteger(viewModel, "font", "size"));
            button.setProp(new String[] { "font", "color" }, ElementUtil.findString(viewModel, "font", "color"));
        }

        return button;
    }

    public ComboBox createComboBox(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        ComboBox comboBox = new ComboBox(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            comboBox.setProp("width", ElementUtil.findString(viewModel, "width"));
            comboBox.setProp("name", ElementUtil.findString(viewModel, "name"));
            comboBox.setProp("name-position", ElementUtil.findString(viewModel, "name-position"));
            comboBox.setProp("placeholder", ElementUtil.findString(viewModel, "placeholder"));
            comboBox.setProp("editable", ElementUtil.findBoolean(viewModel, "editable"));
            comboBox.setProp("enable", ElementUtil.findBoolean(viewModel, "enable"));
            comboBox.setProp("lang", ElementUtil.findBoolean(viewModel, "lang"));
            comboBox.setProp("select-index", ElementUtil.findString(viewModel, "select-index"));
            comboBox.setProp("dropdown-height", ElementUtil.findInteger(viewModel, "dropdown-height"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            Element initValueElement = model.getChild("init-value");
            if (initValueElement != null) {
                List<Option> initValueOptions = createInitValueOptions(initValueElement);
                for (Option initValueOption : initValueOptions) {
                    comboBox.addInitValueOption(initValueOption);
                }
            }

            comboBox.setProp("value-id", ElementUtil.findString(model, "value-id"));
            comboBox.setProp("text-id", ElementUtil.findString(model, "text-id"));
            comboBox.setProp("text-id.sort", ElementUtil.findString(model, "text-id.sort"));
            comboBox.setProp("select-id", ElementUtil.findString(model, "select-id"));
            comboBox.setProp("ignore-case", ElementUtil.findBoolean(model, "ignore-case"));
            comboBox.setProp("tooltip", ElementUtil.findString(model, "tooltip"));
            comboBox.setProp("select-index", ElementUtil.findString(model, "select-index"));
        }

        return comboBox;
    }

    public CheckBox createCheckBox(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        CheckBox checkBox = new CheckBox(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            checkBox.setProp("name", ElementUtil.findString(viewModel, "name"));
            checkBox.setProp("name-position", ElementUtil.findString(viewModel, "name-position"));
            checkBox.setProp("editable", ElementUtil.findBoolean(viewModel, "editable"));
            checkBox.setProp("lang", ElementUtil.findBoolean(viewModel, "lang"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            checkBox.setProp("init-value", ElementUtil.findBoolean(model, "init-value"));
            checkBox.setProp("value-id", ElementUtil.findString(model, "value-id"));
            checkBox.setProp("text-id", ElementUtil.findString(model, "text-id"));
        }

        return checkBox;
    }

    public Radio createRadio(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Radio radio = new Radio(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            radio.setProp("name", ElementUtil.findString(viewModel, "name"));
            radio.setProp("lang", ElementUtil.findBoolean(viewModel, "lang"));
            radio.setProp("option-deployment", ElementUtil.findString(viewModel, "option-deployment"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            Element initValueElement = model.getChild("init-value");
            if (initValueElement != null) {
                List<Option> initValueOptions = createInitValueOptions(initValueElement);
                for (Option initValueOption : initValueOptions) {
                    radio.addInitValueOption(initValueOption);
                }
            }

            radio.setProp("value-id", ElementUtil.findString(model, "value-id"));
            radio.setProp("text-id", ElementUtil.findString(model, "text-id"));
            radio.setProp("select-id", ElementUtil.findString(model, "select-id"));
        }

        return radio;
    }

    public DatePicker createDatePicker(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        DatePicker datePicker = new DatePicker(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            datePicker.setProp("width", ElementUtil.findString(viewModel, "width"));
            datePicker.setProp("name", ElementUtil.findString(viewModel, "name"));
            datePicker.setProp("name-position", ElementUtil.findString(viewModel, "name-position"));
            datePicker.setProp("editable", ElementUtil.findBoolean(viewModel, "editable"));
            datePicker.setProp("lang", ElementUtil.findBoolean(viewModel, "lang"));
            datePicker.setProp("date-type", ElementUtil.findString(viewModel, "date-type"));
            datePicker.setProp("date-format", ElementUtil.findString(viewModel, "date-format"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            datePicker.setProp("init-value", ElementUtil.findString(model, "init-value"));
            datePicker.setProp("value-id", ElementUtil.findString(model, "value-id"));
            datePicker.setProp("base-value", ElementUtil.findString(model, "base-value"));
        }

        return datePicker;
    }

    public FileUpload createFileUpload(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        FileUpload fileUpload = new FileUpload(id, type, copy);

        return fileUpload;
    }

    public KFileUpload createKFileUpload(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        KFileUpload kFileUpload = new KFileUpload(id, type, copy);

        return kFileUpload;
    }

    public Textarea createTextarea(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Textarea textarea = new Textarea(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            textarea.setProp("width", ElementUtil.findString(viewModel, "width"));
            textarea.setProp("height", ElementUtil.findString(viewModel, "height"));
            textarea.setProp("lang", ElementUtil.findBoolean(viewModel, "lang"));
            textarea.setProp("editable", ElementUtil.findBoolean(viewModel, "editable"));
            textarea.setProp("placeholder", ElementUtil.findString(viewModel, "placeholder"));
            textarea.setProp("name", ElementUtil.findString(viewModel, "name"));
            textarea.setProp("name-position", ElementUtil.findString(viewModel, "name-position"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            textarea.setProp("value-id", ElementUtil.findString(model, "value-id"));
            textarea.setProp(new String[] { "init-value", "data" },   ElementUtil.findString(model, "init-value", "data"));
        }

        return textarea;
    }

    public Editor createEditor(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Editor editor = new Editor(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            editor.setProp("width", ElementUtil.findString(viewModel, "width"));
            editor.setProp("height", ElementUtil.findString(viewModel, "height"));
            editor.setProp("lang", ElementUtil.findBoolean(viewModel, "lang"));
            editor.setProp("editable", ElementUtil.findBoolean(viewModel, "editable"));
            editor.setProp("paste-option", ElementUtil.findString(viewModel, "paste-option"));
            editor.setProp("toolbar.use", ElementUtil.findBoolean(viewModel, "toolbar.use"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            editor.setProp("value-id", ElementUtil.findString(model, "value-id"));
            editor.setProp("value-type", ElementUtil.findString(model, "value-type"));
            editor.setProp(new String[] { "init-value", "data" }, ElementUtil.findString(model, "init-value", "data"));
        }

        return editor;
    }

    public Tree createTree(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Tree tree = new Tree(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            tree.setProp("width", ElementUtil.findString(viewModel, "width"));
            tree.setProp("height", ElementUtil.findString(viewModel, "height"));
            tree.setProp("checkbox", ElementUtil.findBoolean(viewModel, "checkbox"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            tree.setProp("value-id", ElementUtil.findString(model, "value-id"));
            tree.setProp("value-id.sort", ElementUtil.findString(model, "value-id.sort"));
            tree.setProp("text-id", ElementUtil.findString(model, "text-id"));
            tree.setProp("text-id.sort", ElementUtil.findString(model, "text-id.sort"));
            tree.setProp("getvalue-concat", ElementUtil.findString(model, "getvalue-concat"));
        }

        return tree;
    }

    public Chart createChart(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Chart chart = new Chart(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            chart.setProp("title", ElementUtil.findString(viewModel, "title"));
            chart.setProp("height", ElementUtil.findString(viewModel, "height"));
            chart.setProp("theme", ElementUtil.findString(viewModel, "theme"));
            chart.setProp("default-type", ElementUtil.findString(viewModel, "default-type"));
            chart.setProp(new String[] { "border", "width" }, ElementUtil.findString(viewModel, "border", "width"));
            chart.setProp(new String[] { "border", "color" }, ElementUtil.findString(viewModel, "border", "color"));
            chart.setProp(new String[] { "legend", "visible" }, ElementUtil.findBoolean(viewModel, "legend", "visible"));
            chart.setProp(new String[] { "legend", "position" }, ElementUtil.findString(viewModel, "legend", "position"));
            chart.setProp(new String[] { "legend", "hidden", "field-id" }, ElementUtil.findString(viewModel, "legend", "hidden", "field-id"));
            chart.setProp(new String[] { "tooltip", "visible" }, ElementUtil.findBoolean(viewModel, "tooltip", "visible"));
            chart.setProp(new String[] { "tooltip", "format" }, ElementUtil.findString(viewModel, "tooltip", "format"));

            chart.setProp(new String[] { "labels", "categoryAxis", "title", "text" }, ElementUtil.findString(viewModel, "labels", "categoryAxis", "title", "text"));
            chart.setProp(new String[] { "labels", "categoryAxis", "title", "font" }, ElementUtil.findString(viewModel, "labels", "categoryAxis", "title", "font"));
            chart.setProp(new String[] { "labels", "categoryAxis", "title", "color" }, ElementUtil.findString(viewModel, "labels", "categoryAxis", "title", "color"));
            chart.setProp(new String[] { "labels", "categoryAxis", "rotation" }, ElementUtil.findString(viewModel, "labels", "categoryAxis", "rotation"));

            chart.setProp(new String[] { "labels", "valueAxis", "title", "text" }, ElementUtil.findString(viewModel, "labels", "valueAxis", "title", "text"));
            chart.setProp(new String[] { "labels", "valueAxis", "title", "font" }, ElementUtil.findString(viewModel, "labels", "valueAxis", "title", "font"));
            chart.setProp(new String[] { "labels", "valueAxis", "title", "color" }, ElementUtil.findString(viewModel, "labels", "valueAxis", "title", "color"));
            chart.setProp(new String[] { "labels", "valueAxis", "axisCrossingValue" }, ElementUtil.findString(viewModel, "labels", "valueAxis", "axisCrossingValue"));
            chart.setProp(new String[] { "labels", "valueAxis", "format" }, ElementUtil.findString(viewModel, "labels", "valueAxis", "format"));
            chart.setProp(new String[] { "labels", "valueAxis", "min" }, ElementUtil.findInteger(viewModel, "labels", "valueAxis", "min"));
            chart.setProp(new String[] { "labels", "valueAxis", "max" }, ElementUtil.findInteger(viewModel, "labels", "valueAxis", "max"));

            chart.setProp(new String[] { "labels", "xAxis", "format" }, ElementUtil.findString(viewModel, "labels", "xAxis", "format"));
            chart.setProp(new String[] { "labels", "xAxis", "axis-crossing-value" }, ElementUtil.findString(viewModel, "labels", "xAxis", "axis-crossing-value"));
            chart.setProp(new String[] { "labels", "yAxis", "format" }, ElementUtil.findString(viewModel, "labels", "yAxis", "format"));

            Element labelsElement = viewModel.getChild("labels");
            if (labelsElement != null) {
                Element categoryAxisElement = labelsElement.getChild("categoryAxis");
                if (categoryAxisElement != null) {
                    for (Element categoryElement : categoryAxisElement.getChildren("category")) {
                        String categoryId = categoryElement.getAttributeValue("id");
                        if (categoryId == null) {
                            continue;
                        }

                        CategoryAxis categoryAxis = new CategoryAxis(categoryId);

                        categoryAxis.setProp(new String[] { "title", "text" }, ElementUtil.findString(categoryElement, "title", "text"));
                        categoryAxis.setProp(new String[] { "title", "font" }, ElementUtil.findString(categoryElement, "title", "font"));
                        categoryAxis.setProp(new String[] { "title", "color" }, ElementUtil.findString(categoryElement, "title", "color"));
                        categoryAxis.setProp("rotation", ElementUtil.findString(categoryElement, "rotation"));
                        categoryAxis.setProp("format", ElementUtil.findString(categoryElement, "format"));

                        chart.addCategoryAxis(categoryAxis);
                    }
                }

                Element valueAxisElement = labelsElement.getChild("valueAxis");
                if (valueAxisElement != null) {
                    for (Element valueElement : valueAxisElement.getChildren("value")) {
                        String valueId = valueElement.getAttributeValue("id");
                        if (valueId == null) {
                            continue;
                        }

                        ValueAxis valueAxis = new ValueAxis(valueId);

                        valueAxis.setProp(new String[] { "title", "text" }, ElementUtil.findString(valueElement, "title", "text"));
                        valueAxis.setProp(new String[] { "title", "font" }, ElementUtil.findString(valueElement, "title", "font"));
                        valueAxis.setProp(new String[] { "title", "color" }, ElementUtil.findString(valueElement, "title", "color"));
                        valueAxis.setProp("axisCrossingValue", ElementUtil.findString(valueElement, "axisCrossingValue"));
                        valueAxis.setProp("visible", ElementUtil.findBoolean(valueElement, "visible"));
                        valueAxis.setProp("format", ElementUtil.findString(valueElement, "format"));
                        valueAxis.setProp("min", ElementUtil.findInteger(valueElement, "min"));
                        valueAxis.setProp("max", ElementUtil.findInteger(valueElement, "max"));

                        chart.addValueAxis(valueAxis);
                    }
                }

                for (Element seriesElement : ElementUtil.findElements(viewModel, "labels", "serieses", "series")) {
                    String seriesId = seriesElement.getAttributeValue("id");
                    if (seriesId == null) {
                        continue;
                    }

                    LabelsSeries labelsSeries = new LabelsSeries(seriesId);

                    labelsSeries.setProp("visible", ElementUtil.findBoolean(seriesElement, "visible"));
                    labelsSeries.setProp("format", ElementUtil.findString(seriesElement, "format"));

                    chart.addLabelsSeries(labelsSeries);
                }
            }
        }

        Element model = element.getChild("model");
        if (model != null) {
            chart.setProp("data-group-id", ElementUtil.findString(model, "data-group-id"));
            chart.setProp(new String[] { "serieses", "visible" }, ElementUtil.findString(model, "serieses", "visible"));
            chart.setProp(new String[] { "serieses", "format" }, ElementUtil.findString(model, "serieses", "format"));

            Element categoriesElement = model.getChild("categories");
            if (categoriesElement != null) {
                for (Element categoryElement : categoriesElement.getChildren("category")) {
                    String fieldId = categoryElement.getAttributeValue("field-id");
                    if (fieldId == null) {
                        continue;
                    }

                    Category category = new Category(fieldId);

                    category.setProp("type", ElementUtil.findString(categoryElement, "type"));
                    category.setProp("date-group", ElementUtil.findString(categoryElement, "date-group"));
                    category.setProp("format", ElementUtil.findString(categoryElement, "format"));

                    chart.addCategory(category);
                }
            }

            Element seriesesElement = model.getChild("serieses");
            if (seriesesElement != null) {
                for (Element seriesElement : seriesesElement.getChildren("series")) {
                    String fieldId = seriesElement.getAttributeValue("field-id");
                    if (fieldId == null) {
                        continue;
                    }

                    Series series = new Series(fieldId);

                    series.setProp(".note-text-field-id", ElementUtil.findString(seriesElement, ".note-text-field-id"));
                    series.setProp("chart-type.type", ElementUtil.findString(seriesElement, "chart-type.type"));
                    series.setProp(new String[] { "chart-type", "stack" }, ElementUtil.findBoolean(seriesElement, "chart-type", "stack"));
                    series.setProp(new String[] { "chart-type", "line-style" }, ElementUtil.findString(seriesElement, "chart-type", "line-style"));
                    series.setProp("type", ElementUtil.findString(seriesElement, "type"));
                    series.setProp("criteria-axis", ElementUtil.findString(seriesElement, "criteria-axis"));
                    series.setProp("x-field", ElementUtil.findString(seriesElement, "x-field"));
                    series.setProp("y-field", ElementUtil.findString(seriesElement, "y-field"));
                    series.setProp("category-field", ElementUtil.findString(seriesElement, "category-field"));

                    chart.addSeries(series);
                }
            }
        }

        return chart;
    }

    public PieChart createPieChart(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        PieChart pieChart = new PieChart(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            pieChart.setProp("title", ElementUtil.findString(viewModel, "title"));
            pieChart.setProp("title-position", ElementUtil.findString(viewModel, "title-position"));
            pieChart.setProp("height", ElementUtil.findString(viewModel, "height"));
            pieChart.setProp("theme", ElementUtil.findString(viewModel, "theme"));
            pieChart.setProp("startAngle", ElementUtil.findString(viewModel, "startAngle"));
            pieChart.setProp(new String[] { "border", "width" }, ElementUtil.findString(viewModel, "border", "width"));
            pieChart.setProp(new String[] { "border", "color" }, ElementUtil.findString(viewModel, "border", "color"));
            pieChart.setProp(new String[] { "legend", "visible" }, ElementUtil.findBoolean(viewModel, "legend", "visible"));
            pieChart.setProp(new String[] { "legend", "position" }, ElementUtil.findString(viewModel, "legend", "position"));
            pieChart.setProp(new String[] { "labels", "visible" }, ElementUtil.findBoolean(viewModel, "labels", "visible"));
            pieChart.setProp(new String[] { "labels", "position" }, ElementUtil.findString(viewModel, "labels", "position"));
            pieChart.setProp(new String[] { "labels", "percentage" }, ElementUtil.findBoolean(viewModel, "labels", "percentage"));
            pieChart.setProp(new String[] { "tooltip", "visible" }, ElementUtil.findBoolean(viewModel, "tooltip", "visible"));
            pieChart.setProp(new String[] { "tooltip", "format" }, ElementUtil.findString(viewModel, "tooltip", "format"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            Element seriesesElement = model.getChild("serieses");
            if (seriesesElement != null) {
                for (Element seriesElement : seriesesElement.getChildren("series")) {
                    String fieldId = seriesElement.getAttributeValue("field-id");
                    if (fieldId == null) {
                        continue;
                    }

                    Series series = new Series(fieldId);

                    series.setPieChart(true);
                    series.setProp("category-field", ElementUtil.findString(seriesElement, "category-field"));

                    pieChart.addSeries(series);
                }
            }
        }

        return pieChart;
    }

    public Grid createGrid(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Grid grid = new Grid(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            /* General Properties */
            grid.setProp("height", ElementUtil.findString(viewModel, "height"));
            grid.setProp("header-height", ElementUtil.findString(viewModel, "header-height"));
            grid.setProp("chart-height", ElementUtil.findString(viewModel, "chart-height"));
            grid.setProp("ignore-change", ElementUtil.findBoolean(viewModel, "ignore-change"));
            grid.setProp("selection-mode", ElementUtil.findString(viewModel, "selection-mode"));
            grid.setProp("indicator", ElementUtil.findBoolean(viewModel, "indicator"));
            grid.setProp("state-bar", ElementUtil.findBoolean(viewModel, "state-bar"));
            grid.setProp("check-bar", ElementUtil.findBoolean(viewModel, "check-bar"));
            grid.setProp("check-exclusive", ElementUtil.findBoolean(viewModel, "check-exclusive"));
            grid.setProp("fit-style", ElementUtil.findString(viewModel, "fit-style"));
            grid.setProp("data-fit", ElementUtil.findString(viewModel, "data-fit"));
            grid.setProp("header-sortable", ElementUtil.findBoolean(viewModel, "header-sortable"));
            grid.setProp("show-row-count", ElementUtil.findBoolean(viewModel, "show-row-count"));

            /* Paging Properties */
            grid.setProp("pageable", ElementUtil.findBoolean(viewModel, "pageable"));
            grid.setProp("page-row-count", ElementUtil.findInteger(viewModel, "page-row-count"));
            grid.setProp("paging-mode", ElementUtil.findString(viewModel, "paging-mode"));

            /* Summary Properties */
            grid.setProp("grid-summary", ElementUtil.findBoolean(viewModel, "grid-summary"));
            grid.setProp("grid-summary-on-header", ElementUtil.findBoolean(viewModel, "grid-summary-on-header"));
            grid.setProp("grid-summary-mode", ElementUtil.findString(viewModel, "grid-summary-mode"));

            /* Row Grouping Properties */
            grid.setProp("groupable", ElementUtil.findBoolean(viewModel, "groupable"));
            grid.setProp("group-header", ElementUtil.findBoolean(viewModel, "group-header"));
            grid.setProp("group-summary", ElementUtil.findBoolean(viewModel, "group-summary"));
            grid.setProp("group-summary-on-header", ElementUtil.findBoolean(viewModel, "group-summary-on-header"));
            grid.setProp("group-sort", ElementUtil.findBoolean(viewModel, "group-sort"));
            grid.setProp("group-summary-mode", ElementUtil.findString(viewModel, "group-summary-mode"));
            grid.setProp("group-header-text", ElementUtil.findString(viewModel, "group-header-text"));
            grid.setProp("group-footer-text", ElementUtil.findString(viewModel, "group-footer-text"));
            grid.setProp("group-merge-mode", ElementUtil.findBoolean(viewModel, "group-merge-mode"));
            grid.setProp("group-level-style", ElementUtil.findBoolean(viewModel, "group-level-style"));
            grid.setProp("group-expander", ElementUtil.findBoolean(viewModel, "group-expander"));

            List<Element> cellAttributeElements = ElementUtil.findElements(viewModel, "cell-attributes", "cell-attribute");
            for (Element cellAttributeElement : cellAttributeElements) {
                String cellAttributeId = cellAttributeElement.getAttributeValue("id");
                if (cellAttributeId == null) {
                    continue;
                }

                CellAttribute cellAttribute = new CellAttribute(cellAttributeId);

                Element conditionsElement = cellAttributeElement.getChild("conditions");
                if (conditionsElement != null) {
                    List<Condition> conditions = createConditions(conditionsElement);
                    for (Condition condition : conditions) {
                        cellAttribute.addCondition(condition);
                    }
                }

                Element appliesElement = cellAttributeElement.getChild("applies");
                if (appliesElement != null) {
                    List<Apply> applies = createApplies(appliesElement);
                    for (Apply apply : applies) {
                        cellAttribute.addApply(apply);
                    }
                }

                grid.addCellAttribute(cellAttribute);
            }

            Element toolbarElement = viewModel.getChild("toolbar");
            if (toolbarElement != null) {
                Toolbar toolbar = new Toolbar();

                toolbar.setProp(".use", ElementUtil.findBoolean(toolbarElement, ".use"));

                List<ToolbarButton> toolbarButtons = createToolbarButtons(toolbarElement);
                for (ToolbarButton toolbarButton : toolbarButtons) {
                    toolbar.addToolbarButton(toolbarButton);
                }

                grid.setToolbar(toolbar);
            }
        }

        Element model = element.getChild("model");
        if (model != null) {
            Element columnsElement = model.getChild("columns");

            List<Column> columns = createColumns(columnsElement, false);
            for (Column column : columns) {
                grid.addColumn(column);
            }
        }

        return grid;
    }

    public TreeGrid createTreeGrid(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        TreeGrid treeGrid = new TreeGrid(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            /* General Properties */
            treeGrid.setProp("height", ElementUtil.findString(viewModel, "height"));
            treeGrid.setProp("header-height", ElementUtil.findString(viewModel, "header-height"));
            treeGrid.setProp("indicator", ElementUtil.findBoolean(viewModel, "indicator"));
            treeGrid.setProp("state-bar", ElementUtil.findBoolean(viewModel, "state-bar"));
            treeGrid.setProp("check-bar", ElementUtil.findBoolean(viewModel, "check-bar"));
            treeGrid.setProp("fit-style", ElementUtil.findString(viewModel, "fit-style"));
            treeGrid.setProp("data-fit", ElementUtil.findString(viewModel, "data-fit"));
            treeGrid.setProp("header-sortable", ElementUtil.findBoolean(viewModel, "header-sortable"));
            treeGrid.setProp("init-expand-level", ElementUtil.findString(viewModel, "init-expand-level"));
            treeGrid.setProp("selection-mode", ElementUtil.findString(viewModel, "selection-mode"));
            treeGrid.setProp("show-row-count", ElementUtil.findBoolean(viewModel, "show-row-count"));

            /* Summary Properties */
            treeGrid.setProp("grid-summary", ElementUtil.findBoolean(viewModel, "grid-summary"));
            treeGrid.setProp("grid-summary-mode", ElementUtil.findString(viewModel, "grid-summary-mode"));

            List<Element> cellAttributeElements = ElementUtil.findElements(viewModel, "cell-attributes", "cell-attribute");
            for (Element cellAttributeElement : cellAttributeElements) {
                String cellAttributeId = cellAttributeElement.getAttributeValue("id");
                if (cellAttributeId == null) {
                    continue;
                }

                CellAttribute cellAttribute = new CellAttribute(cellAttributeId);

                Element conditionsElement = cellAttributeElement.getChild("conditions");
                if (conditionsElement != null) {
                    List<Condition> conditions = createConditions(conditionsElement);
                    for (Condition condition : conditions) {
                        cellAttribute.addCondition(condition);
                    }
                }

                Element appliesElement = cellAttributeElement.getChild("applies");
                if (appliesElement != null) {
                    List<Apply> applies = createApplies(appliesElement);
                    for (Apply apply : applies) {
                        cellAttribute.addApply(apply);
                    }
                }

                treeGrid.addCellAttribute(cellAttribute);
            }

            Element toolbarElement = viewModel.getChild("toolbar");
            if (toolbarElement != null) {
                Toolbar toolbar = new Toolbar();

                toolbar.setProp(".use", ElementUtil.findBoolean(toolbarElement, ".use"));

                List<ToolbarButton> toolbarButtons = createToolbarButtons(toolbarElement);
                for (ToolbarButton toolbarButton : toolbarButtons) {
                    toolbar.addToolbarButton(toolbarButton);
                }

                treeGrid.setToolbar(toolbar);
            }
        }

        Element model = element.getChild("model");
        if (model != null) {
            Element columnsElement = model.getChild("columns");

            List<Column> columns = createColumns(columnsElement, true);
            for (Column column : columns) {
                treeGrid.addColumn(column);
            }
        }

        return treeGrid;
    }

    public BPMNWebModeler createBPMNWebModeler(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        BPMNWebModeler bpmnWebModeler = new BPMNWebModeler(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            bpmnWebModeler.setProp("height", ElementUtil.findString(viewModel, "height"));

            Element toolbarElement = viewModel.getChild("toolbar");
            if (toolbarElement != null) {
                Toolbar toolbar = new Toolbar();

                toolbar.setProp(".use", ElementUtil.findBoolean(toolbarElement, ".use"));

                List<ToolbarButton> toolbarButtons = createToolbarButtons(toolbarElement);
                for (ToolbarButton toolbarButton : toolbarButtons) {
                    toolbar.addToolbarButton(toolbarButton);
                }

                bpmnWebModeler.setToolbar(toolbar);
            }
        }

        Element model = element.getChild("model");
        if (model != null) {
            bpmnWebModeler.setProp("editable", ElementUtil.findBoolean(model, "editable"));
        }

        return bpmnWebModeler;
    }

    public Tab createTab(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Tab tab = new Tab(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            tab.setProp("width", ElementUtil.findString(viewModel, "width"));
            tab.setProp("height", ElementUtil.findString(viewModel, "height"));
            tab.setProp(new String[] { "tabs", "position" }, ElementUtil.findString(viewModel, "tabs", "position"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            List<Element> tabElements = ElementUtil.findElements(model, "tabs", "tab");
            for (Element tabElement : tabElements) {
                String tabId = tabElement.getAttributeValue("id");
                if (tabId == null) {
                    continue;
                }

                TabItem tabItem = new TabItem(tabId);

                tabItem.setProp(".title", ElementUtil.findString(tabElement, ".title"));
                tabItem.setProp(".expand", ElementUtil.findBoolean(tabElement, ".expand"));
                tabItem.setProp(".init-render", ElementUtil.findBoolean(tabElement, ".init-render"));

                tab.addTabItem(tabItem);
            }
        }

        return tab;
    }

    public Container createContainer(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Container container = new Container(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            Element groupBoxElement = ElementUtil.findElement(viewModel, "group-box");
            if (groupBoxElement != null) {
                container.existGroupBox(true);
            }

            container.setProp("width", ElementUtil.findString(viewModel, "width"));
            container.setProp("height", ElementUtil.findString(viewModel, "height"));
            container.setProp(new String[] { "group-box", "border-radius" }, ElementUtil.findString(viewModel, "group-box", "border-radius"));
            container.setProp(new String[] { "group-box", "border-color" }, ElementUtil.findString(viewModel, "group-box", "border-color"));
            container.setProp(new String[] { "group-box", "border-width" }, ElementUtil.findString(viewModel, "group-box", "border-width"));
            container.setProp(new String[] { "group-box", "border-style" }, ElementUtil.findString(viewModel, "group-box", "border-style"));
            container.setProp(new String[] { "group-box", "title" }, ElementUtil.findString(viewModel, "group-box", "title"));
            container.setProp(new String[] { "group-box", "title-position" }, ElementUtil.findString(viewModel, "group-box", "title-position"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            List<Element> containerElements = ElementUtil.findElements(model, "containers", "container");
            for (Element containerElement : containerElements) {
                String containerId = containerElement.getAttributeValue("id");
                if (containerId == null) {
                    continue;
                }

                ContainerItem containerItem = new ContainerItem(containerId);

                containerItem.setProp(".expand", ElementUtil.findBoolean(containerElement, ".expand"));
                containerItem.setProp(".init-render", ElementUtil.findBoolean(containerElement, ".init-render"));

                container.addContainerItem(containerItem);
            }
        }

        return container;
    }

    public Split createSplit(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Split split = new Split(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            split.setProp("width", ElementUtil.findString(viewModel, "width"));
            split.setProp("height", ElementUtil.findString(viewModel, "height"));
            split.setProp(new String[] { "splits", "position" }, ElementUtil.findString(viewModel, "splits", "position"));
        }

        Element model = element.getChild("model");
        if (model != null) {
            List<Element> splitElements = ElementUtil.findElements(model, "splits", "split");
            for (Element splitElement : splitElements) {
                String splitId = splitElement.getAttributeValue("id");
                if (splitId == null) {
                    continue;
                }

                SplitItem splitItem = new SplitItem(splitId);

                splitItem.setProp(".collapsed", ElementUtil.findBoolean(splitElement, ".collapsed"));
                splitItem.setProp(".collapsible", ElementUtil.findBoolean(splitElement, ".collapsible"));
                splitItem.setProp(".resizable", ElementUtil.findBoolean(splitElement, ".resizable"));
                splitItem.setProp(".size", ElementUtil.findString(splitElement, ".size"));

                split.addSplitItem(splitItem);
            }
        }

        return split;
    }

    public URLPage createURLPage(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        URLPage urlPage = new URLPage(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            urlPage.setProp("url", ElementUtil.findString(viewModel, "url"));
            urlPage.setProp("width", ElementUtil.findString(viewModel, "width"));
            urlPage.setProp("height", ElementUtil.findString(viewModel, "height"));
            urlPage.setProp("scroll", ElementUtil.findBoolean(viewModel, "scroll"));
        }

        return urlPage;
    }

    public Window createWindow(Element element) {
        String id = element.getAttributeValue("id");
        String type = element.getAttributeValue("type");
        String copy = element.getAttributeValue("copy");

        Window window = new Window(id, type, copy);

        Element viewModel = element.getChild("view-model");
        if (viewModel != null) {
            window.setProp("lang", ElementUtil.findBoolean(viewModel, "lang"));
            window.setProp("title", ElementUtil.findString(viewModel, "title"));
            window.setProp("width", ElementUtil.findString(viewModel, "width"));
            window.setProp("height", ElementUtil.findString(viewModel, "height"));
            window.setProp("visible", ElementUtil.findBoolean(viewModel, "visible"));
            window.setProp("modal", ElementUtil.findBoolean(viewModel, "modal"));
            window.setProp("init-render", ElementUtil.findBoolean(viewModel, "init-render"));
        }

        return window;
    }

}
