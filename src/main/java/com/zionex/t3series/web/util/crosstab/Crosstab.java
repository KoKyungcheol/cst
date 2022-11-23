package com.zionex.t3series.web.util.crosstab;

import static com.zionex.t3series.web.constant.ServiceConstants.PARAMETER_KEY_INFO;
import static com.zionex.t3series.web.constant.ServiceConstants.RESULT_CODE_FAIL;

import java.text.DateFormat;
import java.text.DecimalFormat;
import java.text.NumberFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.zionex.t3series.util.ObjectUtil;
import com.zionex.t3series.util.time.DayofWeekBasedCalendar;
import com.zionex.t3series.util.time.ISO8601Calendar;
import com.zionex.t3series.web.constant.ServiceConstants.ServiceResultUtil;

import org.apache.commons.lang3.StringUtils;
import org.thymeleaf.util.ArrayUtils;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.extern.java.Log;

@Log
public class Crosstab {

    public static final SimpleDateFormat ISO8601_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

    public static final DateFormat DEFAULT_DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd");
    public static final String DEFAULT_DELIMITER = ",";

    public static final String DELIMITER = "delimiter";

    public static final String DATE_FORMAT = "date-format";
    public static final String DATE_FORMAT_TYPE = "type";
    public static final String NUMBER_FORMAT = "number-format";

    public static final String PREFIX_GROUP_KEY = "prefix-group-key";
    public static final String PREFIX_ROW_NAME = "prefix-rowname";
    public static final String USELESS_ROWNAME = "useless-rowname";

    public static final String GROUP_COLUMN = "group-column";
    public static final String GROUP_COLUMNS = "group-columns";

    public static final String GROUP_ROWS = "group-rows";
    public static final String GROUP_KEY = "group-key";
    public static final String GROUP_VALUE = "group-value";
    public static final String GROUP_VALUES = "group-values";
    public static final String GROUP_TYPE = "group-type";

    public static final String DATA_KEYS = "data-keys";

    public static final String GROUP_HORIZONTAL_VALUES = "group-horizontal-values";
    public static final String GROUP_VERTICAL_VALUES = "group-vertical-values";

    public static final String GROUP_TYPE_VERTICAL = "vertical";
    public static final String GROUP_TYPE_HORIZONTAL = "horizontal";

    public static final String SUMMARY_TYPE = "summary-type";

    private final String DATA_TYPE_STRING = "string";
    private final String DATA_TYPE_ARRAY = "array";

    private final Set<Item> items = Collections.unmodifiableSet(new HashSet<Item>() {
        private static final long serialVersionUID = -6646470298886692348L;
        {
            add(new Item(GROUP_COLUMN, DATA_TYPE_STRING));
            add(new Item(GROUP_KEY, DATA_TYPE_STRING));
            add(new Item(GROUP_VALUE, DATA_TYPE_STRING));

            add(new Item(GROUP_COLUMNS, DATA_TYPE_ARRAY));
            add(new Item(GROUP_ROWS, DATA_TYPE_ARRAY));
            add(new Item(GROUP_VALUES, DATA_TYPE_ARRAY));
            add(new Item(GROUP_HORIZONTAL_VALUES, DATA_TYPE_ARRAY));
            add(new Item(GROUP_VERTICAL_VALUES, DATA_TYPE_ARRAY));
            add(new Item(DATA_KEYS, DATA_TYPE_ARRAY));
            add(new Item(SUMMARY_TYPE, DATA_TYPE_ARRAY));
        }
    });

    public Item getItem(String itemName) {
        for (Item item : items) {
            if (item.getItemName().equalsIgnoreCase(itemName)) {
                return item;
            }
        }
        return null;
    }

    @AllArgsConstructor
    @Data
    public static class Item {

        private String itemName;
        private String dataType;

