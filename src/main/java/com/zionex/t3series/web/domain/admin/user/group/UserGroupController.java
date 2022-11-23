package com.zionex.t3series.web.domain.admin.user.group;

import java.util.List;
import java.util.Map;

import com.zionex.t3series.web.util.ResponseMessage;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class UserGroupController {

    private final UserGroupService userGroupService;

    @GetMapping("/system/users/{username}/groups/default")
    public Group getUserGroupDefault(@PathVariable("username") String username) {
        return userGroupService.getUserGroupDefault(username);
    }

    @PostMapping("/system/users/{username}/groups/default")
    public ResponseEntity<ResponseMessage> saveUserGroupDefault(@RequestBody Map<String, String> map) {
        userGroupService.saveUserGroupDefault(map.get("username"), map.get("group-id"));
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated usergroup entities"), HttpStatus.OK);
    }

    @GetMapping("/system/groups/{group-cd}/users")
    public List<GroupUserResult> getGroupUsers(@PathVariable("group-cd") String groupcode) {
        return userGroupService.getGroupUsers(groupcode);
    }
    
    @PostMapping("/system/groups/{group-cd}/users")
    public ResponseEntity<ResponseMessage> saveGroupUsers(@RequestBody List<GroupUserResult> groupUsers) {
        userGroupService.saveGroupUsers(groupUsers);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated usergroup entities"), HttpStatus.OK);
    }
    
    @PostMapping("/system/groups/{group-cd}/users/delete")
    public ResponseEntity<ResponseMessage> deleteGroupUsers(@RequestBody List<GroupUserResult> groupUsers) {
        userGroupService.deleteGroupUsers(groupUsers);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Deleted usergroup entities"), HttpStatus.OK);
    }

}
