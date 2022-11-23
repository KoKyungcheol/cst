package com.zionex.t3series.web.domain.admin.code;

import java.util.List;

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
public class GroupCodeController {

    private final GroupCodeService groupCodeService;
    
    @GetMapping("/system/common/groups")
    public List<GroupCode> getGroupCodes(@RequestParam(value = "group-cd", defaultValue = "") String groupCd, @RequestParam(value = "group-nm", defaultValue = "") String groupNm) {
        return groupCodeService.getGroupCodes(groupCd, groupNm);
    }

    @PostMapping("/system/common/groups")
    public ResponseEntity<ResponseMessage> saveGroupCodes(@RequestBody List<GroupCode> GroupCodes) {
        groupCodeService.saveGroupCodes(GroupCodes);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated common group entities"), HttpStatus.OK);
    }

    @PostMapping("/system/common/groups/delete")
    public ResponseEntity<ResponseMessage> deleteGroupCodes(@RequestBody List<GroupCode> groupCodes) {
        groupCodeService.deleteGroupCodes(groupCodes);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Deleted common group entities"), HttpStatus.OK);
    }

}
