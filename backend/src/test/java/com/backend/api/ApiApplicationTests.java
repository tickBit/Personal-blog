package com.backend.api;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import com.backend.api.entity.Post;
import com.backend.api.repository.PostRepository;

import java.util.Date;
import java.util.List;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest(properties = "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE")
@AutoConfigureMockMvc
class ApiApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private PostRepository postRepository;

	@BeforeEach
	void clearPosts() {
		postRepository.deleteAll();
	}

	@Test
	void contextLoads() {
	}

	@Test
	void getPostsIsPublic() throws Exception {
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

	private Post postEntity(String title, long createdAt) {
		Post post = new Post();
		post.setTitle(title);
		post.setSlug(title);
		post.setExcerpt(title);
		post.setBody(title);
		post.setTags(List.of(title));
		post.setCreatedAt(new Date(createdAt));
		post.setUpdatedAt(new Date(createdAt));
		return post;
	}

	@Test
	void nonAdminCannotCreatePost() throws Exception {
		mockMvc.perform(post("/api/posts")
					.with(user("editor").roles("USER"))
					.contentType(MediaType.APPLICATION_JSON)
					.content("{}"))
				.andExpect(status().isForbidden());
	}

	@Test
	void adminCanReachCreatePostEndpoint() throws Exception {
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
				.content("""
						{
						  "title": "Created Title",
						  "excerpt": "Created excerpt",
						  "body": "Created body",
						  "tags": ["created", "post"],
						  "coverImage": "/images/created.png"
						}
						"""))
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
	void adminCanDeletePost() throws Exception {
		Post savedPost = postRepository.save(postEntity("to-delete", 1_000L));

		mockMvc.perform(delete("/api/posts/{id}", savedPost.getId())
				.with(user("admin").roles("ADMIN")))
				.andExpect(status().isNoContent());

		org.assertj.core.api.Assertions.assertThat(postRepository.existsById(savedPost.getId())).isFalse();
	}

	@Test
	void adminCanUpdatePost() throws Exception {
		Date createdAt = new Date(1_000L);
		Post savedPost = postRepository.save(postEntity("original-title", createdAt.getTime()));

		mockMvc.perform(put("/api/posts/{id}", savedPost.getId())
				.with(user("admin").roles("ADMIN"))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "title": "Updated Title",
						  "excerpt": "Updated excerpt",
						  "body": "Updated body",
						  "tags": ["updated", "post"],
						  "coverImage": "/images/updated.png"
						}
						"""))
				.andExpect(status().isAccepted());

		Post updatedPost = postRepository.findById(savedPost.getId()).orElseThrow();
		org.assertj.core.api.Assertions.assertThat(updatedPost.getTitle()).isEqualTo("Updated Title");
		org.assertj.core.api.Assertions.assertThat(updatedPost.getExcerpt()).isEqualTo("Updated excerpt");
		org.assertj.core.api.Assertions.assertThat(updatedPost.getBody()).isEqualTo("Updated body");
		org.assertj.core.api.Assertions.assertThat(updatedPost.getTags()).containsExactly("updated", "post");
		org.assertj.core.api.Assertions.assertThat(updatedPost.getCoverImage()).isEqualTo("/images/updated.png");
		org.assertj.core.api.Assertions.assertThat(updatedPost.getSlug()).isEqualTo("updated-title");
		org.assertj.core.api.Assertions.assertThat(updatedPost.getCreatedAt().getTime()).isEqualTo(createdAt.getTime());
		org.assertj.core.api.Assertions.assertThat(updatedPost.getUpdatedAt()).isAfter(createdAt);
	}

	@Test
	void updatingUnknownPostReturnsNotFound() throws Exception {
		mockMvc.perform(put("/api/posts/{id}", 999L)
				.with(user("admin").roles("ADMIN"))
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{
						  "title": "Updated Title",
						  "excerpt": "Updated excerpt",
						  "body": "Updated body",
						  "tags": ["updated"]
						}
						"""))
				.andExpect(status().isNotFound());
	}

}
