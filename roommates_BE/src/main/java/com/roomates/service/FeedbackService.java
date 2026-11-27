package com.roomates.service;

import java.util.List;

import com.roomates.webModel.FeedbackRequest;
import com.roomates.webModel.FeedbackResponse;

public interface FeedbackService {

    void submit(Integer userId, FeedbackRequest request);

    List<FeedbackResponse> getAll();
}
