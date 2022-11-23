package com.zionex.t3series.web.view.v1_2.component.grid;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_2.ViewUtil;
import com.zionex.t3series.web.view.v1_2.component.Component;
import com.zionex.t3series.web.view.v1_2.component.Toolbar;

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

        Element viewModel = new Element("view-model");

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

        if (height != null ) viewModel.addContent(new Element("height").setText(height.toString()));
        if (headerHeight != null ) viewModel.addContent(new Element("header-height").setText(headerHeight.toString()));
        if (ignoreChange != null ) viewModel.addContent(new Element("ignore-change").setText(ignoreChange.toString()));
        if (selectionMode != null ) viewModel.addContent(new Element("selection-mode").setText(selectionMode.toString()));
        if (indicator != null ) viewModel.addContent(new Element("indicator").setText(indicator.toString()));
        if (stateBar != null ) viewModel.addContent(new Element("state-bar").setText(stateBar.toString()));
        if (checkBar != null ) viewModel.addContent(new Element("check-bar").setText(checkBar.toString()));
        if (checkExclusive != null ) viewModel.addContent(new Element("check-exclusive").setText(checkExclusive.toString()));
        if (fitStyle != null ) viewModel.addContent(new Element("fit-style").setText(fitStyle.toString()));
        if (dataFit != null ) viewModel.addContent(new Element("data-fit").setText(dataFit.toString()));
        if (headerSortable != null ) viewModel.addContent(new Element("header-sortable").setText(headerSortable.toString()));
        if (showRowCount != null ) viewModel.addContent(new Element("show-row-count").setText(showRowCount.toString()));

        /* Paging Properties */
        Object pageable = getProp("pageable");
        Object pageRowCount = getProp("page-row-count");
        Object pagingMode = getProp("paging-mode");

        if (pageable != null ) viewModel.addContent(new Element("pageable").setText(pageable.toString()));
        if (pageRowCount != null ) viewModel.addContent(new Element("page-row-count").setText(pageRowCount.toString()));
        if (pagingMode != null ) viewModel.addContent(new Element("paging-mode").setText(pagingMode.toString()));

        /* Summary Properties */
        Object gridSummary = getProp("grid-summary");
        Object gridSummaryOnHeader = getProp("grid-summary-on-header");
        Object gridSummaryMode = getProp("grid-summary-mode");

        if (gridSummary != null ) viewModel.addContent(new Element("grid-summary").setText(gridSummary.toString()));
        if (gridSummaryOnHeader != null ) viewModel.addContent(new Element("grid-summary-on-header").setText(gridSummaryOnHeader.toString()));
        if (gridSummaryMode != null ) viewModel.addContent(new Element("grid-summary-mode").setText(gridSummaryMode.toString()));

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

        if (groupable != null ) viewModel.addContent(new Element("groupable").setText(groupable.toString()));
        if (groupHeader != null ) viewModel.addContent(new Element("group-header").setText(groupHeader.toString()));
        if (groupSummary != null ) viewModel.addContent(new Element("group-summary").setText(groupSummary.toString()));
        if (groupSummaryOnHeader != null ) viewModel.addContent(new Element("group-summary-on-header").setText(groupSummaryOnHeader.toString()));
        if (groupSort != null ) viewModel.addContent(new Element("group-sort").setText(groupSort.toString()));
        if (groupSummaryMode != null ) viewModel.addContent(new Element("group-summary-mode").setText(groupSummaryMode.toString()));
        if (groupHeaderText != null ) viewModel.addContent(new Element("group-header-text").setText(groupHeaderText.toString()));
        if (groupFooterText != null ) viewModel.addContent(new Element("group-footer-text").setText(groupFooterText.toString()));
        if (groupMergeMode != null ) viewModel.addContent(new Element("group-merge-mode").setText(groupMergeMode.toString()));
        if (groupLevelStyle != null ) viewModel.addContent(new Element("group-level-style").setText(groupLevelStyle.toString()));
        if (groupExpander != null ) viewModel.addContent(new Element("group-expander").setText(groupExpander.toString()));

        /* Chart Properties */
        Object chartHeight = getProp("chart-height");
        Object measureColumn = getProp("measure-column");

        if (chartHeight != null ) viewModel.addContent(new Element("chart-height").setText(chartHeight.toString()));
        if (measureColumn != null ) viewModel.addContent(new Element("measure-column").setText(measureColumn.toString()));

        if (!cellAttributes.isEmpty()) {
            Element cellAttributesElement = new Element("cell-attributes");
            for (CellAttribute cellAttribute : cellAttributes) {
                cellAttributesElement.addContent(cellAttribute.toElement());
            }
            viewModel.addContent(cellAttributesElement);
        }

        if (toolbar != null) {
            viewModel.addContent(toolbar.toElement());
        }

        Element model = new Element("model");
        if (!columns.isEmpty()) {
            Element columnsElement = new Element("columns");
            for (Column column : columns) {
                columnsElement.addContent(column.toElement());
            }
            model.addContent(columnsElement);
        }

        if (viewModel.getContentSize() > 0) component.addContent(viewModel);
        if (model.getContentSize() > 0) component.addContent(model);

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

        StringBuilder viewModelBuilder = new StringBuilder();

        if (height != null) {
            viewModelBuilder.append("\"height\":").append('"').append(height).append('"');
        }

        if (headerHeight != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"headerHeight\":").append('"').append(headerHeight).append('"');
        }

        if (ignoreChange != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"ignoreChange\":").append(ignoreChange);
        }

        if (selectionMode != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"selectionMode\":").append('"').append(selectionMode).append('"');
        }

        if (indicator != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"indicator\":").append(indicator);
        }

        if (stateBar != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"stateBar\":").append(stateBar);
        }

        if (checkBar != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"checkBar\":").append(checkBar);
        }

        if (checkExclusive != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"checkExclusive\":").append(checkExclusive);
        }

        if (fitStyle != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"fitStyle\":").append('"').append(fitStyle).append('"');
        }

        if (dataFit != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"dataFit\":").append('"').append(dataFit).append('"');
        }

        if (headerSortable != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"headerSortable\":").append(headerSortable);
        }

        if (showRowCount != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"showRowCount\":").append(showRowCount);
        }

        /* Paging Properties */
        Object pageable = getProp("pageable");
        Object pageRowCount = getProp("page-row-count");
        Object pagingMode = getProp("paging-mode");

        if (pageable != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"pageable\":").append(pageable);
        }

        if (pageRowCount != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"pageRowCount\":").append('"').append(pageRowCount).append('"');
        }

        if (pagingMode != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"pagingMode\":").append('"').append(pagingMode).append('"');
        }

        /* Summary Properties */
        Object gridSummary = getProp("grid-summary");
        Object gridSummaryOnHeader = getProp("grid-summary-on-header");
        Object gridSummaryMode = getProp("grid-summary-mode");

        if (gridSummary != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"gridSummary\":").append(gridSummary);
        }

        if (gridSummaryOnHeader != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"gridSummaryOnHeader\":").append(gridSummaryOnHeader);
        }

        if (gridSummaryMode != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"gridSummaryMode\":").append('"').append(gridSummaryMode).append('"');
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
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupable\":").append(groupable);
        }

        if (groupHeader != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupHeader\":").append(groupHeader);
        }

        if (groupSummary != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupSummary\":").append(groupSummary);
        }

        if (groupSummaryOnHeader != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupSummaryOnHeader\":").append(groupSummaryOnHeader);
        }

        if (groupSort != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupSort\":").append(groupSort);
        }

        if (groupSummaryMode != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupSummaryMode\":").append('"').append(groupSummaryMode).append('"');
        }

        if (groupHeaderText != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupHeaderText\":").append('"').append(groupHeaderText).append('"');
        }

        if (groupFooterText != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupFooterText\":").append('"').append(groupFooterText).append('"');
        }

        if (groupMergeMode != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupMergeMode\":").append(groupMergeMode);
        }

        if (groupLevelStyle != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupLevelStyle\":").append(groupLevelStyle);
        }

        if (groupExpander != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"groupExpander\":").append(groupExpander);
        }

        /* Chart Properties */
        Object chartHeight = getProp("chart-height");
        Object measureColumn = getProp("measure-column");

        if (chartHeight != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"chartHeight\":").append('"').append(chartHeight).append('"');
        }

        if (measureColumn != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"measureColumn\":").append('"').append(measureColumn).append('"');
        }

        StringBuilder cellAttriBuilder = new StringBuilder();

        if (!cellAttributes.isEmpty()) {
            cellAttriBuilder.append('{');

            for (int i = 0; i < cellAttributes.size(); i++) {
                CellAttribute cellAttribute = cellAttributes.get(i);

                if (i > 0){
                    cellAttriBuilder.append(',');
                }

                String json = cellAttribute.toJson();
                if (json.isEmpty()){
                    continue;
                }
                cellAttriBuilder.append('"').append(cellAttribute.getId()).append("\":").append(json);
            }
            cellAttriBuilder.append('}');
        }

        if (cellAttriBuilder.length() > 0){
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"cellAttributes\":").append(cellAttriBuilder.toString());
        }

        if (toolbar != null) {
            String toolbarJson = toolbar.toJson();
            if (!toolbarJson.isEmpty()) {
                if (viewModelBuilder.length() > 0) {
                    viewModelBuilder.append(',');
                }
                viewModelBuilder.append(toolbarJson);
            }
        }

        StringBuilder modelBuilder = new StringBuilder();

        if (!columns.isEmpty()) {
            for (int i = 0; i < columns.size(); i++) {
                Column column = columns.get(i);

                if (i > 0) {
                    modelBuilder.append(',');
                }

                String json = column.toJson();
                if (json.isEmpty()) {
                    continue;
                }
                modelBuilder.append('"').append(column.getId()).append("\":").append(json);
            }
        }

        StringBuilder builder = new StringBuilder();
        builder.append('{');
        builder.append("\"type\":").append('"').append(this.getType()).append('"');

        if (viewModelBuilder.length() > 0) {
            builder.append(",\"viewModel\":").append('{').append(viewModelBuilder.toString()).append('}');
        }

        if (modelBuilder.length() > 0) {
            builder.append(",\"model\":{").append("\"columns\":").append('{').append(modelBuilder.toString()).append("}}");
        }

        String action = ViewUtil.toJsonAction(this);
        String operation = ViewUtil.toJsonOperation(this);

        if (!action.isEmpty()) builder.append(',').append(action);
        if (!operation.isEmpty()) builder.append(',').append(operation);

        builder.append('}');
        return builder.toString();
    }

}
