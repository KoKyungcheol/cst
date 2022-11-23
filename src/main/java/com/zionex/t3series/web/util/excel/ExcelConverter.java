package com.zionex.t3series.web.util.excel;

import static org.apache.poi.ss.usermodel.CellType.BOOLEAN;
import static org.apache.poi.ss.usermodel.CellType.NUMERIC;
import static org.apache.poi.ss.usermodel.CellType.STRING;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.text.DecimalFormat;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zionex.t3series.util.ObjectUtil;
import com.zionex.t3series.web.constant.ServiceConstants;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFFormulaEvaluator;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.ss.formula.BaseFormulaEvaluator;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellType;
import org.apache.poi.ss.usermodel.CellValue;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row.MissingCellPolicy;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFCell;
import org.apache.poi.xssf.usermodel.XSSFFormulaEvaluator;
import org.apache.poi.xssf.usermodel.XSSFRow;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.json.simple.JSONArray;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;

public class ExcelConverter {

    private final List<String> DATETIME_DATA_TYPE = new ArrayList<>(Arrays.asList("DATETIME", "DATE"));
    private final SimpleDateFormat DATE_FORMAT = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss");

    public ExcelConverter() {
    }

    @SuppressWarnings("unchecked")
    public String toJson(File file) throws IOException, ParseException {
        String extension = FilenameUtils.getExtension(file.getName());
        if (!"xls".equals(extension) && !"xlsx".equals(extension)) {
            return "";
        }

        JSONArray resultData;
        if ("xls".equals(extension)) {
            resultData = createJsonFromXLS(file);
        } else {
            resultData = createJsonFromXLSX(file);
        }

        JSONObject finalData = new JSONObject();
        finalData.put(ServiceConstants.PARAMETER_KEY_RESULT_SUCCESS, true);
        finalData.put(ServiceConstants.PARAMETER_KEY_RESULT_MESSAGE, resultData.size() + " rows imported.");
        finalData.put(ServiceConstants.PARAMETER_KEY_RESULT_DATA, resultData);

        return finalData.toString();
    }

    @SuppressWarnings("unchecked")
    private JSONArray createJsonFromXLSX(File uploadExcelFile) throws IOException, ParseException {
        JSONArray resultRows = new JSONArray();

        FileInputStream fis = new FileInputStream(uploadExcelFile);
        XSSFWorkbook workbook = (XSSFWorkbook) WorkbookFactory.create(fis);
        workbook.setMissingCellPolicy(MissingCellPolicy.CREATE_NULL_AS_BLANK);
        XSSFSheet sheet = workbook.getSheetAt(0);

        JSONObject bindingInfo = (JSONObject) new JSONParser().parse(readExcelRowXLSX(workbook, sheet.getRow(0), null).get(0).toString());
        String bindingFields = ObjectUtil.toString(bindingInfo.get("BINDING_FIELDS"));
        String fieldTypes = ObjectUtil.toString(bindingInfo.get("FIELD_TYPES"));
        int dataBeginIdx = ObjectUtil.toInteger(bindingInfo.get("DATA_BEGIN_IDX"));
        String importExceptFields = ObjectUtil.toString(bindingInfo.get("IMPORT_EXCEPT_FIELDS"));
        String categoryLang = ObjectUtil.toString(bindingInfo.get("CATEGORY_LANG"));

        Map<String, String> bindingFieldsMap = new ObjectMapper().readValue(bindingFields, new TypeReference<Map<String, String>>() {
        });

        Map<String, String> fieldTypesMap = new ObjectMapper().readValue(fieldTypes, new TypeReference<Map<String, String>>() {
        });

        Map<String, String> importExceptFieldsMap = new ObjectMapper().readValue(importExceptFields, new TypeReference<Map<String, String>>() {
        });

        Map<String, String> categoryLangMap = new ObjectMapper().readValue(categoryLang, new TypeReference<Map<String, String>>() {
        });

        ArrayList<String> excelColumns = new ArrayList<>();
        int fieldsCount = bindingFieldsMap.keySet().size();
        for (int keyIdx = 0; keyIdx < fieldsCount; keyIdx++) {
            String columnName = ObjectUtil.toString(bindingFieldsMap.get(ObjectUtil.toString(keyIdx)));
            if (!importExceptFieldsMap.containsValue(columnName)) {
                excelColumns.add(columnName);
            }
        }

        int indexOfCategoryColumn = excelColumns.indexOf("CATEGORY");
        int rowCount = sheet.getPhysicalNumberOfRows();

        for (int r = dataBeginIdx; r < rowCount; r++) {
            XSSFRow dataRow = sheet.getRow(r);
            if (dataRow == null) {
                continue;
            }

            ArrayList<Object> rowDatas = readExcelRowXLSX(workbook, dataRow, fieldTypesMap);

            if (!categoryLangMap.isEmpty() && indexOfCategoryColumn >= 0 && indexOfCategoryColumn < rowDatas.size()) {
                String categoryValue = ObjectUtil.toString(rowDatas.get(indexOfCategoryColumn));
                String keyByValue = getKeyByValue(categoryLangMap, categoryValue);
                rowDatas.set(indexOfCategoryColumn, keyByValue);
            }

            if (!rowDatas.isEmpty()) {
                resultRows.add(getSingleRow(excelColumns, rowDatas, rowDatas.size()));
            }
        }

        workbook.close();

        return resultRows;
    }

