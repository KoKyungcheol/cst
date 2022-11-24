package com.zionex.t3series.web.domain.education.sample1;

import lombok.Data;

import javax.persistence.*;

@Entity
@Data
@NamedStoredProcedureQuery(name = "SP_LS_CO_062_Q1", procedureName = "SP_LS_CO_062_Q1", resultClasses = Co062Result_01.class)
public class Co062Result_01 {

    @Id
    @Column(name = "COMN_CD")
    String comnCd;

    @Column(name = "COMN_CD_NM")
    String comnCdnm;

    @Column(name = "KEY_VAL")
    String keyVal;

}
