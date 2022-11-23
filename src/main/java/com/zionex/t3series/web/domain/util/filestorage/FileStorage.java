package com.zionex.t3series.web.domain.util.filestorage;

import java.sql.Timestamp;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.DynamicInsert;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

@Entity
@DynamicInsert
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
@Table(name = "TB_UT_FILE_STORAGE")
public class FileStorage {

    @Id
    @GeneratedValue(generator = "generator")
    @GenericGenerator(name = "generator", strategy = "increment")
    @Column(name = "ID")
    private int id;

    @Column(name = "CATEGORY")
    private String category;

    @Column(name = "FILE_NM")
    private String fileName;

    @Column(name = "FILE_TP")
    private String fileType;

    @Column(name = "FILE_SIZE")
    private Long fileSize;

    @Column(name = "FILE_PATH")
    private String filePath;

    @Column(name = "UPLOAD_UUID")
    private String uploadUuid;

    @Column(name = "UPLOAD_BY")
    private String uploadBy;

    @Column(name = "UPLOAD_DTTM")
    private Timestamp uploadDttm;

    @Column(name = "DELETE_YN")
    private String deleteYn;

    @Column(name = "DELETE_BY")
    private String deleteBy;

    @Column(name = "DELETE_DTTM")
    private Timestamp deleteDttm;

    @Column(name = "MODIFY_BY")
    private Timestamp modifyBy;

    @Column(name = "MODIFY_DTTM")
    private Timestamp modifyDttm;
    
}
