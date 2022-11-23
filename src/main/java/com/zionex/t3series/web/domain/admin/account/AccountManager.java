package com.zionex.t3series.web.domain.admin.account;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

import com.zionex.t3series.util.SecurityUtil;
import com.zionex.t3series.web.ApplicationProperties.Authentication;
import com.zionex.t3series.web.domain.admin.user.User;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.domain.admin.user.authority.Authority;
import com.zionex.t3series.web.domain.admin.user.authority.AuthorityService;
import com.zionex.t3series.web.domain.admin.user.group.GroupService;
import com.zionex.t3series.web.domain.admin.user.group.UserGroup;
import com.zionex.t3series.web.domain.admin.user.group.UserGroupService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AccountManager {

    @Autowired
    private UserService userService;
    
    @Autowired
    private GroupService groupService;
    
    @Autowired
    private UserGroupService userGroupService;
    
    private final AuthorityService authorityService;

    private final Set<String> systemAdmins = new HashSet<>();
    
    private final Set<String> roles = new HashSet<>(Arrays.asList("ADMIN", "USER"));

    public void addSystemAdmin(String systemAdmin) {
        this.systemAdmins.add(systemAdmin);
    }

    public boolean isSystemAdmin(String username) {
        String userId = userService.getUser(username).getId();
        return authorityService.existsAuthority(userId, "ADMIN");
    }

    public void addAdminAuthority(String userId) {
        roles.forEach(role -> {
            Authority authority = new Authority();
            authority.setUserId(userId);
            authority.setAuthority(role);

            authorityService.saveAuthority(authority);
        });
    }

    public void init(Authentication authentication) {
        systemAdmins.forEach(adminUser -> {
            if (!userService.existsByUsername(adminUser)) {
                String password = SecurityUtil.encryptPassword(authentication.getInitialPassword());

                User user = new User();
                user.setUsername(adminUser);
                user.setPassword(password);
                user.setPasswordExpired(true);
                user.setLoginFailCount(0);

                userService.saveUser(user);

                String userId = userService.getUser(user.getUsername()).getId();
                String grpId = groupService.getGroup(GroupService.RequiredGroup.DEFAULT.name()).getId();

                UserGroup userGroup = new UserGroup();
                userGroup.setUserId(userId);
                userGroup.setGrpId(grpId);
                userGroup.setPrefDefaultYn(true);
                
                userGroupService.saveUserGroup(userGroup);
            }

            String adminUserId = userService.getUser(adminUser).getId();
            addAdminAuthority(adminUserId);
        });
    }

}
