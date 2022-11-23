package com.zionex.t3series.web.util.audit;

import java.util.Optional;

import com.zionex.t3series.web.domain.admin.user.UserService;

import org.springframework.data.domain.AuditorAware;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class LoginUserAuditorAware implements AuditorAware<String> {

    private final UserService userService;

    @Override
    public Optional<String> getCurrentAuditor() {
        UserDetails user = userService.getUserDetails();
        return user != null ? Optional.of(user.getUsername()) : Optional.of("system");
    }
    
}
