package com.backend.api;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.api.entity.Post;
import com.backend.api.repository.PostRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:post-read-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
@AutoConfigureMockMvc
class PostReadIntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private PostRepository postRepository;

	@BeforeEach
	void clearPosts() {
		postRepository.deleteAll();
	}

	@Test
	void getPostsIsPublicAndEmptyByDefault() throws Exception {
		mockMvc.perform(get("/api/posts"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content").isArray())
				.andExpect(jsonPath("$.page").value(0))
				.andExpect(jsonPath("$.size").value(5))
				.andExpect(jsonPath("$.totalElements").value(0))
				.andExpect(jsonPath("$.totalPages").value(0))
				.andExpect(jsonPath("$.first").value(true))
				.andExpect(jsonPath("$.last").value(true));
	}

	@Test
	void descendingFalseSortsPostsAscending() throws Exception {
		postRepository.save(postEntity("new", 2_000L));
		postRepository.save(postEntity("old", 1_000L));

		mockMvc.perform(get("/api/posts?page=0&size=1&sortBy=createdAt&descending=false"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.content[0].title").value("old"))
				.andExpect(jsonPath("$.totalElements").value(2))
				.andExpect(jsonPath("$.totalPages").value(2))
				.andExpect(jsonPath("$.last").value(false));
	}

	@Test
	void invalidPaginationParametersReturnBadRequest() throws Exception {
		mockMvc.perform(get("/api/posts?page=-1&size=101&sortBy=unknown"))
				.andExpect(status().isBadRequest());
	}

	@Test
	void getPostBySlugReturnsPost() throws Exception {
		postRepository.save(postEntity("first-post", 1_000L));

		mockMvc.perform(get("/api/posts/first-post"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.slug").value("first-post"))
				.andExpect(jsonPath("$.title").value("first-post"));
	}

	@Test
	void getPostByUnknownSlugReturnsNotFound() throws Exception {
		mockMvc.perform(get("/api/posts/missing-post"))
				.andExpect(status().isNotFound());
	}

	private Post postEntity(String title, long createdAt) {
		Post entity = new Post();
		entity.setTitle(title);
		entity.setSlug(title.trim().toLowerCase().replaceAll("\\s+", "-"));
		entity.setExcerpt(title);
		entity.setBody(title);
		entity.setTags(List.of(title));
		entity.setCreatedAt(new java.util.Date(createdAt));
		entity.setUpdatedAt(new java.util.Date(createdAt));
		return entity;
	}
}
