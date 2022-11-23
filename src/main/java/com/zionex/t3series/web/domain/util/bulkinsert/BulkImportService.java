package com.zionex.t3series.web.domain.util.bulkinsert;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.FileReader;
import java.io.FileWriter;
import java.io.InputStreamReader;
import java.sql.BatchUpdateException;
import java.sql.CallableStatement;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.sql.Types;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.TreeMap;
import java.util.concurrent.Future;
import java.util.concurrent.atomic.AtomicInteger;

import javax.sql.DataSource;

import com.zionex.t3series.web.ApplicationProperties;
import com.zionex.t3series.web.domain.util.filestorage.FileStorage;
import com.zionex.t3series.web.domain.util.filestorage.FileStorageService;

import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.scheduling.annotation.AsyncResult;
import org.springframework.stereotype.Service;

import lombok.Builder;
import lombok.Data;
import lombok.extern.java.Log;

@Service
@Log
public class BulkImportService {

    private static final int MAX_BATCH_SIZE = 4000;
    private static final int MIN_BATCH_SIZE = 20;
    private static final int MAX_ERRORS = 100000;
    private static final int MAX_SPLIT_SIZE = 100;

    private static final String ERROR_HEADER_TITLE = "ERROR";
    private static final String SPLITER_COMMMAR = ",";
    private static final String SPLITER_TAB = "\t";
    public static final String MODE_INSERT = "INSERT";
    public static final String MODE_UPDATE = "UPDATE";
    public static final String MODE_ADD = "INSERT_AND_UPDATE";
    public static final String MODE_EXPORT_DATA = "EXPORT_DATA";
    public static final String MODE_EXPORT_HEADER = "EXPORT_HEADER";

    private String SPLITER;
    private boolean bDelete;

    @Autowired
    @Qualifier("dataSource")
    DataSource dataSource;

    @Autowired
    ImportJobRepository importJobRepository;

    @Autowired
    ImportFileRepository importFileRepository;

    @Autowired
    FileStorageService fileStorageService;

    @Autowired
    ImportSchemaService importSchemaService;

    private final String rootPath;

    @Value("${spring.datasource.platform}")
    private String databaseType;

    @Autowired
    public BulkImportService(ApplicationProperties applicationProperties) {
        rootPath = applicationProperties.getService().getFile().getExternalPath();
    }

    public void makeCSVFromTable(final FileStorage fileStorage, final String workType, final String moduleName,
            final String tableName, final String userId, final String spliterType) {
        
        try {
            setSpliter(spliterType);

            final TableSchema tableSchema = getTableSchema(setMode(false, workType), moduleName, tableName, userId).initParser();

            log.info("BulkImportService - Meta JSON Parsing and Make Query Starting");

            tableSchema.doParsing();
            tableSchema.makeQuery();

            if (MODE_EXPORT_DATA.equals(tableSchema.getWorkType())) {
                DBQuery dbQuery = null;
                
                try {
                    log.info("BulkImportService - Table (" + tableName + ")  Select Start for Export");
                    
                    dbQuery = getDBHandleForSelect(fileStorage, tableSchema).active();
                    dbQuery.exportJob(MAX_BATCH_SIZE);
                    
                    log.info("BulkImportService - Table (" + tableName + ")  Select Complete");

                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    assert dbQuery != null;
                    try {
                        dbQuery.finish();
                    }
                    catch (Exception e) {
                        e.printStackTrace();
                    }
                }
                
            } else if (MODE_EXPORT_HEADER.equals(tableSchema.getWorkType())) {
                makeCSVOnlyHeader(tableSchema, fileStorage);
                log.info("BulkImportService - Table (" + tableName + ") Header Select Complete");
            }
        }
        catch (Exception ex) {
            ex.printStackTrace();
        }
    }

