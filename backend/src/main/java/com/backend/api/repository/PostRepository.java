package com.backend.api.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.api.entity.Post;

import jakarta.persistence.LockModeType;

public interface PostRepository extends JpaRepository<Post, Long> {

    Optional<Post> findBySlug(String slug);

    // Acquires a pessimistic write lock on the post row to prevent concurrent updates.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    // Loads the post with its emoji in one query for update.
    @Query("SELECT p FROM Post p LEFT JOIN FETCH p.emoji WHERE p.id = :id")
    Optional<Post> findByIdForUpdate(@Param("id") Long id);

}
