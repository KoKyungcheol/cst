package com.zionex.t3series.web.domain.education.sample1;

import lombok.Data;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Data
@NamedStoredProcedureQuery(name = "SP_LS_CO_062_Q3", procedureName = "SP_LS_CO_062_Q3", resultClasses = Co062Result_03.class)
public class Co062Result_03 {

    @Column(name = "MTRL_CD")
    String mtrlCd;

    @Column(name = "MTRL_DESC")
    String mtrlDesc;

    @Id
    @Column(name = "PLANT_CD")
    String plantCd;

    @Column(name = "PLANT_NM")
    String plantNm;

    @Column(name = "MTRL_GRP")
    String mtrlGrp;

    @Column(name = "MTRL_GRP_NM")
    String mtrlGrpNm;

    @Column(name = "THPUT_PRIORITY")
    String thputPriority;

    @Column(name = "WG_TY")
    String wgTy;

    @Column(name = "MIN_WGT")
    String minWgt;

    @Column(name = "OPT_WGT")
    String optWgt;

    @Column(name = "MAX_WGT")
    String maxWgt;

    @Column(name = "THPUT_TYPE")
    String thputType;

    @Column(name = "THPUT_TYPE_NM")
    String thputTypeNm;

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

    @Column(name = "CREATE_ID")
    String createId;

    @Column(name = "CREATE_DTM")
    Timestamp createDtm;

    @Column(name = "MODIFY_ID")
    String modifyId;

    @Column(name = "MODIFY_DTM")
    Timestamp modifyDtm;

}
