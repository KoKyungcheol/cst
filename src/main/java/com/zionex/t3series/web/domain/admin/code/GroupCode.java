package com.zionex.t3series.web.domain.admin.code;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.zionex.t3series.web.util.audit.BaseEntity;
import com.zionex.t3series.web.util.converter.BooleanToYNConverter;

import org.hibernate.annotations.GenericGenerator;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TB_AD_COMN_GRP")
public class GroupCode extends BaseEntity {

    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "GRP_CD")
    private String grpCd;

    @Column(name = "GRP_NM")
    private String grpNm;

    @Column(name = "DESCRIP")
    private String descrip;

    @Transient
    private String descripLangValue;

    @Column(name = "USE_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean useYn;

    @Column(name = "DEL_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean delYn = false;

    @Column(name = "ATTR_01_VAL")
    private String attr01Val;

    @Column(name = "ATTR_02_VAL")
    private String attr02Val;

    @Column(name = "ATTR_03_VAL")
    private String attr03Val;

    @Column(name = "ATTR_04_VAL")
    private String attr04Val;

    @Column(name = "ATTR_05_VAL")
    private String attr05Val;

}
