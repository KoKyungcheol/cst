package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.domain.admin.user.group.GroupService;
import com.zionex.t3series.web.domain.admin.user.group.UserGroupService;
import com.zionex.t3series.web.util.ResponseMessage;
import com.zionex.t3series.web.util.audit.BaseEntity;
import com.zionex.t3series.web.util.crosstab.Crosstab;
import com.zionex.t3series.web.util.crosstab.Crosstab.Item;

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
public class PreferenceInfoController {

    private final PreferenceInfoService preferenceService;

    private final PreferenceMasterService preferenceMasterService;
    private final PreferenceDetailService preferenceDetailService;
    private final PreferenceOptionService preferenceOptionService;
    
    private final UserService userService;
    private final GroupService groupService;
    private final UserGroupService userGroupService;

    @GetMapping("/system/users/preferences/init")
    public ResponseEntity<ResponseMessage> initPreferences(@RequestParam("pref-mst-id") final String userPrefMstId, @RequestParam("group-id") final String groupId, @RequestParam("username") final String username) {
        final String userId = userService.getUser(username).getId();

        preferenceService.deletePreferences(userPrefMstId, groupId, userId);

        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Applied preference init entities"), HttpStatus.OK);
    }

    @GetMapping("/system/users/preferences")
    public List<? extends BaseEntity> getPreferences(@RequestParam("pref-mst-id") String userPrefMstId, @RequestParam(value = "group-id", defaultValue = "") String groupId, @RequestParam("username") String username) {
        String userId = userService.getUser(username).getId();

        final List<PreferenceInfo> preferences = preferenceService.getPreferences(userPrefMstId, groupId, userId);

        if (!preferences.isEmpty())
            return preferences;
        else {
            return preferenceDetailService.getPreferenceDetails(userPrefMstId, groupId);
        }
    }

    @PostMapping("/system/users/preferences")
    public ResponseEntity<ResponseMessage> savePreferences(@RequestBody final Map<String, String> map) throws JsonProcessingException {
        final ObjectMapper objectMapper = new ObjectMapper();

        final List<PreferenceInfo> preferences = objectMapper.readValue(map.get("pref-info") , new TypeReference<List<PreferenceInfo>>() {});
        if (!preferences.isEmpty()) {
            final List<PreferenceInfo> preferenceUpdates = new ArrayList<>();
            final PreferenceInfo first = preferences.get(0);

            final String userId = userService.getUser(map.get("username")).getId();
            final String grpId = ( map.get("grp-cd") == null ) ? first.getGrpId() : groupService.getGrpId(map.get("grp-cd"));

            final int rowCount  = preferenceService.getRowCount(userId, first.getUserPrefMstId(), grpId);
            if (rowCount < 1) {
                final List<PreferenceInfo> initPreferences = new ArrayList<>();

                final List<PreferenceDetail> preferenceDetails = preferenceDetailService.getPreferenceDetails(first.getUserPrefMstId(), first.getGrpId());
                preferenceDetails.forEach(p -> {
                    final PreferenceInfo preference = new PreferenceInfo();
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
                    preference.setCrosstabItemCd(p.getCrosstabItemCd());
                    preference.setCategoryGroup(p.getCategoryGroup());
                    preference.setDimMeasureTp(p.getDimMeasureTp());
                    preference.setSummaryTp(p.getSummaryTp());
                    preference.setSummaryYn(p.getSummaryYn());
                    preference.setEditMeasureYn(p.getEditMeasureYn());
                    preference.setEditTargetYn(p.getEditTargetYn());
                    preference.setDataKeyYn(p.getDataKeyYn());
                    preference.setCrosstabYn(p.getCrosstabYn());
        
                    initPreferences.add(preference);
                });
        
                preferenceService.savePreferences(initPreferences);
            }

            preferences.forEach(p -> {
                final PreferenceInfo preference = preferenceService.getPreference(userId, p.getUserPrefMstId(), p.getGrpId(), p.getFldCd());

                if(preference != null) {
                    preference.setFldApplyCd(p.getFldApplyCd());
                    preference.setFldWidth(p.getFldWidth());
                    preference.setFldSeq(p.getFldSeq());
                    preference.setFldActiveYn(p.getFldActiveYn());
                    preference.setApplyYn(p.getApplyYn());
                    preference.setReferValue(p.getReferValue());
                    preference.setDataKeyYn(p.getDataKeyYn());
                    preference.setCrosstabItemCd(p.getCrosstabItemCd());
                    preference.setSummaryTp(p.getSummaryTp());
                    preference.setCrosstabYn(p.getCrosstabYn());

                    preferenceUpdates.add(preference);
                }
            });

            preferenceService.savePreferences(preferenceUpdates);
        }

        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated preference entities"), HttpStatus.OK);
    }

