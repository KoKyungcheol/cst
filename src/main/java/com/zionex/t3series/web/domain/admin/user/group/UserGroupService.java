package com.zionex.t3series.web.domain.admin.user.group;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.admin.user.User;
import com.zionex.t3series.web.domain.admin.user.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserGroupService {

    private final UserGroupRepository userGroupRepository;
    private final UserService userService;

    @Autowired
    private GroupService groupService;

    public List<Group> getUserGroups(String userId, Boolean includeDefault) {
        List<Group> groups = new ArrayList<>();
        
        List<UserGroup> userGroups = new ArrayList<>();
        if (!includeDefault) {
            String grpId = groupService.getGrpId(GroupService.RequiredGroup.DEFAULT.name());
            userGroups = userGroupRepository.findByUserIdAndGrpIdNot(userId, grpId);
        } else {
            userGroups = userGroupRepository.findByUserId(userId);
        }

        userGroups.forEach(userGroup -> {
            Group group = groupService.getGroupById(userGroup.getGrpId());
            groups.add(group);
        });

        if (includeDefault && !groups.isEmpty()) {
            int idx = groups.indexOf(
                    groups.stream()
                          .filter(group -> group.getGrpCd() != null && group.getGrpCd().equals(GroupService.RequiredGroup.DEFAULT.name()))
                          .findFirst()
                          .orElse(null)
            );

            if (idx != -1) {
                Collections.swap(groups, idx, 0);
            }
        }

        return groups;
    }

    public List<UserGroup> getGroupsByUsers(List<String> userIds) {
        String grpId = groupService.getGrpId(GroupService.RequiredGroup.DEFAULT.name());
        return userGroupRepository.findByUserIdInAndGrpIdNot(userIds, grpId);
    }

    public Group getUserGroupDefault(String username) {
        UserGroup userGroup = userGroupRepository.findByUserIdAndPrefDefaultYn(userService.getUser(username).getId(), true);
        if (userGroup != null) {
            return groupService.getGroupById(userGroup.getGrpId());
        }

        return new Group();
    }

    public void saveUserGroup(UserGroup group){
        userGroupRepository.save(group);
    }

    public void saveUserGroupDefault(String username, String groupId) {
        List<UserGroup> userGroups = userGroupRepository.findByUserId(userService.getUser(username).getId());

        userGroups.forEach(userGroup -> {
            userGroup.setPrefDefaultYn(groupId.equals(userGroup.getGrpId()));
        });

        userGroupRepository.saveAll(userGroups);
    }

	public List<GroupUserResult> getGroupUsers(String groupcode) {
		List<GroupUserResult> userResults = new ArrayList<>();

        List<UserGroup> userGroups = new ArrayList<>();
        String groupId = groupService.getGrpId(groupcode);
        
        userGroups = userGroupRepository.findByGrpId(groupId);

        userGroups.forEach(userGroup -> {
            User user = userService.getUserById(userGroup.getUserId());
            if (user != null) {
                userResults.add(GroupUserResult.builder()
                        .userId(user.getId())
                        .username(user.getUsername())
                        .displayName(user.getDisplayName())
                        .department(user.getDepartment())
                        .businessValue(user.getBusinessValue())
                        .grpCd(groupcode)
                        .build());
            }
        });

        if (!userResults.isEmpty()) {
            int idx = userResults.indexOf(
                    userResults.stream()
                               .filter(userGroup -> userGroup.getUserId() != null)
                               .findFirst()
                               .orElse(null));

            if (idx != -1) {
                Collections.swap(userResults, idx, 0);
            }
        }

        return userResults;
	}

	public void saveGroupUsers(List<GroupUserResult> groupUsers) {
        groupUsers.forEach(user -> {
            String userId = userService.getUser(user.getUsername()).getId();
            String grpId = groupService.getGroup(user.getGrpCd()).getId();

            boolean existsUserGroup = userGroupRepository.existsByUserIdAndGrpId(userId, grpId);
            if (!existsUserGroup) {
                UserGroup userGroup = new UserGroup();

                userGroup.setGrpId(grpId);
                userGroup.setUserId(userId);
                userGroupRepository.save(userGroup);
            }
        });
	}

	public void deleteGroupUsers(List<GroupUserResult> groupUserResults) {
        List<UserGroup> userGroup = groupUserResults.stream()
            .map(groupUserResult -> {
                String userId = userService.getUser(groupUserResult.getUsername()).getId();
                String grpId = groupService.getGroup(groupUserResult.getGrpCd()).getId();
                return userGroupRepository.findByUserIdAndGrpId(userId, grpId);
            })
            .collect(Collectors.toList());

        userGroupRepository.deleteAll(userGroup);
	}

    public void deleteUserGroupsByUser(List<String> userIds) {
        userGroupRepository.deleteByUserIdIn(userIds);
    }

    public boolean existsUserGroupByGrpId(String grpId) {
        return userGroupRepository.existsByGrpId(grpId);
    }

    public List<UserGroup> getUserGroupByGrpId(String grpId) {
        return userGroupRepository.findByGrpId(grpId);
    }

}
