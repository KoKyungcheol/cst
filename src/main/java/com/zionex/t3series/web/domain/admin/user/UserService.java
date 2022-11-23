package com.zionex.t3series.web.domain.admin.user;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.zionex.t3series.util.SecurityUtil;
import com.zionex.t3series.web.ApplicationProperties;
import com.zionex.t3series.web.domain.admin.account.AccountManager;
import com.zionex.t3series.web.domain.admin.log.SystemAccess;
import com.zionex.t3series.web.domain.admin.log.SystemAccessService;
import com.zionex.t3series.web.domain.admin.user.authority.AuthorityService;
import com.zionex.t3series.web.domain.admin.user.group.GroupService;
import com.zionex.t3series.web.domain.admin.user.group.UserGroup;
import com.zionex.t3series.web.domain.admin.user.group.UserGroupService;
import com.zionex.t3series.web.security.authentication.LoginPolicy;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    
    private final ApplicationProperties applicationProperties;
    private final AuthorityService authorityService;
    private final SystemAccessService systemAccessService;

    @Autowired
    private AccountManager accountManager;
    
    @Autowired
    private UserGroupService userGroupService;

    @Autowired
    private LoginPolicy loginPolicy;
    
    @Autowired
    private GroupService groupService;

    public UserDetails getUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }

        return (UserDetails) authentication.getPrincipal();
    }

    public boolean checkAdmin(String username) {
        return accountManager.isSystemAdmin(username);
    }

    public Integer getLoginFailCount(String username) {
        User user = getUser(username);
        return user.getLoginFailCount();
    }

    public void incLoginFailCount(String username) {
        User user = getUser(username);
        user.setLoginFailCount(user.getLoginFailCount() + 1);

        userRepository.save(user);
    }

    public void clearLoginFailCount(String username) {
        User user = getUser(username);
        user.setLoginFailCount(0);
        
        userRepository.save(user);
    }

    public void unlockLogin(String username) {
        this.clearLoginFailCount(username);

        User user = getUser(username);
        user.setEnabled(true);
        
        userRepository.save(user);
    }

    public void resetPassword(String username) {
        User user = getUser(username);
        user.setPassword(SecurityUtil.encryptPassword(applicationProperties.getAuthentication().getInitialPassword()));
        user.setPasswordExpired(true);
        user.setPasswordModifyDttm(LocalDateTime.now());
        user.setLoginFailCount(0);
        
        userRepository.save(user);
    }

    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public List<User> getUsers(String username, String displayName, String uniqueValue, String department, Boolean includeAdmin) {
        List<User> users = new ArrayList<User>();

        if (username == null) {
            if (displayName == null) {
                if (uniqueValue == null) {
                    if (department == null) {
                        users = userRepository.findAll();
                    } else {
                        department = "%" + department + "%";
                        users = userRepository.findByDepartment(department);
                    }
                } else {
                    uniqueValue = "%" + uniqueValue + "%";
                    if (department == null) {
                        users = userRepository.findByUniqueValue(uniqueValue);
                    } else {
                        department = "%" + department + "%";
                        users = userRepository.findByUniqueValueAndDepartment(uniqueValue, department);
                    }
                }
            } else {
                displayName = "%" + displayName + "%";
                if (uniqueValue == null) {
                    if (department == null) {
                        users = userRepository.findByDisplayName(displayName);
                    } else {
                        department = "%" + department + "%";
                        users = userRepository.findByDisplayNameAndDepartment(displayName, department);
                    }
                } else {
                    uniqueValue = "%" + uniqueValue + "%";
                    if (department == null) {
                        users = userRepository.findByDisplayNameAndUniqueValue(displayName, uniqueValue);
                    } else {
                        department = "%" + department + "%";
                        users = userRepository.findByDisplayNameAndUniqueValueAndDepartment(displayName, uniqueValue, department);                        
                    }
                }
            }
        } else {
            username = "%" + username + "%";
            if (displayName == null) {
                if (uniqueValue == null) {
                    if (department == null) {
                        users = userRepository.findAllByUsername(username);
                    } else {
                        department = "%" + department + "%";
                        users = userRepository.findByUsernameAndDepartment(username, department);
                    }
                } else {
                    uniqueValue = "%" + uniqueValue + "%";
                    if (department == null) {
                        users = userRepository.findByUsernameAndUniqueValue(username, uniqueValue);
                    } else {
                        department = "%" + department + "%";
                        users = userRepository.findByUsernameAndUniqueValueAndDepartment(username, uniqueValue, department);
                    }
                }
            } else {
                displayName = "%" + displayName + "%";
                if (uniqueValue == null) {
                    if (department == null) {
                        users = userRepository.findByUsernameAndDisplayName(username, displayName);
                    } else {
                        department = "%" + department + "%";
                        users = userRepository.findByUsernameAndDisplayNameAndDepartment(username, displayName, department);
                    }
                } else {
                    uniqueValue = "%" + uniqueValue + "%";
                    if (department == null) {
                        users = userRepository.findByUsernameAndDisplayNameAndUniqueValue(username, displayName, uniqueValue);
                    } else {
                        department = "%" + department + "%";
                        users = userRepository.findByUsernameAndDisplayNameAndUniqueValueAndDepartment(username, displayName, uniqueValue, department);
                    }
                }
            }
        }

        if (includeAdmin != null && includeAdmin) {
            return users;
        } else {
            return users
                    .stream()
                    .filter(user -> !accountManager.isSystemAdmin(user.getUsername()))
                    .collect(Collectors.toList());
        }
    }

	public List<User> getSelectableUsers(String groupcode, String username, String displayName) {
        List<User> users = new ArrayList<User>();

        if (username == null) {
            if (displayName == null) {
                users = userRepository.findAll();
            } else {
                displayName = "%" + displayName + "%";
                users = userRepository.findByDisplayName(displayName);
            }
        } else {
            username = "%" + username + "%";
            if (displayName == null) {
                users = userRepository.findAllByUsername(username);
            } else {
                displayName = "%" + displayName + "%";
                users = userRepository.findByUsernameAndDisplayName(username, displayName);

            }
        }

        List<User> unselectableUser = new ArrayList<User>();
        String grpId = groupService.getGrpId(groupcode);

        boolean existsUserGroup = userGroupService.existsUserGroupByGrpId(grpId);
        if (existsUserGroup) {
            List<UserGroup> userGroups = userGroupService.getUserGroupByGrpId(grpId);
            unselectableUser = userGroups
                    .stream()
                    .map(userGroup -> getUserById(userGroup.getUserId()))
                    .collect(Collectors.toList());
        }

        users.removeAll(unselectableUser);

        return users;
    }

    public boolean existsUser(String username) {
        return userRepository.existsByUsername(username);
    }

    public User getUserById(String userId) {
        return userRepository.findById(userId).orElse(null);
    }

    public User getUserOrNull(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public User getUser(String username) {
        return userRepository.findByUsername(username).orElse(new User());
    }

    public User saveUser(User user) {
        User checkUser = userRepository.findByUsername(user.getUsername()).orElse(user);
        user.setId(checkUser.getId());

        String displayName = user.getDisplayName();
        if (displayName == null || displayName.isEmpty()) {
            user.setDisplayName(user.getUsername());
        }

        return userRepository.save(user);
    }

    public void saveUsers(List<User> users) {
        userRepository.saveAll(users);

        users.forEach(user -> {
            if (user.getAdminYn()) {
                accountManager.addAdminAuthority(user.getId());
            } else {
                authorityService.deleteAuthority(user.getId(), "ADMIN");
            }
        });
    }

    public void deleteUsers(List<User> users) {
        userRepository.deleteAll(users);
    }

    public void updateLongTermUnvisitedStatus(User user) {
        if (checkAdmin(user.getUsername())) {
            return;
        }
        SystemAccess latestSystemAccess = systemAccessService.getLatestSystemAccessLog(user.getId());
        LocalDateTime latestSystemAccessTime = user.getCreateDttm();
        if (latestSystemAccess != null) {
            latestSystemAccessTime = latestSystemAccess.getAccessDttm();
        }

        if (loginPolicy.isViolateLongTermUnvisitedDays(latestSystemAccessTime)) {
            user.setEnabled(false);
            userRepository.save(user);
        }
        return;
    }

    public void updatePasswordExpiredStatus(User user) {
        LocalDateTime passwordModifyDttm = user.getPasswordModifyDttm();
        if (passwordModifyDttm == null) {
            return;
        }
        
        if (loginPolicy.isViolateMaxPasswordDays(passwordModifyDttm)) {
            user.setPasswordExpired(true);
            user.setLoginFailCount(0);
            userRepository.save(user);
        }
    }

}
