package com.zionex.t3series.web.util.query;

import java.util.List;
import java.util.Map;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.springframework.stereotype.Service;

import com.zionex.t3series.web.domain.common.AsyncService;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Log
@Service
@RequiredArgsConstructor
public class QueryLogService {

    private final AsyncService asyncService;

    public void traceQuery(String procName, Map<String, Object> inputParams, List<Map<String, Object>> procParams) {
        try {
            int timeout = 200;
            Future<Long> future = asyncService.runAsync(() -> this.logProcedure(procName, inputParams, procParams));
            future.get(timeout, TimeUnit.SECONDS);
        } catch (TimeoutException te) {
            log.info("createVersionAsync waiting timeout but we will keep going our way");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public void logProcedure(String procName, Map<String, Object> inputParams, List<Map<String, Object>> procParams) {
        StringBuilder logBuilder = new StringBuilder();
        logBuilder.append(procName);
        logBuilder.append(" ");

        if (procParams != null) {
            for (Map<String, Object> paramInfo : procParams) {
                String orgParamName = paramInfo.get("COLUMN_NAME").toString();
                String paramName = orgParamName.replace("@", "");

                Object param = null;
                if (inputParams != null) {
                    param = inputParams.get(paramName);
                }

                if (param != null) {
                    logBuilder.append("'");
                    logBuilder.append(paramName).append("=").append(param);
                    logBuilder.append("'");
                    logBuilder.append(",");
                } else {
                    logBuilder.append("{NO PARAM VALUE}");
                    logBuilder.append(",");
                }
            }
        }
        log.info(logBuilder.substring(0, logBuilder.length() - 1));
    }

}
