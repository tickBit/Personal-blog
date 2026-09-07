package com.backend.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiApplicationTests {

	@Autowired
	private MockMvc mockMvc;

	@Test
	void contextLoads() {
	}

	@Test
	void getPostsIsPublic() throws Exception {
		mockMvc.perform(get("/api/posts"))
				.andExpect(status().isNotImplemented());
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
				.andExpect(status().isNotImplemented());
	}

}
