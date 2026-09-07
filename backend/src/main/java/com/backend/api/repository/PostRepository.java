package com.backend.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.backend.api.entity.Post;

public interface PostRepository extends JpaRepository<Post, Long> {

    public Post findBySlug(String slug);
}
