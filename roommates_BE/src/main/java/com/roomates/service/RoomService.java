package com.roomates.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;

import com.roomates.webModel.RoomRequest;
import com.roomates.webModel.RoomResponse;

public interface RoomService {

    Page<RoomResponse> search(String location, BigDecimal minRent, BigDecimal maxRent, String roomType,
            String gender, Boolean food, String foodPreference, int page, int size, String sort);

    RoomResponse getById(Integer id);

    List<RoomResponse> getMine(Integer ownerId);

    RoomResponse create(Integer ownerId, RoomRequest request);

    RoomResponse update(Integer ownerId, Integer id, RoomRequest request);

    void delete(Integer ownerId, Integer id);

    RoomResponse deleteImage(Integer ownerId, Integer id, String imageUrl);
}
