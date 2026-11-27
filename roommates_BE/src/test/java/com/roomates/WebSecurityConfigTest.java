package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.roomates.model.User;
import com.roomates.repository.FeedbackRepository;
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

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private FeedbackRepository feedbackRepository;

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
        mockMvc.perform(post("/api/feedback")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/feedback"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(authorities = "ROLE_SEEKER")
    void seekerCannotAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users"))
                .andExpect(status().isForbidden());
        mockMvc.perform(get("/api/admin/feedback"))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminCanAccessAdminEndpoints() throws Exception {
        mockMvc.perform(get("/api/admin/users").with(user("admin").authorities(() -> "ROLE_ADMIN")))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/feedback").with(user("admin").authorities(() -> "ROLE_ADMIN")))
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

    @Test
    void loginAcceptsPhoneNumberWithDuplicateAccounts() throws Exception {
        User phoneUser = new User();
        phoneUser.setName("Phone Login");
        phoneUser.setMailID("phone-login@example.com");
        phoneUser.setPhone_no("9123456789");
        phoneUser.setPassword(passwordEncoder.encode("secret123"));
        phoneUser.setGender("ANY");
        phoneUser.setUserType("3");
        phoneUser.setStatus(true);
        phoneUser.setIsDelete(false);
        userRepository.save(phoneUser);

        User duplicatePhoneUser = new User();
        duplicatePhoneUser.setName("Phone Login Two");
        duplicatePhoneUser.setMailID("phone-login-2@example.com");
        duplicatePhoneUser.setPhone_no("9123456789");
        duplicatePhoneUser.setPassword(passwordEncoder.encode("secret456"));
        duplicatePhoneUser.setGender("ANY");
        duplicatePhoneUser.setUserType("3");
        duplicatePhoneUser.setStatus(true);
        duplicatePhoneUser.setIsDelete(false);
        userRepository.save(duplicatePhoneUser);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"9123456789\",\"password\":\"secret456\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.email").value("phone-login-2@example.com"));
    }

    @Test
    void seekerCanSubmitFeedback() throws Exception {
        long before = feedbackRepository.count();

        User seeker = new User();
        seeker.setName("Feedback Seeker");
        seeker.setMailID("feedback-seeker@example.com");
        seeker.setPhone_no("9145678901");
        seeker.setGender("ANY");
        seeker.setUserType("3");
        seeker.setStatus(true);
        seeker.setIsDelete(false);
        userRepository.save(seeker);

        String token = tokenUtil.generateToken(seeker);

        mockMvc.perform(post("/api/feedback")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"category\":\"Suggestion\",\"message\":\"Please add more filters\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Feedback submitted"));

        assertEquals(before + 1, feedbackRepository.count());
    }
}
