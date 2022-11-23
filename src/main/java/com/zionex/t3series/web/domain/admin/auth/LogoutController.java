package com.zionex.t3series.web.domain.admin.auth;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.zionex.t3series.web.security.redis.session.RedisSessionManager;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import lombok.RequiredArgsConstructor;

@Controller
@RequiredArgsConstructor
public class LogoutController {

    private final RedisSessionManager redisSessionManager;

    @RequestMapping(value = "/logout", method = { RequestMethod.GET, RequestMethod.POST })
    public final void logout(HttpServletRequest request, HttpServletResponse response) {
        redisSessionManager.sessionDestroyed(request);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            new SecurityContextLogoutHandler().logout(request, response, auth);
        }
    }

}
