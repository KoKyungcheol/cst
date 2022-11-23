package com.zionex.t3series.web.view.v2_0.component.grid;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.util.Configurable;
import com.zionex.t3series.web.view.util.Properties;

import org.jdom2.Element;

public class Column extends Properties implements Configurable {

    private final String id;

    private Candidate candidate;
    private DateLimit dateLimit;
    private Iteration iteration;

    private boolean isTreeColumn;

    private List<Validation> validations = new ArrayList<>();

    public Column(String id) {
        this.id = id;
    }

    public String getId() {
        return id;
    }

    public boolean isTreeColumn() {
        return isTreeColumn;
    }

    public void setTreeColumn(boolean isTreeColumn) {
        this.isTreeColumn = isTreeColumn;
    }

    public Candidate getCandidate() {
        return candidate;
    }

    public void setCandidate(Candidate candidate) {
        this.candidate = candidate;
    }

    public DateLimit getDateLimit() {
        return dateLimit;
    }

    public void setDateLimit(DateLimit dateLimit) {
        this.dateLimit = dateLimit;
    }

    public Iteration getIteration() {
        return iteration;
    }

    public void setIteration(Iteration iteration) {
        this.iteration = iteration;
    }

    public List<Validation> getValidations() {
        return Collections.unmodifiableList(validations);
    }

    public void addValidation(Validation validation) {
        validations.add(validation);
    }

