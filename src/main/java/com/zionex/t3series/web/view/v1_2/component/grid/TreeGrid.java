package com.zionex.t3series.web.view.v1_2.component.grid;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import com.zionex.t3series.web.view.v1_2.ViewUtil;
import com.zionex.t3series.web.view.v1_2.component.Component;
import com.zionex.t3series.web.view.v1_2.component.Toolbar;

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

        Element viewModel = new Element("view-model");

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

        if (height != null ) viewModel.addContent(new Element("height").setText(height.toString()));
        if (headerHeight != null ) viewModel.addContent(new Element("header-height").setText(headerHeight.toString()));
        if (indicator != null ) viewModel.addContent(new Element("indicator").setText(indicator.toString()));
        if (stateBar != null ) viewModel.addContent(new Element("state-bar").setText(stateBar.toString()));
        if (checkBar != null ) viewModel.addContent(new Element("check-bar").setText(checkBar.toString()));
        if (fitStyle != null ) viewModel.addContent(new Element("fit-style").setText(fitStyle.toString()));
        if (dataFit != null ) viewModel.addContent(new Element("data-fit").setText(dataFit.toString()));
        if (headerSortable != null ) viewModel.addContent(new Element("header-sortable").setText(headerSortable.toString()));
        if (initExpandLevel != null ) viewModel.addContent(new Element("init-expand-level").setText(initExpandLevel.toString()));
        if (selectionMode != null ) viewModel.addContent(new Element("selection-mode").setText(selectionMode.toString()));
        if (showRowCount != null ) viewModel.addContent(new Element("show-row-count").setText(showRowCount.toString()));

        /* Summary Properties */
        Object gridSummary = getProp("grid-summary");
        Object gridSummaryMode = getProp("grid-summary-mode");

        if (gridSummary != null ) viewModel.addContent(new Element("grid-summary").setText(gridSummary.toString()));
        if (gridSummaryMode != null ) viewModel.addContent(new Element("grid-summary-mode").setText(gridSummaryMode.toString()));

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
        Object indicator = getProp("indicator");
        Object stateBar = getProp("state-bar");
        Object checkBar = getProp("check-bar");
        Object fitStyle = getProp("fit-style");
        Object dataFit = getProp("data-fit");
        Object headerSortable = getProp("header-sortable");
        Object initExpandLevel = getProp("init-expand-level");
        Object selectionMode = getProp("selection-mode");
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

        if (initExpandLevel != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"initExpandLevel\":").append('"').append(initExpandLevel).append('"');
        }

        if (selectionMode != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"selectionMode\":").append('"').append(selectionMode).append('"');
        }

        if (showRowCount != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"showRowCount\":").append('"').append(showRowCount).append('"');
        }

        /* Summary Properties */
        Object gridSummary = getProp("grid-summary");
        Object gridSummaryMode = getProp("grid-summary-mode");

        if (gridSummary != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"gridSummary\":").append(gridSummary);
        }

        if (gridSummaryMode != null) {
            if (viewModelBuilder.length() > 0) {
                viewModelBuilder.append(',');
            }
            viewModelBuilder.append("\"gridSummaryMode\":").append('"').append(gridSummaryMode).append('"');
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
