package com.zionex.t3series.web.view.v2_0.component.grid;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v2_0.ViewUtil;
import com.zionex.t3series.web.view.v2_0.component.Component;
import com.zionex.t3series.web.view.v2_0.component.Toolbar;

import org.jdom2.Element;

public class TreeGrid extends Component {

    private Toolbar toolbar;

    private List<CellAttribute> cellAttributes = new ArrayList<>();
    private List<Column> columns = new ArrayList<>();

    public TreeGrid(String id, String type, String copy) {
        super(id, type, copy);
    }

    public Toolbar getToolbar() {
        return toolbar;
    }

    public void setToolbar(Toolbar toolbar) {
        this.toolbar = toolbar;
    }

    public List<CellAttribute> getCellAttributes() {
        return Collections.unmodifiableList(cellAttributes);
    }

    public void addCellAttribute(CellAttribute cellAttribute) {
        this.cellAttributes.add(cellAttribute);
    }

    public List<Column> getColumns() {
        return Collections.unmodifiableList(columns);
    }

    public void addColumn(Column column) {
        this.columns.add(column);
    }

    @Override
    public Element toElement() {
        Element component = super.toElement();

        Element props = new Element("props");

        /* General Properties */
        Object height = getProp("height");
        Object headerHeight = getProp("header-height");
        Object indicator = getProp("indicator");
        Object stateBar = getProp("state-bar");
        Object checkBar = getProp("check-bar");
        Object fitStyle = getProp("fit-style");
        Object dataFit = getProp("data-fit");
        Object headerSortable = getProp("header-sortable");
        Object initExpandLevel = getProp("init-expand-level");
        Object selectionMode = getProp("selection-mode");
        Object showRowCount = getProp("show-row-count");

        if (height != null) props.addContent(new Element("height").setText(height.toString()));
        if (headerHeight != null) props.addContent(new Element("header-height").setText(headerHeight.toString()));
        if (indicator != null) props.addContent(new Element("indicator").setText(indicator.toString()));
        if (stateBar != null) props.addContent(new Element("state-bar").setText(stateBar.toString()));
        if (checkBar != null) props.addContent(new Element("check-bar").setText(checkBar.toString()));
        if (fitStyle != null) props.addContent(new Element("fit-style").setText(fitStyle.toString()));
        if (dataFit != null) props.addContent(new Element("data-fit").setText(dataFit.toString()));
        if (headerSortable != null) props.addContent(new Element("header-sortable").setText(headerSortable.toString()));
        if (initExpandLevel != null) props.addContent(new Element("init-expand-level").setText(initExpandLevel.toString()));
        if (selectionMode != null) props.addContent(new Element("selection-mode").setText(selectionMode.toString()));
        if (showRowCount != null) props.addContent(new Element("show-row-count").setText(showRowCount.toString()));

        /* Summary Properties */
        Object gridSummary = getProp("grid-summary");
        Object gridSummaryMode = getProp("grid-summary-mode");

        if (gridSummary != null) props.addContent(new Element("grid-summary").setText(gridSummary.toString()));
        if (gridSummaryMode != null) props.addContent(new Element("grid-summary-mode").setText(gridSummaryMode.toString()));

        if (!cellAttributes.isEmpty()) {
            Element cellAttributesElement = new Element("cell-attributes");
            for (CellAttribute cellAttribute : cellAttributes) {
                cellAttributesElement.addContent(cellAttribute.toElement());
            }
            props.addContent(cellAttributesElement);
        }

        if (toolbar != null) {
            props.addContent(toolbar.toElement());
        }

        if (!columns.isEmpty()) {
            Element columnsElement = new Element("columns");
            for (Column column : columns) {
                columnsElement.addContent(column.toElement());
            }
            props.addContent(columnsElement);
        }

        if (props.getContentSize() > 0) component.addContent(props);

        ViewUtil.addContentAction(component, this);
        ViewUtil.addContentOperation(component, this);

        return component;
    }

    @Override
    public String toJson() {
        /* General Properties */
        Object height = getProp("height");
        Object headerHeight = getProp("header-height");
        Object indicator = getProp("indicator");
        Object stateBar = getProp("state-bar");
        Object checkBar = getProp("check-bar");
        Object fitStyle = getProp("fit-style");
        Object dataFit = getProp("data-fit");
        Object headerSortable = getProp("header-sortable");
        Object initExpandLevel = getProp("init-expand-level");
        Object selectionMode = getProp("selection-mode");
        Object showRowCount = getProp("show-row-count");

        StringBuilder propsBuilder = new StringBuilder();

        if (height != null) {
            propsBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (headerHeight != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"headerHeight\":").append('"').append(headerHeight).append('"');
        }

        if (indicator != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"indicator\":").append(indicator);
        }

        if (stateBar != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"stateBar\":").append(stateBar);
        }

        if (checkBar != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"checkBar\":").append(checkBar);
        }

        if (fitStyle != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"fitStyle\":").append('"').append(fitStyle).append('"');
        }

        if (dataFit != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"dataFit\":").append('"').append(dataFit).append('"');
        }

        if (headerSortable != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"headerSortable\":").append(headerSortable);
        }

        if (initExpandLevel != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"initExpandLevel\":").append('"').append(initExpandLevel).append('"');
        }

        if (selectionMode != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"selectionMode\":").append('"').append(selectionMode).append('"');
        }

        if (showRowCount != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"showRowCount\":").append('"').append(showRowCount).append('"');
        }

        /* Summary Properties */
        Object gridSummary = getProp("grid-summary");
        Object gridSummaryMode = getProp("grid-summary-mode");

        if (gridSummary != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"gridSummary\":").append(gridSummary);
        }

        if (gridSummaryMode != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"gridSummaryMode\":").append('"').append(gridSummaryMode).append('"');
        }

        StringBuilder cellAttriBuilder = new StringBuilder();

        if (!cellAttributes.isEmpty()) {
            cellAttriBuilder.append('{');

            for (int i = 0; i < cellAttributes.size(); i++) {
                CellAttribute cellAttribute = cellAttributes.get(i);

                if (i > 0) {
                    cellAttriBuilder.append(',');
                }

                String json = cellAttribute.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                cellAttriBuilder.append('"').append(cellAttribute.getId()).append("\":").append(json);
            }
            cellAttriBuilder.append('}');
        }

        if (cellAttriBuilder.length() > 0) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"cellAttributes\":").append(cellAttriBuilder.toString());
        }

        if (toolbar != null) {
            String toolbarJson = toolbar.toJson();
            if (!toolbarJson.isEmpty()) {
                if (propsBuilder.length() > 0) {
                    propsBuilder.append(',');
                }
                propsBuilder.append(toolbarJson);
            }
        }

        if (!columns.isEmpty()) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }

            propsBuilder.append("\"columns\":").append('{');
            for (int i = 0; i < columns.size(); i++) {
                Column column = columns.get(i);

                if (i > 0) {
                    propsBuilder.append(',');
                }

                String json = column.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                propsBuilder.append('"').append(column.getId()).append("\":").append(json);
            }
            propsBuilder.append('}');
        }

        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"type\":").append('"').append(this.getType()).append('"');

        if (propsBuilder.length() > 0) {
            builder.append(",\"props\":").append('{').append(propsBuilder.toString()).append('}');
        }

        String action = ViewUtil.toJsonAction(this);
        String operation = ViewUtil.toJsonOperation(this);

        if (!action.isEmpty()) builder.append(',').append(action);
        if (!operation.isEmpty()) builder.append(',').append(operation);

        builder.append('}');
        return builder.toString();
    }

}
