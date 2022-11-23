package com.zionex.t3series.web.domain.admin.user;

import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.zionex.t3series.util.SecurityUtil;
import com.zionex.t3series.web.ApplicationProperties;
import com.zionex.t3series.web.domain.admin.account.AccountManager;
import com.zionex.t3series.web.domain.admin.lang.LangPackService;
import com.zionex.t3series.web.domain.admin.user.authority.Authority;
import com.zionex.t3series.web.domain.admin.user.authority.AuthorityService;
import com.zionex.t3series.web.domain.admin.user.delegation.DelegationService;
import com.zionex.t3series.web.domain.admin.user.group.GroupService;
import com.zionex.t3series.web.domain.admin.user.group.UserGroup;
import com.zionex.t3series.web.domain.admin.user.group.UserGroupService;
import com.zionex.t3series.web.domain.admin.user.password.PasswordPolicy;
import com.zionex.t3series.web.domain.admin.user.permission.PermissionService;
import com.zionex.t3series.web.domain.admin.user.preference.PreferenceInfoService;
import com.zionex.t3series.web.security.redis.session.RedisSessionManager;
import com.zionex.t3series.web.util.ResponseMessage;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.Data;
import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    private final RedisSessionManager redisSessionManager;
    private final ApplicationProperties applicationProperties;
    private final AccountManager accountManager;
    private final AuthorityService authorityService;
    private final PasswordPolicy passwordPolicy;
    
    private final GroupService groupService;
    private final UserGroupService userGroupService;
    private final DelegationService delegationService;
    private final PermissionService permissionService;
    private final PreferenceInfoService preferenceInfoService;
    private final LangPackService langPackService;

    private String langValue = "";
    
    @GetMapping("/system/users/check-admin")
    public boolean checkAdmin(@RequestParam("username") String username) {
        return userService.checkAdmin(username);
    }

    @PostMapping("/system/users/{username}/password")
    public ResponseEntity<ResponseMessage> changePassword(@PathVariable("username") String username, @RequestBody PasswordData passwordData) {
        String oldPassword = passwordData.getOldPassword();
        String newPassword = passwordData.getNewPassword();
        String confirmPassword = passwordData.getConfirmPassword();

        String authUsername = userService.getUserDetails().getUsername();

        if (authUsername.equals(username)) {
            if (oldPassword.isEmpty() || newPassword.isEmpty() || confirmPassword.isEmpty()) {
                langValue = langPackService.getLanguageValue("PW_ERROR_MSG_0001");
                return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.BAD_REQUEST.value(), langValue), HttpStatus.BAD_REQUEST);
            }

            if (!newPassword.equals(confirmPassword)) {
                langValue = langPackService.getLanguageValue("PW_ERROR_MSG_0002");
                return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.BAD_REQUEST.value(), langValue), HttpStatus.BAD_REQUEST);
            }

            User user = userService.getUser(username);
            if (!SecurityUtil.checkPassword(oldPassword, user.getPassword())) {
                langValue = langPackService.getLanguageValue("PW_ERROR_MSG_0003");
                return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.BAD_REQUEST.value(), langValue), HttpStatus.BAD_REQUEST);
            }

            if (!passwordPolicy.checkPassword(username, confirmPassword)) {
                return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.BAD_REQUEST.value(), passwordPolicy.getMessage()), HttpStatus.BAD_REQUEST);
            }

            user.setPassword(SecurityUtil.encryptPassword(newPassword));
            user.setPasswordModifyDttm(LocalDateTime.now());
            user.setPasswordExpired(false);
            userService.saveUser(user);

            langValue = langPackService.getLanguageValue("PW_SUCCESS_MSG_0001");
            return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), langValue), HttpStatus.OK);
        } else {
            return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.BAD_REQUEST.value(), "Not yourself"), HttpStatus.BAD_REQUEST);
        }
    }

    @PostMapping("/system/users/password-reset")
    public ResponseEntity<ResponseMessage> resetPassword(@RequestBody List<User> users) {
        users.forEach(user -> userService.resetPassword(user.getUsername()));
        
        langValue = langPackService.getLanguageValue("PW_SUCCESS_MSG_0002");
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), langValue), HttpStatus.OK);
    }

    @PostMapping("/system/users/login-unlock")
    public ResponseEntity<ResponseMessage> resetLoginCount(@RequestBody List<User> users) {
        users.forEach(user -> userService.unlockLogin(user.getUsername()));

        langValue = langPackService.getLanguageValue("PW_SUCCESS_MSG_0003");
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), langValue), HttpStatus.OK);
    }

    @GetMapping("/system/users")
    public List<User> getUsers(@RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "display-name", required = false) String displayName,
            @RequestParam(value = "unique-value", required = false) String uniqueValue,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "include-admin", required = false) Boolean includeAdmin)
            throws UnsupportedEncodingException {

        if (username != null) {
            username = URLDecoder.decode(username, "UTF-8");
        }

        if (displayName != null) {
            displayName = URLDecoder.decode(displayName, "UTF-8");
        }

        if (uniqueValue != null) {
            uniqueValue = URLDecoder.decode(uniqueValue, "UTF-8");
        }

        if (department != null) {
            department = URLDecoder.decode(department, "UTF-8");
        }

        return userService.getUsers(username, displayName, uniqueValue, department, includeAdmin);
    }

    @GetMapping("/system/users/{group-cd}/except")
    public List<User> getSelectableUsers(@PathVariable("group-cd") String groupcode,
            @RequestParam(value = "username", required = false) String username,
            @RequestParam(value = "display-name", required = false) String displayName)
            throws UnsupportedEncodingException {

        if (username != null) {
            username = URLDecoder.decode(username, "UTF-8");
        }

        if (displayName != null) {
            displayName = URLDecoder.decode(displayName, "UTF-8");
        }

        return userService.getSelectableUsers(groupcode, username, displayName);
    }

    @PostMapping("/system/users")
    public ResponseEntity<ResponseMessage> postUsers(@RequestBody List<User> users) {
        List<User> oldUsers = new ArrayList<>();
        List<User> newUsers = new ArrayList<>();

        users
            .stream()
            .filter(user -> user.getUsername() != null)
            .forEach(user -> {
                if (!userService.existsUser(user.getUsername())) {
                    newUsers.add(user);
                } else {
                    User existsUser = userService.getUser(user.getUsername());

                    user.setId(existsUser.getId());
                    user.setPassword(existsUser.getPassword());
                    user.setEnabled(existsUser.getEnabled());
                    user.setPasswordExpired(existsUser.getPasswordExpired());
                    user.setLoginFailCount(existsUser.getLoginFailCount());

                    oldUsers.add(user);
                }
            });

        newUsers.forEach(newUser -> {
            newUser.setPassword(SecurityUtil.encryptPassword(applicationProperties.getAuthentication().getInitialPassword()));
            newUser.setPasswordExpired(true);
            newUser.setLoginFailCount(0);

            User user = userService.saveUser(newUser);

            String userId = userService.getUser(user.getUsername()).getId();
            String grpId = groupService.getGroup(GroupService.RequiredGroup.DEFAULT.name()).getId();

            UserGroup userGroup = new UserGroup();
            userGroup.setUserId(userId);
            userGroup.setGrpId(grpId);
            userGroup.setPrefDefaultYn(true);

            userGroupService.saveUserGroup(userGroup);

            if (newUser.getAdminYn()) {
                accountManager.addAdminAuthority(user.getId());
            } else {
                Authority authority = new Authority();
                authority.setUserId(userId);
                authority.setAuthority("USER");

                authorityService.saveAuthority(authority);
            }
        });

        userService.saveUsers(oldUsers);

        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated user entities"), HttpStatus.OK);
    }

    @PostMapping("/system/users/delete")
    public ResponseEntity<ResponseMessage> deleteUsers(@RequestBody List<User> users) {
        users.forEach(user -> {
            User oldUser = userService.getUserOrNull(user.getUsername());
            if (oldUser != null) {
                user.setId(oldUser.getId());
            }
        });

        userService.deleteUsers(users);

        List<String> userIds = users.stream().map(User::getId).collect(Collectors.toList());

        authorityService.deleteAuthorities(userIds);
        delegationService.deleteDelegationsByUserId(userIds);
        userGroupService.deleteUserGroupsByUser(userIds);
        permissionService.deletePermissions(userIds);
        preferenceInfoService.deletePreferencesByUsers(userIds);

        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Deleted user entities"), HttpStatus.OK);
    }

    @GetMapping("/system/users/{username}")
    public ResponseEntity<User> getUser(@PathVariable("username") String username) {
        String authUsername = userService.getUserDetails().getUsername();

        if (authUsername.equals(username)) {
            return new ResponseEntity<User>(userService.getUser(username), HttpStatus.OK);
        } else {
            return new ResponseEntity<User>(HttpStatus.FORBIDDEN);
        }
    }

    @PostMapping("/system/users/{username}")
    public ResponseEntity<ResponseMessage> saveUser(@RequestBody User user) {
        User existsUser = userService.getUserOrNull(user.getUsername());
        if (existsUser != null) {
            user.setId(existsUser.getId());
            user.setPassword(existsUser.getPassword());
            user.setPasswordExpired(existsUser.getPasswordExpired());
            user.setLoginFailCount(existsUser.getLoginFailCount());
    
            userService.saveUser(user);
            redisSessionManager.setDisplayName(existsUser.getUsername(), user.getDisplayName());

            langValue = langPackService.getLanguageValue("MSG_SUCCESS_SAVE_MSG");
            return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), langValue), HttpStatus.OK);
        } else {
            return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.BAD_REQUEST.value(), "Failed update user entity"), HttpStatus.BAD_REQUEST);
        }
    }

}

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
class PasswordData {

    private String oldPassword;

    private String newPassword;

    private String confirmPassword;

}
