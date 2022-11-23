package com.zionex.t3series.web.domain.admin.user.preference;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.MappedSuperclass;
import javax.persistence.Transient;

import com.zionex.t3series.web.util.audit.BaseEntity;
import com.zionex.t3series.web.util.converter.BooleanToYNConverter;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@MappedSuperclass
public class Preference extends BaseEntity {
    
    @Column(name = "USER_PREF_MST_ID")
    private String userPrefMstId;
    
    @Column(name = "GRP_ID")
    private String grpId;

    @Column(name = "FLD_CD")
    private String fldCd;

    @Column(name = "FLD_APPLY_CD")
    private String fldApplyCd;
    
    @Column(name = "FLD_WIDTH")
    private Integer fldWidth;
    
    @Column(name = "FLD_SEQ")
    private Integer fldSeq;
    
    @Column(name = "FLD_ACTIVE_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean fldActiveYn;
    
    @Column(name = "APPLY_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean applyYn;
    
    @Column(name = "REFER_VALUE")
    private String referValue;
    
    @Column(name = "CROSSTAB_ITEM_CD")
    private String crosstabItemCd;
    
    @Column(name = "CATEGORY_GROUP")
    private String categoryGroup;
    
    @Column(name = "DIM_MEASURE_TP")
    private String dimMeasureTp;
    
    @Column(name = "SUMMARY_TP")
    private String summaryTp;
    
    @Column(name = "SUMMARY_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean summaryYn;
    
    @Column(name = "EDIT_MEASURE_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean editMeasureYn;
    
    @Column(name = "EDIT_TARGET_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean editTargetYn;
    
    @Column(name = "DATA_KEY_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean dataKeyYn;
    
    @Column(name = "CROSSTAB_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean crosstabYn;

    @Transient
    private String gridCd;

    @Transient
    private String fldApplyCdLang;

    public String getFldApplyCdLang() {
        return getFldApplyCd();
    }
    
    public Integer getFldWidth() {
        return fldWidth = (fldWidth == null) ? 100 : fldWidth;
    }

    public Integer getFldSeq() {
        return fldSeq = (fldSeq == null) ? 0 : fldSeq;
    }
    
}
