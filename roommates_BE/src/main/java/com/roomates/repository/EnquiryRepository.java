package com.roomates.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.roomates.model.Enquiry;

public interface EnquiryRepository extends JpaRepository<Enquiry, Integer> {

    @EntityGraph(attributePaths = { "room", "room.owner", "seeker" })
    List<Enquiry> findBySeekerIdOrderByCreatedAtDesc(Integer seekerId);

    @EntityGraph(attributePaths = { "room", "room.owner", "seeker" })
    Page<Enquiry> findBySeekerId(Integer seekerId, Pageable pageable);

    @EntityGraph(attributePaths = { "room", "room.owner", "seeker" })
    List<Enquiry> findByRoomOwnerIdOrderByCreatedAtDesc(Integer ownerId);

    @EntityGraph(attributePaths = { "room", "room.owner", "seeker" })
    Page<Enquiry> findByRoomOwnerId(Integer ownerId, Pageable pageable);

    @EntityGraph(attributePaths = { "room", "room.owner", "seeker" })
    List<Enquiry> findAllByOrderByCreatedAtDesc();

    @EntityGraph(attributePaths = { "room", "room.owner", "seeker" })
    Page<Enquiry> findAllBy(Pageable pageable);

    boolean existsByRoomIdAndSeekerIdAndStatusIn(Integer roomId, Integer seekerId, List<String> statuses);

    long countByRoomOwnerIdAndStatus(Integer ownerId, String status);

    long countByStatus(String status);
}
