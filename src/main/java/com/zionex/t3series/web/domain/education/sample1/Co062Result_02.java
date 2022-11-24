package com.zionex.t3series.web.domain.education.sample1;

import lombok.Data;

import javax.persistence.*;
import java.sql.Timestamp;

@Entity
@Data
@NamedStoredProcedureQuery(name = "SP_LS_CO_062_Q2", procedureName = "SP_LS_CO_062_Q2", resultClasses = Co062Result_02.class)
public class Co062Result_02 {

    @Id
    @Column(name = "MTRL_CD")
    String mtrlCd;

    @Column(name = "MTRL_DESC")
    String mtrlDesc;

    @Column(name = "EVAL_CLASS_NM")
    String evalClassNm;

    @Column(name = "MTRL_UOM")
    String mtrlUom;

    @Column(name = "MTRL_GRP_LRG")
    String mtrlGrpLrg;

    @Column(name = "MTRL_GRP_LRG_NM")
    String mtrlGrpLrgNm;

    @Column(name = "CONVT_PRIORITY")
    String convtPriority;

    @Column(name = "REFINE_PRIORITY")
    String refinePriority;

    @Column(name = "BAD_RAT")
    String badRat;

    @Column(name = "USE_YN")
    String useYn;

    @Column(name = "REMARK")
    String remark;

    @Column(name = "MODIFY_DTM")
    Timestamp modifyDtm;

    @Transient
    String modifyId;

}
