package com.roomates.serviceImp;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Sort.Direction;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.roomates.exception.BadRequestException;
import com.roomates.exception.ResourceNotFoundException;
import com.roomates.model.Room;
import com.roomates.model.User;
import com.roomates.repository.RoomRepository;
import com.roomates.repository.UserRepository;
import com.roomates.security.UserTypes;
import com.roomates.service.RoomService;
import com.roomates.webModel.RoomRequest;
import com.roomates.webModel.RoomResponse;

@Service
public class RoomServiceImp implements RoomService {

    private static final List<String> SORT_PROPERTIES = List.of("createdAt", "rent", "deposit");
    private static final List<String> ADMIN_BLOCKED_STATUSES = List.of("BLOCKED", "BLOCKED_BY_USER");

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public RoomServiceImp(RoomRepository roomRepository, UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RoomResponse> search(String location, BigDecimal minRent, BigDecimal maxRent, String roomType,
            String gender, Boolean food, int page, int size, String sort) {
        String locationQuery = StringUtils.hasText(location) ? location.trim() : null;
        String roomTypeQuery = StringUtils.hasText(roomType) ? roomType.trim() : null;
        String genderQuery = StringUtils.hasText(gender) ? gender.trim() : null;

        Pageable pageable = PageRequest.of(page, Math.min(size, 50), resolveSort(sort));
        return roomRepository
                .search(locationQuery, minRent, maxRent, roomTypeQuery, genderQuery, food, pageable)
                .map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponse getById(Integer id) {
        Room room = roomRepository.findById(id)
                .filter(candidate -> !Boolean.TRUE.equals(candidate.getIsDelete()))
                .filter(candidate -> !ADMIN_BLOCKED_STATUSES.contains(candidate.getStatus()))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        return toResponse(room);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponse> getMine(Integer ownerId) {
        return roomRepository.findByOwnerId(ownerId).stream()
                .filter(room -> !Boolean.TRUE.equals(room.getIsDelete()))
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public RoomResponse create(Integer ownerId, RoomRequest request) {
        User owner = requireRoomManager(ownerId);

        Room room = new Room();
        room.setOwner(owner);
        room.setIsDelete(false);
        applyRequest(room, request);
        return toResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public RoomResponse update(Integer ownerId, Integer id, RoomRequest request) {
        Room room = findOwnedRoom(ownerId, id);
        requireRoomManager(ownerId);
        ensureNotAdminBlocked(room);
        applyRequest(room, request);
        return toResponse(roomRepository.save(room));
    }

    @Override
    @Transactional
    public void delete(Integer ownerId, Integer id) {
        Room room = findOwnedRoom(ownerId, id);
        requireRoomManager(ownerId);
        ensureNotAdminBlocked(room);
        room.setIsDelete(true);
        room.setStatus("INACTIVE");
        roomRepository.save(room);
    }

    private User requireRoomManager(Integer userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!UserTypes.OWNER.equals(user.getUserType()) && !UserTypes.ADMIN.equals(user.getUserType())) {
            throw new BadRequestException("Only room owners can manage room listings");
        }
        return user;
    }

    private void ensureNotAdminBlocked(Room room) {
        if (ADMIN_BLOCKED_STATUSES.contains(room.getStatus())) {
            throw new BadRequestException("This room is blocked by an administrator");
        }
    }

    private Room findOwnedRoom(Integer ownerId, Integer id) {
        Room room = roomRepository.findById(id)
                .filter(candidate -> !Boolean.TRUE.equals(candidate.getIsDelete()))
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        if (room.getOwner() == null || !room.getOwner().getId().equals(ownerId)) {
            throw new BadRequestException("You can only modify your own rooms");
        }
        return room;
    }

    private void applyRequest(Room room, RoomRequest request) {
        room.setTitle(request.getTitle());
        room.setDescription(request.getDescription());
        room.setLocation(request.getLocation());
        room.setRent(request.getRent());
        room.setDeposit(request.getDeposit());
        room.setRoomType(request.getRoomType());
        room.setSharing(request.getSharing());
        room.setGender(request.getGender());
        room.setFood(request.getFood());
        room.setAvailableFrom(request.getAvailableFrom());
        room.setLatitude(request.getLatitude());
        room.setLongitude(request.getLongitude());
        room.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus().trim() : "ACTIVE");

        if (room.getAmenities() == null) {
            room.setAmenities(new LinkedHashSet<>());
        }
        room.getAmenities().clear();
        if (request.getAmenities() != null) {
            room.getAmenities().addAll(request.getAmenities());
        }

        if (room.getImageUrls() == null) {
            room.setImageUrls(new LinkedHashSet<>());
        }
        room.getImageUrls().clear();
        if (request.getImageUrls() != null) {
            room.getImageUrls().addAll(request.getImageUrls());
        }
    }

    private Sort resolveSort(String sort) {
        String value = StringUtils.hasText(sort) ? sort.trim() : "createdAt,desc";
        String[] parts = value.split(",", 2);
        String property = parts[0].trim();
        if (!SORT_PROPERTIES.contains(property)) {
            property = "createdAt";
        }
        Direction direction = parts.length > 1 && "asc".equalsIgnoreCase(parts[1].trim())
                ? Direction.ASC
                : Direction.DESC;
        return Sort.by(direction, property);
    }

    private RoomResponse toResponse(Room room) {
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
