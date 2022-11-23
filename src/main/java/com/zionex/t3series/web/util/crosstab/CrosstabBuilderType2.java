package com.zionex.t3series.web.util.crosstab;

import java.text.DateFormat;
import java.text.NumberFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.SortedSet;
import java.util.TreeSet;

import com.zionex.t3series.util.ArrayUtil;
import com.zionex.t3series.util.time.TimeStamp;
import com.zionex.t3series.web.constant.ServiceConstants;

import lombok.Builder;
import lombok.extern.java.Log;

@Log
@Builder
public class CrosstabBuilderType2 extends CrosstabBuilder {

    private final String[] columnGroups;
    private final String[] rowGroups;

    private final String[] horizontalValueGroups;
    private final String[] verticalValueGroups;

    private final String[] keyColumns;

    private final Map<String, String> summaryTypeMap;

    private final boolean ignoreEmptyRow;
    private final boolean omitRow;

    @SuppressWarnings("unused")
    private final boolean reverse;

    private boolean usePrefixRowName;
    private String delimiter;
    private String[] ignoreRowNames;

    private DateFormat dateFormat;
    private NumberFormat numberFormat;

    private final Map<String, String> aliases = new HashMap<>();
    private final Map<String, String> reverseAliases = new HashMap<>();
    private final Map<String, String> verticalGroup = new HashMap<>();

    public CrosstabBuilderType2(String[] columnGroups, String[] rowGroups, String[] horizontalValueGroups,
            String[] verticalValueGroups, String[] keyColumns, Map<String, String> summaryTypeMap,
            boolean ignoreEmptyRow, boolean omitRow, boolean reverse) {

        this.columnGroups = interpret(columnGroups, reverse, false);
        this.rowGroups = interpret(rowGroups, false, false);

        this.horizontalValueGroups = interpret(horizontalValueGroups, reverse, false);
        this.verticalValueGroups = interpret(verticalValueGroups, reverse, true);

        String[] keyColumnsLocal = interpret(keyColumns, false, false);
        this.keyColumns = reverse ? revert(keyColumnsLocal) : keyColumnsLocal;

        this.summaryTypeMap = summaryTypeMap;

        this.ignoreEmptyRow = ignoreEmptyRow;
        this.omitRow = omitRow;
        this.reverse = reverse;
    }

    public CrosstabBuilderType2(String[] columnGroups, String[] rowGroups, String[] horizontalValueGroups,
            String[] verticalValueGroups, String[] keyColumns, Map<String, String> summaryTypeMap,
            boolean ignoreEmptyRow, boolean omitRow, boolean reverse,
            boolean usePrefixRowName, String delimiter, String[] ignoreRowNames,
            DateFormat dateFormat, NumberFormat numberFormat) {

        this(columnGroups, rowGroups, horizontalValueGroups, verticalValueGroups, keyColumns, summaryTypeMap, ignoreEmptyRow, omitRow, reverse);

        this.usePrefixRowName = usePrefixRowName;
        this.delimiter = delimiter;
        this.ignoreRowNames = ignoreRowNames;

        this.dateFormat = dateFormat;
        this.numberFormat = numberFormat;
    }

