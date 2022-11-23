package com.zionex.t3series.web.domain.admin.code;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.zionex.t3series.web.util.ResponseMessage;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CodeController {

    private final CodeService codeService;

    @GetMapping("/system/common/codes")
    public List<Code> getCodesByGroupCd(@RequestParam(value = "group-cd", defaultValue = "") String groupCd) {
        return codeService.getCodesByGroupCd(groupCd);
    }

    @GetMapping("/system/common/code-name-maps")
    public List<Map<String, String>> getCodeNameByGroups(@RequestParam("group-cd") String groupCd) throws UnsupportedEncodingException {
        List<Map<String, String>> comnNameMaps = new ArrayList<>();

        groupCd = URLDecoder.decode(groupCd, "UTF-8");

        String[] groups = groupCd.split(",");
        Arrays.sort(groups);

        for (String group : groups) {
            List<Code> comnCodes = codeService.getCodesByGroupCd(group);

            comnCodes.forEach(comnCode -> {
                Map<String, String> comnNameMap = new HashMap<>();
                comnNameMap.put("group", group);
                comnNameMap.put("code", comnCode.getComnCd());
                comnNameMap.put("name", comnCode.getComnCdNm());
                comnNameMaps.add(comnNameMap);
            });
        }

        return comnNameMaps;
    }

    @GetMapping("/system/common/codes/{src-id}")
    public List<Code> getCodes(@PathVariable("src-id") String srcId) {
        return codeService.getCodes(srcId);
    }

    @PostMapping("/system/common/codes")
    public ResponseEntity<ResponseMessage> saveCodes(@RequestBody List<Code> codes) {
        codeService.saveCodes(codes);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated common code entities"), HttpStatus.OK);
    }

    @PostMapping("/system/common/codes/delete")
    public ResponseEntity<ResponseMessage> deleteCodes(@RequestBody List<Code> codes) {
        codeService.deleteCodes(codes);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Deleted common code entities"), HttpStatus.OK);
    }

}
