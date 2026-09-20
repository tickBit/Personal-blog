package com.backend.api.service;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.backend.api.config.JwtTokenUtil;
import com.backend.api.entity.User;
import com.backend.api.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenUtil jwtTokenUtil;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenUtil jwtTokenUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    public Map<String, String> login(String username, String password) {
        if (username == null || password == null) {
            throw invalidCredentials();
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(this::invalidCredentials);

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw invalidCredentials();
        }

        return Map.of(
                "accessToken", jwtTokenUtil.generateAccessToken(user.getUsername()),
                "refreshToken", jwtTokenUtil.generateRefreshToken(user.getUsername()));
    }

    public Map<String, String> refreshAccessToken(String refreshToken) {
        if (!jwtTokenUtil.isRefreshToken(refreshToken)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid refresh token");
        }

        String username = jwtTokenUtil.getUsernameFromToken(refreshToken);
        if (userRepository.findByUsername(username).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid refresh token");
        }

        return Map.of("accessToken", jwtTokenUtil.generateAccessToken(username));
    }

    private ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid username or password");
    }
}
