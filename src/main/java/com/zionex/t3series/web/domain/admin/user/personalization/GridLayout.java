package com.zionex.t3series.web.domain.admin.user.personalization;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.Table;

import com.zionex.t3series.web.util.audit.BaseEntity;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@IdClass(GridLayoutPK.class)
@Table(name = "TB_AD_USER_LAYOUT")
public class GridLayout extends BaseEntity {

    @Id
    private String username;

    @Id
    private String menuCode;

    @Id
    private String gridCode;

    @Id
    private String layoutName;

    @Id
    private String layoutType;

    @Column(name = "ALL_USER")
    private String allUser;

    @Column(name = "GRID_LAYOUT")
    private String gridLayout;

    @Column(name = "SAVE_DTTM")
    private LocalDateTime saveDttm;

}
