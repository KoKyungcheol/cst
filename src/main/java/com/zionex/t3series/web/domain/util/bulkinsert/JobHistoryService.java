package com.zionex.t3series.web.domain.util.bulkinsert;

import java.util.List;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.util.exception.NoContentException;
import com.zionex.t3series.web.domain.util.filestorage.FileStorage;
import com.zionex.t3series.web.domain.util.filestorage.FileStorageRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class JobHistoryService {

    private static final int COMPLETE_YN_N = 1;
    private static final int COMPLETE_YN_Y = 2;

    private static final int ERROR_YN_Y = 1;
    private static final int ERROR_YN_N = 2;

    @Autowired
    ImportJobRepository importJobRepository;

    @Autowired
    ImportFileRepository importFileRepository;

    @Autowired
    FileStorageRepository fileStorageRepository;

    /**
     * Get import job history data
     */
    public List<ImportJob> getJobHistory(String moduleName, String tableName, int jobStatus, int jobError) {

        // Complete YN
        String completeYn = "";
        if (jobStatus == COMPLETE_YN_N) {
            completeYn = "N";
        } else if (jobStatus == COMPLETE_YN_Y) {
            completeYn = "Y";
        }

        List<ImportJob> importJobList = importJobRepository.getImportJobHistory(moduleName, tableName, completeYn)
                .orElseThrow(NoContentException::new);

        // Error YN
        List<ImportJob> result;
        if (jobError == ERROR_YN_Y) {
            result = importJobList.stream()
                    .filter(it -> it.getFailSum() > 0)
                    .collect(Collectors.toList());
        } else if (jobError == ERROR_YN_N) {
            result = importJobList.stream()
                    .filter(it -> it.getFailSum() == 0 && it.getCompleteYn().equals("Y"))
                    .collect(Collectors.toList());
        } else {
            result = importJobList;
        }

        // No content
        if (result.size() == 0) {
            throw new NoContentException();
        }

        // Select import job error file from repository
        List<Integer> errorJobIds = result.parallelStream()
                .filter(it -> it.getCompleteYn().equals("Y") && it.getFailSum() > 0)
                .map(ImportJob::getId)
                .collect(Collectors.toList());

        List<ImportFile> errorFileList = importFileRepository.findAllByImportJobIdInAndErrorFileYn(errorJobIds, "Y");

        // Set error file storage id
        errorFileList.forEach(it -> result.stream()
                .filter(job -> job.getId() == it.getImportJobId())
                .forEach(job -> job.setErrorFileStorageId(it.getFileStorageId())));

        // Select file storage from repository
        List<Integer> errorFileStorageIds = errorFileList.parallelStream()
                .map(ImportFile::getFileStorageId)
                .collect(Collectors.toList());

        List<FileStorage> errorFileStorageList = fileStorageRepository.findAllById(errorFileStorageIds);

        // Set error file name
        errorFileStorageList.forEach(it -> result.stream()
                .filter(job -> job.getErrorFileStorageId() == it.getId())
                .forEach(job -> job.setErrorFileName(it.getFileName())));

        return result;
    }

    public boolean isRunning(String tableName) {
        return importJobRepository.existsByJobTableAndCompleteYn(tableName, "N");
    }

}
