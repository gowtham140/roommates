package com.roomates.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.roomates.model.Feedback;

public interface FeedbackRepository extends JpaRepository<Feedback, Integer> {

    @Override
    @EntityGraph(attributePaths = "user")
    List<Feedback> findAll(Sort sort);
}
