package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.roomates.exception.BadRequestException;
import com.roomates.model.Room;
import com.roomates.model.User;
import com.roomates.repository.RoomRepository;
import com.roomates.repository.UserRepository;
import com.roomates.serviceImp.AdminServiceImp;
import com.roomates.webModel.AdminUserResponse;

@ExtendWith(MockitoExtension.class)
class AdminServiceImpTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomRepository roomRepository;

    private AdminServiceImp service;

    @BeforeEach
    void setUp() {
        service = new AdminServiceImp(userRepository, roomRepository);
    }

    @Test
    void blockUserBlocksRoomsAndUnblockRestoresOnlyUserBlockedRooms() {
        User target = user(2, "2", true);
        Room byUser = room(10, "ACTIVE");
        Room byAdmin = room(11, "BLOCKED");

        when(userRepository.findById(2)).thenReturn(Optional.of(target));
        when(roomRepository.findByOwnerId(2)).thenReturn(List.of(byUser, byAdmin));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminUserResponse blocked = service.setUserBlocked(1, 2, true);

        assertTrue(blocked.isBlocked());
        assertFalse(target.getStatus());
        assertEquals("BLOCKED_BY_USER", byUser.getStatus());
        assertEquals("BLOCKED", byAdmin.getStatus());

        AdminUserResponse unblocked = service.setUserBlocked(1, 2, false);

        assertFalse(unblocked.isBlocked());
        assertTrue(target.getStatus());
        assertEquals("ACTIVE", byUser.getStatus());
        assertEquals("BLOCKED", byAdmin.getStatus());
    }

    @Test
    void unblockRoomKeepsItBlockedWhenOwnerIsBlocked() {
        User owner = user(2, "2", false);
        Room room = room(10, "BLOCKED");
        room.setOwner(owner);

        when(roomRepository.findById(10)).thenReturn(Optional.of(room));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        assertEquals("BLOCKED_BY_USER", service.setRoomBlocked(10, false).getStatus());
    }

    @Test
    void adminCannotBlockOwnAccount() {
        assertThrows(BadRequestException.class, () -> service.setUserBlocked(1, 1, true));
    }

    private User user(Integer id, String type, boolean active) {
        User user = new User();
        user.setId(id);
        user.setMailID("user" + id + "@example.com");
        user.setName("User " + id);
        user.setUserType(type);
        user.setStatus(active);
        user.setIsDelete(false);
        return user;
    }

    private Room room(Integer id, String status) {
        Room room = new Room();
        room.setId(id);
        room.setStatus(status);
        room.setIsDelete(false);
        room.setTitle("Room " + id);
        return room;
    }
}