    @SuppressWarnings("unchecked")
    private JSONArray createJsonFromXLS(File uploadExcelFile) throws IOException, ParseException {
        JSONArray resultRows = new JSONArray();

        FileInputStream fis = new FileInputStream(uploadExcelFile);
        HSSFWorkbook workbook = (HSSFWorkbook) WorkbookFactory.create(fis);
        workbook.setMissingCellPolicy(MissingCellPolicy.CREATE_NULL_AS_BLANK);
        HSSFSheet sheet = workbook.getSheetAt(0);

        JSONObject bindingInfo = (JSONObject) new JSONParser().parse(readExcelRowXLS(workbook, sheet.getRow(0), null).get(0).toString());
        String bindingFields = ObjectUtil.toString(bindingInfo.get("BINDING_FIELDS"));
        String fieldTypes = ObjectUtil.toString(bindingInfo.get("FIELD_TYPES"));
        int dataBeginIdx = ObjectUtil.toInteger(bindingInfo.get("DATA_BEGIN_IDX"));
        String importExceptFields = ObjectUtil.toString(bindingInfo.get("IMPORT_EXCEPT_FIELDS"));
        String categoryLang = ObjectUtil.toString(bindingInfo.get("CATEGORY_LANG"));

        Map<String, String> bindingFieldsMap = new ObjectMapper().readValue(bindingFields, new TypeReference<Map<String, String>>() {
        });

        Map<String, String> fieldTypesMap = new ObjectMapper().readValue(fieldTypes, new TypeReference<Map<String, String>>() {
        });

        Map<String, String> importExceptFieldsMap = new ObjectMapper().readValue(importExceptFields, new TypeReference<Map<String, String>>() {
        });

        Map<String, String> categoryLangMap = new ObjectMapper().readValue(categoryLang, new TypeReference<Map<String, String>>() {
        });

        ArrayList<String> excelColumns = new ArrayList<>();
        int fieldsCount = bindingFieldsMap.keySet().size();
        for (int keyIdx = 0; keyIdx < fieldsCount; keyIdx++) {
            String columnName = ObjectUtil.toString(bindingFieldsMap.get(ObjectUtil.toString(keyIdx)));
            if (!importExceptFieldsMap.containsValue(columnName)) {
                excelColumns.add(columnName);
            }
        }

        int indexOfCategoryColumn = excelColumns.indexOf("CATEGORY");
        int rowCount = sheet.getPhysicalNumberOfRows();

        for (int r = dataBeginIdx; r < rowCount; r++) {
            HSSFRow dataRow = sheet.getRow(r);
            ArrayList<Object> rowDatas = readExcelRowXLS(workbook, dataRow, fieldTypesMap);

            if (!categoryLangMap.isEmpty() && indexOfCategoryColumn >= 0) {
                String categoryValue = ObjectUtil.toString(rowDatas.get(indexOfCategoryColumn));
                String keyByValue = getKeyByValue(categoryLangMap, categoryValue);
                rowDatas.set(indexOfCategoryColumn, keyByValue);
            }

            if (!rowDatas.isEmpty()) {
                resultRows.add(getSingleRow(excelColumns, rowDatas, rowDatas.size()));
            }
        }

        workbook.close();

        return resultRows;
    }

