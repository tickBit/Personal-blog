package com.backend.api;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.api.entity.Post;
import com.backend.api.repository.PostRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:post-reaction-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
@AutoConfigureMockMvc
class PostReactionIntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private PostRepository postRepository;

	@Autowired
	private JdbcTemplate jdbcTemplate;

	@BeforeEach
	void clearPosts() {
		postRepository.deleteAll();
	}

	@Test
	void reactionsAreIncrementedInTheDatabase() throws Exception {
		Post savedPost = postRepository.save(postEntity("reaction-post"));

		for (int i = 0; i < 2; i++) {
			mockMvc.perform(post("/api/posts/{id}/reactions", savedPost.getId())
					.contentType(MediaType.APPLICATION_JSON)
					.content("{\"emoji\":\"😄\"}"))
					.andExpect(status().isOk());
		}

		Integer count = jdbcTemplate.queryForObject(
				"SELECT grinning_face FROM emoji WHERE post_id = ?",
				Integer.class,
				savedPost.getId());
		assertThat(count).isEqualTo(2);
	}

	@Test
	void unknownPostReactionReturnsNotFound() throws Exception {
		mockMvc.perform(post("/api/posts/{id}/reactions", -1)
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"emoji\":\"😄\"}"))
				.andExpect(status().isNotFound());
	}

	@Test
	void adminCanReadReactionAmounts() throws Exception {
		Post savedPost = postRepository.save(postEntity("reaction-values"));

		mockMvc.perform(get("/api/posts/{id}/reactions/amount", savedPost.getId())
				.with(user("admin").roles("ADMIN")))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").isArray());
	}

	@Test
	void reactionAmountsRequireAdminRole() throws Exception {
		Post savedPost = postRepository.save(postEntity("protected-values"));

		mockMvc.perform(get("/api/posts/{id}/reactions/amount", savedPost.getId())
				.with(user("user").roles("USER")))
				.andExpect(status().isForbidden());
	}

	@Test
	void adminCanSetAndResetReactionAmounts() throws Exception {
		Post savedPost = postRepository.save(postEntity("reset-values"));

		mockMvc.perform(post("/api/posts/{id}/reactions/amount", savedPost.getId())
				.with(user("admin").roles("ADMIN"))
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"index\":0,\"amount\":3}"))
				.andExpect(status().isOk());

		mockMvc.perform(delete("/api/posts/{id}/reactions", savedPost.getId())
				.with(user("admin").roles("ADMIN")))
				.andExpect(status().isNoContent());

		Integer count = jdbcTemplate.queryForObject(
				"SELECT grinning_face FROM emoji WHERE post_id = ?",
				Integer.class,
				savedPost.getId());
		assertThat(count).isEqualTo(0);
	}

	private Post postEntity(String title) {
		Post entity = new Post();
		entity.setTitle(title);
		entity.setSlug(title.trim().toLowerCase().replaceAll("\\s+", "-"));
		entity.setExcerpt(title);
		entity.setBody(title);
		entity.setTags(List.of(title));
		entity.setCreatedAt(new java.util.Date(1_000L));
		entity.setUpdatedAt(new java.util.Date(1_000L));
		return entity;
	}
}
