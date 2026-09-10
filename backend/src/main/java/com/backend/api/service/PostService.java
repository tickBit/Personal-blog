package com.backend.api.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import com.backend.api.controller.PageResponse;
import com.backend.api.controller.PostResponse;
import com.backend.api.entity.Post;
import com.backend.api.repository.PostRepository;

@Service
public class PostService {
    
    @Autowired
    private PostRepository postRepository;

    // constructor injection    
    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }
    
    public PageResponse<PostResponse> getPosts(Pageable pageable) {
        Page<PostResponse> posts = postRepository.findAll(pageable).map(post -> new PostResponse(
                String.valueOf(post.getId()),
                post.getTitle(),
                post.getExcerpt(),
                post.getBody(),
                post.getTags(),
                post.getCoverImage(),
                post.getCreatedAt(),
                post.getUpdatedAt()));

        return new PageResponse<>(
                posts.getContent(),
                posts.getNumber(),
                posts.getSize(),
                posts.getTotalElements(),
                posts.getTotalPages(),
                posts.isFirst(),
                posts.isLast());
    }
    
    public void createPost(String title, String excerpt, String body, List<String> tags, String coverImage) {
        Post post = new Post();
        post.setTitle(title);
        post.setExcerpt(excerpt);
        post.setBody(body);
        post.setTags(tags);
        post.setCoverImage(coverImage);
        post.setSlug(title.trim().toLowerCase().replaceAll("\\s+", "-"));
        Date now = new Date();
        post.setCreatedAt(now);
        post.setUpdatedAt(now);
        postRepository.save(post);
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }
}
