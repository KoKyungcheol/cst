package com.zionex.t3series.web.view.v1_0.component.grid;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_0.ViewUtil;
import com.zionex.t3series.web.view.v1_0.component.Component;
import com.zionex.t3series.web.view.v1_0.component.Toolbar;

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
        Object chartHeight = getProp("chart-height");
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
        if (chartHeight != null ) viewModel.addContent(new Element("chart-height").setText(chartHeight.toString()));
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

}
