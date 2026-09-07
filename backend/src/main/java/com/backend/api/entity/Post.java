package com.backend.api.entity;

import java.util.Date;
import java.util.List;

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
    private List<String> tags;
    
    @Column (nullable = false)
    private Date createdAt;
    
    @Column (nullable = false)
    private Date updatedAt;
    
    @Column (nullable = true)
    private String coverImage;
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getTitle() {
        return title;
    }
    
    public void setTitle(String title) {
        this.title = title;
    }
    
    public String getSlug() {
        return slug;
    }
    
    public void setSlug(String slug) {
        this.slug = slug;
    }
    
    public String getExcerpt() {
        return excerpt;
    }
    
    public void setExcerpt(String excerpt) {
        this.excerpt = excerpt;
    }
    
    public String getBody() {
        return body;
    }
    
    public void setBody(String body) {
        this.body = body;
    }
    
    public List<String> getTags() {
        return tags;
    }
    
    public void setTags(List<String> tags2) {
        this.tags = tags2;
    }
    
    public Date getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }
    
    public Date getUpdatedAt() {
        return updatedAt;
    }
    
    public void setUpdatedAt(Date updatedAt) {
        this.updatedAt = updatedAt;
    }
    
    public String getCoverImage() {
        return coverImage;
    }
    
    public void setCoverImage(String coverImage) {
        this.coverImage = coverImage;
    }
    
}
