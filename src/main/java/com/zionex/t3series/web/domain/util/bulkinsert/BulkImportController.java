package com.zionex.t3series.web.domain.util.bulkinsert;

import java.io.IOException;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Date;
import java.util.List;
import java.util.concurrent.Future;

import javax.servlet.http.HttpServletRequest;

import com.zionex.t3series.web.ApplicationProperties;
import com.zionex.t3series.web.domain.util.filestorage.FileStorage;
import com.zionex.t3series.web.domain.util.filestorage.FileStorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.extern.java.Log;

@Log
@RestController
public class BulkImportController {

    private static final String FILES = "FILES";
    private static final String USER_ID = "USER_ID";
    private static final String BATCH_SIZE = "BATCH_SIZE";
    private static final String DEFAULT_BATCH_SIZE = "10000";

    private static final String JOB_MODULE = "JOB_MODULE";
    private static final String JOB_TABLE = "JOB_TABLE";
    private static final String JOB_LEVEL = "JOB_LEVEL";
    private static final String JOB_STEP = "JOB_STEP";
    private static final String IMPORT_OPTION = "IMPORT_OPTION"; // (0:insert / 1:update / 2:add and update / 3:delete and insert)
    private static final String EXPORT_OPTION = "EXPORT_OPTION"; // (0:only header / 1:header and data)
    private static final String SEPARATOR_OPTION = "SEPARATOR_OPTION";  // (0:comma / 1:TAB)

    private static final String JOB_STATUS = "JOB_STATUS";
    private static final String JOB_ERROR = "JOB_ERROR";

    @Autowired
    BulkImportService bulkImportService;

    @Autowired
    ImportSchemaService importSchemaService;

    @Autowired
    JobHistoryService jobHistoryService;

    @Autowired
    FileStorageService fileStorageService;

    @Autowired
    ImportJobRepository importJobRepository;

    @Autowired
    ImportFileRepository importFileRepository;

    private final ApplicationProperties.Service.File.Category fileCategoryProps;

    @Autowired
    public BulkImportController(ApplicationProperties applicationProperties) {
        this.fileCategoryProps = applicationProperties.getService().getFile().getCategory();
    }

    /**
     * Import data into DB table By files
     */
    @PostMapping("/data/bulk/import/files")
    public ResponseDataWithSingleMessage bulkInsertFileData(
            @RequestParam(IMPORT_OPTION) String workType,
            @RequestParam(JOB_MODULE) String moduleName, 
            @RequestParam(JOB_TABLE) String tableName,
            @RequestParam(JOB_LEVEL) String jobLevel,
            @RequestParam(JOB_STEP) String jobStep,
            @RequestParam(FILES) MultipartFile[] files, 
            @RequestParam(USER_ID) String userId,
            @RequestParam(value = SEPARATOR_OPTION, required = false, defaultValue = "0") String spliterType,
            @RequestParam(value = BATCH_SIZE, required = false, defaultValue = DEFAULT_BATCH_SIZE) int batchSize) {

        if (jobHistoryService.isRunning(tableName)) {
            return ResponseDataWithSingleMessage.builder()
                    .success(false)
                    .message("Fail - " + tableName + " is Running")
                    .data(null)
                    .build();
        }

        ImportJob jobHistory = new ImportJob();
        jobHistory.setJobModule(moduleName);
        jobHistory.setJobTable(tableName);
        jobHistory.setJobLevel(Integer.parseInt(jobLevel));
        jobHistory.setJobStep(Integer.parseInt(jobStep));
        jobHistory.setImportOption(Integer.parseInt(workType));
        jobHistory.setSeparatorOption(Integer.parseInt(spliterType));
        jobHistory.setImportBy(userId);
        jobHistory.setStartDttm(new Timestamp((new Date()).getTime()));

        try {
            if (!saveJobHistory(jobHistory, "CSV Files Import Start", "N")) {
                return ResponseDataWithSingleMessage.builder()
                        .success(false)
                        .message("Fail - Don't Insert TB_UT_EXCEL_IMPORT_JOB table")
                        .data(null)
                        .build();
            }
            
            List<FileStorage> bulkDataFiles = uploadToFileStorage(files, userId);

            if (!insertFileInfo(jobHistory.getId(), bulkDataFiles)) {
                return ResponseDataWithSingleMessage.builder()
                        .success(false)
                        .message("Fail - Don't File Upload")
                        .data(null)
                        .build();
            }

            if (!saveJobHistory(jobHistory, "File Upload Completed and AsyncTask Import Service Start", "N")) {
                return ResponseDataWithSingleMessage.builder()
                        .success(false)
                        .message("Fail - Don't Update TB_UT_EXCEL_IMPORT_JOB table")
                        .data(null)
                        .build();
            }

            log.info("BulkImportController - TABLE (" + tableName + ") Starting Bulke Import");
            log.info("BulkImportController - " + "File Upload Completed and AsyncTask Import Service Start");
            
            Future<String> result = bulkImportService.saveAllDataInFiles(workType, moduleName, tableName, jobLevel, jobStep, 
                    bulkDataFiles, spliterType, userId, jobHistory);
            
            String message = result.get();
            boolean success = "Complete".equals(message) ? true : false;

            log.info("BulkImportController - " + "File Upload Completed and AsyncTask Import Service End");
            
            return ResponseDataWithSingleMessage.builder()
                    .success(success)
                    .message(message)
                    .data(null)
                    .build();

        } catch (Exception e) {
            try {
                saveJobHistory(jobHistory, "Fail - Run File Bulk Insert AsyncTask", "Y");
            } catch (Exception ex) {
                ex.printStackTrace();
            }

            return ResponseDataWithSingleMessage.builder()
                    .success(false)
                    .message("Fail - Run File Bulk Insert AsyncTask")
                    .data(null)
                    .build();
        }
    }

