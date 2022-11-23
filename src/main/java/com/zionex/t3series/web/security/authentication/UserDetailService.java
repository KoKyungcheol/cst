package com.zionex.t3series.web.security.authentication;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import com.zionex.t3series.web.domain.admin.user.User;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.domain.admin.user.authority.Authority;
import com.zionex.t3series.web.domain.admin.user.authority.AuthorityService;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDetailService implements UserDetailsService {

    private final LoginPolicy loginPolicy;
    
    private final UserService userService;
    private final AuthorityService authorityService;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userService.getUser(username);
        if (user.getId() == null) {
            throw new UsernameNotFoundException(username);
        }

        userService.updateLongTermUnvisitedStatus(user);
        userService.updatePasswordExpiredStatus(user);

        List<Authority> userAuthorities = authorityService.getAuthorities(user.getId());
        Set<GrantedAuthority> grantedAuthorities = userAuthorities
            .stream()
            .map(authority -> new SimpleGrantedAuthority(authority.getAuthority()))
            .collect(Collectors.toSet());
        
        if (user.getEnabled()) {
            if (loginPolicy.checkFailureCount(user.getUsername())) {
                return new UserDetail(user.getUsername(), user.getPassword(), grantedAuthorities);
            } else {
                return new UserDetail(user.getUsername(), user.getPassword(), true, true, true, false, grantedAuthorities);
            }
        } else {
            return new UserDetail(user.getUsername(), user.getPassword(), false, true, true, true, grantedAuthorities);
        }

    }

}
