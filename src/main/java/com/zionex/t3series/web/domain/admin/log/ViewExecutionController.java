package com.zionex.t3series.web.domain.admin.log;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import com.zionex.t3series.web.domain.admin.user.UserService;

import org.apache.commons.lang3.StringUtils;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ViewExecutionController {

    private final ViewExecutionService viewExecutionService;

    private final UserService userService;
    
    @GetMapping("/system/logs/view-execution")
    public List<ViewExecution> getViewExecutionLog(@RequestParam("startDttm") @DateTimeFormat(iso = ISO.DATE_TIME) LocalDate startDate,
                                                   @RequestParam("endDttm") @DateTimeFormat(iso = ISO.DATE_TIME) LocalDate endDate,
                                                   @RequestParam(value = "menu-cd", required = false) String menuCd,
                                                   @RequestParam(value = "displayName", required = false) String menuNm,
                                                   @RequestParam(value = "viewName", required = false) String username) {
        return viewExecutionService.getViewExecutionLog(startDate, endDate, menuCd, menuNm, username);
    }

    @PostMapping("/system/logs/view-execution")
    public ViewExecution saveViewExecutionLog(@RequestBody String menuCd, HttpServletRequest request) {
        Object sessionId = request.getSession(false).getId();
        
        ViewExecution viewExecution = new ViewExecution();
        viewExecution.setId(sessionId.toString());
        viewExecution.setUser(userService.getUser(userService.getUserDetails().getUsername()));
        viewExecution.setViewCd(menuCd);
        viewExecution.setUserIp(getUserIp(request));
        viewExecution.setUserBrowser(getUserBrowser(request));
        viewExecution.setExecutionDttm(LocalDateTime.now());
        viewExecution.setModifyDttm(LocalDateTime.now());

        return viewExecutionService.saveViewExecutionLog(viewExecution);
    }

    private String getUserIp(HttpServletRequest request) {
        String ip = request.getHeader("X-FORWARDED-FOR");
        if (StringUtils.isEmpty(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }

        if (StringUtils.isEmpty(ip)) {
            ip = request.getHeader("WL-Proxy-Client-IP");
        }

        if (StringUtils.isEmpty(ip)) {
            ip = request.getRemoteAddr();
        }

        return ip;
    }

    private String getUserBrowser(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) {
            return "";
        }

        if (userAgent.contains("Trident")) {
            return "Internet Explorer";
        } else if (userAgent.contains("Chrome")) {
            return "Chrome";
        } else if (userAgent.contains("Opera")) {
            return "Opera";
        } else if (userAgent.contains("iPhone") && userAgent.contains("Mobile")) {
            return "iPhone";
        } else if (userAgent.contains("Android") && userAgent.contains("Mobile")) {
            return "Android";
        } else {
            return "Firefox";
        }
    }

}
