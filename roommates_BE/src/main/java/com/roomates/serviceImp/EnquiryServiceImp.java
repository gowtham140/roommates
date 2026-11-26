package com.roomates.serviceImp;

import java.util.List;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
import com.roomates.service.NotificationMailService;
import com.roomates.webModel.EnquiryRequest;
import com.roomates.webModel.EnquiryResponse;

@Service
public class EnquiryServiceImp implements EnquiryService {

    private static final List<String> ACTIVE_STATUSES = List.of("NEW", "CONTACTED");
    private static final List<String> ALLOWED_STATUSES = List.of("NEW", "CONTACTED", "CLOSED", "CONFIRMED");

    private final EnquiryRepository enquiryRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final NotificationMailService notificationMailService;

    public EnquiryServiceImp(EnquiryRepository enquiryRepository, RoomRepository roomRepository,
            UserRepository userRepository, NotificationMailService notificationMailService) {
        this.enquiryRepository = enquiryRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.notificationMailService = notificationMailService;
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

        Enquiry saved = enquiryRepository.save(enquiry);
        notificationMailService.sendEnquiryNotification(saved);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnquiryResponse> sent(Integer seekerId) {
        return sent(seekerId, 0, 100);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnquiryResponse> sent(Integer seekerId, int page, int size) {
        User user = requireUser(seekerId);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        if (isAdmin(user)) {
            return enquiryRepository.findAllBy(pageable).map(this::toResponse).getContent();
        }
        requireSeeker(user);
        return enquiryRepository.findBySeekerId(seekerId, pageable).map(this::toResponse).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnquiryResponse> received(Integer ownerId) {
        return received(ownerId, 0, 100);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EnquiryResponse> received(Integer ownerId, int page, int size) {
        User user = requireRoomManager(ownerId);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.min(Math.max(size, 1), 100),
                Sort.by(Sort.Direction.DESC, "createdAt"));
        if (isAdmin(user)) {
            return enquiryRepository.findAllBy(pageable).map(this::toResponse).getContent();
        }
        return enquiryRepository.findByRoomOwnerId(ownerId, pageable).map(this::toResponse).getContent();
    }

    @Override
    @Transactional(readOnly = true)
    public long countNewReceived(Integer ownerId) {
        User user = requireRoomManager(ownerId);
        return isAdmin(user)
                ? enquiryRepository.countByStatus("NEW")
                : enquiryRepository.countByRoomOwnerIdAndStatus(ownerId, "NEW");
    }

    @Override
    @Transactional
    public void updateStatus(Integer ownerId, Integer id, String status) {
        Enquiry enquiry = enquiryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Enquiry not found"));

        Room room = enquiry.getRoom();
        boolean admin = userRepository.findById(ownerId).map(this::isAdmin).orElse(false);
        if (!admin && (room == null || room.getOwner() == null || !room.getOwner().getId().equals(ownerId))) {
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

    private User requireUser(Integer userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private void requireSeeker(User user) {
        if (!UserTypes.SEEKER.equals(user.getUserType())) {
            throw new BadRequestException("Only room seekers can send enquiries");
        }
    }

    private User requireRoomManager(Integer userId) {
        User user = requireUser(userId);
        if (!UserTypes.OWNER.equals(user.getUserType()) && !UserTypes.ADMIN.equals(user.getUserType())) {
            throw new BadRequestException("Only room owners and administrators can manage enquiries");
        }
        return user;
    }

    private boolean isAdmin(User user) {
        return UserTypes.ADMIN.equals(user.getUserType());
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
