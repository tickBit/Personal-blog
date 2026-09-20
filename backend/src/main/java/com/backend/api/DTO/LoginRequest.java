package com.backend.api.DTO;

public class LoginRequest {
    private String username;
    private String password;
    
    public LoginRequest() {

    }
    
    // Getters and Setters
    
    public String getUsername() {
        return this.username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getPassword() {
        return this.password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
}
