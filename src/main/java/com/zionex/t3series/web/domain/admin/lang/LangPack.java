package com.zionex.t3series.web.domain.admin.lang;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.zionex.t3series.web.util.audit.BaseEntity;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@IdClass(LangPackPK.class)
@JsonIgnoreProperties(ignoreUnknown = true)
@Table(name = "TB_AD_LANG_PACK")
public class LangPack extends BaseEntity {

    @Id
    String langCd;

    @Id
    String langKey;

    @Column(name = "LANG_VALUE")
    String langValue;

}
