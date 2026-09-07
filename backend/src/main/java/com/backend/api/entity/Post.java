package com.backend.api.entity;

import java.util.Date;

import jakarta.persistence.*;

@Entity
@Table(name = "post")
public class Post {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String title;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String slug;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String excerpt;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;
    
    @Column (nullable = false)
    private String[] tags;
    
    @Column (nullable = false)
    private Date createdAt;
    
    @Column (nullable = false)
    private Date updatedAt;
    
    @Column (nullable = true)
    private byte[] coverImage;
}
