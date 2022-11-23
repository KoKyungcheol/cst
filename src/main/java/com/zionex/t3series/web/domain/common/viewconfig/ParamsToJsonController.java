package com.zionex.t3series.web.domain.common.viewconfig;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.persistence.ParameterMode;
import javax.servlet.http.HttpServletResponse;

import com.zionex.t3series.web.constant.ApplicationConstants;
import com.zionex.t3series.web.constant.ServiceConstants;
import com.zionex.t3series.web.util.query.QueryHandler;

import org.json.simple.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class ParamsToJsonController {

    private final QueryHandler queryHandler;

    @Value("${spring.datasource.platform}")
    private String databaseType;

    @SuppressWarnings("unchecked")
    @PostMapping("/view-config/json-save")
    public void saveData(@RequestBody Map<String, Object> allParameters, HttpServletResponse response) {
        String procedure = (String) allParameters.get("procedure");
        Map<String, Object> params = new HashMap<>();
        params.put("P_JSON", new Object[] { allParameters.get("changes"), String.class, ParameterMode.IN });

        // procedure & changes 이외의 모든 parameter를 추가한다.
        for (String key : allParameters.keySet()) {
            if (key.equals("changes") || key.equals("procedure")) {
                continue;
            }
            params.put(key, new Object[] { allParameters.get(key), String.class, ParameterMode.IN });
        }

        params.put("P_RT_ROLLBACK_FLAG", new Object[] { null, String.class, ParameterMode.OUT });
        params.put("P_RT_MSG", new Object[] { null, String.class, ParameterMode.OUT });
        List<Map<String, Object>> result = (List<Map<String, Object>>) queryHandler.getProcedureData(procedure, null, params);

        boolean resultFlag = false;
        String message = "MSG_0004";
        if (!result.isEmpty()) {
            Map<String, Object> resultMap = result.get(0);
            if (resultMap != null) {
                String rollbackFlag = (String) resultMap.get("P_RT_ROLLBACK_FLAG");
                message = (String) resultMap.get("P_RT_MSG");

                if (rollbackFlag == null || rollbackFlag.equals("false")) {
                    resultFlag = false;
                }
            }
        }

        // Make Resonse Result - IMTC1 - WING-UI 1.0
        Map<String, Object> mapResult = new HashMap<String, Object>();
        Map<String, Object> mapData = new HashMap<String, Object>();

        mapData.put(procedure + "_P_RT_MSG", message);
        mapResult.put(ServiceConstants.RESULT_KEY_IM_DATA, mapData);
        mapResult.put(ServiceConstants.RESULT_KEY_ITC1_DATA, Collections.EMPTY_MAP);

        response.setContentType(ApplicationConstants.CONTENT_TYPE_JSON);
        JSONObject resultData = new JSONObject(mapResult);

        PrintWriter pw;
        try {
            pw = response.getWriter();
            pw.print(resultData);
            pw.flush();
            pw.close();
        } catch (IOException e) {
        }
    }
}
