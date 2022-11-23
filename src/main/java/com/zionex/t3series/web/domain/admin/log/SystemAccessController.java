package com.zionex.t3series.web.domain.admin.log;

import java.time.LocalDateTime;

import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.DateTimeFormat.ISO;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class SystemAccessController {

    private final SystemAccessService systemAccessService;

    @GetMapping("/system/logs/system-access")
    public Page<SystemAccess> getSystemAccessLog(@RequestParam("display-name") String displayName,
                                                 @DateTimeFormat(iso = ISO.DATE_TIME) @RequestParam("accessdttm-from") LocalDateTime accessDttmFrom,
                                                 @DateTimeFormat(iso = ISO.DATE_TIME) @RequestParam("accessdttm-to") LocalDateTime accessDttmTo,
                                                 @RequestParam("page") int page, @RequestParam("size") int size) {
        return systemAccessService.getSystemAccessLog(displayName, accessDttmFrom, accessDttmTo, page, size);
    }

}
