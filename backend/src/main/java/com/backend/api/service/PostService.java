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
import com.backend.api.entity.Emoji;
import com.backend.api.entity.Post;
import com.backend.api.repository.PostRepository;
import com.backend.api.repository.EmojiRepository;

import jakarta.transaction.Transactional;

@Service
public class PostService {
    
    @Autowired
    private PostRepository postRepository;

    private final EmojiRepository emojiRepository;

    // constructor injection    
    public PostService(PostRepository postRepository, EmojiRepository emojiRepository) {
        this.postRepository = postRepository;
        this.emojiRepository = emojiRepository;
    }
    
    public PageResponse<PostResponse> getPosts(Pageable pageable) {
        Page<Post> postPage = postRepository.findAll(pageable);
        List<PostResponse> postResponses = postPage.getContent().stream()
                .map(post -> new PostResponse(
                        String.valueOf(post.getId()),
                        post.getSlug(),
                        post.getTitle(),
                        post.getExcerpt(),
                        post.getBody(),
                        post.getTags(),
                        post.getCoverImage(),
                        post.getCreatedAt(),
                        post.getUpdatedAt(),
                        post.getEmojiAlphas()))
                .toList();

        return new PageResponse<PostResponse>(postResponses, postPage.getNumber(), postPage.getSize(), postPage.getTotalElements(), postPage.getTotalPages(), postPage.isLast(), postPage.isFirst());
    }

    public PostResponse getPostBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        return new PostResponse(
                String.valueOf(post.getId()),
                post.getSlug(),
                post.getTitle(),
                post.getExcerpt(),
                post.getBody(),
                post.getTags(),
                post.getCoverImage(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getEmojiAlphas());
    }
    
    public Post createPost(String title, String excerpt, String body, List<String> tags, String coverImage) {
        
        // Check if a post with the same slug already exists
        String slug = generateSlug(title);

        if (postRepository.findBySlug(slug).isPresent()) {
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
        Post savedPost = postRepository.save(post);
        
        return savedPost;
    }
    
    public Post updatePost(Long id, String title, String excerpt, String body, List<String> tags, String coverImage) {
        Post post = postRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Post not found"));

        post.setTitle(title);
        post.setExcerpt(excerpt);
        post.setBody(body);
        post.setTags(tags);
        post.setCoverImage(coverImage);
        post.setSlug(generateSlug(title));
        post.setUpdatedAt(new Date());
        
        return postRepository.save(post);
    }

    @Transactional
    public void setEmoji(Long id, String reaction) {
        int reactionIndex = Emoji.reactionIndex(reaction);

        // The common path is a single atomic UPDATE. Java never reads the
        // old counter value, so concurrent requests cannot overwrite it.
        if (emojiRepository.incrementReaction(id, reactionIndex) == 1) {
            return;
        }

        // Legacy posts may not have an emoji row. Lock the parent while the
        // row is created so two simultaneous first reactions cannot race.
        Post post = postRepository.findByIdForUpdate(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Post not found"));

        if (post.getEmoji() == null) {
            post.setEmoji(new Emoji());
            postRepository.saveAndFlush(post);
        }

        if (emojiRepository.incrementReaction(id, reactionIndex) != 1) {
            throw new IllegalStateException("Could not update reaction counter");
        }
    }
    
    private String generateSlug(String title) {
        return title.trim().toLowerCase().replaceAll("\\s+", "-");
    }

    public void deletePost(Long id) {
        Post post = postRepository.findById(id)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Post not found"
                        )
                );

        postRepository.delete(post);
    }
    
    @Transactional
    public void deleteReactions(Long id) {
        Post post = postRepository.findById(id)
                    .orElseThrow(() ->
                        new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Post not found"));

        if (post.getEmoji() != null) {
            post.resetAllEmojis();
        }
    }
    
    @Transactional 
    public int[] getEmojiValues(Long id) {
        Post post = postRepository.findById(id)
                    .orElseThrow(() ->
                        new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Post not found"));

        if (post.getEmoji() == null) {
            return new int[] {0, 0, 0, 0, 0, 0, 0};
        }

        return post.getEmoji().getEmojiAmounts();
    }

    @Transactional
    public void setEmojiAmount(long id, int index, int value) {
        Post post = postRepository.findById(id)
                    .orElseThrow(() ->
                        new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Post not found"));

        if (post.getEmoji() == null) {
            post.setEmoji(new Emoji());
            postRepository.saveAndFlush(post);
        }

        post.getEmoji().setEmojiAmount(index, value);
    }
}
