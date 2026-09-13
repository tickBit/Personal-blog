package com.backend.api.controller;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

import com.backend.api.entity.Post;
import com.backend.api.service.PostService;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private static final int MAX_PAGE_SIZE = 100;
    private static final List<String> SORTABLE_FIELDS = List.of("id", "title", "createdAt", "updatedAt", "slug");

    private final PostService postService;
    
    // constructor injection
    public PostController(PostService postService) {
        this.postService = postService;
    }
    
    @GetMapping
    public PageResponse<PostResponse> getAllPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "true") boolean descending) {

        if (page < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "page must be greater than or equal to 0");
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "size must be between 1 and 100");
        }
        if (!SORTABLE_FIELDS.contains(sortBy)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported sortBy field: " + sortBy);
        }

        Sort.Direction direction = descending ? Sort.Direction.DESC : Sort.Direction.ASC;
        Sort sort = Sort.by(direction, sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);
        return postService.getPosts(pageable);
    }
    

    @GetMapping("/{id}")
    public ResponseEntity<PostResponse> getPost(@PathVariable String id) {
        return ResponseEntity.status(HttpStatus.NOT_IMPLEMENTED).build();
    }

    @PostMapping
    public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostRequest request) {
        String title = request.title();
        String excerpt = request.excerpt();
        String body = request.body();
        List<String> tags = request.tags();
        String coverImage = request.coverImage(); // image is given as path
        
        Post post = postService.createPost(title, excerpt, body, tags, coverImage);
        PostResponse response = new PostResponse(
            String.valueOf(post.getId()),
            post.getTitle(),
            post.getExcerpt(),
            post.getBody(),
            post.getTags(),
            post.getCoverImage(),
            post.getCreatedAt(),
            post.getUpdatedAt());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {
        Post post = postService.updatePost(
                id,
                request.title(),
                request.excerpt(),
                request.body(),
                request.tags(),
                request.coverImage());

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(post);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
}