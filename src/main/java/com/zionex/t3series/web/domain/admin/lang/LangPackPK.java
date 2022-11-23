package com.zionex.t3series.web.domain.admin.lang;

import java.io.Serializable;

import javax.persistence.Column;

import lombok.Data;

@Data
public class LangPackPK implements Serializable {

    private static final long serialVersionUID = -7503002688319837409L;

    @Column(name = "LANG_CD")
    String langCd;

    @Column(name = "LANG_KEY")
    String langKey;

}
