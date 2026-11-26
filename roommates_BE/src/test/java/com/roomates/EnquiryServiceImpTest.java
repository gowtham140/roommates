package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.roomates.exception.BadRequestException;
import com.roomates.exception.ResourceNotFoundException;
import com.roomates.model.Enquiry;
import com.roomates.model.Room;
import com.roomates.model.User;
import com.roomates.repository.EnquiryRepository;
import com.roomates.repository.RoomRepository;
import com.roomates.repository.UserRepository;
import com.roomates.security.UserTypes;
import com.roomates.service.NotificationMailService;
import com.roomates.serviceImp.EnquiryServiceImp;
import com.roomates.webModel.EnquiryRequest;
import com.roomates.webModel.EnquiryResponse;

@ExtendWith(MockitoExtension.class)
class EnquiryServiceImpTest {

    @Mock
    private EnquiryRepository enquiryRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationMailService notificationMailService;

    private EnquiryServiceImp service;

    @BeforeEach
    void setUp() {
        service = new EnquiryServiceImp(enquiryRepository, roomRepository, userRepository, notificationMailService);
    }

    @Test
    void sendRejectsEnquiryOnOwnRoom() {
        User owner = new User();
        owner.setId(1);
        owner.setUserType("3");

        Room room = new Room();
        room.setId(3);
        room.setOwner(owner);
        room.setStatus("ACTIVE");
        room.setIsDelete(false);

        when(roomRepository.findById(3)).thenReturn(Optional.of(room));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));

        EnquiryRequest request = new EnquiryRequest();
        request.setMessage("Interested");

        assertThrows(BadRequestException.class, () -> service.send(3, 1, request));
    }

    @Test
    void sendRejectsDuplicateActiveEnquiry() {
        User owner = new User();
        owner.setId(1);
        User seeker = new User();
        seeker.setId(2);
        seeker.setUserType("3");

        Room room = new Room();
        room.setId(3);
        room.setOwner(owner);
        room.setStatus("ACTIVE");
        room.setIsDelete(false);

        when(roomRepository.findById(3)).thenReturn(Optional.of(room));
        when(userRepository.findById(2)).thenReturn(Optional.of(seeker));
        when(enquiryRepository.existsByRoomIdAndSeekerIdAndStatusIn(3, 2, List.of("NEW", "CONTACTED")))
                .thenReturn(true);

        EnquiryRequest request = new EnquiryRequest();
        request.setMessage("Interested");

        assertThrows(BadRequestException.class, () -> service.send(3, 2, request));
    }

    @Test
    void sendCreatesEnquiryAndExposesOwnerPhone() {
        User owner = new User();
        owner.setId(1);
        owner.setPhone_no("9000000001");

        User seeker = new User();
        seeker.setId(2);
        seeker.setName("Seeker");
        seeker.setPhone_no("9000000002");
        seeker.setUserType("3");

        Room room = new Room();
        room.setId(3);
        room.setTitle("Nice room");
        room.setOwner(owner);
        room.setStatus("ACTIVE");
        room.setIsDelete(false);

        when(roomRepository.findById(3)).thenReturn(Optional.of(room));
        when(userRepository.findById(2)).thenReturn(Optional.of(seeker));
        when(enquiryRepository.existsByRoomIdAndSeekerIdAndStatusIn(3, 2, List.of("NEW", "CONTACTED")))
                .thenReturn(false);
        when(enquiryRepository.save(any(Enquiry.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EnquiryRequest request = new EnquiryRequest();
        request.setMessage("  Interested  ");

        EnquiryResponse response = service.send(3, 2, request);

        assertEquals("Interested", response.getMessage());
        assertEquals("NEW", response.getStatus());
        assertEquals("9000000001", response.getOwnerPhone());
        assertEquals("Nice room", response.getRoomTitle());
        verify(notificationMailService).sendEnquiryNotification(any(Enquiry.class));
    }

    @Test
    void countNewReceivedUsesRepository() {
        User owner = new User();
        owner.setId(7);
        owner.setUserType(UserTypes.OWNER);
        when(userRepository.findById(7)).thenReturn(Optional.of(owner));
        when(enquiryRepository.countByRoomOwnerIdAndStatus(7, "NEW")).thenReturn(3L);

        assertEquals(3L, service.countNewReceived(7));
    }

    @Test
    void sentEnquiriesRejectOwner() {
        User owner = new User();
        owner.setId(7);
        owner.setUserType(UserTypes.OWNER);
        when(userRepository.findById(7)).thenReturn(Optional.of(owner));

        assertThrows(BadRequestException.class, () -> service.sent(7));
    }

    @Test
    void receivedEnquiriesRejectSeeker() {
        User seeker = new User();
        seeker.setId(8);
        seeker.setUserType(UserTypes.SEEKER);
        when(userRepository.findById(8)).thenReturn(Optional.of(seeker));

        assertThrows(BadRequestException.class, () -> service.received(8));
    }

    @Test
    void adminCanUpdateEnquiryForAnyRoom() {
        User admin = new User();
        admin.setId(9);
        admin.setUserType(UserTypes.ADMIN);

        User owner = new User();
        owner.setId(1);
        owner.setUserType(UserTypes.OWNER);

        Room room = new Room();
        room.setId(3);
        room.setOwner(owner);

        Enquiry enquiry = new Enquiry();
        enquiry.setId(4);
        enquiry.setRoom(room);
        enquiry.setStatus("NEW");

        when(enquiryRepository.findById(4)).thenReturn(Optional.of(enquiry));
        when(userRepository.findById(9)).thenReturn(Optional.of(admin));

        service.updateStatus(9, 4, "CONTACTED");

        assertEquals("CONTACTED", enquiry.getStatus());
        verify(enquiryRepository).save(enquiry);
    }

    @Test
    void adminReceivedEnquiriesIncludeAllRooms() {
        User admin = new User();
        admin.setId(9);
        admin.setUserType(UserTypes.ADMIN);

        Room room = new Room();
        room.setId(3);
        room.setTitle("Any room");

        Enquiry enquiry = new Enquiry();
        enquiry.setId(4);
        enquiry.setRoom(room);
        enquiry.setStatus("NEW");

        when(userRepository.findById(9)).thenReturn(Optional.of(admin));
        when(enquiryRepository.findAllBy(org.mockito.ArgumentMatchers.any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(enquiry)));

        assertEquals(1, service.received(9, 0, 10).size());
    }

    @Test
    void missingRoomThrowsNotFound() {
        when(roomRepository.findById(99)).thenReturn(Optional.empty());
        EnquiryRequest request = new EnquiryRequest();
        request.setMessage("Hi");

        assertThrows(ResourceNotFoundException.class, () -> service.send(99, 2, request));
    }
}