    @Override
    public Element toElement() {
        Element columnElement = new Element("column");

        columnElement.setAttribute("id", id);
        
        Object title = getProp(".title");
        Object type = getProp(".type");
        Object sort = getProp(".sort");
        Object useNumberComparer = getProp(".use-number-comparer");

        if (title != null) columnElement.setAttribute("title", title.toString());
        if (type != null) columnElement.setAttribute("type", type.toString());
        if (sort != null && !isTreeColumn) columnElement.setAttribute("sort", sort.toString()); // Only Grid Configuration
        if (useNumberComparer != null) columnElement.setAttribute("use-number-comparer", useNumberComparer.toString());

        Object width = getProp("width");
        Object visible = getProp("visible");
        Object editable = getProp("editable");
        Object ifNew = getProp("editable.if-new");
        Object textAlignment = getProp("text-alignment");
        Object button = getProp("button");
        Object lang = getProp("lang");
        Object fix = getProp("fix");
        Object fontBold = getProp("font-bold");
        Object background = getProp("background");
        Object foreground = getProp("foreground");
        Object headerBackground = getProp("header-background");
        Object headerForeground = getProp("header-foreground");
        Object masking = getProp("masking");
        Object merge = getProp("merge"); // Only Grid Configuration
        Object filterable = getProp("filterable");
        Object tooltip = getProp("tooltip");
        Object lookup = getProp("lookup");
        Object calc = getProp("calc");
        Object format = getProp("format");
        Object positiveOnly = getProp("positive-only");
        Object datepicker = getProp("datepicker");
        Object excelFormat = getProp("excel-format");
        Object headerCheckable = getProp("header-checkable");
        Object headerCheckerPosition = getProp("header-checker-position");
        Object checkExclusive = getProp("check-exclusive");
        Object groups = getProp("groups");
        Object initGroupOrder = getProp("init-group-order"); // Only Grid Configuration
        Object gridSummaryExp = getProp("grid-summary-exp");
        Object groupSummaryExp = getProp("group-summary-exp"); // Only Grid Configuration

        if (width != null) columnElement.addContent(new Element("width").setText(width.toString()));
        if (visible != null) columnElement.addContent(new Element("visible").setText(visible.toString()));
        if (editable != null) {
            Element editableElement = new Element("editable").setText(editable.toString());
            if (ifNew != null) {
                editableElement.setAttribute("if-new", ifNew.toString());
            }
            columnElement.addContent(editableElement);
        }
        if (textAlignment != null) columnElement.addContent(new Element("text-alignment").setText(textAlignment.toString()));
        if (button != null) columnElement.addContent(new Element("button").setText(button.toString()));
        if (lang != null) columnElement.addContent(new Element("lang").setText(lang.toString()));
        if (fix != null) columnElement.addContent(new Element("fix").setText(fix.toString()));
        if (fontBold != null) columnElement.addContent(new Element("font-bold").setText(fontBold.toString()));
        if (background != null) columnElement.addContent(new Element("background").setText(background.toString()));
        if (foreground != null) columnElement.addContent(new Element("foreground").setText(foreground.toString()));
        if (headerBackground != null) columnElement.addContent(new Element("header-background").setText(headerBackground.toString()));
        if (headerForeground != null) columnElement.addContent(new Element("header-foreground").setText(headerForeground.toString()));
        if (masking != null) columnElement.addContent(new Element("masking").setText(masking.toString()));
        if (merge != null && !isTreeColumn) columnElement.addContent(new Element("merge").setText(merge.toString()));
        if (filterable != null) columnElement.addContent(new Element("filterable").setText(filterable.toString()));
        if (tooltip != null) columnElement.addContent(new Element("tooltip").setText(tooltip.toString()));
        if (lookup != null) columnElement.addContent(new Element("lookup").setText(lookup.toString()));
        if (calc != null) columnElement.addContent(new Element("calc").setText(calc.toString()));
        if (format != null) columnElement.addContent(new Element("format").setText(format.toString()));
        if (positiveOnly != null) columnElement.addContent(new Element("positive-only").setText(positiveOnly.toString()));
        if (datepicker != null) columnElement.addContent(new Element("datepicker").setText(datepicker.toString()));
        if (excelFormat != null) columnElement.addContent(new Element("excel-format").setText(excelFormat.toString()));
        if (headerCheckable != null) columnElement.addContent(new Element("header-checkable").setText(headerCheckable.toString()));
        if (headerCheckerPosition != null) columnElement.addContent(new Element("header-checker-position").setText(headerCheckerPosition.toString()));
        if (checkExclusive != null) columnElement.addContent(new Element("check-exclusive").setText(checkExclusive.toString()));
        if (groups != null) columnElement.addContent(new Element("groups").setText(groups.toString()));
        if (initGroupOrder != null && !isTreeColumn) columnElement.addContent(new Element("init-group-order").setText(initGroupOrder.toString()));
        if (gridSummaryExp != null) columnElement.addContent(new Element("grid-summary-exp").setText(gridSummaryExp.toString()));
        if (groupSummaryExp != null && !isTreeColumn) columnElement.addContent(new Element("group-summary-exp").setText(groupSummaryExp.toString()));

        if (candidate != null)  {
            columnElement.addContent(candidate.toElement());
        }

        if (dateLimit != null)  {
            columnElement.addContent(dateLimit.toElement());
        }

        if (iteration != null)  {
            columnElement.addContent(iteration.toElement());
        }

        if (!validations.isEmpty()) {
            Element validationsElement = new Element("validations");

            for (Validation validation : validations) {
                validationsElement.addContent(validation.toElement());
            }

            columnElement.addContent(validationsElement);
        }

        return columnElement;
    }

    @Override
    public String toJson() {
        StringBuilder builder = new StringBuilder();
        builder.append('{');

        Object title = getProp(".title");
        Object type = getProp(".type");
        Object sort = getProp(".sort");
        Object useNumberComparer = getProp(".use-number-comparer");

        if (title != null) {
            builder.append("\"title\":").append('"').append(title).append('"');
        }

        if (type != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"type\":").append('"').append(type).append('"');
        }

