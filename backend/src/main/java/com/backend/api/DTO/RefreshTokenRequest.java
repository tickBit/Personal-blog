package com.backend.api.DTO;

public class RefreshTokenRequest {
    private String refreshToken;
    
    public RefreshTokenRequest() {

    }
    
    // Getters and Setters
    public String getRefreshToken() {
        return this.refreshToken;
    }
    
    public void setRefreshToken(String refreshToken) {
        this.refreshToken = refreshToken;
    }
    
}