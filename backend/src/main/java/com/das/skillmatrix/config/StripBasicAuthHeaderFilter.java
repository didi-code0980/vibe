package com.das.skillmatrix.config;

import java.io.IOException;
import java.util.Collection;

import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpServletResponseWrapper;

/**
 * Rewrites any {@code WWW-Authenticate: Basic …} header to {@code Bearer realm="api"}
 * before it leaves the server. Browsers render their native sign-in dialog ONLY for
 * the {@code Basic} and {@code Digest} schemes, so swapping to {@code Bearer} is the
 * canonical way to keep JSON-only APIs popup-free even when an upstream Spring
 * Security configurer accidentally registers a {@link
 * org.springframework.security.web.authentication.www.BasicAuthenticationEntryPoint}.
 */
@Component
public class StripBasicAuthHeaderFilter extends OncePerRequestFilter {

    private static final String HEADER = "WWW-Authenticate";

    private static final String BEARER_CHALLENGE = "Bearer realm=\"api\"";

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain) throws ServletException, IOException {
        SanitizingResponse wrapper = new SanitizingResponse(response);
        filterChain.doFilter(request, wrapper);
    }

    private static boolean isBasicChallenge(String value) {
        if (value == null) return false;
        String trimmed = value.trim().toLowerCase();
        return trimmed.startsWith("basic") || trimmed.startsWith("digest");
    }

    private static final class SanitizingResponse extends HttpServletResponseWrapper {

        SanitizingResponse(HttpServletResponse response) {
            super(response);
        }

        @Override
        public void setHeader(String name, String value) {
            if (HEADER.equalsIgnoreCase(name) && isBasicChallenge(value)) {
                super.setHeader(HEADER, BEARER_CHALLENGE);
                return;
            }
            super.setHeader(name, value);
        }

        @Override
        public void addHeader(String name, String value) {
            if (HEADER.equalsIgnoreCase(name) && isBasicChallenge(value)) {
                super.setHeader(HEADER, BEARER_CHALLENGE);
                return;
            }
            super.addHeader(name, value);
        }

        @Override
        public String getHeader(String name) {
            String value = super.getHeader(name);
            if (HEADER.equalsIgnoreCase(name) && isBasicChallenge(value)) {
                return BEARER_CHALLENGE;
            }
            return value;
        }

        @Override
        public Collection<String> getHeaders(String name) {
            Collection<String> values = super.getHeaders(name);
            if (!HEADER.equalsIgnoreCase(name)) {
                return values;
            }
            return values.stream()
                    .map(v -> isBasicChallenge(v) ? BEARER_CHALLENGE : v)
                    .toList();
        }
    }
}
