package com.zionex.t3series.web.security.authentication.handler;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.zionex.t3series.web.domain.admin.user.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.ForwardAuthenticationSuccessHandler;

public class AuthSuccessHandler extends ForwardAuthenticationSuccessHandler {

    @Autowired
    private UserService userService;

    public AuthSuccessHandler(String forwardUrl) {
        super(forwardUrl);
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        userService.clearLoginFailCount(((UserDetails) authentication.getPrincipal()).getUsername());
        super.onAuthenticationSuccess(request, response, authentication);
    }

}
