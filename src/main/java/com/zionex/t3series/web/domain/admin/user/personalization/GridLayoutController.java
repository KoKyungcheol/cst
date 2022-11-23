package com.zionex.t3series.web.domain.admin.user.personalization;

import java.util.Set;

import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.zionex.t3series.web.domain.admin.user.User;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.util.ResponseEntityUtil;
import com.zionex.t3series.web.util.ResponseEntityUtil.ResponseMessage;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class GridLayoutController {

    private final GridLayoutService gridLayoutService;

    private final UserService userService;

    @GetMapping("/system/users/grid-layouts")
    public Object getGridLayouts(@RequestParam("username") String username, @RequestParam("menuCode") String menuCode, @RequestParam("gridCode") String gridCode,
                                 @RequestParam("layoutType") String layoutType, @RequestParam(value = "layoutName", required = false) String layoutName) {
        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(menuCode) || StringUtils.isEmpty(gridCode)) {
            return null;
        }

        User user = userService.getUser(username);
        if (user.getUsername() == null) {
            return null;
        }

        if (layoutName == null) {
            Set<GridLayout> gridLayouts = gridLayoutService.getGridLayouts(user.getUsername(), menuCode, gridCode, layoutType);
            gridLayouts.addAll(gridLayoutService.getBaseGridLayouts(menuCode, gridCode, layoutType));
            return gridLayouts;
        } else {
            GridLayout existBaseGridLayout = gridLayoutService.existsBaseGridLayout(menuCode, gridCode, layoutType, layoutName);
            if (existBaseGridLayout != null) {
                username = existBaseGridLayout.getUsername();
            }
            return gridLayoutService.getGridLayout(username, menuCode, gridCode, layoutType, layoutName);
        }
    }

    @PostMapping("/system/users/grid-layouts")
    public ResponseEntity<ResponseMessage> saveGridLayout(@RequestBody GridLayout layout) {
        ResponseEntity<ResponseMessage> responseEntityFail = ResponseEntityUtil.setResponseEntity(new ResponseMessage(HttpStatus.INTERNAL_SERVER_ERROR.value(), "MSG_FAIL_SAVE_GRID_LAYOUT"));
        if (layout == null) {
            return responseEntityFail;
        }

        if (StringUtils.isEmpty(layout.getUsername()) || StringUtils.isEmpty(layout.getMenuCode())
                || StringUtils.isEmpty(layout.getGridCode()) || StringUtils.isEmpty(layout.getGridLayout())) {
            return responseEntityFail;
        }

        User user = userService.getUser(layout.getUsername());
        if (user.getUsername() == null) {
            return responseEntityFail;
        }

        GridLayout existBaseGridLayout = gridLayoutService.existsBaseGridLayout(layout.getMenuCode(), layout.getGridCode(), layout.getLayoutType(), layout.getLayoutName());
        if (existBaseGridLayout != null && !layout.getUsername().equals(existBaseGridLayout.getUsername())) {
            return ResponseEntityUtil.setResponseEntity(new ResponseMessage(HttpStatus.INTERNAL_SERVER_ERROR.value(), "MSG_DUPLICATE_GRID_LAYOUT"));
        }

        String message = gridLayoutService.saveGridLayout(layout);
        return ResponseEntityUtil.setResponseEntity(new ResponseMessage(HttpStatus.OK.value(), message));
    }

    @PostMapping("/system/users/grid-layouts/delete")
    public ResponseEntity<ResponseMessage> deleteGridLayout(@RequestParam("username") String username, @RequestParam("menuCode") String menuCode,
                                                            @RequestParam("gridCode") String gridCode, @RequestParam("layoutType") String layoutType, @RequestParam("layoutName") String layoutName) {
        ResponseEntity<ResponseMessage> responseEntityFail = ResponseEntityUtil.setResponseEntity(new ResponseMessage(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Failed delete grid layout"));
        
        if (StringUtils.isEmpty(username) || StringUtils.isEmpty(menuCode) || StringUtils.isEmpty(gridCode)) {
            return responseEntityFail;
        }

        User user = userService.getUser(username);
        if (user.getUsername() == null) {
            return responseEntityFail;
        }

        GridLayout layout = gridLayoutService.getGridLayout(username, menuCode, gridCode, layoutType, layoutName);
        if (layout == null) {
            return responseEntityFail;
        } else {
            gridLayoutService.deleteGridLayout(layout); 
            return ResponseEntityUtil.setResponseEntity(new ResponseMessage(HttpStatus.OK.value(), null));
        }
    }

}
