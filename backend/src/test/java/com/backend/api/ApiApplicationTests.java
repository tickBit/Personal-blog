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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

@SpringBootTest
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

}
