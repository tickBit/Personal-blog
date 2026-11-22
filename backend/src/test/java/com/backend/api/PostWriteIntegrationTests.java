package com.backend.api;

import java.util.Date;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.api.entity.Post;
import com.backend.api.repository.PostRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:post-write-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
@AutoConfigureMockMvc
class PostWriteIntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private PostRepository postRepository;

	@BeforeEach
	void clearPosts() {
		postRepository.deleteAll();
	}

	@Test
	void nonAdminCannotCreatePost() throws Exception {
		mockMvc.perform(post("/api/posts")
				.with(user("editor").roles("USER"))
				.contentType(MediaType.APPLICATION_JSON)
				.content(validPostJson("User Post")))
				.andExpect(status().isForbidden());
	}

	@Test
	void adminCannotCreatePostWithInvalidData() throws Exception {
		mockMvc.perform(post("/api/posts")
				.with(user("admin").roles("ADMIN"))
				.contentType(MediaType.APPLICATION_JSON)
				.content("{}"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void adminCanCreatePostAndReceivesCreatedPost() throws Exception {
		mockMvc.perform(post("/api/posts")
				.with(user("admin").roles("ADMIN"))
				.contentType(MediaType.APPLICATION_JSON)
				.content(validPostJson("Created Title")))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.id").isNotEmpty())
				.andExpect(jsonPath("$.title").value("Created Title"))
				.andExpect(jsonPath("$.excerpt").value("Created excerpt"))
				.andExpect(jsonPath("$.body").value("Created body"))
				.andExpect(jsonPath("$.tags[0]").value("created"))
				.andExpect(jsonPath("$.coverImage").value("/images/created.png"))
				.andExpect(jsonPath("$.createdAt").isNotEmpty())
				.andExpect(jsonPath("$.updatedAt").isNotEmpty());
	}

	@Test
	void duplicatePostTitleReturnsConflict() throws Exception {
		postRepository.save(postEntity("Duplicate", 1_000L));

		mockMvc.perform(post("/api/posts")
				.with(user("admin").roles("ADMIN"))
				.contentType(MediaType.APPLICATION_JSON)
				.content(validPostJson("Duplicate")))
				.andExpect(status().isConflict());
	}

	@Test
	void adminCanUpdatePost() throws Exception {
		Date createdAt = new Date(1_000L);
		Post savedPost = postRepository.save(postEntity("original-title", createdAt.getTime()));

		mockMvc.perform(put("/api/posts/{id}", savedPost.getId())
				.with(user("admin").roles("ADMIN"))
				.contentType(MediaType.APPLICATION_JSON)
				.content(validPostJson("Updated Title")))
				.andExpect(status().isCreated());

		Post updatedPost = postRepository.findById(savedPost.getId()).orElseThrow();
		assertThat(updatedPost.getTitle()).isEqualTo("Updated Title");
		assertThat(updatedPost.getExcerpt()).isEqualTo("Created excerpt");
		assertThat(updatedPost.getBody()).isEqualTo("Created body");
		assertThat(updatedPost.getTags()).containsExactly("created", "post");
		assertThat(updatedPost.getCoverImage()).isEqualTo("/images/created.png");
		assertThat(updatedPost.getSlug()).isEqualTo("updated-title");
		assertThat(updatedPost.getCreatedAt().getTime()).isEqualTo(createdAt.getTime());
		assertThat(updatedPost.getUpdatedAt()).isAfter(createdAt);
	}

	@Test
	void updatingUnknownPostReturnsNotFound() throws Exception {
		mockMvc.perform(put("/api/posts/{id}", 999L)
				.with(user("admin").roles("ADMIN"))
				.contentType(MediaType.APPLICATION_JSON)
				.content(validPostJson("Updated Title")))
				.andExpect(status().isNotFound());
	}

	@Test
	void adminCanDeletePost() throws Exception {
		Post savedPost = postRepository.save(postEntity("to-delete", 1_000L));

		mockMvc.perform(delete("/api/posts/{id}", savedPost.getId())
				.with(user("admin").roles("ADMIN")))
				.andExpect(status().isNoContent());

		assertThat(postRepository.existsById(savedPost.getId())).isFalse();
	}

	@Test
	void deletingUnknownPostReturnsNotFound() throws Exception {
		mockMvc.perform(delete("/api/posts/{id}", -1)
				.with(user("admin").roles("ADMIN")))
				.andExpect(status().isNotFound());
	}

	private Post postEntity(String title, long createdAt) {
		Post entity = new Post();
		entity.setTitle(title);
		entity.setSlug(title.trim().toLowerCase().replaceAll("\\s+", "-"));
		entity.setExcerpt(title);
		entity.setBody(title);
		entity.setTags(List.of(title));
		entity.setCreatedAt(new Date(createdAt));
		entity.setUpdatedAt(new Date(createdAt));
		return entity;
	}

	private String validPostJson(String title) {
		return """
				{
				  "title": "%s",
				  "excerpt": "Created excerpt",
				  "body": "Created body",
				  "tags": ["created", "post"],
				  "coverImage": "/images/created.png"
				}
				""".formatted(title);
	}
}
