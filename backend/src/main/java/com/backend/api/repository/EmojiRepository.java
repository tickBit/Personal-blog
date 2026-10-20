package com.backend.api.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.backend.api.entity.Emoji;

public interface EmojiRepository extends JpaRepository<Emoji, Long> {

    /** Atomically increments exactly one reaction counter in the database. */
    @Modifying(clearAutomatically = true, flushAutomatically = true)
    @Query(value = """
            UPDATE emoji
            SET grinning_face = grinning_face + CASE WHEN :reactionIndex = 0 THEN 1 ELSE 0 END,
                smiling_face_with_halo = smiling_face_with_halo + CASE WHEN :reactionIndex = 1 THEN 1 ELSE 0 END,
                smiling_face_with_heart_eyes = smiling_face_with_heart_eyes + CASE WHEN :reactionIndex = 2 THEN 1 ELSE 0 END,
                smiling_face_with_sunglasses = smiling_face_with_sunglasses + CASE WHEN :reactionIndex = 3 THEN 1 ELSE 0 END,
                partying_face = partying_face + CASE WHEN :reactionIndex = 4 THEN 1 ELSE 0 END,
                disappointed_face = disappointed_face + CASE WHEN :reactionIndex = 5 THEN 1 ELSE 0 END,
                neutral_face = neutral_face + CASE WHEN :reactionIndex = 6 THEN 1 ELSE 0 END
            WHERE post_id = :postId
            """, nativeQuery = true)
    int incrementReaction(
            @Param("postId") Long postId,
            @Param("reactionIndex") int reactionIndex);
}
