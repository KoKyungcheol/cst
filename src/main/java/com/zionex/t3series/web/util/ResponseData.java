
package com.zionex.t3series.web.util;

import static com.zionex.t3series.web.constant.ApplicationConstants.CONTENT_TYPE_JSON;

import java.io.IOException;
import java.io.PrintWriter;

import javax.servlet.http.HttpServletResponse;

import com.zionex.t3series.web.constant.ServiceConstants;

import org.json.simple.JSONObject;

import lombok.extern.java.Log;

@Log
public class ResponseData {

    protected void responseError(HttpServletResponse response, String message) {
        responseError(response, message, "");
    }

    @SuppressWarnings("unchecked")
    protected void responseError(HttpServletResponse response, String message, String code) {
        JSONObject resultData = new JSONObject();
        resultData.put(ServiceConstants.PARAMETER_KEY_RESULT_CODE, code);
        resultData.put(ServiceConstants.PARAMETER_KEY_RESULT_SUCCESS, Boolean.FALSE);
        resultData.put(ServiceConstants.PARAMETER_KEY_RESULT_MESSAGE, message == null ? "The service has failed." : message);
        resultData.put(ServiceConstants.PARAMETER_KEY_RESULT_TYPE, ServiceConstants.RESULT_TYPE_I);
        responseResult(response, resultData);
    }

    protected void responseResult(HttpServletResponse response, Object result) {
        try {
            response.setContentType(CONTENT_TYPE_JSON);
            PrintWriter pw = response.getWriter();
            pw.print(result);
            pw.flush();
            pw.close();
        } catch (IOException e) {
            log.warning("response result fails");
        }
    }

}
