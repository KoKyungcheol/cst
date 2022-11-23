package com.zionex.t3series.web.domain.admin.user.group;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class GroupController {
    
    private final GroupService groupService;

    @GetMapping("/system/groups")
    public List<Group> getGroups(@RequestParam(value = "group-nm", defaultValue = "") String groupName,
                                 @RequestParam(value = "include-default", required = false, defaultValue = "false") Boolean includeDefault) {
        return groupService.getGroups(groupName, includeDefault);
    }
    
    @PostMapping("/system/groups")
    public void saveGroups(@RequestBody List<Group> groups) {
        groupService.saveGroups(groups);
    }

    @PostMapping("/system/groups/delete")
    public void deleteGroups(@RequestBody List<Group> groups) {
        groupService.deleteGroups(groups);
    }

}
