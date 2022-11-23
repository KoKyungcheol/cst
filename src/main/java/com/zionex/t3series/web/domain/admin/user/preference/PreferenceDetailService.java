package com.zionex.t3series.web.domain.admin.user.preference;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Function;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.admin.account.AccountManager;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.domain.admin.user.group.Group;
import com.zionex.t3series.web.domain.admin.user.group.GroupService;
import com.zionex.t3series.web.domain.admin.user.group.UserGroupService;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PreferenceDetailService {

    private final PreferenceDetailRepository preferenceDetailRepository;

    private final GroupService groupService;
    private final UserGroupService userGroupService;
    private final UserService userService;
    private final AccountManager accountManager;

    public List<Group> getPreferenceDetailsGroups(String userPrefMstId, String username) {
        List<PreferenceDetail> preferenceDetails = preferenceDetailRepository.findByUserPrefMstId(userPrefMstId);
        
        List<Group> groups = new ArrayList<>();
        if (accountManager.isSystemAdmin(username)) {
            groups = groupService.getGroups("", true);
        } else {
            String userId = userService.getUser(username).getId();
            groups = userGroupService.getUserGroups(userId, true);
        }

        List<String> grpIds = groups
                               .stream()
                               .map(Group::getId)
                               .collect(Collectors.toList());

        return preferenceDetails
                .stream()
                .filter(pd -> grpIds.contains(pd.getGrpId()))
                .collect(Collectors.toMap(PreferenceDetail::getGrpId, Function.identity(), (p1, p2) -> p1))
                .values()
                .stream().map(pd -> groupService.getGroupById(pd.getGrpId())).collect(Collectors.toList());
    }
    
    public boolean existsPreferenceDetail(String userPrefMstId, String groupId, String fieldCd) {
        return preferenceDetailRepository.existsByUserPrefMstIdAndGrpIdAndFldCd(userPrefMstId, groupId, fieldCd);
    }

    public int getRowCount(String userPrefMstId) {
        return preferenceDetailRepository.countByUserPrefMstId(userPrefMstId);
    }

    public List<PreferenceDetail> getPreferenceDetailsForCrosstab(final String userPrefMstId, final String groupId) {
        return preferenceDetailRepository.findByUserPrefMstIdAndGrpIdAndCrosstabItemCdNotNullOrderByUserPrefMstIdAscCrosstabItemCdAscFldSeqAsc(userPrefMstId, groupId);
    }

    public List<PreferenceDetail> getPreferenceDetails(String userPrefMstId, String groupId) {
        return preferenceDetailRepository.findByUserPrefMstIdAndGrpIdOrderByFldSeqAscFldCdAsc(userPrefMstId, groupId);
    }

    public void savePreferenceDetails(List<PreferenceDetail> preferenceDetails) {
        preferenceDetailRepository.saveAll(preferenceDetails);
    }

    public void deletePreferenceDetails(List<PreferenceDetail> preferenceDetails) {
        preferenceDetailRepository.deleteAll(preferenceDetails);
    }

}
