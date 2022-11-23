package com.zionex.t3series.web.domain.admin.auth;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import javax.servlet.RequestDispatcher;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.zionex.t3series.util.SecurityUtil;
import com.zionex.t3series.web.domain.admin.user.User;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.domain.admin.user.authority.Authority;
import com.zionex.t3series.web.domain.admin.user.authority.AuthorityService;
import com.zionex.t3series.web.security.jwt.JwtTokenProvider;
import com.zionex.t3series.web.security.redis.session.RedisSessionManager;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;

@Log
@RestController
@RequiredArgsConstructor
public class AuthenticationController {

    private final UserService userService;
    private final AuthorityService authorityService;
    
    private final RedisSessionManager redisSessionManager;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/authentication")
    public final void authentication(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String username = request.getParameter("username");
        String password = request.getParameter("password");

        User user = userService.getUser(username);
        if (user.getPasswordExpired()) {
            try {
                if (SecurityUtil.checkPassword(password, user.getPassword())) {
                    redisSessionManager.sessionCreated(request, user);

                    RequestDispatcher dispatcher = request.getRequestDispatcher("/password-init");
                    dispatcher.forward(request, response);
                } else {
                    String contextPath = request.getContextPath();
                    if (contextPath.isEmpty()) {
                        response.sendRedirect("/");
                    } else {
                        response.sendRedirect(contextPath);
                    }
                }
            } catch (ServletException e) {
                log.severe("Failed to move password setup page.");
            }
        } else {
            if (SecurityUtil.checkPassword(password, user.getPassword())) {
                redisSessionManager.sessionCreated(request, user);
            } else {
                redisSessionManager.sessionDestroyed(request);
            }

            boolean rememberCheck = request.getParameter("check-remember") == null ? false : true;
            request.getSession().setAttribute("check", rememberCheck);
            
            String contextPath = request.getContextPath();
            if (contextPath.isEmpty()) {
                response.sendRedirect("/");
            } else {
                response.sendRedirect(contextPath);
            }
        }
    }

    @PostMapping("/jwt/token")
    public String createToken(@RequestBody Map<String, String> userInfo) {
        String username = userInfo.get("username");
        String password = userInfo.get("password");

        User user = userService.getUser(username);
        if (!SecurityUtil.checkPassword(password, user.getPassword())) {
            throw new IllegalArgumentException("Failed to issue token.");
        }

        List<Authority> userAuthorities = authorityService.getAuthorities(user.getId());
        List<String> roles = userAuthorities.stream().map(Authority::getAuthority).collect(Collectors.toList());

        return jwtTokenProvider.createToken(user.getUsername(), roles);
    }

}
