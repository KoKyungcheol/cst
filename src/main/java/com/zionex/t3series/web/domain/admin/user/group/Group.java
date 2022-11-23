package com.zionex.t3series.web.domain.admin.user.group;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import org.hibernate.annotations.GenericGenerator;

import lombok.Data;

@Data
@Entity
@Table(name = "TB_AD_GROUP")
public class Group {

    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "GRP_CD")
    private String grpCd;

    @Column(name = "GRP_NM")
    private String grpNm;

    @Column(name = "GRP_DESCRIP")
    private String grpDescrip;
    
}