        public boolean isSummaryItem() {
            return itemName.equals(GROUP_VALUE) || itemName.equals(GROUP_HORIZONTAL_VALUES)
                    || itemName.equals(GROUP_VERTICAL_VALUES);
        }

    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> convertToType1(final Map<String, Object> data, final Map<String, Object> params) {
        String[] columnGroups = new String[] {};

        final List<String> columnGroupsObj = (List<String>) params.get(CrosstabBuilder.GROUP_COLUMNS);
        if (columnGroupsObj != null) {
            columnGroups = columnGroupsObj.toArray(new String[] {});
        }

        final String keyColumn = (String) params.get(CrosstabBuilder.GROUP_KEY);
        final String valueColumn = (String) params.get(CrosstabBuilder.GROUP_VALUE);
        
        if (columnGroups.length == 0 || StringUtils.isEmpty(keyColumn) || StringUtils.isEmpty(valueColumn)) {
            final String message = String.format("One or more required data is null. (required data: %s, %s, %s)", CrosstabBuilder.GROUP_COLUMNS, CrosstabBuilder.GROUP_KEY, CrosstabBuilder.GROUP_VALUE);
            log.warning(message);
            
            final Map<String, Object> serviceResultTypeIInformation = ServiceResultUtil.getServiceResultTypeIInformation(false, RESULT_CODE_FAIL, message);

            final Map<String, Object> errorData = new HashMap<>();
            errorData.put(PARAMETER_KEY_INFO, serviceResultTypeIInformation.get(PARAMETER_KEY_INFO));

            return errorData;
        }

        String summaryType = null;

        final List<String> summaryTypesObj = (List<String>) params.get(SUMMARY_TYPE);
        if (summaryTypesObj != null && !summaryTypesObj.isEmpty()) {
            final String types = summaryTypesObj.get(0);
            summaryType = types.split(":")[1];
        }

        final CrosstabBuilderType1 crosstabBuilder = CrosstabBuilderType1.builder()
            .columnGroups(columnGroups)
            .keyColumn(keyColumn)
            .valueColumn(valueColumn)
            .summaryType(summaryType)
            .usePrefixKeyColumn(ObjectUtil.toBoolean(params.get(PREFIX_GROUP_KEY)))
            .dateFormat(getDateFormat(params))
            .numberFormat(getNumberFormat(params))
            .build();

        return crosstabBuilder.convert(data);
    }

    @SuppressWarnings({"unchecked"})
    public static List<Map<String, Object>> reverseToType1(final List<Map<String, Object>> data, final Map<String, Object> params) throws CrosstabException {
        if (data == null || data.isEmpty()) {
            throw new CrosstabException("The data does not exist.");
        }

        String[] columnGroups = new String[] {};

        final List<String> columnGroupsObj = (List<String>) params.get(CrosstabBuilder.GROUP_COLUMNS);
        if (columnGroupsObj != null) {
            columnGroups = columnGroupsObj.toArray(new String[] {});
        }

        final String keyColumn = (String) params.get(CrosstabBuilder.GROUP_KEY);
        final String valueColumn = (String) params.get(CrosstabBuilder.GROUP_VALUE);

        if (columnGroups.length == 0 || StringUtils.isEmpty(keyColumn) || StringUtils.isEmpty(valueColumn)) {
            final String message = String.format("One or more required data is null. (required data: %s, %s, %s)", CrosstabBuilder.GROUP_COLUMNS, CrosstabBuilder.GROUP_KEY, CrosstabBuilder.GROUP_VALUE);
            log.warning(message);
            throw new CrosstabException(message);
        }

        final List<Object> columns = new ArrayList<>(data.get(0).keySet());

        final List<List<Object>> newData = new ArrayList<>();
        for (final Map<String, Object> rowMap : data) {
            final List<Object> row = new ArrayList<>();
            for (final Object column : columns) {
                row.add(rowMap.get(column.toString()));
            }

            newData.add(row);
        }

        final CrosstabBuilderType1 crosstabBuilder = CrosstabBuilderType1.builder()
            .columnGroups(columnGroups)
            .keyColumn(keyColumn)
            .valueColumn(valueColumn)
            .usePrefixKeyColumn(ObjectUtil.toBoolean(params.get(PREFIX_GROUP_KEY)))
            .build();

        return crosstabBuilder.reverse(columns, newData);
    }

