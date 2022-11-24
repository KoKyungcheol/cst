package com.zionex.t3series.web.domain.education.sample1;

import java.sql.Timestamp;

import javax.persistence.*;
import lombok.Data;

/**
 * CoPlant
 */
@Data
@Entity
@Table(name = "TB_CO_PLANT")
public class CoPlant {

    @Id
    @Column(name = "PLANT_CD")
    String plantCd;

    @Column(name = "PLANT_NM")
    String plantNm;

    @Column(name = "PLANT_GRP")
    String plantGrp;

    @Column(name = "ATTR_01_VAL")
    String attr01Val;

    @Column(name = "ATTR_02_VAL")
    String attr02Val;

    @Column(name = "ATTR_03_VAL")
    String attr03Val;

    @Column(name = "ATTR_04_VAL")
    String attr04Val;

    @Column(name = "ATTR_05_VAL")
    String attr05Val;

    @Column(name = "USE_YN")
    String useYn;

    @Column(name = "CREATION_ID")
    String creationId;

    @Column(name = "CREATION_DTM")
    Timestamp creationDtm;

    @Column(name = "MODIFY_ID")
    String modifyId;

    @Column(name = "MODIFY_DTM")
    Timestamp modifyDtm;

    @Transient
    String matCd;

    @Transient
    Float limitRate;
}