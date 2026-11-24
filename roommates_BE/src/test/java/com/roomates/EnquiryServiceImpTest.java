package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
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
import com.roomates.exception.ResourceNotFoundException;
import com.roomates.model.Enquiry;
import com.roomates.model.Room;
import com.roomates.model.User;
import com.roomates.repository.EnquiryRepository;
import com.roomates.repository.RoomRepository;
import com.roomates.repository.UserRepository;
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

    private EnquiryServiceImp service;

    @BeforeEach
    void setUp() {
        service = new EnquiryServiceImp(enquiryRepository, roomRepository, userRepository);
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
    }

    @Test
    void missingRoomThrowsNotFound() {
        when(roomRepository.findById(99)).thenReturn(Optional.empty());
        EnquiryRequest request = new EnquiryRequest();
        request.setMessage("Hi");

        assertThrows(ResourceNotFoundException.class, () -> service.send(99, 2, request));
    }
}
