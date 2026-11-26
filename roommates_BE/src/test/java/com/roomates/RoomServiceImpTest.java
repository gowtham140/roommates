package com.roomates;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.math.BigDecimal;
import java.util.LinkedHashSet;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import com.roomates.exception.BadRequestException;
import com.roomates.model.Room;
import com.roomates.model.User;
import com.roomates.repository.RoomRepository;
import com.roomates.repository.UserRepository;
import com.roomates.service.FileStorageService;
import com.roomates.serviceImp.RoomServiceImp;
import com.roomates.webModel.RoomRequest;
import com.roomates.webModel.RoomResponse;

@ExtendWith(MockitoExtension.class)
class RoomServiceImpTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    private RoomServiceImp service;

    @BeforeEach
    void setUp() {
        service = new RoomServiceImp(roomRepository, userRepository, fileStorageService);
    }

    @Test
    void searchMapsResponseAndResolvesSort() {
        when(roomRepository.search(any(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(java.util.List.of()));

        service.search("adyar", new BigDecimal("10000"), new BigDecimal("30000"), "1BHK", "ANY", true, "VEG", 1, 10,
                "rent,asc");

        ArgumentCaptor<Pageable> captor = ArgumentCaptor.forClass(Pageable.class);
        verify(roomRepository).search(any(), any(), any(), any(), any(), any(), any(), captor.capture());
        assertEquals(1, captor.getValue().getPageNumber());
        assertEquals(10, captor.getValue().getPageSize());
        assertEquals("rent: ASC", captor.getValue().getSort().toString());
    }

    @Test
    void updateRejectsNonOwner() {
        User owner = new User();
        owner.setId(1);

        Room room = new Room();
        room.setId(5);
        room.setOwner(owner);
        room.setIsDelete(false);

        when(roomRepository.findById(5)).thenReturn(Optional.of(room));

        RoomRequest request = new RoomRequest();
        request.setTitle("X");
        request.setLocation("Chennai");
        request.setRent(BigDecimal.TEN);

        assertThrows(BadRequestException.class, () -> service.update(2, 5, request));
    }

    @Test
    void createCopiesRequestFields() {
        User owner = new User();
        owner.setId(1);
        owner.setName("Owner");
        owner.setUserType("2");

        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RoomRequest request = new RoomRequest();
        request.setTitle("Nice room");
        request.setLocation("Velachery");
        request.setRent(new BigDecimal("15000"));
        request.setRoomType("1BHK");

        RoomResponse response = service.create(1, request);

        assertEquals("Nice room", response.getTitle());
        assertEquals("Owner", response.getOwnerName());
        assertEquals("ACTIVE", response.getStatus());
        assertEquals(new BigDecimal("15000"), response.getRent());
    }

    @Test
    void deleteImageRemovesPhotoAndStorageFile() {
        User owner = new User();
        owner.setId(1);
        owner.setUserType("2");

        Room room = new Room();
        room.setId(5);
        room.setOwner(owner);
        room.setIsDelete(false);
        room.setStatus("ACTIVE");
        room.setImageUrls(new LinkedHashSet<>(java.util.List.of("/uploads/rooms/a.png", "/uploads/rooms/b.png")));

        when(roomRepository.findById(5)).thenReturn(Optional.of(room));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));
        when(roomRepository.save(room)).thenReturn(room);

        RoomResponse response = service.deleteImage(1, 5, "/uploads/rooms/a.png");

        assertEquals(java.util.List.of("/uploads/rooms/b.png"), response.getImageUrls());
        verify(fileStorageService).delete("/uploads/rooms/a.png");
    }

    @Test
    void deleteImageRejectsPhotoFromAnotherRoom() {
        User owner = new User();
        owner.setId(1);
        owner.setUserType("2");

        Room room = new Room();
        room.setId(5);
        room.setOwner(owner);
        room.setIsDelete(false);
        room.setStatus("ACTIVE");
        room.setImageUrls(new LinkedHashSet<>(java.util.List.of("/uploads/rooms/a.png")));

        when(roomRepository.findById(5)).thenReturn(Optional.of(room));
        when(userRepository.findById(1)).thenReturn(Optional.of(owner));

        assertThrows(BadRequestException.class,
                () -> service.deleteImage(1, 5, "/uploads/rooms/unknown.png"));
        verify(fileStorageService, org.mockito.Mockito.never()).delete(any());
    }
}