    @SuppressWarnings("unchecked")
    public static Map<String, Object> convertToType2(final Map<String, Object> data, final Map<String, Object> params) {
        String[] columnGroups = {};
        String[] rowGroups = {};
        String[] valueGroups = {};
        String[] horizontalValueGroups = {};
        String[] verticalValueGroups = {};
        String[] keyColumns = {};

        final List<String> columnGroupsObj = (List<String>) params.get(CrosstabBuilder.GROUP_COLUMNS);
        if (columnGroupsObj != null) {
            columnGroups = columnGroupsObj.toArray(new String[] {});
        }

        final List<String> rowGroupsObj = (List<String>) params.get(CrosstabBuilder.GROUP_ROWS);
        if (rowGroupsObj != null) {
            rowGroups = rowGroupsObj.toArray(new String[] {});
        }

        final List<String> valueGroupsObj = (List<String>) params.get(GROUP_VALUES);
        if (valueGroupsObj != null) {
            valueGroups = valueGroupsObj.toArray(new String[] {});
        }

        final List<String> horizontalValueGroupsObj = (List<String>) params.get(CrosstabBuilder.GROUP_HORIZONTAL_VALUES);
        if (horizontalValueGroupsObj != null) {
            horizontalValueGroups = horizontalValueGroupsObj.toArray(new String[] {});
            checkValueGroups(params, horizontalValueGroups, valueGroups, GROUP_TYPE_HORIZONTAL);
        }

        final List<String> verticalValueGroupsObj = (List<String>) params.get(CrosstabBuilder.GROUP_VERTICAL_VALUES);
        if (verticalValueGroupsObj != null) {
            verticalValueGroups = verticalValueGroupsObj.toArray(new String[] {});
            checkValueGroups(params, verticalValueGroups, valueGroups, GROUP_TYPE_VERTICAL);
        }

        final List<String> keyColumnsObj = (List<String>) params.get(CrosstabBuilder.DATA_KEYS);
        if (keyColumnsObj != null) {
            keyColumns = keyColumnsObj.toArray(new String[] {});
        }

        final Map<String, String> summaryTypeMap = new HashMap<>();

        final Object summaryTypesObj = params.get(SUMMARY_TYPE);
        if (summaryTypesObj != null) {
            final List<String> summaryTypes = (List<String>) summaryTypesObj;
            for (final String summaryType : summaryTypes) {
                final String[] types = summaryType.split(":");
                if (types.length > 1) {
                    summaryTypeMap.put(types[0].trim(), types[1].trim());
                }
            }
        }

        boolean ignoreEmptyRow = false;

        final Object ignoreEmptyRowObj = params.get(CrosstabBuilder.IGNORE_EMPTY_ROW);
        if (ignoreEmptyRowObj != null) {
            ignoreEmptyRow = ObjectUtil.toBoolean(ignoreEmptyRowObj);
        }
        
        boolean omitRow = false;
        final Object omitRowObj = params.get(CrosstabBuilder.OMIT_ROW);
        if (omitRowObj != null) {
        	omitRow = ObjectUtil.toBoolean(omitRowObj);
        }

        String delimiter = (String) params.get(DELIMITER);
        if (delimiter == null || delimiter.trim().isEmpty()) {
            delimiter = DEFAULT_DELIMITER;
        }

        String[] ignoreRowNames = new String[0];

        List<String> ignoreRowNamesObj = (List<String>) params.get(USELESS_ROWNAME);
        if (ignoreRowNamesObj != null) {
            ignoreRowNames = ignoreRowNamesObj.toArray(new String[0]);
        }

        DateFormat dateFormat = getDateFormat(params);
        NumberFormat numberFormat = getNumberFormat(params);

        final CrosstabBuilderType2 crosstabBuilder = CrosstabBuilderType2.builder()
            .columnGroups(columnGroups)
            .rowGroups(rowGroups)
            .horizontalValueGroups(horizontalValueGroups)
            .verticalValueGroups(verticalValueGroups)
            .keyColumns(keyColumns)
            .summaryTypeMap(summaryTypeMap)
            .ignoreEmptyRow(ignoreEmptyRow)
            .omitRow(omitRow)
            .usePrefixRowName(ObjectUtil.toBoolean(params.get(PREFIX_ROW_NAME)))
            .delimiter(delimiter)
            .ignoreRowNames(ignoreRowNames)
            .dateFormat(dateFormat)
            .numberFormat(numberFormat)
            .build();

        return crosstabBuilder.convert(data);
    }

