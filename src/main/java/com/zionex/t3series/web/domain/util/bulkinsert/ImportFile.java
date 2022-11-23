package com.zionex.t3series.web.domain.util.bulkinsert;

import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;

@Entity
@Data
@Table(name = "TB_UT_EXCEL_IMPORT_FILE")
public class ImportFile {

    @Id
    @GeneratedValue(generator = "generator")
    @GenericGenerator(name = "generator", strategy = "increment")
    @Column(name = "ID")
    int id;

    @Column(name = "IMPORT_JOB_ID")
    int importJobId;

    @Column(name = "FILE_STORAGE_ID")
    int fileStorageId;

    @Column(name = "ERROR_FILE_YN")
    String errorFileYn;

}
