package com.zionex.t3series.web.domain.admin.user.delegation;

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
public class DelegationController {

    private final DelegationService delegationService;

    @GetMapping("/system/users/delegations")
    public List<Delegation> getDelegations(@RequestParam(value = "username", required = false) String username,
                                           @RequestParam(value = "delegation-username", required = false) String delegationUsername) {
        return delegationService.getDelegations(username, delegationUsername);
    }

    @PostMapping("/system/users/delegations")
    public ResponseEntity<ResponseMessage> saveDelegations(@RequestBody List<Delegation> delegations) {
        delegationService.saveDelegations(delegations);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted or updated delegation entities"), HttpStatus.OK);
    }

    @PostMapping("/system/users/delegations/delete")
    public ResponseEntity<ResponseMessage> deleteDelegations(@RequestBody List<Delegation> delegations) {
        delegationService.deleteDelegations(delegations);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Deleted delegation entities"), HttpStatus.OK);
    }

}
