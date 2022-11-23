package com.zionex.t3series.web.domain.common;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CommonController {

    private final CommonService commonService;

    private static final String PARAM_PROCEDURE = "PROCEDURE_NAME";

    @PostMapping("/common/combos")
    public List<Map<String, Object>> getCombos(@RequestBody Map<String, Object> allParameters, HttpServletResponse response) {
        String procedureName = (String) allParameters.get(PARAM_PROCEDURE);
        Map<String, Object> procParam = new HashMap<>();
        
        for (String key : allParameters.keySet()) {
            if (key.equals(PARAM_PROCEDURE)) {
                continue;
            }
            procParam.put(key, allParameters.get(key));
        }
        
        return commonService.getCombos(procedureName, procParam);
    }
    
}
