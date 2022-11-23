package com.zionex.t3series.web.domain.admin.user.authority;

import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthorityService {

    private final AuthorityRepository authorityRepository;

    public List<Authority> getAuthorities() {
        return authorityRepository.findAll();
    }

    public List<Authority> getAuthorities(String userId) {
        return authorityRepository.findByUserId(userId);
    }

    public boolean existsAuthority(String userId, String authority) {
        return authorityRepository.existsByUserIdAndAuthority(userId, authority);
    }

    public void saveAuthorities(List<Authority> authorities) {
        authorityRepository.saveAll(authorities);
    }

    public void saveAuthority(Authority authority) {
        if (!authorityRepository.existsByUserIdAndAuthority(authority.getUserId(), authority.getAuthority())) {
            authorityRepository.save(authority);
        }
    }

    public void deleteAuthorities(List<String> userIds) {
        authorityRepository.deleteByUserIdIn(userIds);
    }

    public void deleteAuthority(String userId, String authority) {
        authorityRepository.deleteByUserIdAndAuthority(userId, authority);
    }
}