    @GetMapping("/system/users/preferences/crosstab-info")
    @SuppressWarnings("unchecked")
    public Map<String, Map<String, Map<String, Object>>> getCrosstabInfo(@RequestParam("view-cd") final String viewCd, @RequestParam(value = "grp-cd", required = false) final String grpCd, @RequestParam("username") final String username) {
        final Crosstab crosstab = new Crosstab();

        final Map<String, String> crosstabTpMap = new HashMap<>();

        final List<PreferenceMaster> prefMasters = preferenceMasterService.getPreferenceMastersByCrosstabTpNotNull(viewCd);
        if (prefMasters.isEmpty()) {
            return Collections.emptyMap();
        }

        final List<String> userPrefMstIds = new ArrayList<>();
        final String grpId = ( grpCd == null ) ? userGroupService.getUserGroupDefault(username).getId() : groupService.getGrpId(grpCd);
        final String userId = userService.getUser(username).getId();

        prefMasters.forEach(prefMaster -> {
            userPrefMstIds.add(prefMaster.getId());
            crosstabTpMap.put(viewCd + "-" + prefMaster.getGridCd(), prefMaster.getCrosstabTp());
        });

        final Map<String, Map<String, Map<String, Object>>> crosstabInfo = new HashMap<>();

        final Set<String> summarableGrids = new HashSet<>();

        userPrefMstIds.forEach(userPrefMstId -> {
            List<? extends Preference> preferences = preferenceService.getPreferencesForCrosstab(userPrefMstId, grpId, userId);
            if (preferences.isEmpty()) {
                preferences = preferenceDetailService.getPreferenceDetailsForCrosstab(userPrefMstId, grpId);
            }

            preferences.stream().filter(prefer -> prefer != null && !prefer.getCrosstabItemCd().equals("")).forEach(preference -> {
                final PreferenceMaster prefMaster = preferenceMasterService.getPreferenceMaster(preference.getUserPrefMstId());
    
                final String gridCd = viewCd + "-" + prefMaster.getGridCd();
                final String crosstabTp = crosstabTpMap.get(gridCd);
    
                Map<String, Map<String, Object>> crosstabMap = crosstabInfo.get(gridCd);
                if (crosstabMap == null) {
                    crosstabMap = new HashMap<>();
                    crosstabInfo.put(gridCd, crosstabMap);
                }
    
                Map<String, Object> crosstabItemMap = crosstabMap.get(crosstabTp);
                if (crosstabItemMap == null) {
                    crosstabItemMap = new HashMap<>();
                    crosstabMap.put(crosstabTp, crosstabItemMap);
                }
    
                if (preference.getSummaryYn() && !preference.getDataKeyYn()) {
                    summarableGrids.add(gridCd);
                }

                final String crosstabItemName = preference.getCrosstabItemCd();
                final String fldCd = preference.getFldCd();
                String fldApplyCd = preference.getFldApplyCd();
                String categoryGroup = preference.getCategoryGroup();
    
                if (preference.getCrosstabYn()) {
                    if (fldApplyCd == null) {
                        fldApplyCd = "";
                    }
        
                    if (categoryGroup == null) {
                        categoryGroup = "";
                    }

                    String crosstabItemValue;
        
                    final Item crosstabItem = crosstab.getItem(crosstabItemName);
                    if (crosstabItem.getItemName().equals("group-vertical-values")) {
                        if (fldApplyCd.isEmpty()) {
                            crosstabItemValue = fldCd + ":" + fldCd + ":" + categoryGroup;
                        } else {
                            crosstabItemValue = fldCd + ":" + fldApplyCd + ":" + categoryGroup;
                        }
                    } else {
                        crosstabItemValue = fldCd;
                    }
        
                    if (crosstabItem.getDataType().equals("array")) {
                        List<String> crosstabItemValues = (List<String>) crosstabItemMap.get(crosstabItem.getItemName());
                        if (crosstabItemValues == null) {
                            crosstabItemValues = new ArrayList<>();
                            crosstabItemMap.put(crosstabItem.getItemName(), crosstabItemValues);
                        }
                        crosstabItemValues.add(crosstabItemValue);
                    } else {
                        crosstabItemMap.put(crosstabItem.getItemName(), crosstabItemValue);
                    }
        
                    if (preference.getDataKeyYn()) {
                        final String newCrosstabItemValue = fldCd;
        
                        final Item newCrosstabItem = crosstab.getItem("data-keys");
                        if (newCrosstabItem.getDataType().equals("array")) {
                            List<String> newCrosstabItemValues = (List<String>) crosstabItemMap.get(newCrosstabItem.getItemName());
                            if (newCrosstabItemValues == null) {
                                newCrosstabItemValues = new ArrayList<>();
                                crosstabItemMap.put(newCrosstabItem.getItemName(), newCrosstabItemValues);
                            }
                            newCrosstabItemValues.add(newCrosstabItemValue);
                        } else {
                            crosstabItemMap.put(newCrosstabItem.getItemName(), newCrosstabItemValue);
                        }
                    }

                    final String summaryTp = preference.getSummaryTp();
                    if (summaryTp != null && crosstabItem.isSummaryItem()) {
                        final String newCrosstabItemValue = fldCd + ":" + summaryTp;
    
                        final Item newCrosstabItem = crosstab.getItem("summary-type");
                        if (newCrosstabItem.getDataType().equals("array")) {
                            List<String> newCrosstabItemValues = (List<String>) crosstabItemMap.get(newCrosstabItem.getItemName());
                            if (newCrosstabItemValues == null) {
                                newCrosstabItemValues = new ArrayList<>();
                                crosstabItemMap.put(newCrosstabItem.getItemName(), newCrosstabItemValues);
                            }
                            newCrosstabItemValues.add(newCrosstabItemValue);
                        } else {
                            crosstabItemMap.put(newCrosstabItem.getItemName(), newCrosstabItemValue);
                        }
                    }
                }
            });
        });

        if (crosstabInfo.isEmpty()) {
            return Collections.emptyMap();
        }

        crosstabTpMap.keySet().forEach(gridCd -> {
            final Map<String, Map<String, Object>> crosstabMap = crosstabInfo.get(gridCd);
            if (crosstabMap != null) {
                crosstabMap.values().forEach(crosstabItemMap -> {
                    if (!summarableGrids.contains(gridCd)) {
                        crosstabItemMap.remove("summary-type");
                    }
                });
            }
        });

        final List<PreferenceOption> prefOptions = preferenceOptionService.getPreferenceOptions(userPrefMstIds);
        prefOptions.forEach(prefOption -> {
            final PreferenceMaster prefMaster = preferenceMasterService.getPreferenceMaster(prefOption.getUserPrefMstId());

            final String gridCd = viewCd + "-" + prefMaster.getGridCd();
            final String crosstabTp = crosstabTpMap.get(gridCd);

            Map<String, Map<String, Object>> crosstabMap = crosstabInfo.get(gridCd);
            if (crosstabMap == null) {
                crosstabMap = new HashMap<>();
                crosstabInfo.put(gridCd, crosstabMap);
            }

            Map<String, Object> crosstabItemMap = crosstabMap.get(crosstabTp);
            if (crosstabItemMap == null) {
                crosstabItemMap = new HashMap<>();
                crosstabMap.put(crosstabTp, crosstabItemMap);
            }

            final String crosstabItemName = prefOption.getOptTp();
            final String crosstabItemValue = prefOption.getOptValue();
            
            crosstabItemMap.put(crosstabItemName, crosstabItemValue);
        });

        return crosstabInfo;
    }

    @GetMapping("/system/users/preferences/pref-info")
    public List<? extends BaseEntity> getPreferencesInfo(@RequestParam("view-cd") final String viewCd, @RequestParam(value = "grp-cd", required = false) final String grpCd, @RequestParam("username") final String username) {
        final String userId = userService.getUser(username).getId();
        final String groupId = ( grpCd == null ) ? userGroupService.getUserGroupDefault(username).getId() : groupService.getGrpId(grpCd);

        final List<PreferenceMaster> preferenceMasters = preferenceMasterService.getPreferenceMasters(viewCd);
        final List<Preference> preferenceInfos = new ArrayList<>();

        preferenceMasters.forEach(pm -> {
            final String gridCd = pm.getGridCd();

            List<? extends Preference> preferences = preferenceService.getPreferences(pm.getId(), groupId, userId);
            if (preferences.isEmpty()) {
                preferences = preferenceDetailService.getPreferenceDetails(pm.getId(), groupId);
            }

            preferenceInfos.addAll(preferences
                                    .stream()
                                    .peek(prefer -> prefer.setGridCd(viewCd + "-" + gridCd))
                                    .collect(Collectors.toList()));

        });
    
        return preferenceInfos;
    }

}