    @SuppressWarnings({ "unchecked", "rawtypes" })
    public static List<Map<String, Object>> reverseToType2(final List<Map<String, Object>> data, final Map<String, Object> params) throws CrosstabException {
        if (data == null || data.isEmpty()) {
            throw new CrosstabException("The data does not exist.");
        }

        String[] columnGroups = {};
        String[] rowGroups = {};
        String[] valueGroups = {};
        String[] horizontalValueGroups = {};
        String[] verticalValueGroups = {};
        String[] keyColumns = {};

        final List<String> columnGroupsObj = (List<String>) params.get(CrosstabBuilder.GROUP_COLUMNS);
        if (columnGroupsObj != null) {
            columnGroups = columnGroupsObj.toArray(new String[] {});
        }

        final List<String> rowGroupsObj = (List<String>) params.get(CrosstabBuilder.GROUP_ROWS);
        if (rowGroupsObj != null) {
            final List<String> tempRowGroups = new ArrayList<>();
            for (final String rowGroup : rowGroupsObj) {
                if (rowGroup.contains(":")) {
                    tempRowGroups.add(rowGroup.split(":")[0]);
                } else {
                    tempRowGroups.add(rowGroup);
                }

            }
            rowGroups = tempRowGroups.toArray(new String[] {});
        }

        final List<String> valueGroupsObj = (List<String>) params.get(GROUP_VALUES);
        if (valueGroupsObj != null) {
            valueGroups = valueGroupsObj.toArray(new String[] {});
        }

        final List<String> horizontalValueGroupsObj = (List<String>) params.get(CrosstabBuilder.GROUP_HORIZONTAL_VALUES);
        if (horizontalValueGroupsObj != null) {
            horizontalValueGroups = horizontalValueGroupsObj.toArray(new String[] {});
            checkValueGroups(params, horizontalValueGroups, valueGroups, GROUP_TYPE_HORIZONTAL);
        }

        final List<String> verticalValueGroupsObj = (List<String>) params.get(CrosstabBuilder.GROUP_VERTICAL_VALUES);
        if (verticalValueGroupsObj != null) {
            verticalValueGroups = verticalValueGroupsObj.toArray(new String[] {});
            checkValueGroups(params, verticalValueGroups, valueGroups, GROUP_TYPE_VERTICAL);
        }

        final List<String> keyColumnsObj = (List<String>) params.get(CrosstabBuilder.DATA_KEYS);
        if (keyColumnsObj != null) {
            keyColumns = keyColumnsObj.toArray(new String[] {});
        }

        final boolean prefixRowName = ObjectUtil.toBoolean(params.get(PREFIX_ROW_NAME));
        final DateFormat dateFormat = getDateFormat(params);

        String delimiter = (String) params.get(DELIMITER);
        if (delimiter == null || delimiter.trim().isEmpty()) {
            delimiter = DEFAULT_DELIMITER;
        }

        final List<Object> ignoreColumns = new ArrayList<>();
        
        final List<List<Object>> columns2 = new ArrayList<>();

        final List<String> columns1 = new ArrayList<>(data.get(0).keySet());

        final Map<Object, Integer> columnIndexMap = CrosstabBuilder.findColumnIndexMap((List) columns1, (List) Arrays.asList(columnGroups));
        columnIndexMap.put(CrosstabBuilder.COLUMN_VALUE_CATEGORY, columnIndexMap.size());

        Collections.sort(columns1, new Comparator<Object>() {

            @Override
            public int compare(final Object col1, final Object col2) {
                final int idx1 = columnIndexMap.get(col1);
                final int idx2 = columnIndexMap.get(col2);
                if (idx1 == -1 && idx2 == -1) {
                    return 0;
                }

                if (idx1 != -1 && idx2 != -1) {
                    return Integer.compare(idx1, idx2);
                }

                return idx1 != -1 ? -1 : 1;
            }

        });

        for (final String column : columns1) {
            if (prefixRowName) {
                final List<String> filteredRowGroups = Arrays.asList(rowGroups).stream()
                    .filter(rowGroup -> column.contains(rowGroup))
                    .collect(Collectors.toList());

                if (filteredRowGroups != null && !filteredRowGroups.isEmpty()) {
                    final List<Object> splitedColumns = new ArrayList<>(Arrays.asList(column.split(delimiter)));
                    for (int i = 0, n = splitedColumns.size(); i < n; i++) {
                        final String splitedColumn = (String) splitedColumns.get(i);
                        for (final String filteredRowGroup : filteredRowGroups) {
                            if (!splitedColumn.startsWith(filteredRowGroup)) {
                                continue;
                            }

                            final String newColumn = splitedColumn.replace(filteredRowGroup + "_", "");

                            final Object dateColumn = toISOString(newColumn, dateFormat);
                            if (dateColumn != null) {
                                splitedColumns.set(i, dateColumn);
                            } else {
                                splitedColumns.set(i, newColumn);
                            }
                        }
                    }

                    columns2.add(splitedColumns);
                } else {
                    if (ArrayUtils.contains(columnGroups, column) || column.equals("CATEGORY") || column.equals("CATEGORY_GROUP")) {
                        columns2.add(new ArrayList<>(Arrays.asList(column.split(delimiter))));
                    } else {
                        ignoreColumns.add(column);
                    }
                }
            } else {
                final List<Object> newColumns = new ArrayList<>(Arrays.asList(column.split(delimiter)));
                for (int i = 0, n = newColumns.size(); i < n; i++) {
                    final String newColumn = (String) newColumns.get(i);

                    final Object dateColumn = toISOString(newColumn, dateFormat);
                    if (dateColumn != null) {
                        newColumns.set(i, dateColumn);
                    }
                }

                columns2.add(newColumns);
            }
        }

        final List<List<Object>> newData = new ArrayList<>();

        for (final Map<String, Object> row : data) {
            final List<Object> newRow = new ArrayList<>();
            for (final String column : columns1) {
                if (ignoreColumns.contains(column)) {
                    continue;
                }

                newRow.add(row.get(column));
            }

            newData.add(newRow);
        }

        boolean ignoreEmptyRow = true;

        final Object ignoreEmptyRowObj = params.get(CrosstabBuilder.IGNORE_EMPTY_ROW);
        if (ignoreEmptyRowObj != null) {
            ignoreEmptyRow = ObjectUtil.toBoolean(ignoreEmptyRowObj);
        }

        final CrosstabBuilderType2 crosstabBuilder = CrosstabBuilderType2.builder()
            .columnGroups(columnGroups)
            .rowGroups(rowGroups)
            .horizontalValueGroups(horizontalValueGroups)
            .verticalValueGroups(verticalValueGroups)
            .keyColumns(keyColumns)
            .summaryTypeMap(Collections.emptyMap())
            .ignoreEmptyRow(ignoreEmptyRow)
            .reverse(true)
            .build();

        return crosstabBuilder.reverse(columns2, newData);
    }

