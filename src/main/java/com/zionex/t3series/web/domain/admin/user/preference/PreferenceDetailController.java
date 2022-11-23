package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.admin.user.group.Group;
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
public class PreferenceDetailController {

    private final PreferenceDetailService preferenceDetailService;
    private final PreferenceInfoService preferenceService;

    @GetMapping("/system/users/preference-details/groups")
    public List<Group> getPreferenceDetailsGroups(@RequestParam(value = "pref-mst-id", defaultValue = "") String userPrefMstId, @RequestParam("username") String username) {
        return preferenceDetailService.getPreferenceDetailsGroups(userPrefMstId, username);
    }

    @GetMapping("/system/users/preference-details")
    public List<PreferenceDetail> getPreferenceDetails(@RequestParam("pref-mst-id") String userPrefMstId, @RequestParam("group-id") String groupId) {
        return preferenceDetailService.getPreferenceDetails(userPrefMstId, groupId);
    }

    @PostMapping("/system/users/preference-details")
    public ResponseEntity<ResponseMessage> savePreferenceDetails(@RequestBody List<PreferenceDetail> preferenceDetails) {
        if (!preferenceDetails.isEmpty()) {
            PreferenceDetail first = preferenceDetails.get(0);
            List<String> userIds = preferenceService.getPreferences(first.getUserPrefMstId(), first.getGrpId(), null)
                                    .stream()
                                    .map(PreferenceInfo::getUserId)
                                    .distinct()
                                    .collect(Collectors.toList());

            List<PreferenceInfo> preferences = new ArrayList<>();

            preferenceDetails.forEach(p -> {
                boolean exists = preferenceDetailService.existsPreferenceDetail(p.getUserPrefMstId(), p.getGrpId(), p.getFldCd());
                String crosstabItemCd = p.getCrosstabItemCd();

                if (crosstabItemCd != null && crosstabItemCd.equals("GROUP-VERTICAL-VALUES")) {
                    p.setCrosstabYn(p.getFldActiveYn());
                }

                if (!exists && !userIds.isEmpty()) {
                    userIds.forEach(userId -> {
            
                        PreferenceInfo preference = new PreferenceInfo();
                        preference.setUserId(userId);
                        preference.setUserPrefMstId(p.getUserPrefMstId());
                        preference.setGrpId(p.getGrpId());
                        preference.setFldCd(p.getFldCd());
                        preference.setFldApplyCd(p.getFldApplyCd());
                        preference.setFldWidth(p.getFldWidth());
                        preference.setFldSeq(p.getFldSeq());
                        preference.setFldActiveYn(p.getFldActiveYn());
                        preference.setApplyYn(p.getApplyYn());
                        preference.setReferValue(p.getReferValue());
                        preference.setDataKeyYn(p.getDataKeyYn());
                        preference.setCrosstabItemCd(crosstabItemCd);
                        preference.setCrosstabYn(p.getCrosstabYn());
                        preference.setCategoryGroup(p.getCategoryGroup());
                        preference.setDimMeasureTp(p.getDimMeasureTp());
                        preference.setSummaryTp(p.getSummaryTp());
                        preference.setSummaryYn(p.getSummaryYn());

                        preferences.add(preference);
                    });
                }
            });

            preferenceDetailService.savePreferenceDetails(preferenceDetails);
            preferenceService.savePreferences(preferences);
        }

        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated preference detail entities"), HttpStatus.OK);
    }

    @PostMapping("/system/users/preference-details/delete")
    public ResponseEntity<ResponseMessage> deletePreferenceDetails(@RequestBody List<PreferenceDetail> preferenceDetails) {
        if (!preferenceDetails.isEmpty()) {
            List<PreferenceInfo> preferences = new ArrayList<>();

            preferenceDetails.forEach(p -> {
                PreferenceInfo preference = new PreferenceInfo();
                preference.setUserPrefMstId(p.getUserPrefMstId());
                preference.setGrpId(p.getGrpId());
                preference.setFldCd(p.getFldCd());

                preferences.add(preference);
            });

            preferenceDetailService.deletePreferenceDetails(preferenceDetails);
            preferenceService.deletePreferences(preferences);
        }

        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Deleted preference detail entities"), HttpStatus.OK);
    }

}