    /**
     * Export data from DB
     */
    @GetMapping("/data/bulk/export")
    public ResponseEntity<Resource> bulkExportFileData(@RequestParam(EXPORT_OPTION) String workType,
                            @RequestParam(JOB_MODULE) String moduleName, 
                            @RequestParam(JOB_TABLE) String tableName,
                            @RequestParam(USER_ID) String userId,
                            @RequestParam(value = SEPARATOR_OPTION, required = false, defaultValue = "0") String spliterType,
                            HttpServletRequest request) throws IOException {

        String csvFileName = tableName;
        if (spliterType.equals("0")) {
            csvFileName =  csvFileName + ".csv";
        } else {
            csvFileName =  csvFileName + ".tsv";
        }
        
        String fileStorageCategorySystem = fileCategoryProps.getSystem();
        FileStorage fileStorage = fileStorageService.getFilePathInfo(csvFileName, fileStorageCategorySystem, userId);

        bulkImportService.makeCSVFromTable(fileStorage, workType, moduleName, tableName, userId, spliterType);
        return fileStorageService.downloadFileUseFilePath(fileStorage, request);
    }

    /**
     * Get excel import schema
     */
    @GetMapping("/data/bulk/schema")
    public ImportSchema getImportSchema() throws IOException {
        return importSchemaService.getImportSchema();
    }

    /**
     * Get excel import module list
     */
    @GetMapping("/data/bulk/schema/modules")
    public List<String> getModulesList() throws IOException {
        return importSchemaService.getImportModules();
    }

    /**
     * Get excel import table list
     */
    @GetMapping("/data/bulk/schema/tables")
    public Collection<List<ImportSchemaService.ResultTableItem>> getTablesList(@RequestParam(JOB_MODULE) String moduleName) throws IOException {
        return importSchemaService.getImportTables(moduleName);
    }

    /**
     * Get excel import table status
     */
    @GetMapping("/data/bulk/table/status")
    public ImportSchemaService.ResultTableStatus getTablesStatus(@RequestParam(JOB_TABLE) String tableName) {
        return importSchemaService.getTableStatus(tableName);
    }

    /**
     * Get import job history list
     */
    @GetMapping("/data/bulk/job/history")
    public List<ImportJob> getJobHistory(@RequestParam(JOB_MODULE) String moduleName,
                                         @RequestParam(JOB_TABLE) String tableName,
                                         @RequestParam(JOB_STATUS) int jobStatus,
                                         @RequestParam(JOB_ERROR) int jobError) {
        return jobHistoryService.getJobHistory(moduleName, tableName, jobStatus, jobError);
    }

    /* Upload import file to file storage */
    private List<FileStorage> uploadToFileStorage(final MultipartFile[] files, final String userId) {
        return fileStorageService.uploadMultiFiles(files, fileCategoryProps.getSystem(), userId);
    }

    private boolean insertFileInfo(int jobId, List<FileStorage> files) {
        if (files == null) {
            return false;
        }
        
        List<ImportFile> imports = new ArrayList<ImportFile>();

        files.forEach(it -> {
            ImportFile importFile = new ImportFile();
            importFile.setImportJobId(jobId);
            importFile.setFileStorageId(it.getId());
            importFile.setErrorFileYn("N");
            imports.add(importFile);
        });

        try {
            importFileRepository.saveAll(imports);
            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

    private boolean saveJobHistory(ImportJob jobHistory, String message, String completed) {
        try {
            jobHistory.setCompleteYn(completed);
            jobHistory.setJobDescription(message);
            
            importJobRepository.save(jobHistory);
            return true;
        } catch (Exception ex) {
            ex.printStackTrace();
            return false;
        }
    }

}
