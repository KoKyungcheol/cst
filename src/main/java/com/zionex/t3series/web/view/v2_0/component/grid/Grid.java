package com.zionex.t3series.web.view.v2_0.component.grid;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v2_0.ViewUtil;
import com.zionex.t3series.web.view.v2_0.component.Component;
import com.zionex.t3series.web.view.v2_0.component.Toolbar;

import org.jdom2.Element;

public class Grid extends Component {

    private Toolbar toolbar;

    private List<CellAttribute> cellAttributes = new ArrayList<>();
    private List<Column> columns = new ArrayList<>();

    public Grid(String id, String type, String copy) {
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
        Object ignoreChange = getProp("ignore-change");
        Object selectionMode = getProp("selection-mode");
        Object indicator = getProp("indicator");
        Object stateBar = getProp("state-bar");
        Object checkBar = getProp("check-bar");
        Object checkExclusive = getProp("check-exclusive");
        Object fitStyle = getProp("fit-style");
        Object dataFit = getProp("data-fit");
        Object headerSortable = getProp("header-sortable");
        Object showRowCount = getProp("show-row-count");

        if (height != null) props.addContent(new Element("height").setText(height.toString()));
        if (headerHeight != null) props.addContent(new Element("header-height").setText(headerHeight.toString()));
        if (ignoreChange != null) props.addContent(new Element("ignore-change").setText(ignoreChange.toString()));
        if (selectionMode != null) props.addContent(new Element("selection-mode").setText(selectionMode.toString()));
        if (indicator != null) props.addContent(new Element("indicator").setText(indicator.toString()));
        if (stateBar != null) props.addContent(new Element("state-bar").setText(stateBar.toString()));
        if (checkBar != null) props.addContent(new Element("check-bar").setText(checkBar.toString()));
        if (checkExclusive != null) props.addContent(new Element("check-exclusive").setText(checkExclusive.toString()));
        if (fitStyle != null) props.addContent(new Element("fit-style").setText(fitStyle.toString()));
        if (dataFit != null) props.addContent(new Element("data-fit").setText(dataFit.toString()));
        if (headerSortable != null) props.addContent(new Element("header-sortable").setText(headerSortable.toString()));
        if (showRowCount != null) props.addContent(new Element("show-row-count").setText(showRowCount.toString()));

        /* Paging Properties */
        Object pageable = getProp("pageable");
        Object pageRowCount = getProp("page-row-count");
        Object pagingMode = getProp("paging-mode");

        if (pageable != null) props.addContent(new Element("pageable").setText(pageable.toString()));
        if (pageRowCount != null) props.addContent(new Element("page-row-count").setText(pageRowCount.toString()));
        if (pagingMode != null) props.addContent(new Element("paging-mode").setText(pagingMode.toString()));

        /* Summary Properties */
        Object gridSummary = getProp("grid-summary");
        Object gridSummaryOnHeader = getProp("grid-summary-on-header");
        Object gridSummaryMode = getProp("grid-summary-mode");

        if (gridSummary != null) props.addContent(new Element("grid-summary").setText(gridSummary.toString()));
        if (gridSummaryOnHeader != null) props.addContent(new Element("grid-summary-on-header").setText(gridSummaryOnHeader.toString()));
        if (gridSummaryMode != null) props.addContent(new Element("grid-summary-mode").setText(gridSummaryMode.toString()));

        /* Row Grouping Properties */
        Object groupable = getProp("groupable");
        Object groupHeader = getProp("group-header");
        Object groupSummary = getProp("group-summary");
        Object groupSummaryOnHeader = getProp("group-summary-on-header");
        Object groupSort = getProp("group-sort");
        Object groupSummaryMode = getProp("group-summary-mode");
        Object groupHeaderText = getProp("group-header-text");
        Object groupFooterText = getProp("group-footer-text");
        Object groupMergeMode = getProp("group-merge-mode");
        Object groupLevelStyle = getProp("group-level-style");
        Object groupExpander = getProp("group-expander");

        if (groupable != null) props.addContent(new Element("groupable").setText(groupable.toString()));
        if (groupHeader != null) props.addContent(new Element("group-header").setText(groupHeader.toString()));
        if (groupSummary != null) props.addContent(new Element("group-summary").setText(groupSummary.toString()));
        if (groupSummaryOnHeader != null) props.addContent(new Element("group-summary-on-header").setText(groupSummaryOnHeader.toString()));
        if (groupSort != null) props.addContent(new Element("group-sort").setText(groupSort.toString()));
        if (groupSummaryMode != null) props.addContent(new Element("group-summary-mode").setText(groupSummaryMode.toString()));
        if (groupHeaderText != null) props.addContent(new Element("group-header-text").setText(groupHeaderText.toString()));
        if (groupFooterText != null) props.addContent(new Element("group-footer-text").setText(groupFooterText.toString()));
        if (groupMergeMode != null) props.addContent(new Element("group-merge-mode").setText(groupMergeMode.toString()));
        if (groupLevelStyle != null) props.addContent(new Element("group-level-style").setText(groupLevelStyle.toString()));
        if (groupExpander != null) props.addContent(new Element("group-expander").setText(groupExpander.toString()));

        /* Chart Properties */
        Object chartHeight = getProp("chart-height");
        Object measureColumn = getProp("measure-column");

        if (chartHeight != null) props.addContent(new Element("chart-height").setText(chartHeight.toString()));
        if (measureColumn != null) props.addContent(new Element("measure-column").setText(measureColumn.toString()));

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
        Object ignoreChange = getProp("ignore-change");
        Object selectionMode = getProp("selection-mode");
        Object indicator = getProp("indicator");
        Object stateBar = getProp("state-bar");
        Object checkBar = getProp("check-bar");
        Object checkExclusive = getProp("check-exclusive");
        Object fitStyle = getProp("fit-style");
        Object dataFit = getProp("data-fit");
        Object headerSortable = getProp("header-sortable");
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

        if (ignoreChange != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"ignoreChange\":").append(ignoreChange);
        }

