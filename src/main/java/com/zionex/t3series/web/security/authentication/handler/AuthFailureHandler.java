package com.zionex.t3series.web.security.authentication.handler;

import java.io.IOException;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import com.zionex.t3series.web.domain.admin.user.UserService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationFailureHandler;

import lombok.extern.java.Log;

@Log
public class AuthFailureHandler extends SimpleUrlAuthenticationFailureHandler {

    @Autowired
    private UserService userService;

    public AuthFailureHandler(String defaultFailureUrl) {
        setDefaultFailureUrl(defaultFailureUrl);
    }

    @Override
    public void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
            AuthenticationException exception) throws IOException, ServletException {

        String userId = request.getParameter("username");
        String errorMessage;

        if (exception instanceof UsernameNotFoundException) {
            errorMessage = "The username or password you entered is incorrect.";
        } else if (exception instanceof BadCredentialsException) {
            userService.incLoginFailCount(userId);
            errorMessage = "The username or password you entered is incorrect.";
        } else if (exception instanceof LockedException) {
            errorMessage = "User account is locked, Contact the Administrator";
        } else if (exception instanceof DisabledException) {
            errorMessage = "User account is Disabled, Contact the Administrator";
        } else {
            errorMessage = "Internal error occurred";
        }

        log.severe("login fails : " + errorMessage);
        request.setAttribute("errorMsg", errorMessage);

        setUseForward(true);
        super.onAuthenticationFailure(request, response, exception);
    }

}
