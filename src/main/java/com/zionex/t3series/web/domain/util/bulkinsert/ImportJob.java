package com.zionex.t3series.web.domain.util.bulkinsert;

import lombok.Data;
import org.hibernate.annotations.GenericGenerator;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Data
@Table(name = "TB_UT_EXCEL_IMPORT_JOB")
public class ImportJob {

    @Id
    @GeneratedValue(generator = "generator")
    @GenericGenerator(name = "generator", strategy = "increment")
    @Column(name = "ID")
    int id;

    @Column(name = "JOB_MODULE")
    String jobModule;

    @Column(name = "JOB_TABLE")
    String jobTable;

    @Column(name = "JOB_LEVEL")
    int jobLevel;

    @Column(name = "JOB_STEP")
    int jobStep;

    @Column(name = "IMPORT_OPTION")
    int importOption;

    @Column(name = "SEPARATOR_OPTION")
    int separatorOption;

    @Column(name = "SUCCESS_SUM")
    int successSum;

    @Column(name = "FAIL_SUM")
    int failSum;

    @Column(name = "IMPORT_BY")
    String importBy;

    @Column(name = "START_DTTM")
    Timestamp startDttm;

    @Column(name = "END_DTTM")
    Timestamp endDttm;

    @Column(name = "COMPLETE_YN")
    String completeYn;

    @Column(name = "JOB_DESCRIPTION")
    String jobDescription;

    @Transient
    int errorFileStorageId;

    @Transient
    String errorFileName;

}