    private void makeCSVOnlyHeader(final TableSchema tableSchema, final FileStorage fileStorage) {
        FileWriter writer = null;

        try {
            writer = new FileWriter(getCSVFileAbsolutePath(fileStorage));
            
            String csvString = String.join(SPLITER, tableSchema.getJsonHeaders());
            writer.write(csvString);
            
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            assert writer != null;
            try {
                writer.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }
    }

    @Async("csvJOBExecutor")
    public Future<String> saveAllDataInFiles(final String workType, final String moduleName, final String tableName,
            final String jobLevel, final String jobStep, final List<FileStorage> files,  final String spliterType, 
            final String userId, ImportJob jobHistory) {
        
        // Information
        final AtomicInteger totalInsertSum = new AtomicInteger();
        final AtomicInteger totalFailSum = new AtomicInteger();
        final List<ResultDetail> errorDetailSummary = new ArrayList<>();

        final int jobId = jobHistory.getId();

        String procedureDesc = "";
        boolean procedureResult = true;
        String failMessage = null;
        
        try {
            setSpliter(spliterType);
            
            final TableSchema tableSchema = getTableSchema(setMode(true, workType), moduleName, tableName, userId).initParser();

            log.info("BulkImportService - Meta JSON Parsing and Make Query Starting");
            tableSchema.doParsing();
            tableSchema.makeQuery();

            DBQuery deleteHandle = null;

            try {
                if (bDelete) {
                    deleteHandle = getDBHandleForDeleteAndProcedure().active();

                    try {
                        List<String> tables = importSchemaService.getLowerLevelTables(moduleName, tableName);
                        assert tables != null;
                        
                        for (String table : tables) {
                            log.info("BulkImportService - delete Start " + table + " table");
                            deleteHandle.delete(table);
                            log.info("BulkImportService - delete complete " + table + " table");
                        }
                        
                    } catch (Exception ex) {
                        ex.printStackTrace();
                    }

                    log.info("BulkImportService - delete Start " + tableName + " table");
                    deleteHandle.delete(tableName);
                    log.info("BulkImportService - delete complete " + tableName + " table");
                }
                
            } catch (Exception e) {
                e.printStackTrace();

                jobHistory.setSuccessSum(0);
                jobHistory.setFailSum(0);
                jobHistory.setEndDttm(new Timestamp((new Date()).getTime()));
                jobHistory.setJobDescription(e.getMessage());
                jobHistory.setCompleteYn("Y");
        
                try {
                    jobHistory = importJobRepository.save(jobHistory);
                } catch (Exception je) {
                    je.printStackTrace();
                }
                
                return new AsyncResult<String>(e.getMessage());
                
            } finally {
                assert deleteHandle != null;
                try { deleteHandle.finish(); } catch (Exception e) {e.printStackTrace();}
            }
            
            final ValueContext context = new ValueContext(failMessage) {
                @Override
                public void run() {
                    files.parallelStream().forEach(it -> {
                        DBQuery dbQuery = null;
                        
                        try {
                            log.info("BulkImportService - Starting File (" + it.getFileName() + ") Processing");

                            dbQuery = getDBHandleForImport(it, tableSchema, jobId).active();
                            dbQuery.importJob(MAX_BATCH_SIZE);

                            log.info("BulkImportService - Success Import Job");

                        } catch (Exception ex) {
                            throw ex;
                            
                        } finally {
                            if (dbQuery != null) {
                                try {
                                    totalInsertSum.addAndGet(dbQuery.iTotalInsertSum);
                                    totalFailSum.addAndGet(dbQuery.iTotalFailSum);
                                    
                                    log.info("BulkImportService - Import Job Result (Success : " + totalInsertSum + " / Fail : " + totalFailSum + ")");
                                    
                                } catch (Exception e) { e.printStackTrace();
                                }

                                try { dbQuery.finish(); } catch (Exception e) { e.printStackTrace(); }
                            }
                        }

                        if (dbQuery.iTotalFailSum > 0) {
                            errorDetailSummary.add(dbQuery.getFailResponse());
                            value = "Fail - Import Job Result (Success : " + totalInsertSum + " / Fail : " + totalFailSum + ")";
                        }
                    });
                }
            };
            
            context.run();
            failMessage = context.value;
            
            if (failMessage != null && failMessage.length() > 0) {
                jobHistory.setSuccessSum(totalInsertSum.get());
                jobHistory.setFailSum(totalFailSum.get());
                jobHistory.setEndDttm(new Timestamp((new Date()).getTime()));
                jobHistory.setJobDescription(failMessage);
                jobHistory.setCompleteYn("Y");
                
                try {
                    jobHistory = importJobRepository.save(jobHistory);
                } catch (Exception je) {
                    je.printStackTrace();
                }
                
                return new AsyncResult<String>(failMessage);
            }
            
            if (tableSchema.isUseProcedure() && tableSchema.getProcedures() != null) {
                String desc = "";
                boolean bSuccess = true;

                for (int key : tableSchema.getProcedures().keySet()) {
                    String procedure = tableSchema.getProcedures().get(key);

                    if (bSuccess) {
                        DBQuery dbHandProcedure = null;

                        try {
                            dbHandProcedure = getDBHandleForDeleteAndProcedure().active();
                            
                            List<String> result = dbHandProcedure.procedureJob(procedure, bDelete, userId);
                            if (result != null && result.size() == 2) {
                                if (result.get(0).equals("true")) {
                                    desc = desc + procedure + " : Sucess " + System.getProperty("line.separator");
                                    bSuccess = true;
                                } else {
                                    desc = desc + procedure + " : Faile (" + result.get(1) + ")" + System.getProperty("line.separator");
                                    bSuccess = false;
                                }
                                
                            } else {
                                desc = desc + procedure + " : Fail " + System.getProperty("line.separator");
                                bSuccess = false;
                            }
                            
                        } catch (Exception ex) {
                            desc = desc + procedure + " : Fail " + System.getProperty("line.separator");
                            desc = desc + ex.getMessage();
                            bSuccess = false;
                            
                        } finally {
                            assert dbHandProcedure != null;
                            try { dbHandProcedure.finish(); } catch (Exception e) {e.printStackTrace();}
                        }
                        
                    } else {
                        desc = desc + procedure + " : Do Not Run " + System.getProperty("line.separator");
                    }
                }

                log.info(desc);
                
                procedureResult = bSuccess;
                procedureDesc = desc;
            }
            
        } catch (Exception e) {
            log.info(e.getMessage());

            jobHistory.setSuccessSum(totalInsertSum.get());
            jobHistory.setFailSum(totalFailSum.get());
            jobHistory.setEndDttm(new Timestamp((new Date()).getTime()));
            jobHistory.setJobDescription(e.getMessage());
            jobHistory.setCompleteYn("Y");
            
            try {
                jobHistory = importJobRepository.save(jobHistory);
            } catch (Exception je) {
                je.printStackTrace();
            }
            
            return new AsyncResult<String>(e.getMessage());
        }

        jobHistory.setSuccessSum(totalInsertSum.get());
        jobHistory.setFailSum(totalFailSum.get());
        jobHistory.setEndDttm(new Timestamp((new Date()).getTime()));
        
        String resultMessage = procedureResult == Boolean.TRUE ? "Complete" : procedureDesc;
        jobHistory.setJobDescription(resultMessage);
        
        jobHistory.setCompleteYn("Y");

        try {
            jobHistory = importJobRepository.save(jobHistory);
        } catch (Exception je) {
            je.printStackTrace();
        }
        
        return new AsyncResult<String>(resultMessage);
    }

    private void setSpliter(final String spliterType) {
        if (spliterType.equals("0")) {
            SPLITER = SPLITER_COMMMAR;
        } else if (spliterType.equals("1")) {
            SPLITER = SPLITER_TAB;
        } else {
            SPLITER = SPLITER_COMMMAR;
        }
    }

    private String setMode(final boolean bImport, final String workType) {
        String mode;
        bDelete = false;

        if (bImport) {
            if (workType.equals("0")) {
                mode = MODE_INSERT;
            } else if (workType.equals("1")) {
                mode = MODE_UPDATE;
            } else if (workType.equals("2")) {
                mode = MODE_ADD;
            } else if (workType.equals("3")) {
                bDelete = true;
                mode = MODE_INSERT;
            } else {
                mode = MODE_INSERT;
            }
            
        } else {
            if (workType.equals("0")) {
                mode = MODE_EXPORT_HEADER;
            } else if (workType.equals("1")) {
                mode = MODE_EXPORT_DATA;
            } else {
                mode = MODE_EXPORT_HEADER;
            }
        }

        return mode;
    }

    private String getFilePath(final FileStorage fileStorage) {
        return rootPath + fileStorage.getFilePath();
    }

    private String getErrorFileAbsolutePath(final FileStorage fileStorage) {
        String path = FilenameUtils.getPath(fileStorage.getFilePath()) + FilenameUtils.getBaseName(fileStorage.getFileName());
        
        if (SPLITER.equals(SPLITER_COMMMAR)) {
            path = path + "_Error.csv";
        } else {
            path = path + "_Error.tsv";
        }
        
        return rootPath + path;
    }

    private String getCSVFileAbsolutePath(final FileStorage fileStorage) {
        return rootPath + fileStorage.getFilePath();
    }

    private DBQuery getDBHandleForImport(final FileStorage fileStorage, final TableSchema schema, int jobId) {
        return DBQuery.builder()
                .iDataSource(dataSource)
                .iFileStorageService(fileStorageService)
                .iImportFileRepository(importFileRepository)
                .iJobId(jobId)
                .iFileStorage(fileStorage)
                .iFilePath(getFilePath(fileStorage))
                .iErrorFilePath(getErrorFileAbsolutePath(fileStorage))
                .iHeaderData(readCvsHeader(fileStorage))
                .iSpliter(SPLITER)
                .iTableSchema(schema)
                .build();
    }

    private DBQuery getDBHandleForSelect(final FileStorage fileStorage, final TableSchema schema) {
        return DBQuery.builder()
                .iDataSource(dataSource)
                .iFileStorage(fileStorage)
                .iCSVFilePath(getCSVFileAbsolutePath(fileStorage))
                .iHeaderData(schema.getJsonHeaders())
                .iSpliter(SPLITER)
                .iTableSchema(schema)
                .build();
    }

    private DBQuery getDBHandleForDeleteAndProcedure() {
        return DBQuery.builder()
                .iDataSource(dataSource)
                .build();
    }

    /* Get JSON Schema Handle */
    private TableSchema getTableSchema(final String workType, final String moduleName, final String tableName, final String userId) {
        return TableSchema.builder()
                .dataSource(dataSource)
                .workType(workType)
                .moduleName(moduleName)
                .tableName(tableName)
                .databaseType(databaseType.toUpperCase())
                .userId(userId)
                .build();
    }

    private List<String> readCvsHeader(final FileStorage fileStorage) {
        FileReader fileReader = null;
        BufferedReader bufferedReader = null;

        final String filePath = getFilePath(fileStorage);
        List<String> list = new ArrayList<String>();

        try {
            fileReader = new FileReader(filePath);
            bufferedReader = new BufferedReader(fileReader);

            String headers = bufferedReader.readLine();

            if(headers == null) {
                throw new BulkImportException("Error Read CSV Header");
            }
            list = Arrays.asList(headers.split(SPLITER, MAX_SPLIT_SIZE));
            
        } catch (final Exception e) {
            throw new BulkImportException("Error Read CSV Header");
        } finally {
            if (fileReader != null) {
                try { fileReader.close(); } catch (final Exception e) {e.printStackTrace();}
            }

            if (bufferedReader != null) {
                try { bufferedReader.close(); } catch (final Exception e) {e.printStackTrace();}
            }
        }

        return list;
    }

    /**
     * Database query handle
     */
    @Builder
    @Data
    public static class DBQuery {
        // Database
        DataSource iDataSource;
        Connection iConnection;
        PreparedStatement iPs;
        CallableStatement iCs;

        // Response information
        int iTotalInsertSum;
        int iTotalFailSum;
        int iTotalSelect;

        String iErrorFilePath;
        String iCSVFilePath;

        int iJobId;

        // CVS file information
        FileStorage iFileStorage;
        String iFilePath;
        List<String> iHeaderData;

        FileStorageService iFileStorageService;
        ImportFileRepository iImportFileRepository;

        TableSchema iTableSchema;
        String iSpliter;

        List<List<String>> iErrors;

        public DBQuery active() {
            iTotalInsertSum = 0;
            iTotalFailSum = 0;

            if (iConnection == null) {
                try {
                    iConnection = iDataSource.getConnection();
                    iConnection.setAutoCommit(false);
                } catch (final SQLException e) {
                    throw new BulkImportException(BulkImportException.DB_CONNECTION_ERROR);
                }
            }

            return this;
        }

        public void exportJob(final int batchSize) {
            try {
                iPs = iConnection.prepareStatement(iTableSchema.getExportQuery());
            } catch (final SQLException e) {
                throw new BulkImportException(BulkImportException.DB_CONNECTION_ERROR);
            } catch (final Exception ex) {
                throw ex;
            }

            ResultSet rs = null;
            FileWriter writer = null;
            String csvString = null;

            try {
                writer = new FileWriter(iCSVFilePath);
                csvString = String.join(iSpliter, iHeaderData);
                writer.write(csvString);

                assert iTableSchema.getWorkType().equals(MODE_EXPORT_DATA);

                rs = iPs.executeQuery();

                assert rs != null;

                while (rs.next()) {
                    int i = 0;
                    String line = "";
                    
                    for (String header : iHeaderData) {
                        if (i == 0) {
                            line = rs.getString(header) == null ? "" : rs.getString(header);
                        } else {
                            line = line + iSpliter + (rs.getString(header) == null ? "" : rs.getString(header));
                        }
                        i++;
                    }
                    
                    writer.write(System.getProperty("line.separator"));
                    writer.write(line);
                }
                
            } catch (Exception e) {
                throw new BulkImportException("Error Export Select");
                
            } finally {
                if (rs != null) {
                    try { rs.close(); } catch (Exception e) {e.printStackTrace();}
                }
                
                if (writer != null) {
                    try { writer.close(); } catch (Exception e) {e.printStackTrace();}
                }
            }
        }

        public List<String> procedureJob(final String procedure, boolean bDelete, String userId) {
            List<String> result = new ArrayList<String>();
            
            try {
                iCs = iConnection.prepareCall(procedure);
                
                if (bDelete) {
                    iCs.setString(1, "Y");
                } else {
                    iCs.setString(1, "N");
                }

                iCs.setString(2, userId);
                iCs.setString(3, "");
                iCs.setString(4, "");

                iCs.registerOutParameter(3, Types.VARCHAR);
                iCs.registerOutParameter(4, Types.VARCHAR);

                iCs.execute();
                iConnection.commit();

                String sucess = iCs.getString(3);
                String message = iCs.getString(4);

                result.add(sucess);
                result.add(message);
                
            } catch (Exception e) {
                try { iConnection.rollback(); } catch (Exception ex) {ex.printStackTrace();}
                throw new BulkImportException(e.getMessage());
            }
            
            return result;
        }

        public void importJob(final int batchSize) {
            iTableSchema.setCsvHeaders(iHeaderData);

            if (!iTableSchema.checkHeaders()) {
                throw new BulkImportException(BulkImportException.CSV_HEADER_NOT_MATCH);
            }

            try {
                iPs = iConnection.prepareStatement(iTableSchema.getPrepareQuery());
            } catch (final SQLException e) {
                throw new BulkImportException(BulkImportException.DB_CONNECTION_ERROR);
            }

            writeErrorHeader();

            int count = 0;
            FileInputStream fileStream = null;
            InputStreamReader inputStream = null;
            BufferedReader bufferedReader = null;
            final List<List<String>> recordLists = new ArrayList<>();

            try {
                fileStream = new FileInputStream(iFilePath);
                inputStream = new InputStreamReader(fileStream, "utf-8");
                bufferedReader = new BufferedReader(inputStream);

                String line;
                while ((line = bufferedReader.readLine()) != null) {
                    if (count == 0) {
                        count++;
                        continue;
                    }

                    List<String> readList = Arrays.asList(line.split(iSpliter, MAX_SPLIT_SIZE));

                    if (readList != null) {
                        recordLists.add(readList);
                    }

                    if (count++ % batchSize == 0) {
                        saveAllData(recordLists);
                        recordLists.clear();
                    }
                }

                if (recordLists.size() > 0) {
                    saveAllData(recordLists);
                }
                
            } catch (final BulkImportException bulk) {
                throw bulk;
                
            } catch (final Exception ex) {
                throw new BulkImportException(BulkImportException.CSV_FILE_READ_ERROR);
                
            } finally {
                if (fileStream != null) {
                    try { fileStream.close(); } catch (final Exception e) {e.printStackTrace();}
                }
                
                if (inputStream != null) {
                    try { inputStream.close(); } catch (final Exception e) {e.printStackTrace();}
                }
                
                if (bufferedReader != null) {
                    try { bufferedReader.close(); } catch (final Exception e) {e.printStackTrace();}
                }
            }
        }

        public void delete(String tableName) {
            Statement statement = null;
            
            try {
                statement = iConnection.createStatement();
                statement.execute("delete from " + StringUtils.replace(tableName, "'", "''"));
                iConnection.commit();
                
            } catch (final SQLException e) {
                try { iConnection.rollback(); } catch (Exception ex) {ex.printStackTrace();}
                throw new BulkImportException(BulkImportException.SQL_DELTE_ERROR);
                
            } finally {
                try {
                    assert statement != null;
                    statement.close();
                } catch (final SQLException e) {
                     e.printStackTrace();
                }
            }
        }

        public void finish() {
            try {
                if (iTotalFailSum != 0) makeErrorFile();
                if (iPs != null) iPs.close();
                if (iCs != null) iCs.close();
                if (iConnection != null) iConnection.close();
            } catch (final Exception e) {
                e.printStackTrace();
            }
        }

        private void saveAllData(final List<List<String>> recordLists) {
            try {
                if (recordLists.size() <= MIN_BATCH_SIZE) {
                    recordLists.forEach(this::insertOneData);
                } else {
                    List<List<String>> left = recordLists.subList(0, Math.round(recordLists.size() / 2));
                    if (!insertManyData(left)) {
                        saveAllData(left);
                    }

                    List<List<String>> right = recordLists.subList(left.size(), recordLists.size());
                    if (!insertManyData(right)) {
                        saveAllData(right);
                    }
                }
                
            } catch (BulkImportException bulkImportException) {
                throw bulkImportException;
            } catch (Exception e) {
                throw new BulkImportException("saveAllData");
            }
        }

        /* Insert one data at once */
        private void insertOneData(final List<String> recordList) {
            try {
                ParseResult result = setInsertParameter(recordList);

                if (!result.success) {
                    summaryFailRecord(recordList, result.error);
                    return;
                }

                iPs.addBatch();
                int[] run = iPs.executeBatch();

                boolean bSuccess = false;

                if (run[0] == Statement.SUCCESS_NO_INFO || run[0] == 1) {
                    bSuccess = true;
                } else if (run[0] >= 2) {
                    summaryFailRecord(recordList, "Multiple rows Updated(Inserted)");
                } else {
                    summaryFailRecord(recordList, "Row is not Updated(Inserted)");
                }
                iConnection.commit();

                if (bSuccess) {
                    iTotalInsertSum++;
                }
            } catch (final Exception e) {                
                try {
                    iConnection.rollback();
                } catch (final SQLException ex) { ex.printStackTrace();
                }
                summaryFailRecord(recordList, e.getMessage());
            }
        }

        /* Insert many data at once */
        private boolean insertManyData(List<List<String>> recordLists) {
            if (recordLists.size() == 0) {
                return true;
            }
            
            int recordIndex = 0;
            List<Integer> errorList = new ArrayList<Integer>();

            try {
                for (final List<String> recordList : recordLists) {
                    ParseResult result = setInsertParameter(recordList);

                    if (!result.success) {
                        summaryFailRecord(recordList, result.error);
                        errorList.add(recordIndex);
                    } else {
                        iPs.addBatch();
                        iPs.clearParameters();
                    }

                    recordIndex++;
                }

                for (int i = errorList.size()- 1; i >= 0; i--) {
                    recordLists.remove((int) errorList.get(i));
                }

                int[] run = iPs.executeBatch();
                int nSuccess = 0;

                for (int i = 0; i < run.length; i++) {
                    if (run[i] == Statement.SUCCESS_NO_INFO || run[i] == 1) {
                        nSuccess++;
                    } else if (run[i] >= 2) {
                        summaryFailRecord(recordLists.get(i), "Multiple rows Updated(Inserted)");
                    } else {
                        summaryFailRecord(recordLists.get(i), "Row is not Updated(Inserted)");
                    }
                }

                iConnection.commit();
                
                iTotalInsertSum += nSuccess;
                recordLists.clear();

                return true;
                
            } catch (final BatchUpdateException batchUpdateException) {
                try {
                    iConnection.rollback();
                } catch (final SQLException ex) { ex.printStackTrace();
                }

                try {
                    int returns[] = batchUpdateException.getUpdateCounts();
                    List<List<String>> success = new ArrayList<List<String>>();

                    if (recordLists.size() == returns.length) { //Error Count == Request Count
                        for (int i = 0; i < returns.length; i++) {
                            if (returns[i] == Statement.EXECUTE_FAILED) {
                                summaryFailRecord(recordLists.get(i), batchUpdateException.getMessage());
                            } else if (returns[i] == Statement.RETURN_GENERATED_KEYS) {   //success
                                success.add(recordLists.get(i));
                            } else {
                                summaryFailRecord(recordLists.get(i), "UnDefined Error");
                            }
                        }

                        recordLists.clear();

                        if (success.size() > 0) {
                            for (List<String> list : success) {
                                recordLists.add(list);
                            }

                            return false;
                        } else {
                            return true;
                        }
                        
                    } else {  //발생하지 않음 //iPs.clearBatch() 이전
                        summaryFailRecord(recordLists.get(returns.length), batchUpdateException.getMessage());
                        recordLists.remove(returns.length);
                        return false;
                    }
                    
                } catch (BulkImportException bulkImportException) {
                    throw bulkImportException;
                } catch (Exception ex) {
                    throw new BulkImportException("Processing Error - BatchUpdateException");
                }
                
            } catch (final BulkImportException bulkE) {   //Parameter Not Matched
                try { iConnection.rollback(); } catch (final SQLException ex) {ex.printStackTrace();}
                if (recordIndex != 0) {
                    recordLists.remove(recordIndex - 1);
                }

                return false;
                
            } catch (final Exception e) {
                try { iConnection.rollback(); } catch (final SQLException ex) {ex.printStackTrace();}
                return false;
                
            } finally {
                try { iPs.clearBatch(); } catch (Exception e) {e.printStackTrace();}
            }
        }

        private ParseResult setInsertParameter(final List<String> recordList) {
            try {
                if (iTableSchema.isUseOfConstraints()) {
                    for (TableSchema.OFConstraints constraint : iTableSchema.getOfConstraints()) {
                        int nCheckCount = 0;

                        String errorHeaders = "";
                        TreeMap<Integer, List<String>> headerMap = new TreeMap<Integer, List<String>>();

                        for (TableSchema.OFConstraints.Column column : constraint.getColumns()) {
                            column.setCheckHeaders(true);

                            if (column.getPariority() != 0) {
                                headerMap.put(column.getPariority(), column.getHeaders());
                            }

                            errorHeaders = errorHeaders + "[";

                            for (String header : column.getHeaders()) {

                                if (recordList.get(iTableSchema.getCsvMap().get(header)).equals("") ||
                                    recordList.get(iTableSchema.getCsvMap().get(header)).toUpperCase().equals("NULL")) {
                                    column.setCheckHeaders(false);

                                    headerMap.remove(column.getPariority());
                                }

                                errorHeaders = errorHeaders + header + " and ";
                            }

                            errorHeaders = errorHeaders.substring(0, errorHeaders.lastIndexOf(" and "));
                            errorHeaders = errorHeaders + "] or ";

                            if (column.isCheckHeaders()) {
                                nCheckCount++;
                            }
                        }

                        errorHeaders = errorHeaders.substring(0, errorHeaders.lastIndexOf(" or "));

                        if (nCheckCount == 0) {
                            String errorMsg;
                            errorMsg = errorHeaders + " Must be entered.";

                            return ParseResult.builder()
                                .success(false)
                                .error(errorMsg)
                                .recordList(recordList)
                                .build();
                            
                        } else if (nCheckCount > 1) {
                            int beforKey = headerMap.firstKey();

                            // TreeMap이라 맨위꺼만 남기고 다 지워 도 됨
                            for (int key : headerMap.keySet()) {
                                if (key == beforKey) {
                                    continue;
                                }
                                
                                for (String header : headerMap.get(key)) {
                                    recordList.set(iTableSchema.getCsvMap().get(header), "");
                                }
                            }
                        }
                    }
                }

                for (final int key : iTableSchema.getImportMap().keySet()) {
                    final TableSchema.ImportColumnType columnType = iTableSchema.getImportMap().get(key);

                    if (columnType.isUseParam()) {
                        for (TableSchema.ImportColumnType.Param param : columnType.getParams()) {

                            if (param.isHidden()) {
                                switch (param.getType()) {
                                case TableSchema.TYPE_NUMBER:
                                    iPs.setDouble(param.getValueIndex(), Double.parseDouble(param.getDefaultValue()));
                                    break;
                                    
                                case TableSchema.TYPE_STIRNG:
                                    iPs.setString(param.getValueIndex(), param.getDefaultValue());
                                    break;
                                    
                                case TableSchema.TYPE_DATE:
                                    String data = param.getDefaultValue().substring(0, 10);
                                    iPs.setDate(param.getValueIndex(), java.sql.Date.valueOf(data));
                                    break;
                                    
                                case TableSchema.TYPE_DATETIME:
                                    iPs.setTimestamp(param.getValueIndex(), java.sql.Timestamp.valueOf(param.getDefaultValue()));
                                    break;
                                    
                                default:
                                    throw new BulkImportException(BulkImportException.PARSER_PARM_NOT_MATCH);
                                }
                                
                            } else {
                                String value = recordList.get(iTableSchema.getCsvMap().get(param.getHeader()));
                                
                                if (!param.getDefaultValue().equals("")) {
                                    if (value.equals("") || value.toUpperCase().equals("NULL")) {
                                        recordList.set(iTableSchema.getCsvMap().get(param.getHeader()), param.getDefaultValue());
                                    }
                                }
                                
                                if (param.isNotNull()) {
                                    if (value.equals("") || value.toUpperCase().equals("NULL")) {
                                        String errorMsg;
                                        errorMsg = "[" + param.getHeader() + "]" + " is a Reuired Value but " + param.getHeader() + " is Empty";

                                        return ParseResult.builder()
                                            .success(false)
                                            .error(errorMsg)
                                            .recordList(recordList)
                                            .build();
                                    }
                                }
                                
                                switch (param.getType()) {
                                case TableSchema.TYPE_NUMBER:
                                    if (value.equals("") || value.toUpperCase().equals("NULL")) {
                                        iPs.setNull(param.getValueIndex(), java.sql.Types.DOUBLE);
                                    } else {
                                        iPs.setDouble(param.getValueIndex(), Double.parseDouble(value));
                                    }
                                    break;
                                    
                                case TableSchema.TYPE_STIRNG:
                                    if (value.toUpperCase().equals("NULL")) {
                                        iPs.setNull(param.getValueIndex(), java.sql.Types.VARCHAR);
                                    } else {
                                        iPs.setString(param.getValueIndex(), value);
                                    }
                                    break;
                                    
                                case TableSchema.TYPE_DATE:
                                    if (value.equals("") || value.toUpperCase().equals("NULL")) {
                                        iPs.setNull(param.getValueIndex(), java.sql.Types.DATE);
                                    } else {
                                        String dateStr = value.substring(0, 10);
                                        iPs.setDate(param.getValueIndex(), java.sql.Date.valueOf(dateStr));
                                    }
                                    break;
                                    
                                case TableSchema.TYPE_DATETIME:
                                    if (value.equals("") || value.toUpperCase().equals("NULL")) {
                                        iPs.setNull(param.getValueIndex(), java.sql.Types.TIMESTAMP);
                                    }  else {
                                        iPs.setTimestamp(param.getValueIndex(), java.sql.Timestamp.valueOf(value));
                                    }
                                    break;
                                    
                                default:
                                    throw new BulkImportException(BulkImportException.PARSER_PARM_NOT_MATCH);
                                }
                            }
                        }
                    }
                }
                
            } catch (final Exception e) {
                throw new BulkImportException(BulkImportException.PARSER_PARM_NOT_MATCH);
            }

            return ParseResult.builder()
                    .success(true)
                    .error("")
                    .recordList(recordList)
                    .build();
        }

        private void writeErrorHeader() {
            final List<String> errorHeader = new ArrayList<>(iHeaderData);
            errorHeader.add(0, ERROR_HEADER_TITLE);
        }

        private void summaryFailRecord(final List<String> recordList, String reason) {
            reason = reason.replaceAll(iSpliter, " - ");

            if (iErrors == null) {
                iErrors = new ArrayList<>();
            } else if (iErrors.size() >= MAX_ERRORS) {
                throw new BulkImportException(BulkImportException.MAX_SQL_ERROR + " (MAX ERROR SIZE = " + MAX_ERRORS + ")");
            }
            
            reason = reason.replaceAll("(\r\n|\r|\n|\n\r)", " ");

            final List<String> errorRecord = new ArrayList<>(recordList);
            errorRecord.add(0, reason);
            iErrors.add(iErrors.size(), errorRecord);
            iTotalFailSum++;
        }

        private ResultDetail getFailResponse() {
            return ResultDetail.builder()
                    .fileName(FilenameUtils.getName(iFilePath))
                    .insertSum(iTotalInsertSum)
                    .failSum(iTotalFailSum)
                    .failFileUrl(iErrorFilePath)
                    .build();
        }
        
        private void makeErrorFile() {
            FileWriter writer = null;

            try {
                writer = new FileWriter(iErrorFilePath);
                List<String> header = new ArrayList<>(iHeaderData);
                header.add(0, ERROR_HEADER_TITLE);

                String csvString = String.join(iSpliter, header);

                writer.write(csvString);
                writer.write(System.getProperty("line.separator"));

                for (List<String> error : iErrors) {
                    csvString = String.join(iSpliter, error);
                    writer.write(csvString);
                    writer.write(System.getProperty("line.separator"));
                }
                
            } catch (Exception e) {
                throw new BulkImportException(BulkImportException.CSV_ERROR_FILE_ERROR);
            } finally {
                if (writer != null) {
                    try { writer.close(); } catch (Exception ex) {ex.printStackTrace();}
                }
            }

            FileStorage errorFileStorage = iFileStorageService.recordErrorFile(iFileStorage);
            
            ImportFile errorFile = new ImportFile();
            errorFile.setImportJobId(iJobId);
            errorFile.setFileStorageId(errorFileStorage.getId());
            errorFile.setErrorFileYn("Y");
            
            try {
                iImportFileRepository.save(errorFile);
            } catch (Exception ex) {
                throw ex;
            }
        }

        @Builder
        @Data
        private static class ParseResult {
            boolean success;
            String error;
            List<String> recordList;
        }
    }

    @Builder
    @Data
    public static class ResultHeader {
        int totalInsertSum;
        int totalFailSum;
        List<ResultDetail> failDetailSummary;
    }

    @Builder
    @Data
    public static class ResultDetail {
        String fileName;
        int insertSum;
        int failSum;
        String failFileUrl;
    }

}
