package com.backend.api.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

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
    
    public Post createPost(String title, String excerpt, String body, List<String> tags, String coverImage) {
        
        // Check if a post with the same slug already exists
        String slug = generateSlug(title);
        if (postRepository.findBySlug(slug) != null) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A post with the same title already exists");
        }
        
        Post post = new Post();
        post.setTitle(title);
        post.setExcerpt(excerpt);
        post.setBody(body);
        post.setTags(tags);
        post.setCoverImage(coverImage);
        post.setSlug(generateSlug(title));
        Date now = new Date();
        post.setCreatedAt(now);
        post.setUpdatedAt(now);
        return postRepository.save(post);
    }
    
    public void updatePost(Long id, String title, String excerpt, String body, List<String> tags, String coverImage) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        post.setTitle(title);
        post.setExcerpt(excerpt);
        post.setBody(body);
        post.setTags(tags);
        post.setCoverImage(coverImage);
        post.setSlug(generateSlug(title));
        post.setUpdatedAt(new Date());
        postRepository.save(post);
    }

    private String generateSlug(String title) {
        return title.trim().toLowerCase().replaceAll("\\s+", "-");
    }

    public void deletePost(Long id) {
        postRepository.deleteById(id);
    }
}
