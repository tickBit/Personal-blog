package com.backend.api.controller;

import com.backend.api.repository.PostRepository;
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
    
    private final PostRepository postRepository;
    private static final int MAX_PAGE_SIZE = 100;
    private static final int MAX_LENGTH_OF_COVER_IMAGE_URL = 384;
    private static final int MAX_LENGTH_OF_BODY = 4096;
    
    private static final List<String> SORTABLE_FIELDS = List.of("id", "title", "createdAt", "updatedAt", "slug");

    private final PostService postService;
    
    // constructor injection
    public PostController(PostService postService, PostRepository postRepository) {
        this.postService = postService;
        this.postRepository = postRepository;
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
    public ResponseEntity<Post> createPost(@Valid @RequestBody PostRequest request) {
 
        if (!validate(request)) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        
        String title = request.title();
        String excerpt = request.excerpt();
        String body = request.body();
        List<String> tags = request.tags();
        String coverImage = request.coverImage(); // image is given as path
                
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(title, excerpt, body, tags, coverImage));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Post> updatePost(
            @PathVariable Long id,
            @Valid @RequestBody PostRequest request) {
        
        if (id == null) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);        
        if (postRepository.findById(id) == null) return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        if (!validate(request)) return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        
        return ResponseEntity.status(HttpStatus.OK).body(postService.updatePost(id, request.title(), request.body(), request.excerpt(), request.tags(), request.coverImage()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }
    
    private boolean validate(PostRequest request) {
        if (request.title().trim() == "" || request.title() == null) return false;
        if (request.excerpt().trim() == "" || request.excerpt() == null) return false;
        
        // limit also max length of body
        if (request.body().trim() == "" || request.body() == null || request.body().length() > MAX_LENGTH_OF_BODY) return false;
 
        // limit number of tags to 5
        if (request.tags().isEmpty() || request.tags().size() > 5) return false;
        
        // limit length coverImage's URL
        if (request.coverImage() != null) {
            if (request.coverImage().length() > MAX_LENGTH_OF_COVER_IMAGE_URL) return false;
        }
        return true;
    }
}