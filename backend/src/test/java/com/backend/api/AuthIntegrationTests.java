package com.backend.api;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import com.backend.api.config.JwtTokenUtil;
import com.backend.api.entity.User;
import com.backend.api.repository.UserRepository;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
		"spring.datasource.url=jdbc:h2:mem:auth-test;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
		"spring.datasource.driver-class-name=org.h2.Driver",
		"spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
@AutoConfigureMockMvc
class AuthIntegrationTests {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private PasswordEncoder passwordEncoder;

	@Autowired
	private JwtTokenUtil jwtTokenUtil;

	@BeforeEach
	void seedUser() {
		userRepository.deleteAll();
		userRepository.save(new User("admin", passwordEncoder.encode("password"), "ROLE_ADMIN"));
	}

	@Test
	void loginReturnsAccessAndRefreshTokens() throws Exception {
		mockMvc.perform(post("/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"username":"admin","password":"password"}
						"""))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accessToken").isString())
				.andExpect(jsonPath("$.refreshToken").isString());
	}

	@Test
	void loginRejectsInvalidPassword() throws Exception {
		mockMvc.perform(post("/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"username":"admin","password":"wrong"}
						"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void loginRejectsUnknownUser() throws Exception {
		mockMvc.perform(post("/auth/login")
				.contentType(MediaType.APPLICATION_JSON)
				.content("""
						{"username":"missing","password":"password"}
						"""))
				.andExpect(status().isUnauthorized());
	}

	@Test
	void refreshEndpointReturnsNewAccessToken() throws Exception {
		String refreshToken = jwtTokenUtil.generateRefreshToken("admin");

		mockMvc.perform(post("/auth/refresh")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"refreshToken\":\"" + refreshToken + "\"}"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.accessToken").isString());
	}

	@Test
	void refreshEndpointRejectsAccessToken() throws Exception {
		String accessToken = jwtTokenUtil.generateAccessToken("admin");

		mockMvc.perform(post("/auth/refresh")
				.contentType(MediaType.APPLICATION_JSON)
				.content("{\"refreshToken\":\"" + accessToken + "\"}"))
				.andExpect(status().isForbidden());
	}

	@Test
	void accessTokenCanAuthenticateProtectedAdminEndpoint() throws Exception {
		String accessToken = jwtTokenUtil.generateAccessToken("admin");

		mockMvc.perform(get("/api/posts/{id}/reactions/amount", -1)
				.header("Authorization", "Bearer " + accessToken))
				.andExpect(status().isNotFound());
	}
}
