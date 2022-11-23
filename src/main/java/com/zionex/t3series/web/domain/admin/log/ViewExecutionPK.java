package com.zionex.t3series.web.domain.admin.log;

import java.io.Serializable;

import javax.persistence.Column;

import lombok.Data;

@Data
public class ViewExecutionPK implements Serializable {

    private static final long serialVersionUID = -7503002688319837501L;

    @Column(name = "ID")
    private String id;

    @Column(name = "VIEW_CD")
    private String viewCd;

}