        if (selectionMode != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"selectionMode\":").append('"').append(selectionMode).append('"');
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

        if (checkExclusive != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"checkExclusive\":").append(checkExclusive);
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

        if (showRowCount != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"showRowCount\":").append(showRowCount);
        }

        /* Paging Properties */
        Object pageable = getProp("pageable");
        Object pageRowCount = getProp("page-row-count");
        Object pagingMode = getProp("paging-mode");

        if (pageable != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"pageable\":").append(pageable);
        }

        if (pageRowCount != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"pageRowCount\":").append('"').append(pageRowCount).append('"');
        }

        if (pagingMode != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"pagingMode\":").append('"').append(pagingMode).append('"');
        }

        /* Summary Properties */
        Object gridSummary = getProp("grid-summary");
        Object gridSummaryOnHeader = getProp("grid-summary-on-header");
        Object gridSummaryMode = getProp("grid-summary-mode");

        if (gridSummary != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"gridSummary\":").append(gridSummary);
        }

        if (gridSummaryOnHeader != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"gridSummaryOnHeader\":").append(gridSummaryOnHeader);
        }

        if (gridSummaryMode != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"gridSummaryMode\":").append('"').append(gridSummaryMode).append('"');
        }

        /* Row Grouping Properties */
        Object groupable = getProp("groupable");
        Object groupHeader = getProp("group-header");
        Object groupSummary = getProp("group-summary");
        Object groupSummaryOnHeader = getProp("group-summary-on-header");
        Object groupSort = getProp("group-sort");
        Object groupSummaryMode = getProp("group-summary-mode");
        Object groupHeaderText = getProp("group-header-text");
        Object groupFooterText = getProp("group-footer-text");
        Object groupMergeMode = getProp("group-merge-mode");
        Object groupLevelStyle = getProp("group-level-style");
        Object groupExpander = getProp("group-expander");

        if (groupable != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupable\":").append(groupable);
        }

        if (groupHeader != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupHeader\":").append(groupHeader);
        }

        if (groupSummary != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupSummary\":").append(groupSummary);
        }

        if (groupSummaryOnHeader != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupSummaryOnHeader\":").append(groupSummaryOnHeader);
        }

        if (groupSort != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupSort\":").append(groupSort);
        }

        if (groupSummaryMode != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupSummaryMode\":").append('"').append(groupSummaryMode).append('"');
        }

        if (groupHeaderText != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupHeaderText\":").append('"').append(groupHeaderText).append('"');
        }

        if (groupFooterText != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupFooterText\":").append('"').append(groupFooterText).append('"');
        }

        if (groupMergeMode != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupMergeMode\":").append(groupMergeMode);
        }

        if (groupLevelStyle != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupLevelStyle\":").append(groupLevelStyle);
        }

        if (groupExpander != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"groupExpander\":").append(groupExpander);
        }

        /* Chart Properties */
        Object chartHeight = getProp("chart-height");
        Object measureColumn = getProp("measure-column");

        if (chartHeight != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"chartHeight\":").append('"').append(chartHeight).append('"');
        }

        if (measureColumn != null) {
            if (propsBuilder.length() > 0) {
                propsBuilder.append(',');
            }
            propsBuilder.append("\"measureColumn\":").append('"').append(measureColumn).append('"');
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
