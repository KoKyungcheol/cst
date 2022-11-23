package com.zionex.t3series.web.domain.admin.menu;

import javax.persistence.Column;
import javax.persistence.Convert;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.Id;
import javax.persistence.Table;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.zionex.t3series.web.util.audit.BaseEntity;
import com.zionex.t3series.web.util.converter.BooleanToYNConverter;

import org.hibernate.annotations.GenericGenerator;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@JsonIgnoreProperties
@Entity
@Table(name = "TB_AD_MENU")
public class Menu extends BaseEntity {

    @Id
    @GeneratedValue(generator = "generator-uuid")
    @GenericGenerator(name = "generator-uuid", strategy = "uuid")
    @Column(name = "ID")
    private String id;

    @Column(name = "PARENT_ID")
    private String parentId;

    @Column(name = "MENU_CD")
    private String menuCd;

    @Column(name = "MENU_PATH")
    private String menuPath;

    @Column(name = "MENU_TP")
    private String menuTp;

    @Column(name = "MENU_SEQ")
    private Integer menuSeq;
    
    @Column(name = "MENU_ICON")
    private String menuIcon;

    @Column(name = "USE_YN")
    @Convert(converter = BooleanToYNConverter.class)
    private Boolean useYn;

}
