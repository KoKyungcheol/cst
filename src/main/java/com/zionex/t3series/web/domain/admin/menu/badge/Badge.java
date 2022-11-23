package com.zionex.t3series.web.domain.admin.menu.badge;

import java.time.LocalDateTime;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.Transient;

import lombok.Data;

@Entity
@Data
@Table(name = "TB_AD_MENU_BADGE")
public class Badge {

    @Id
    @Column(name = "MENU_ID")
    private String menuId;

    @Transient
    private String menuCd;

    @Column(name = "BADGE_CONTENT")
    private String badgeContent;

    @Column(name = "EXPIRED_DTTM")
    private LocalDateTime expiredDttm;

    @Column(name = "EXPIRED_DAYS")
    private Integer expiredDays;

}
