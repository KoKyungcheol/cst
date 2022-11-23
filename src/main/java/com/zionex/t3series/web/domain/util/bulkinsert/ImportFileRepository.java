package com.zionex.t3series.web.domain.util.bulkinsert;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ImportFileRepository extends JpaRepository<ImportFile, Integer> {

    /* Select by IMPORT_JOB_ID(in) and ERROR_FILE_YN */
    List<ImportFile> findAllByImportJobIdInAndErrorFileYn(List<Integer> importJobIds, String errorFileYn);

}
