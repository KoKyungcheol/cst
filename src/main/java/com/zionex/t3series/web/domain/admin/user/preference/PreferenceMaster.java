package com.zionex.t3series.web.domain.admin.user.preference;

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
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "TB_AD_USER_PREF_MST")
@JsonIgnoreProperties(ignoreUnknown = true)
public class PreferenceMaster extends BaseEntity {

    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "VIEW_CD")
    private String viewCd;

    @Column(name = "GRID_CD")
    private String gridCd;
    
    @Column(name = "GRID_DESCRIP")
    private String gridDescrip;
    
    @Transient
    private String gridDescripLangValue;

    @Column(name = "CROSSTAB_TP")
    private String crosstabTp;
    
    @Column(name = "AUTO_CREATE_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean autoCreateYn;
    
    @Transient
    private String viewNm;

    public String getViewNm() {
        return viewNm = viewCd;
    }

}
