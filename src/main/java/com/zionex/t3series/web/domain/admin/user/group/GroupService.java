package com.zionex.t3series.web.domain.admin.user.group;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.admin.user.permission.GroupPermissionService;
import com.zionex.t3series.web.domain.admin.user.preference.PreferenceDetailRepository;
import com.zionex.t3series.web.domain.admin.user.preference.PreferenceInfoRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class GroupService {
    
    private final GroupRepository groupRepository;
    private final UserGroupRepository userGroupRepository;

    private final PreferenceDetailRepository preferenceDetailRepository;
    private final PreferenceInfoRepository preferenceInfoRepository;
    
    @Autowired
    private GroupPermissionService groupPermissionService;

    public enum RequiredGroup {
        DEFAULT;

        public static boolean isRequired(String grpCd) {
            for (RequiredGroup requiredGroup : RequiredGroup.values()) {
                if (grpCd.equals(requiredGroup.name())) {
                    return true;
                }
            }
            return false;
        }
    }

    public String getGrpId(String grpCd) {
        return groupRepository.findByGrpCd(grpCd).orElse(new Group()).getId();
    }

    public Group getGroupById(String grpId) {
        return groupRepository.findById(grpId).orElse(new Group());
    }

    public Group getGroup(String grpCd) {
        if (RequiredGroup.isRequired(grpCd)) {
            Group group = groupRepository.findByGrpCd(grpCd).orElse(new Group());
            if (group != null) {
                return group;
            }

            Group newGroup = new Group();
            newGroup.setGrpCd(grpCd);
            newGroup.setGrpNm(grpCd);
            newGroup.setGrpDescrip(grpCd);

            groupRepository.save(newGroup);
        }

        return groupRepository.findByGrpCd(grpCd).orElse(new Group());
    }

    public List<Group> getGroups(String grpNm, Boolean includeDefault) {
        List<Group> groups = new ArrayList<>();
        
        if (grpNm == null || grpNm.isEmpty()) {
            groups = groupRepository.findAll();
        } else {
            groups = groupRepository.findByGrpNmIgnoreCaseContaining(grpNm);
        }

        if (includeDefault) {
            int idx = groups.indexOf(
                    groups.stream()
                          .filter(group -> RequiredGroup.isRequired(group.getGrpCd()))
                          .findFirst()
                          .orElse(null));
                          
            if (idx != -1) {
                Collections.swap(groups, idx, 0);
            }
        } else {
            groups = groups
                      .stream()
                      .filter(grp -> !RequiredGroup.isRequired(grp.getGrpCd()))
                      .collect(Collectors.toList());
        }

        return groups;
    }

    public void saveGroups(List<Group> groups) {
        groups = groups
                 .stream()
                 .filter(group -> group.getGrpCd() != null)
                 .collect(Collectors.toList());

        groupRepository.saveAll(groups);
    }

    public void deleteGroups(List<Group> groups) {
        List<String> grpIds = groups.stream()
                                    .map(Group::getId)
                                    .collect(Collectors.toList());

        groupRepository.deleteAllById(grpIds);
        userGroupRepository.deleteByGrpIdIn(grpIds);
        groupPermissionService.deleteGroupPermissions(grpIds);
        preferenceDetailRepository.deleteByGrpIdIn(grpIds);
        preferenceInfoRepository.deleteByGrpIdIn(grpIds);
    }

}