    private ArrayList<Object> readExcelRowXLSX(XSSFWorkbook workbook, XSSFRow row, Map<String, String> fieldTypesMap) {
        ArrayList<Object> rowDataList = new ArrayList<>();
        XSSFFormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

        for (int c = 0; c < row.getLastCellNum(); c++) {
            XSSFCell cell = row.getCell(c, MissingCellPolicy.CREATE_NULL_AS_BLANK);
            readCellData(rowDataList, evaluator, fieldTypesMap, c, cell);
        }

        boolean rowEvalFlag = false;
        for (int i = 0; i < rowDataList.size(); i++) {
            if (ObjectUtil.toString(rowDataList.get(i)).length() > 0) {
                rowEvalFlag = true;
            }
        }

        if (rowDataList.size() <= 0 || !rowEvalFlag) {
            rowDataList.clear();
        }

        return rowDataList;
    }

    private ArrayList<Object> readExcelRowXLS(HSSFWorkbook workbook, HSSFRow row, Map<String, String> fieldTypesMap) {
        ArrayList<Object> rowDataList = new ArrayList<>();
        HSSFFormulaEvaluator evaluator = workbook.getCreationHelper().createFormulaEvaluator();

        for (int c = 0; c < row.getLastCellNum(); c++) {
            HSSFCell cell = row.getCell(c, MissingCellPolicy.CREATE_NULL_AS_BLANK);
            readCellData(rowDataList, evaluator, fieldTypesMap, c, cell);
        }

        boolean rowEvalFlag = false;
        for (int i = 0; i < rowDataList.size(); i++) {
            if (ObjectUtil.toString(rowDataList.get(i)).length() > 0) {
                rowEvalFlag = true;
            }
        }

        if (rowDataList.size() <= 0 || !rowEvalFlag) {
            rowDataList.clear();
        }

        return rowDataList;
    }

    @SuppressWarnings("unchecked")
    private JSONObject getSingleRow(ArrayList<String> excelColumns, ArrayList<Object> rowDatas, int dataSize) {
        JSONObject row = new JSONObject();
        for (int columnIdx = 0; columnIdx < excelColumns.size(); columnIdx++) {
            if (columnIdx < dataSize) {
                row.put(excelColumns.get(columnIdx), rowDatas.get(columnIdx));
            }
        }
        return row;
    }

    private void readCellData(ArrayList<Object> rowDataList, BaseFormulaEvaluator evaluator, Map<String, String> fieldTypesMap, int c, Cell cell) {
        if (cell != null) {
            String data = null;
            CellValue cellValue = evaluator.evaluate(cell);

            if (cellValue != null) {
                CellType cellType = cellValue.getCellType();
                switch (cellType) {
                    case BOOLEAN:
                        rowDataList.add(cell.getBooleanCellValue());
                        break;
                    case STRING:
                        rowDataList.add(cell.getStringCellValue());
                        break;
                    case NUMERIC:
                        if (DateUtil.isCellDateFormatted(cell) || DATETIME_DATA_TYPE.contains(fieldTypesMap.get(ObjectUtil.toString(c)))) {
                            data = DATE_FORMAT.format(cell.getDateCellValue());
                            rowDataList.add(data);
                        } else {
                            rowDataList.add(cell.getNumericCellValue());
                        }
                        break;
                    case FORMULA:
                        DecimalFormat df = new DecimalFormat();
                        if (!StringUtils.isEmpty(cell.toString())) {
                            CellType evalCellType = evaluator.evaluate(evaluator.evaluateInCell(cell)).getCellType();
                            if (evalCellType == NUMERIC) {
                                double fddata = cell.getNumericCellValue();
                                data = df.format(fddata);
                            } else if (evalCellType == STRING) {
                                data = cell.getStringCellValue();
                            } else if (evalCellType == BOOLEAN) {
                                boolean fbdata = cell.getBooleanCellValue();
                                data = String.valueOf(fbdata);
                            }
                            rowDataList.add(data);
                        }
                        break;
                    case BLANK:
                        rowDataList.add("");
                        break;
                    case _NONE:
                        break;
                    case ERROR:
                        break;
                }
            } else {
                rowDataList.add("");
            }
        } else {
            rowDataList.add("");
        }
    }

    private String getKeyByValue(Map<String, String> map, String value) {
        for (Entry<String, String> entry : map.entrySet()) {
            if (entry.getValue().equals(value)) {
                return entry.getKey();
            }
        }
        return null;
    }

}
