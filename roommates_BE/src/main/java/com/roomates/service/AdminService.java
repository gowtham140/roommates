package com.roomates.service;

import java.util.List;

import com.roomates.webModel.AdminUserResponse;
import com.roomates.webModel.RoomResponse;

public interface AdminService {

    List<AdminUserResponse> getUsers();

    AdminUserResponse setUserBlocked(Integer adminId, Integer userId, boolean blocked);

    List<RoomResponse> getRooms();

    RoomResponse setRoomBlocked(Integer roomId, boolean blocked);
}
