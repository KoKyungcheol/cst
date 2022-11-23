package com.zionex.t3series.web.domain.admin.user.personalization;

import java.io.Serializable;

import javax.persistence.Column;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GridLayoutPK implements Serializable {

    private static final long serialVersionUID = -7309524535907676431L;

    @Column(name = "USERNAME")
    private String username;

    @Column(name = "MENU_CD")
    private String menuCode;

    @Column(name = "GRID_CD")
    private String gridCode;

    @Column(name = "LAYOUT_NAME")
    private String layoutName;

    @Column(name = "LAYOUT_TYPE")
    private String layoutType;

}
