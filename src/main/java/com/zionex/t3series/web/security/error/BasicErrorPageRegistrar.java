package com.zionex.t3series.web.security.error;

import org.springframework.boot.web.server.ErrorPage;
import org.springframework.boot.web.server.ErrorPageRegistrar;
import org.springframework.boot.web.server.ErrorPageRegistry;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

@Configuration
public class BasicErrorPageRegistrar implements ErrorPageRegistrar {
    @Override
    public void registerErrorPages(ErrorPageRegistry registry) {
        ErrorPage error400 = new ErrorPage(HttpStatus.BAD_REQUEST, "/error");
        ErrorPage error401 = new ErrorPage(HttpStatus.UNAUTHORIZED, "/error");
        ErrorPage error403 = new ErrorPage(HttpStatus.FORBIDDEN, "/error");
        ErrorPage error404 = new ErrorPage(HttpStatus.NOT_FOUND, "/error");   
        ErrorPage error405 = new ErrorPage(HttpStatus.METHOD_NOT_ALLOWED, "/error");   
        ErrorPage error500 = new ErrorPage(HttpStatus.INTERNAL_SERVER_ERROR, "/error");
        ErrorPage exception = new ErrorPage(Throwable.class, "/error");
        ErrorPage error = new ErrorPage("/error");

        registry.addErrorPages(error400, error401, error403, error404, error405, error500, exception, error);
    }
}