        if (sort != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"sort\":").append('"').append(sort).append('"');
        }

        if (useNumberComparer != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"useNumberComparer\":").append('"').append(useNumberComparer).append('"');
        }

        Object width = getProp("width");
        Object visible = getProp("visible");
        Object editable = getProp("editable");
        Object editableNew = getProp("editable.if-new");
        Object textAlignment = getProp("text-alignment");
        Object button = getProp("button");
        Object lang = getProp("lang");
        Object fix = getProp("fix");
        Object fontBold = getProp("font-bold");
        Object background = getProp("background");
        Object foreground = getProp("foreground");
        Object headerBackground = getProp("header-background");
        Object headerForeground = getProp("header-foreground");
        Object masking = getProp("masking");
        Object merge = getProp("merge"); // Only Grid Configuration
        Object filterable = getProp("filterable");
        Object tooltip = getProp("tooltip");
        Object lookup = getProp("lookup");
        Object calc = getProp("calc");
        Object format = getProp("format");
        Object positiveOnly = getProp("positive-only");
        Object datepicker = getProp("datepicker");
        Object excelFormat = getProp("excel-format");
        Object headerCheckable = getProp("header-checkable");
        Object headerCheckerPosition = getProp("header-checker-position");
        Object checkExclusive = getProp("check-exclusive");
        Object groups = getProp("groups");
        Object initGroupOrder = getProp("init-group-order"); // Only Grid Configuration
        Object gridSummaryExp = getProp("grid-summary-exp");
        Object groupSummaryExp = getProp("group-summary-exp"); // Only Grid Configuration

        if (width != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"width\":").append('"').append(width).append('"');
        }

        if (visible != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"visible\":").append(visible);
        }

        if (editable != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"editable\":").append(editable);
        }

        if (editableNew != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"editableNew\":").append(editableNew);
        }

        if (textAlignment != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"textAlignment\":").append('"').append(textAlignment).append('"');
        }

        if (button != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"button\":").append(button);
        }

        if (lang != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"lang\":").append(lang);
        }

        if (fix != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"fix\":").append(fix);
        }

        if (fontBold != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"fontBold\":").append(fontBold);
        }

        if (background != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"background\":").append('"').append(background).append('"');
        }

        if (foreground != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"foreground\":").append('"').append(foreground).append('"');
        }

        if (headerBackground != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"headerBackground\":").append('"').append(headerBackground).append('"');
        }

        if (headerForeground != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"headerForeground\":").append('"').append(headerForeground).append('"');
        }

        if (masking != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"masking\":").append(masking);
        }

        if (merge != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"merge\":").append(merge);
        }

        if (filterable != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"filterable\":").append(filterable);
        }

        if (tooltip != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"tooltip\":").append('"').append(tooltip).append('"');
        }

        if (lookup != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"lookup\":").append('"').append(lookup).append('"');
        }

        if (calc != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"calc\":").append('"').append(calc).append('"');
        }

        if (format != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"format\":").append('"').append(format).append('"');
        }

        if (positiveOnly != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"positiveOnly\":").append(positiveOnly);
        }

        if (datepicker != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"datepicker\":").append(datepicker);
        }

        if (excelFormat != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"excelFormat\":").append('"').append(excelFormat).append('"');
        }

        if (headerCheckable != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"headerCheckable\":").append(headerCheckable);
        }

        if (headerCheckerPosition != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"headerCheckerPosition\":").append(headerCheckerPosition);
        }

        if (checkExclusive != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"checkExclusive\":").append(checkExclusive);
        }

        if (groups != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"groups\":").append('"').append(groups).append('"');
        }

        if (initGroupOrder != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"initGroupOrder\":").append('"').append(initGroupOrder).append('"');
        }

        if (gridSummaryExp != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"gridSummaryExp\":").append('"').append(gridSummaryExp).append('"');
        }

        if (groupSummaryExp != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"groupSummaryExp\":").append('"').append(groupSummaryExp).append('"');
        }

        if (candidate != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"candidate\":").append(candidate.toJson());
        }

        if (dateLimit != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"dateLimit\":").append(dateLimit.toJson());
        }

        if (iteration != null) {
            if (builder.length() > 1) {
                builder.append(',');
            }
            builder.append("\"iteration\":").append(iteration.toJson());
        }

        if (!validations.isEmpty()) {
            builder.append(',').append("\"validations\":").append('{');
            for (int i = 0; i < validations.size(); i++) {
                Validation validation = validations.get(i);

                if (i > 0) {
                    builder.append(',');
                }
                builder.append('"').append(validation.getId()).append("\":").append(validation.toJson());

            }
            builder.append('}');
        }
        builder.append('}');
        return builder.toString();
    }

}
