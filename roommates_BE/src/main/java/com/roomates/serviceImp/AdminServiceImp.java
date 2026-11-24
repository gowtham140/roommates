package com.roomates.serviceImp;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.roomates.exception.BadRequestException;
import com.roomates.exception.ResourceNotFoundException;
import com.roomates.model.Room;
import com.roomates.model.User;
import com.roomates.repository.RoomRepository;
import com.roomates.repository.UserRepository;
import com.roomates.service.AdminService;
import com.roomates.webModel.AdminUserResponse;
import com.roomates.webModel.RoomResponse;

@Service
public class AdminServiceImp implements AdminService {

    private static final String BLOCKED_BY_ADMIN = "BLOCKED";
    private static final String BLOCKED_BY_USER = "BLOCKED_BY_USER";

    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    public AdminServiceImp(UserRepository userRepository, RoomRepository roomRepository) {
        this.userRepository = userRepository;
        this.roomRepository = roomRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<AdminUserResponse> getUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.ASC, "id")).stream()
                .map(this::toUserResponse)
                .toList();
    }

    @Override
    @Transactional
    public AdminUserResponse setUserBlocked(Integer adminId, Integer userId, boolean blocked) {
        if (adminId.equals(userId)) {
            throw new BadRequestException("You cannot block your own account");
        }

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if ("1".equals(target.getUserType())) {
            throw new BadRequestException("Admin accounts cannot be blocked");
        }

        target.setStatus(!blocked);
        userRepository.save(target);

        for (Room room : roomRepository.findByOwnerId(userId)) {
            if (Boolean.TRUE.equals(room.getIsDelete())) {
                continue;
            }
            if (blocked) {
                if (!BLOCKED_BY_ADMIN.equals(room.getStatus())) {
                    room.setStatus(BLOCKED_BY_USER);
                }
            } else if (BLOCKED_BY_USER.equals(room.getStatus())) {
                room.setStatus("ACTIVE");
            }
            roomRepository.save(room);
        }

        return toUserResponse(target);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getRooms() {
        return roomRepository.findAll(Sort.by(Sort.Direction.DESC, "id")).stream()
                .filter(room -> !Boolean.TRUE.equals(room.getIsDelete()))
                .map(this::toRoomResponse)
                .toList();
    }

    @Override
    @Transactional
    public RoomResponse setRoomBlocked(Integer roomId, boolean blocked) {
        Room room = roomRepository.findById(roomId)
                .filter(candidate -> !Boolean.TRUE.equals(candidate.getIsDelete()))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (blocked) {
            room.setStatus(BLOCKED_BY_ADMIN);
        } else {
            User owner = room.getOwner();
            room.setStatus(owner != null && Boolean.FALSE.equals(owner.getStatus())
                    ? BLOCKED_BY_USER
                    : "ACTIVE");
        }

        return toRoomResponse(roomRepository.save(room));
    }

    private AdminUserResponse toUserResponse(User user) {
        List<Room> rooms = roomRepository.findByOwnerId(user.getId());
        long active = rooms.stream()
                .filter(room -> !Boolean.TRUE.equals(room.getIsDelete()) && "ACTIVE".equals(room.getStatus()))
                .count();
        long blocked = rooms.stream()
                .filter(room -> !Boolean.TRUE.equals(room.getIsDelete()))
                .filter(room -> BLOCKED_BY_ADMIN.equals(room.getStatus()) || BLOCKED_BY_USER.equals(room.getStatus()))
                .count();
        boolean isBlocked = Boolean.FALSE.equals(user.getStatus()) || Boolean.TRUE.equals(user.getIsDelete());

        return new AdminUserResponse(
                user.getId(),
                user.getName(),
                user.getMailID(),
                user.getPhone_no(),
                user.getUserType(),
                isBlocked,
                rooms.size(),
                active,
                blocked);
    }

    private RoomResponse toRoomResponse(Room room) {
        User owner = room.getOwner();
        List<String> amenities = room.getAmenities() == null ? List.of() : new ArrayList<>(room.getAmenities());
        List<String> imageUrls = room.getImageUrls() == null ? List.of() : new ArrayList<>(room.getImageUrls());

        return new RoomResponse(
                room.getId(),
                owner == null ? null : owner.getId(),
                owner == null ? null : owner.getName(),
                room.getTitle(),
                room.getDescription(),
                room.getLocation(),
                room.getRent(),
                room.getDeposit(),
                room.getRoomType(),
                room.getSharing(),
                room.getGender(),
                room.getFood(),
                room.getAvailableFrom(),
                amenities,
                imageUrls,
                room.getStatus(),
                room.getLatitude(),
                room.getLongitude(),
                room.getCreatedAt());
    }
}
