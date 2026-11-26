package com.roomates;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.roomates.model.User;
import com.roomates.repository.UserRepository;
import com.roomates.security.TokenUtil;

import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchKeyException;

@SpringBootTest
@AutoConfigureMockMvc
class WebSecurityConfigTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenUtil tokenUtil;

    @MockitoBean
    private S3Client s3Client;

    @Test
    void publicEndpointsDoNotRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/rooms"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/rooms/999"))
                .andExpect(status().isNotFound());
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void protectedEndpointsRequireAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/rooms/mine"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/rooms")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/uploads"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/enquiries/received"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "ROLE_SEEKER")
    void seekerCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users").with(user("admin").authorities(() -> "ROLE_ADMIN")))
                .andExpect(status().isOk());
    }

    @Test
    void actuatorAndStaticUploadsArePublic() throws Exception {
        when(s3Client.getObject(any(GetObjectRequest.class)))
                .thenThrow(NoSuchKeyException.builder().message("missing").build());
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/uploads/rooms/missing.png"))
                .andExpect(status().isNotFound());
    }

    @Test
    void enquiryCreationRequiresAuthentication() throws Exception {
        mockMvc.perform(post("/api/rooms/1/enquiries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void blockedUsersTokenIsRejected() throws Exception {
        User blocked = new User();
        blocked.setName("Blocked");
        blocked.setMailID("blocked-token@example.com");
        blocked.setPhone_no("0000000000");
        blocked.setUserType("3");
        blocked.setStatus(false);
        blocked.setIsDelete(false);
        userRepository.save(blocked);

        String token = tokenUtil.generateToken(blocked);

        mockMvc.perform(get("/api/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isUnauthorized());
    }
}
