package com.roomates.serviceImp;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roomates.exception.BadRequestException;
import com.roomates.exception.ResourceNotFoundException;
import com.roomates.model.Enquiry;
import com.roomates.model.Room;
import com.roomates.model.User;
import com.roomates.repository.EnquiryRepository;
import com.roomates.repository.RoomRepository;
import com.roomates.repository.UserRepository;
import com.roomates.security.UserTypes;
import com.roomates.service.EnquiryService;
import com.roomates.webModel.EnquiryRequest;
import com.roomates.webModel.EnquiryResponse;

@Service
public class EnquiryServiceImp implements EnquiryService {

    private static final List<String> ACTIVE_STATUSES = List.of("NEW", "CONTACTED");
    private static final List<String> ALLOWED_STATUSES = List.of("NEW", "CONTACTED", "CLOSED", "CONFIRMED");

    private final EnquiryRepository enquiryRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public EnquiryServiceImp(EnquiryRepository enquiryRepository, RoomRepository roomRepository,
            UserRepository userRepository) {
        this.enquiryRepository = enquiryRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public EnquiryResponse send(Integer roomId, Integer seekerId, EnquiryRequest request) {
        Room room = roomRepository.findById(roomId)
                .filter(candidate -> !Boolean.TRUE.equals(candidate.getIsDelete()))
                .filter(candidate -> "ACTIVE".equals(candidate.getStatus()))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        User seeker = userRepository.findById(seekerId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        requireSeeker(seeker);
        if (Boolean.TRUE.equals(seeker.getSeekingClosed())) {
            throw new BadRequestException("Your room seeking is closed. Reopen it from your profile to send enquiries.");
        }

        if (room.getOwner() != null && room.getOwner().getId().equals(seekerId)) {
            throw new BadRequestException("You cannot enquire on your own room");
        }

        if (enquiryRepository.existsByRoomIdAndSeekerIdAndStatusIn(roomId, seekerId, ACTIVE_STATUSES)) {
            throw new BadRequestException("You already have an active enquiry for this room");
        }

        String message = request.getMessage() == null ? "" : request.getMessage().trim();
        if (message.isEmpty()) {
            throw new BadRequestException("Message is required");
        }

        Enquiry enquiry = new Enquiry();
        enquiry.setRoom(room);
        enquiry.setSeeker(seeker);
        enquiry.setMessage(message);
        enquiry.setStatus("NEW");

        return toResponse(enquiryRepository.save(enquiry));
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnquiryResponse> sent(Integer seekerId) {
        return enquiryRepository.findBySeekerIdOrderByCreatedAtDesc(seekerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnquiryResponse> received(Integer ownerId) {
        return enquiryRepository.findByRoomOwnerIdOrderByCreatedAtDesc(ownerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public void updateStatus(Integer ownerId, Integer id, String status) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found"));

        Room room = enquiry.getRoom();
        if (room == null || room.getOwner() == null || !room.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only manage enquiries for your own rooms");
        }
        requireRoomManager(ownerId);
        if (!ALLOWED_STATUSES.contains(status)) {
            throw new BadRequestException("Invalid enquiry status");
        }

        enquiry.setStatus(status);
        enquiryRepository.save(enquiry);

        if ("CONFIRMED".equals(status)) {
            User seeker = enquiry.getSeeker();
            if (seeker != null && !Boolean.TRUE.equals(seeker.getSeekingClosed())) {
                seeker.setSeekingClosed(true);
                userRepository.save(seeker);
            }
        }
    }

    private void requireSeeker(User user) {
        if (!UserTypes.SEEKER.equals(user.getUserType())) {
            throw new BadRequestException("Only room seekers can send enquiries");
        }
    }

    private void requireRoomManager(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!UserTypes.OWNER.equals(user.getUserType()) && !UserTypes.ADMIN.equals(user.getUserType())) {
            throw new BadRequestException("Only room owners can manage enquiries");
        }
    }

    private EnquiryResponse toResponse(Enquiry enquiry) {
        Room room = enquiry.getRoom();
        User seeker = enquiry.getSeeker();
        User owner = room == null ? null : room.getOwner();

        return new EnquiryResponse(
                enquiry.getId(),
                room == null ? null : room.getId(),
                room == null ? null : room.getTitle(),
                seeker == null ? null : seeker.getId(),
                seeker == null ? null : seeker.getName(),
                seeker == null ? null : seeker.getPhone_no(),
                owner == null ? null : owner.getPhone_no(),
                seeker == null ? null : seeker.getWorkingDetails(),
                seeker == null ? null : seeker.getHobbyPreferences(),
                seeker != null && Boolean.TRUE.equals(seeker.getSeekingClosed()),
                enquiry.getMessage(),
                enquiry.getStatus(),
                enquiry.getCreatedAt());
    }
}
