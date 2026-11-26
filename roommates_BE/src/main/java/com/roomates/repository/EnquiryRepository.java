package com.roomates.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomates.model.Enquiry;

public interface EnquiryRepository extends JpaRepository<Enquiry, Integer> {

    List<Enquiry> findBySeekerIdOrderByCreatedAtDesc(Integer seekerId);

    List<Enquiry> findByRoomOwnerIdOrderByCreatedAtDesc(Integer ownerId);

    boolean existsByRoomIdAndSeekerIdAndStatusIn(Integer roomId, Integer seekerId, List<String> statuses);

    long countByRoomOwnerIdAndStatus(Integer ownerId, String status);
}
