package com.zionex.t3series.web.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.security.web.authentication.ForwardAuthenticationSuccessHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.session.HttpSessionEventPublisher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.zionex.t3series.web.ApplicationProperties;
import com.zionex.t3series.web.security.authentication.UserDetailService;
import com.zionex.t3series.web.security.authentication.handler.AuthFailureHandler;
import com.zionex.t3series.web.security.authentication.handler.AuthSuccessHandler;
import com.zionex.t3series.web.security.encoder.SecurityPasswordEncoder;
import com.zionex.t3series.web.security.jwt.JwtAuthenticationEntryPoint;
import com.zionex.t3series.web.security.jwt.JwtAuthenticationFilter;
import com.zionex.t3series.web.security.jwt.JwtTokenProvider;

@Configuration
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    private final UserDetailService userDetailService;
    private final JwtTokenProvider jwtTokenProvider;
    private final List<String> corsAllowUrl;

    public SecurityConfig(UserDetailService userDetailService, JwtTokenProvider jwtTokenProvider, ApplicationProperties applicationProperties) {
        this.userDetailService = userDetailService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.corsAllowUrl = applicationProperties.getAuthentication().getCorsAllowUrl();
    }

    private final String[] accessAllUrl = {
        "/js/**",
        "/css/**",
        "/fonts/**",
        "/images/**",
        "/favicon.ico",
        "/login",
        "/engine/service",
        "/jwt/token"
    };

    private final String[] accessAdminUrl = {
        "/republish",
        "/system/users",
        "/system/users/password-reset",
        "/system/users/login-unlock",
        "/system/users/authorities",
        "/system/users/permissions",
        "/system/users/{username}/permissions/**",
        "/system/groups/**",
        "/system/logs/*",
        "/system/menus/**",
        "/system/users/{group-cd}/except"
    };

    private final String[] accessUserGetUrl = {
        "/system/users/{username}/permissions/{menu-cd}/{permission-type}",
        "/system/users/{username}/permissions/{menu-cd}",
        "/system/menus",
        "/system/menus/badges"
    };

    private final String[] accessUserPostUrl = {
        "/system/menus/bookmarks",
        "/system/logs/view-execution"
    };

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new SecurityPasswordEncoder();
    }

    @Bean
    public ForwardAuthenticationSuccessHandler authSuccessHandler() {
        return new AuthSuccessHandler("/authentication");
    }

    @Bean
    public AuthenticationFailureHandler authFailureHandler() {
        return new AuthFailureHandler("/login");
    }

    @Bean
    public AuthenticationProvider daoAuthenticationProvider() {
        DaoAuthenticationProvider daoAuthenticationProvider = new DaoAuthenticationProvider();

        daoAuthenticationProvider.setUserDetailsService(userDetailService);
        daoAuthenticationProvider.setPasswordEncoder(passwordEncoder());
        daoAuthenticationProvider.setHideUserNotFoundExceptions(false);

        return daoAuthenticationProvider;
    }

    @Bean
    public HttpSessionEventPublisher httpSessionEventPublisher() {
      return new HttpSessionEventPublisher();
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        configureSession(http);
        // configureJwt(http);
    }

    private void configureSession(HttpSecurity http) throws Exception {
        http
            .authorizeRequests(authorize -> authorize
                .antMatchers(accessAllUrl).permitAll()
                .antMatchers(HttpMethod.GET, accessUserGetUrl).hasAuthority("USER")
                .antMatchers(HttpMethod.POST, accessUserPostUrl).hasAuthority("USER")
                .antMatchers(accessAdminUrl).hasAuthority("ADMIN")
                .anyRequest().authenticated())
            .cors()
                .configurationSource(corsConfigurationSource())
                .and()
            .csrf()
                .ignoringAntMatchers("/engine/service")
                .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                .and()
            .headers()
                .frameOptions().sameOrigin()
                .and()
            .formLogin()
                .loginPage("/login")
                .loginProcessingUrl("/authentication")
                .usernameParameter("username")
                .passwordParameter("password")
                .successHandler(authSuccessHandler())
                .failureHandler(authFailureHandler())
                .and()
            .logout()
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login")
                .invalidateHttpSession(true)
                .deleteCookies("T3SESSIONID")
                .clearAuthentication(true);
    }

    private void configureJwt(HttpSecurity http) throws Exception {
        http
            .authorizeRequests(authorize -> authorize
                .antMatchers(accessAllUrl).permitAll()
                .antMatchers(HttpMethod.GET, accessUserGetUrl).hasAuthority("USER")
                .antMatchers(accessAdminUrl).hasAuthority("ADMIN")
                .anyRequest().authenticated())
            .cors()
                .configurationSource(corsConfigurationSource())
                .and()
            .csrf()
                .disable()
            .headers()
                .frameOptions().disable()
                .and()
            .formLogin()
                .disable()
            .httpBasic()
                .disable()
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
            .addFilterBefore(new JwtAuthenticationFilter(jwtTokenProvider), UsernamePasswordAuthenticationFilter.class)
            .exceptionHandling()
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint());
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.authenticationProvider(daoAuthenticationProvider());
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(corsAllowUrl);
        configuration.addAllowedHeader(CorsConfiguration.ALL);
        configuration.addAllowedMethod(CorsConfiguration.ALL);
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

}
