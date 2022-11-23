package com.zionex.t3series.web.domain.admin.user.authority;

import java.util.List;

import com.zionex.t3series.web.domain.admin.user.UserService;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class AuthorityController {

    private final AuthorityService authorityService;
    private final UserService userService;

    @GetMapping("/system/users/authorities")
    public List<Authority> getAuthorities() {
        return authorityService.getAuthorities();
    }

    @PostMapping("/system/users/authorities")
    public void saveAuthorities(@RequestBody List<Authority> authorities) {
        authorityService.saveAuthorities(authorities);
    }

    @GetMapping("/system/users/{username}/authorities")
    public List<Authority> getAuthorities(@PathVariable("username") String username) {
        String userId = userService.getUser(username).getId();
        return authorityService.getAuthorities(userId);
    }

}
