package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.List;

import com.zionex.t3series.web.util.ResponseMessage;

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
public class PreferenceOptionController {

    private final PreferenceOptionService PreferenceOptionService;

    @GetMapping("/system/users/preference-options")
    public List<PreferenceOption> getPreferenceOptions(@RequestParam("pref-mst-id") String userPrefMstId) {
        return PreferenceOptionService.getPreferenceOptions(userPrefMstId);
    }

    @PostMapping("/system/users/preference-options")
    public ResponseEntity<ResponseMessage> savePreferenceOptions(@RequestBody List<PreferenceOption> preferenceOptions) {
        PreferenceOptionService.savePreferenceOptions(preferenceOptions);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated preference option entities"), HttpStatus.OK);
    }

    @PostMapping("/system/users/preference-options/delete")
    public ResponseEntity<ResponseMessage> deletePreferenceOptions(@RequestBody List<PreferenceOption> preferenceOptions) {
        PreferenceOptionService.deletePreferenceOptions(preferenceOptions);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Deleted preference option entities"), HttpStatus.OK);
    }

}