    public Map<String, Object> convert(Map<String, Object> data) {
        return convert2(convert1(data));
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> convert1(Map<String, Object> data) {
        Map<String, Object> info = (Map<String, Object>) data.get(PARAMETER_KEY_INFO);
        if (info == null) {
            info = new HashMap<>();
            info.put(ServiceConstants.PARAMETER_KEY_RESULT_SUCCESS, true);
            info.put(ServiceConstants.PARAMETER_KEY_RESULT_CODE, ServiceConstants.RESULT_CODE_SUCCESS);
            info.put(ServiceConstants.PARAMETER_KEY_RESULT_TYPE, ServiceConstants.RESULT_TYPE_ITC_2);
            info.put(ServiceConstants.PARAMETER_KEY_RESULT_MESSAGE, "");
        }

        List<Object> columns = (List<Object>) data.get(RESULT_COLUMNS_1);
        if (columns == null) {
            String message = String.format("Required data does not exist. (required data: %s)", RESULT_COLUMNS_1);
            log.warning(message);
            return getServiceResult(false, ServiceConstants.RESULT_CODE_FAIL, message, data);
        }

        List<List<Object>> orgData = (List<List<Object>>) data.get(RESULT_DATA);
        if (orgData == null) {
            String message = String.format("Required data does not exist. (required data: %s)", RESULT_DATA);
            log.warning(message);
            return getServiceResult(false, ServiceConstants.RESULT_CODE_FAIL, message, data);
        }

        String[] horizontalValueGroupsLocal = Arrays.asList(horizontalValueGroups).stream()
            .filter(c -> columns.contains(c))
            .toArray(String[]::new);

        String[] verticalValueGroupsLocal = Arrays.asList(verticalValueGroups).stream()
            .filter(c -> columns.contains(c))
            .toArray(String[]::new);

        int[] keyColumnIdxes = findColumnIndexes(keyColumns, columns);
        int[] horizontalValueGroupIdxes = findColumnIndexes(horizontalValueGroupsLocal, columns);
        int[] verticalValueGroupIdxes = findColumnIndexes(verticalValueGroupsLocal, columns);
        int[] columnGroupIdxes = findColumnIndexes(columnGroups, columns);
        int[] rowGroupIdxes = findColumnIndexes(rowGroups, columns);

        SortedSet<List<Object>> tempData = new TreeSet<>(getObjectListComparator());
        for (List<Object> row : orgData) {
            List<Object> rowGroups = new ArrayList<>();
            for (int crosstabRowIndex : rowGroupIdxes) {
                rowGroups.add(row.get(crosstabRowIndex));
            }
            tempData.add(rowGroups);
        }

        List<List<Object>> rowGroupDataList = new ArrayList<>(tempData);

        Map<List<Object>, Map<List<Object>, Map<Object, Object>>> rowGroupDataMap = new HashMap<>();
        Map<List<Object>, List<Object>> columnGroupDataMap = new LinkedHashMap<>();

        for (List<Object> row : orgData) {
            List<Object> keyColumnData = extractData(keyColumnIdxes, row);

            Map<List<Object>, Map<Object, Object>> keyValueMap = rowGroupDataMap.get(keyColumnData);
            if (keyValueMap == null) {
                List<Object> columnGroupData = extractData(columnGroupIdxes, row);
                columnGroupDataMap.put(keyColumnData, columnGroupData);

                keyValueMap = new LinkedHashMap<>();
                for (List<Object> rowGroupData : rowGroupDataList) {
                    Map<Object, Object> valueMap = new LinkedHashMap<>();

                    for (String valueKey : horizontalValueGroupsLocal) {
                        String summaryType = summaryTypeMap.get(valueKey);
                        if (CrosstabSummaryData.accept(summaryType)) {
                            valueMap.put(valueKey, new CrosstabSummaryData(valueKey, summaryType));
                        } else {
                            valueMap.put(valueKey, null);
                        }
                    }

                    for (String valueKey : verticalValueGroupsLocal) {
                        String summaryType = summaryTypeMap.get(valueKey);
                        if (CrosstabSummaryData.accept(summaryType)) {
                            valueMap.put(valueKey, new CrosstabSummaryData(valueKey, summaryType));
                        } else {
                            valueMap.put(valueKey, null);
                        }
                    }

                    keyValueMap.put(rowGroupData, valueMap);
                }

                rowGroupDataMap.put(keyColumnData, keyValueMap);
            }

            List<Object> rowGroupData = extractData(rowGroupIdxes, row);
            Map<Object, Object> valueMap = keyValueMap.get(rowGroupData);

            for (int i = 0, n = horizontalValueGroupIdxes.length; i < n; i++) {
                String valuekey = horizontalValueGroupsLocal[i];
                Object valuevalue = row.get(horizontalValueGroupIdxes[i]);

                Object object = valueMap.get(valuekey);
                if (object instanceof CrosstabSummaryData) {
                    ((CrosstabSummaryData) object).append(valuevalue);
                } else {
                    valueMap.put(valuekey, valuevalue);
                }
            }

            for (int i = 0, n = verticalValueGroupIdxes.length; i < n; i++) {
                int valueIdx = verticalValueGroupIdxes[i];
                if (valueIdx >= 0) {
                    String valuekey = verticalValueGroupsLocal[i];
                    Object valuevalue = row.get(valueIdx);

                    Object object = valueMap.get(valuekey);
                    if (object instanceof CrosstabSummaryData) {
                        ((CrosstabSummaryData) object).append(valuevalue);
                    } else {
                        valueMap.put(valuekey, valuevalue);
                    }
                }
            }
        }

        List<List<Object>> resultColumns = makeNewColumns(columnGroups, rowGroups, rowGroupDataList, horizontalValueGroupsLocal, verticalValueGroupsLocal);

        data.put(RESULT_COLUMNS_2, resultColumns);

        List<List<Object>> resultData = makeNewData(rowGroupDataMap, columnGroupDataMap, horizontalValueGroupsLocal, verticalValueGroupsLocal);

        data.put(RESULT_DATA, resultData);

        info.put(GROUP_ROWS, ArrayUtil.join(rowGroups, Crosstab.DEFAULT_DELIMITER));
        info.put(GROUP_COLUMNS, ArrayUtil.join(columnGroups, Crosstab.DEFAULT_DELIMITER));
        info.put(GROUP_HORIZONTAL_VALUES, ArrayUtil.join(horizontalValueGroupsLocal, Crosstab.DEFAULT_DELIMITER));
        info.put(GROUP_VERTICAL_VALUES, ArrayUtil.join(verticalValueGroupsLocal, Crosstab.DEFAULT_DELIMITER));
        info.put(DATA_KEYS, ArrayUtil.join(keyColumns, Crosstab.DEFAULT_DELIMITER));

        return data;
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> convert2(Map<String, Object> data) {
        Map<String, Object> info = (Map<String, Object>) data.get(PARAMETER_KEY_INFO);
        if (info == null) {
            info = new HashMap<>();
            info.put(ServiceConstants.PARAMETER_KEY_RESULT_SUCCESS, true);
            info.put(ServiceConstants.PARAMETER_KEY_RESULT_CODE, ServiceConstants.RESULT_CODE_SUCCESS);
            info.put(ServiceConstants.PARAMETER_KEY_RESULT_TYPE, ServiceConstants.RESULT_TYPE_ITC_2);
            info.put(ServiceConstants.PARAMETER_KEY_RESULT_MESSAGE, "");
        }

        List<List<Object>> orgColumns = (List<List<Object>>) data.get(RESULT_COLUMNS_2);
        if (orgColumns == null) {
            String message = String.format("Required data does not exist. (required data: %s)", RESULT_COLUMNS_2);
            log.warning(message);
            return getServiceResult(false, ServiceConstants.RESULT_CODE_FAIL, message, data);
        }

        List<List<Object>> orgData = (List<List<Object>>) data.get(RESULT_DATA);
        if (orgData == null) {
            String message = String.format("Required data does not exist. (required data: %s)", RESULT_DATA);
            log.warning(message);
            return getServiceResult(false, ServiceConstants.RESULT_CODE_FAIL, message, data);
        }

        String[] columnGroups = splitAndTrim(info.get(GROUP_COLUMNS));
        String[] rowGroups = null;
        if (usePrefixRowName) {
            rowGroups = splitAndTrim(info.get(GROUP_ROWS));
        }
        
        DateFormat stdDateFormat = new SimpleDateFormat(DATE_FORMAT_PATTERN);

        List<Object> newColumns = new ArrayList<>();
        for (List<Object> orgColumn : orgColumns) {
            StringBuilder builder = new StringBuilder();

            for (int i = 0, n = orgColumn.size(); i < n; i++) {
                Object columnItem = orgColumn.get(i);
                if (columnItem == null) {
                    continue;
                }

                String columnName = columnItem.toString();
                if (ignoreRowNames != null && ignoreRowNames.length > 0 && ArrayUtil.contains(ignoreRowNames, columnName)) {
                    continue;
                }
                
                if (columnName.matches(DATE_FORMAT_REGEX)) {
            		try {
            			columnItem = stdDateFormat.parse(columnName);
					} catch (Exception e) {
						log.warning(e.getMessage());
					}
            	}

                if (dateFormat != null && columnItem instanceof Date) {
                    columnName = dateFormat.format((Date) columnItem);
                } else if (dateFormat != null && columnItem instanceof TimeStamp) {
                    columnName = dateFormat.format(((TimeStamp) columnItem).toDate());
                } else if (numberFormat != null && columnItem instanceof Number) {
                    columnName = numberFormat.format(columnItem);
                }

                if (usePrefixRowName && !COLUMN_VALUE_CATEGORY.equals(columnName)
                        && !COLUMN_VALUE_CATEGORY_GROUP.equals(columnName)
                        && !ArrayUtil.contains(columnGroups, columnName) && i < rowGroups.length) {
                    columnName = rowGroups[i] + "_" + columnName;
                }

                if (builder.length() > 0) {
                    builder.append(delimiter);
                }
                builder.append(columnName);
            }

            newColumns.add(builder.toString());
        }
        
        data.put(ServiceConstants.PARAMETER_KEY_COLUMNS_1, newColumns);

        info.put(ServiceConstants.PARAMETER_KEY_RESULT_CODE, ServiceConstants.RESULT_CODE_SUCCESS);
        info.put(ServiceConstants.PARAMETER_KEY_RESULT_MESSAGE, ServiceConstants.RESULT_MESSAGE_SUCCESS);
        
        return data;
    }

    public List<Map<String, Object>> reverse(List<List<Object>> columns, List<List<Object>> data) {
        List<Object> reverseColumns = getReverseColumns(columns);

        int[] keyColumnIdxes = findColumnIndexes(keyColumns, reverseColumns);

        String[] filteredColumnGroups = Arrays.asList(columnGroups).stream()
            .filter(columnGroup -> reverseColumns.contains(columnGroup))
            .toArray(String[]::new);

        Object[] nullColumnArray = new Object[filteredColumnGroups.length];
        List<Object> nullRowList = Arrays.asList(new Object[rowGroups.length + horizontalValueGroups.length + verticalValueGroups.length]);

        List<Object> tempColumns = new ArrayList<>();
        tempColumns.addAll(Arrays.asList(filteredColumnGroups));
        tempColumns.addAll(Arrays.asList(horizontalValueGroups));
        tempColumns.addAll(Arrays.asList(verticalValueGroups));
        tempColumns.addAll(Arrays.asList(rowGroups));

        int categoryIdx = -1;
        int categoryGroupIdx = -1;

        boolean hasVertical = verticalValueGroups.length > 0;
        if (hasVertical) {
            categoryIdx = findColumnIndex(COLUMN_VALUE_CATEGORY, reverseColumns);
            categoryGroupIdx = findColumnIndex(COLUMN_VALUE_CATEGORY_GROUP, reverseColumns);
        }

        int columnMaxIndex = findMaxColumnIndex(columnGroups, reverseColumns);
        int columnEndIndex = Math.max(columnMaxIndex, filteredColumnGroups.length - 1);

        Map<List<Object>, Map<List<Object>, List<Object>>> tempData = new LinkedHashMap<>();

        Set<Object> checkColumns = new HashSet<>();

        for (List<Object> row : data) {
            List<Object> newKeyColumns = extractData(keyColumnIdxes, row);

            Map<List<Object>, List<Object>> tempRows = tempData.get(newKeyColumns);
            if (tempRows == null) {
                tempRows = new LinkedHashMap<>();
                tempData.put(newKeyColumns, tempRows);
            }

            List<Object> columnData = Arrays.asList(nullColumnArray);

            for (int i = 0; i < columnEndIndex + 1; i++) {
                Object item = row.get(i);
                if (i <= columnEndIndex) {
                    int index = tempColumns.indexOf(reverseColumns.get(i));
                    if (index >= 0) {
                        checkColumns.add(reverseColumns.get(i));
                        columnData.set(index, item);
                    }
                }
            }

            Object targetVertical = null;

            for (int i = columnEndIndex + 1, n = row.size(); i < n; i++) {
                if (hasVertical && i == categoryGroupIdx) {
                    continue;
                }

                Object item = row.get(i);
                if (hasVertical && i == categoryIdx) {
                    targetVertical = item;
                    continue;
                }

                if (horizontalValueGroups.length == 0) {
                    List<Object> subColumns = columns.get(i);
                    List<Object> tempRow = tempRows.get(subColumns);
                    if (tempRow == null) {
                        tempRow = new ArrayList<>();
                        tempRow.addAll(columnData);
                        tempRow.addAll(nullRowList);
                        tempRows.put(subColumns, tempRow);

                        for (int j = 0, s = subColumns.size(); j < s; j++) {
                            Object key = rowGroups[j];
                            Object value = subColumns.get(j);

                            int index = tempColumns.indexOf(key);
                            if (index >= 0) {
                                checkColumns.add(key);
                                tempRow.set(index, value);
                            }
                        }
                    }

                    if (item != null && hasVertical && targetVertical != null) {
                        int index = tempColumns.indexOf(targetVertical);
                        if (index >= 0) {
                            checkColumns.add((String) targetVertical);
                            tempRow.set(index, item);
                        }
                    }
                } else {
                    List<Object> subColumns = columns.get(i);
                    List<Object> subList = subColumns.subList(0, subColumns.size() - 1);
                    if (subList.isEmpty()) {
                        continue;
                    }

                    List<Object> tempRow = tempRows.get(subList);
                    if (tempRow == null) {
                        tempRow = new ArrayList<>();
                        tempRow.addAll(columnData);
                        tempRow.addAll(nullRowList);
                        tempRows.put(subList, tempRow);

                        for (int j = 0, s = subColumns.size(); j < s - 1; j++) {
                            Object key = rowGroups[j];
                            Object value = subColumns.get(j);

                            int index = tempColumns.indexOf(key);
                            if (index >= 0) {
                                checkColumns.add(key);
                                tempRow.set(index, value);
                            }
                        }
                    }

                    if (item != null) {
                        for (int j = 0, s = subColumns.size(); j < s; j++) {
                            Object key = null;
                            Object value = subColumns.get(j);

                            if (j == s - 1) {
                                if (value.equals(ROW_VALUE_VALUE)) {
                                    key = targetVertical;
                                    value = item;
                                } else {
                                    key = value;
                                    value = item;
                                }

                                int index = tempColumns.indexOf(key);
                                if (index >= 0) {
                                    checkColumns.add(key);
                                    tempRow.set(index, value);
                                }
                            }
                        }
                    }
                }
            }
        }

        List<Object> newColumns = new ArrayList<>();
        for (Object tempColumn : tempColumns) {
            if (checkColumns.contains(tempColumn)) {
                Object newColumn = reverseAliases.get(tempColumn);
                if (newColumn == null) {
                    newColumns.add(tempColumn);
                } else {
                    newColumns.add(newColumn);
                }
            }
        }

        List<List<Object>> newData = new ArrayList<>();
        for (Map<List<Object>, List<Object>> tempRow : tempData.values()) {
            for (List<Object> valueRow : tempRow.values()) {
                boolean isValid = false;
                
                List<Object> newRow = new ArrayList<>();

                for (int i = 0, n = tempColumns.size(); i < n; i++) {
                    Object tempColumn = tempColumns.get(i);
                    if (!checkColumns.contains(tempColumn)) {
                        continue;
                    }

                    Object value = valueRow.get(i);
                    newRow.add(value);
                    if (ArrayUtil.contains(horizontalValueGroups, tempColumn) || ArrayUtil.contains(verticalValueGroups, tempColumn)) {
                        isValid |= (value != null);
                    }
                }

                if (!ignoreEmptyRow || isValid) {
                    newData.add(newRow);
                }

            }
        }

        return Crosstab.convertListOfMap(newColumns, newData);
    }

    private List<List<Object>> makeNewColumns(String[] columnGroups, String[] rowGroups,
            List<List<Object>> rowGroupDataList, String[] horizontalValueGroupsLocal, String[] verticalValueGroupsLocal) {

        List<List<Object>> resultColumns = new ArrayList<>();
        for (String columnGroup : columnGroups) {
            List<Object> each = new ArrayList<>();
            each.add(aliases.get(columnGroup));
            resultColumns.add(each);
        }

        if (verticalValueGroupsLocal.length > 0) {
            if (!verticalGroup.isEmpty()) {
                List<Object> categoryGroup = new ArrayList<>();
                categoryGroup.add(COLUMN_VALUE_CATEGORY_GROUP);
                resultColumns.add(categoryGroup);
            }

            List<Object> category = new ArrayList<>();
            category.add(COLUMN_VALUE_CATEGORY);
            resultColumns.add(category);
        }

        for (List<Object> rowGroupData : rowGroupDataList) {
            if (verticalValueGroupsLocal.length > 0 && horizontalValueGroupsLocal.length > 0) {
                List<Object> verticalList = new ArrayList<>();
                verticalList.addAll(rowGroupData);
                verticalList.add(ROW_VALUE_VALUE);
                resultColumns.add(verticalList);

                for (String horizontalValueGroup : horizontalValueGroupsLocal) {
                    List<Object> each = new ArrayList<>();
                    each.addAll(rowGroupData);
                    each.add(aliases.get(horizontalValueGroup));
                    resultColumns.add(each);
                }
            } else if (verticalValueGroupsLocal.length == 0 && horizontalValueGroupsLocal.length > 0) {
                for (String horizontalValueGroup : horizontalValueGroupsLocal) {
                    List<Object> each = new ArrayList<>();
                    each.addAll(rowGroupData);
                    if (horizontalValueGroupsLocal.length > 1) {
                        each.add(aliases.get(horizontalValueGroup));
                    }
                    resultColumns.add(each);
                }

            } else if (verticalValueGroupsLocal.length > 0 && horizontalValueGroupsLocal.length == 0) {
                List<Object> each = new ArrayList<>();
                each.addAll(rowGroupData);
                if (rowGroups.length == 0) {
                    each.add(ROW_VALUE_VALUE);
                }
                resultColumns.add(each);
            }
        }
        return resultColumns;
    }

    private List<List<Object>> makeNewData(Map<List<Object>, Map<List<Object>, Map<Object, Object>>> rowGroupDataMap,
            Map<List<Object>, List<Object>> columnGroupDataMap, String[] horizontalValueGroupsLocal, String[] verticalValueGroupsLocal) {

        List<List<Object>> resultData = new ArrayList<>();

        for (Map.Entry<List<Object>, List<Object>> entry : columnGroupDataMap.entrySet()) {
            Map<List<Object>, Map<Object, Object>> newColumnValues = rowGroupDataMap.get(entry.getKey());

            if (newColumnValues == null) {
                continue;
            }

            if (verticalValueGroupsLocal.length > 0) {
                for (String verticalValueKey : verticalValueGroupsLocal) {
                    List<Object> each = new ArrayList<>();

                    each.addAll(entry.getValue());

                    if (!verticalGroup.isEmpty()) {
                        String grpKey = verticalGroup.get(verticalValueKey);
                        if (grpKey != null) {
                            each.add(grpKey);
                        } else {
                            each.add("");
                        }
                    }

                    each.add(aliases.get(verticalValueKey));

                    boolean isValid = false;
                    double total = 0;

                    for (Map<Object, Object> values : newColumnValues.values()) {
                        Object verticalValue = values.get(verticalValueKey);

                        isValid |= (verticalValue != null);
                        
                        double tempVal = 0;
                        if (verticalValue instanceof CrosstabSummaryData) {
                        	Object summaryObj = ((CrosstabSummaryData) verticalValue).getSummary();
                            if (summaryObj != null) {
                            	tempVal = ((Number) summaryObj).doubleValue();
                            	each.add(summaryObj);
                            }
                        	isValid = (summaryObj != null);
                        } else {
                        	if (verticalValue instanceof Number) {
                        		tempVal = ((Number) verticalValue).doubleValue();
                        	}
                            each.add(verticalValue);
                        }
                        
                        total += tempVal;

                        for (String horizontalValueKey : horizontalValueGroupsLocal) {
                            Object horizontalValue = values.get(horizontalValueKey);

                            isValid |= (horizontalValue != null);
                            if (horizontalValue instanceof CrosstabSummaryData) {
                                each.add(((CrosstabSummaryData) horizontalValue).getSummary());
                            } else {
                                each.add(horizontalValue);
                            }
                        }
                    }

                    boolean isOmit = omitRow && total == 0;
                    if (!isOmit && (!ignoreEmptyRow || isValid)) {
                    	resultData.add(each);
                    }
                }

            } else {
                List<Object> each = new ArrayList<>();
                each.addAll(entry.getValue());

                boolean isValid = false;
                for (Map<Object, Object> values : newColumnValues.values()) {
                    for (String horizontalValueKey : horizontalValueGroupsLocal) {
                        Object horizontalValue = values.get(horizontalValueKey);

                        isValid |= (horizontalValue != null);
                        if (horizontalValue instanceof CrosstabSummaryData) {
                            each.add(((CrosstabSummaryData) horizontalValue).getSummary());
                        } else {
                            each.add(horizontalValue);
                        }
                    }
                }

                if (!ignoreEmptyRow || isValid) {
                    resultData.add(each);
                }
            }
        }

        return resultData;
    }

    private List<Object> extractData(int[] indexes, List<Object> data) {
        List<Object> newData = new ArrayList<>();
        for (int index : indexes) {
            newData.add(data.get(index));
        }
        return newData;
    }

    private String[] interpret(String[] values, boolean reverse, boolean isApplyVerticalGroup) {
        String[] result = new String[values.length];
        for (int i = 0, n = values.length; i < n; i++) {
            String value = values[i];

            String[] split = value.split(":");
            if (split.length > 1) {
                String k = split[0] == null ? "" : split[0].trim();
                String v = split[1] == null ? "" : split[1].trim();

                if (v.isEmpty()) {
                    result[i] = k;
                    aliases.put(k, k);
                } else {
                    result[i] = reverse ? v : k;
                    aliases.put(k, v);
                    reverseAliases.put(v, k);
                }

                if (isApplyVerticalGroup && verticalGroup != null && split.length > 2) {
                    String g = split[2] == null ? "" : split[2].trim();
                    if (!g.isEmpty()) {
                        verticalGroup.put(k, g);
                    }
                }
            } else {
                result[i] = split[0];
                aliases.put(split[0], split[0]);
            }
        }

        return result;
    }

    private String[] revert(String[] keyColumnsLocal) {
        String[] result = new String[keyColumnsLocal.length];
        for (int i = 0, n = keyColumnsLocal.length; i < n; i++) {
            String value = keyColumnsLocal[i];
            result[i] = aliases.containsKey(value) ? aliases.get(value) : value;
        }
        return result;
    }

    private List<Object> getReverseColumns(List<List<Object>> columns) {
        List<Object> reverseColumns = new ArrayList<>();
        for (List<Object> each : columns) {
            if (each == null) {
                reverseColumns.add(each);
            } else if (each.size() == 1) {
                reverseColumns.add(each.get(0));
            } else {
                reverseColumns.add(each.toString());
            }
        }

        return reverseColumns;
    }

    private String[] splitAndTrim(Object value) {
        if (value == null || value.toString().trim().isEmpty()) {
            return new String[] {};
        }

        String[] split = value.toString().split(delimiter);
        for (int i = 0, s = split.length; i < s; i++) {
            split[i] = split[i].trim();
        }
        return split;
    }

}
