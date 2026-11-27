package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Sort;

import com.roomates.exception.BadRequestException;
import com.roomates.model.Feedback;
import com.roomates.model.User;
import com.roomates.repository.FeedbackRepository;
import com.roomates.repository.UserRepository;
import com.roomates.security.UserTypes;
import com.roomates.serviceImp.FeedbackServiceImp;
import com.roomates.webModel.FeedbackRequest;
import com.roomates.webModel.FeedbackResponse;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceImpTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private UserRepository userRepository;

    private FeedbackServiceImp service;

    @BeforeEach
    void setUp() {
        service = new FeedbackServiceImp(feedbackRepository, userRepository);
    }

    @Test
    void submitPersistsFeedbackForSeeker() {
        User seeker = user(UserTypes.SEEKER);
        when(userRepository.findById(7)).thenReturn(Optional.of(seeker));
        when(feedbackRepository.save(any(Feedback.class))).thenAnswer(invocation -> invocation.getArgument(0));

        service.submit(7, request("  Suggestion  ", "  Please add more filters  "));

        ArgumentCaptor<Feedback> captor = ArgumentCaptor.forClass(Feedback.class);
        verify(feedbackRepository).save(captor.capture());
        assertEquals(seeker, captor.getValue().getUser());
        assertEquals("Suggestion", captor.getValue().getCategory());
        assertEquals("Please add more filters", captor.getValue().getMessage());
    }

    @Test
    void submitRejectsAdmin() {
        when(userRepository.findById(7)).thenReturn(Optional.of(user(UserTypes.ADMIN)));

        assertThrows(BadRequestException.class, () -> service.submit(7, request("Suggestion", "Please add filters")));
        verify(feedbackRepository, never()).save(any(Feedback.class));
    }

    @Test
    void getAllMapsFeedbackForAdmin() {
        User owner = user(UserTypes.OWNER);
        Feedback feedback = new Feedback();
        feedback.setId(2);
        feedback.setUser(owner);
        feedback.setCategory("Improvement");
        feedback.setMessage("Make the map faster");
        feedback.setCreatedAt(LocalDateTime.of(2026, 11, 27, 10, 30));
        when(feedbackRepository.findAll(any(Sort.class))).thenReturn(List.of(feedback));

        List<FeedbackResponse> result = service.getAll();

        assertEquals(1, result.size());
        assertEquals("Owner", result.get(0).getUserName());
        assertEquals("owner@example.com", result.get(0).getEmail());
        assertEquals(UserTypes.OWNER, result.get(0).getUserType());
        assertEquals("Improvement", result.get(0).getCategory());
        assertEquals("Make the map faster", result.get(0).getMessage());
    }

    private User user(String userType) {
        User user = new User();
        user.setId(7);
        user.setName(userType.equals(UserTypes.OWNER) ? "Owner" : userType.equals(UserTypes.SEEKER) ? "Seeker" : "Admin");
        user.setMailID("owner@example.com");
        user.setUserType(userType);
        return user;
    }

    private FeedbackRequest request(String category, String message) {
        FeedbackRequest request = new FeedbackRequest();
        request.setCategory(category);
        request.setMessage(message);
        return request;
    }
}
