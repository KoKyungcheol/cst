package com.zionex.t3series.web.domain.admin.user.preference;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.zionex.t3series.web.util.ResponseMessage;

import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class PreferenceMasterController {

    private final PreferenceMasterService preferenceMasterService;
    private final PreferenceDetailService preferenceDetailService;

    @GetMapping("/system/users/preference-masters/code-name-maps")
    public List<Map<String, String>> getPreferenceMasters(@RequestParam("view-cd") String viewCd) {
        List<Map<String, String>> codeNameMaps = new ArrayList<>();
        preferenceMasterService.getPreferenceMasters(viewCd).forEach(pm -> {
            int rowCount = preferenceDetailService.getRowCount(pm.getId());

            if (rowCount > 0) {
                String descrip = pm.getGridDescrip();
                if (descrip == null || descrip.isEmpty()) {
                    descrip = pm.getGridCd();
                }
    
                Map<String, String> codeNameMap = new HashMap<>();
                codeNameMap.put("id", pm.getId());
                codeNameMap.put("code", pm.getGridCd());
                codeNameMap.put("name", descrip);
                codeNameMaps.add(codeNameMap);
            }
        });
        return codeNameMaps;
    }

    @GetMapping("/system/users/preference-masters")
    public List<PreferenceMaster> getPreferenceMasters(@RequestParam(value = "view-cd", required = false) String viewCd,
            @RequestParam(value = "view-nm", required = false) String viewNm, 
            @RequestParam(value = "lang-cd", required = false) String langCd) throws UnsupportedEncodingException {

        if (StringUtils.isEmpty(viewCd)) viewCd = null;
        if (StringUtils.isEmpty(viewNm)) viewNm = null;
        if (StringUtils.isEmpty(langCd)) langCd = null;

        if (viewNm != null) {
            viewNm = URLDecoder.decode(viewNm, "UTF-8");
        }

        return preferenceMasterService.getPreferenceMasters(viewCd, viewNm, langCd);
    }

    @PostMapping("/system/users/preference-masters")
    public ResponseEntity<ResponseMessage> savePreferenceMasters(@RequestBody List<PreferenceMaster> preferenceMasters) {
        preferenceMasterService.savePreferenceMasters(preferenceMasters);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated preference master entities"), HttpStatus.OK);
    }

    @PostMapping("/system/users/preference-masters/delete")
    public ResponseEntity<ResponseMessage> deletePreferenceMasters(@RequestBody List<PreferenceMaster> preferenceMasters) {
        preferenceMasterService.deletePreferenceMasters(preferenceMasters);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Deleted preference master entities"), HttpStatus.OK);
    }

}
