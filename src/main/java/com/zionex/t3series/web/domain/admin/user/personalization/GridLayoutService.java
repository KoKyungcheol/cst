package com.zionex.t3series.web.domain.admin.user.personalization;

import java.time.LocalDateTime;
import java.util.Set;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GridLayoutService {

    private final GridLayoutRepository gridLayoutRepository;

    public GridLayout getGridLayout(String username, String menuCode, String gridCode, String layoutType, String layoutName) {
        return gridLayoutRepository.findById(GridLayoutPK.builder().username(username).menuCode(menuCode)
                .gridCode(gridCode).layoutType(layoutType).layoutName(layoutName).build()).orElse(null);
    }

    public Set<GridLayout> getGridLayouts(String username, String menuCode, String gridCode, String layoutType) {
        return gridLayoutRepository.findByUsernameAndMenuCodeAndGridCodeAndLayoutType(username, menuCode, gridCode, layoutType);
    }

    public Set<GridLayout> getBaseGridLayouts(String menuCode, String gridCode, String layoutType) {
        return gridLayoutRepository.findByMenuCodeAndGridCodeAndLayoutTypeAndAllUser(menuCode, gridCode, layoutType, "Y");    
    }

    public GridLayout existsBaseGridLayout(String menuCode, String gridCode, String layoutType, String layoutName) {
        return gridLayoutRepository.findOneByMenuCodeAndGridCodeAndLayoutTypeAndLayoutNameAndAllUser(menuCode, gridCode, layoutType, layoutName, "Y");
    }

    public String saveGridLayout(GridLayout layout) {
        String message = "MSG_UPDATE_GRID_LAYOUT";

        GridLayout existsLayout = getGridLayout(layout.getUsername(), layout.getMenuCode(), layout.getGridCode(), layout.getLayoutType(), layout.getLayoutName());
        if (existsLayout == null) {
            message = "MSG_SAVE_GRID_LAYOUT";
        }
        layout.setSaveDttm(LocalDateTime.now());
        gridLayoutRepository.save(layout);

        return message;
    }

    public void deleteGridLayout(GridLayout layout) {
        gridLayoutRepository.delete(layout);
    }
    
}
