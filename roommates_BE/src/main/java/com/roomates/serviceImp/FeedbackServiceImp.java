package com.roomates.serviceImp;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roomates.exception.BadRequestException;
import com.roomates.exception.ResourceNotFoundException;
import com.roomates.model.Feedback;
import com.roomates.model.User;
import com.roomates.repository.FeedbackRepository;
import com.roomates.repository.UserRepository;
import com.roomates.security.UserTypes;
import com.roomates.service.FeedbackService;
import com.roomates.webModel.FeedbackRequest;
import com.roomates.webModel.FeedbackResponse;

@Service
public class FeedbackServiceImp implements FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackServiceImp(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void submit(Integer userId, FeedbackRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!UserTypes.OWNER.equals(user.getUserType()) && !UserTypes.SEEKER.equals(user.getUserType())) {
            throw new BadRequestException("Only owners and seekers can submit feedback");
        }

        Feedback feedback = new Feedback();
        feedback.setUser(user);
        feedback.setCategory(request.getCategory().trim());
        feedback.setMessage(request.getMessage().trim());
        feedbackRepository.save(feedback);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeedbackResponse> getAll() {
        return feedbackRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .map(this::toResponse)
                .toList();
    }

    private FeedbackResponse toResponse(Feedback feedback) {
        User user = feedback.getUser();
        return new FeedbackResponse(
                feedback.getId(),
                user == null ? null : user.getName(),
                user == null ? null : user.getMailID(),
                user == null ? null : user.getUserType(),
                feedback.getCategory(),
                feedback.getMessage(),
                feedback.getCreatedAt());
    }
}