    public static List<Map<String, Object>> convertListOfMap(final Object[] columns, final Object[][] data) {
        final List<Map<String, Object>> listOfMap = new ArrayList<>();

        for (final Object[] row : data) {
            final Map<String, Object> map = new HashMap<>();
            for (int i = 0, n = columns.length; i < n; i++) {
                map.put((String) columns[i], row[i]);
            }
            listOfMap.add(map);
        }

        return listOfMap;
    }

    public static List<Map<String, Object>> convertListOfMap(final List<Object> columns, final List<List<Object>> data) {
        final List<Map<String, Object>> listOfMap = new ArrayList<>();

        for (final List<Object> row : data) {
            final Map<String, Object> map = new HashMap<>();
            for (int i = 0, n = columns.size(); i < n; i++) {
                map.put((String) columns.get(i), row.get(i));
            }
            listOfMap.add(map);
        }

        return listOfMap;
    }

    private static DateFormat getDateFormat(final Map<String, Object> params) {        
        DateFormat dateformat = null;

        try {
            final String dateformatStr = (String) params.get(DATE_FORMAT);
            if (dateformatStr != null && !dateformatStr.isEmpty()) {
                dateformat = new SimpleDateFormat(dateformatStr);

                final String dateformatType = (String) params.get(DATE_FORMAT_TYPE);
                if (dateformatType != null) {
                    if ("ISO8601".equalsIgnoreCase(dateformatType)) {
                        dateformat.setCalendar(ISO8601Calendar.getInstance());
                    } else if (dateformatType.toUpperCase().startsWith("BASE.")) {
                        dateformat.setCalendar(DayofWeekBasedCalendar.getInstance(dateformatType));
                    }
                }
            }
        } catch (final IllegalArgumentException e) {
            log.warning("The date format is not valid.");
        }

        return dateformat == null ? DEFAULT_DATE_FORMAT : dateformat;
    }

    private static NumberFormat getNumberFormat(final Map<String, Object> params) {
        NumberFormat numberFormat = null;

        try {
            final String numberformatStr = (String) params.get(NUMBER_FORMAT);
            if (numberformatStr != null && !numberformatStr.isEmpty()) {
                numberFormat = new DecimalFormat(numberformatStr);
            }
        } catch (final IllegalArgumentException e) {
            log.warning("The number format is not valid.");
        }

        return numberFormat;
    }

    @SuppressWarnings("unchecked")
    private static void checkValueGroups(final Map<String, Object> params, String[] orgValueGroups, final String[] newValueGroups, final String groupType) {
        if (orgValueGroups == null || orgValueGroups.length == 0) {
            String targetGroupType = "";

            final Map<String, Object> targetGroupTypeObj = (Map<String, Object>) params.get(GROUP_TYPE);
            if (targetGroupTypeObj != null) {
                targetGroupType = (String) targetGroupTypeObj.get(GROUP_TYPE);
            }

            if (groupType.equalsIgnoreCase(targetGroupType) && newValueGroups != null && newValueGroups.length > 0) {
                orgValueGroups = newValueGroups;
            }
        }
    }

    private static String toISOString(final String source, final DateFormat format) {
        Date date = parseDateFormat(source, format);
        if (date == null) {
            return null;
        }

        return ISO8601_DATE_FORMAT.format(date);
    }

    private static Date parseDateFormat(final String source, final DateFormat format) {
        if (format == null) {
            return null;
        }

        try {
            return format.parse(source);
        } catch (final ParseException e) {
            return null;
        }
    }

}
