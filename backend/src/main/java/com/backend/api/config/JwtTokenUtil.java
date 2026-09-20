package com.backend.api.config;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;
 
@Component
public class JwtTokenUtil {
    private static final String TOKEN_TYPE_CLAIM = "tokenType";
    private static final String ACCESS_TOKEN_TYPE = "access";
    private static final String REFRESH_TOKEN_TYPE = "refresh";
    private static final Duration ACCESS_TOKEN_VALIDITY = Duration.ofMinutes(5);
    private static final Duration REFRESH_TOKEN_VALIDITY = Duration.ofDays(7);

    private final SecretKey signingKey;

    public JwtTokenUtil(@Value("${security.jwt.secret-key}") String secret) {
        this.signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
 
    public String generateAccessToken(String username) {
        return generateToken(username, ACCESS_TOKEN_VALIDITY, ACCESS_TOKEN_TYPE);
    }
 
    public String generateRefreshToken(String username) {
        return generateToken(username, REFRESH_TOKEN_VALIDITY, REFRESH_TOKEN_TYPE);
    }

    private String generateToken(String username, Duration validity, String tokenType) {
        Instant issuedAt = Instant.now();

        return Jwts.builder()
                .subject(username)
                .claim(TOKEN_TYPE_CLAIM, tokenType)
                .issuedAt(Date.from(issuedAt))
                .expiration(Date.from(issuedAt.plus(validity)))
                .signWith(signingKey)
                .compact();
    }
 
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(signingKey)
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException ex) {
            return false;
        }
    }
 
    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isRefreshToken(String token) {
        if (!validateToken(token)) {
            return false;
        }

        String tokenType = Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .get(TOKEN_TYPE_CLAIM, String.class);
        return REFRESH_TOKEN_TYPE.equals(tokenType);
    }
}
