package com.zionex.t3series.web.domain.util.noticeboard;

import java.time.LocalDateTime;
import java.util.ArrayList;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import org.hibernate.annotations.GenericGenerator;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@EqualsAndHashCode(callSuper = false)
@Table(name = "TB_UT_NOTICEBOARD")
@Entity
public class NoticeBoard {

    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "TITLE")
    private String title;

    @Column(name = "CONTENT")
    private String content;

    @Column(name = "NOTICE_YN")
    private String noticeYn;

    @Column(name = "DELETE_YN")
    private String deleteYn;
    
    @Column(name = "DELETE_BY")
    private String deleteBy;
    
    @Column(name = "DELETE_DTTM")
    private LocalDateTime deleteDttm;
    
    @Column(name = "CREATE_BY")
    private String createBy;
    
    @Column(name = "CREATE_DTTM")
    private LocalDateTime createDttm;
    
    @Column(name = "MODIFY_BY")
    private String modifyBy;
    
    @Column(name = "MODIFY_DTTM")
    private LocalDateTime modifyDttm;
    
    @Transient
    private ArrayList<Integer> files;

    @Transient
    private String createByDisplayName;

}
