package com.zionex.t3series.web.security.error;

import java.util.Map;

import javax.servlet.RequestDispatcher;
import javax.servlet.http.HttpServletRequest;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.web.servlet.error.AbstractErrorController;
import org.springframework.boot.web.error.ErrorAttributeOptions;
import org.springframework.boot.web.servlet.error.DefaultErrorAttributes;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("${server.error.path:${error.path:/error}}")
public class BasicErrorController extends AbstractErrorController {

    @Autowired
    public BasicErrorController() {
        super(defaultErrorAttributes());
    }

    public static DefaultErrorAttributes defaultErrorAttributes() {
        return new DefaultErrorAttributes();
    }

    @RequestMapping
    public String error(HttpServletRequest request, Model model) {
        Object status = request.getAttribute(RequestDispatcher.ERROR_STATUS_CODE);

        ErrorAttributeOptions options = ErrorAttributeOptions.defaults();

        Map<String, Object> errorAttributes = this.getErrorAttributes(request, options);
        errorAttributes.forEach((attributeName, attributeValue) -> model.addAttribute(attributeName, attributeValue));

        if (status != null) {
            int statusCode = Integer.parseInt(status.toString());

            if (statusCode == HttpStatus.BAD_REQUEST.value()) {
                model.addAttribute("message", "The server did not understand the request.");
            } else if (statusCode == HttpStatus.UNAUTHORIZED.value()) {
                model.addAttribute("message", "The requested page needs a username and a password.");
            } else if (statusCode == HttpStatus.FORBIDDEN.value()) {
                model.addAttribute("message", "Access is forbidden to the requested page.");
            } else if (statusCode == HttpStatus.NOT_FOUND.value()) {
                model.addAttribute("message", "The server can not find the requested page.");
            } else if (statusCode == HttpStatus.METHOD_NOT_ALLOWED.value()) {
                model.addAttribute("message", "The method specified in the request cannot be used.");
            } else if (statusCode == HttpStatus.INTERNAL_SERVER_ERROR.value()) {
                model.addAttribute("message", "The request was not completed. The server met an unexpected condition.");
            }
        }

        return "error";
    }
}
