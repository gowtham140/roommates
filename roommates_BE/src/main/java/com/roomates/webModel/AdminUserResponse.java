package com.roomates.webModel;

public class AdminUserResponse {

    private Integer id;
    private String name;
    private String email;
    private String phone;
    private String userType;
    private boolean blocked;
    private int roomCount;
    private long activeRoomCount;
    private long blockedRoomCount;

    public AdminUserResponse() {
    }

    public AdminUserResponse(Integer id, String name, String email, String phone, String userType,
            boolean blocked, int roomCount, long activeRoomCount, long blockedRoomCount) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.userType = userType;
        this.blocked = blocked;
        this.roomCount = roomCount;
        this.activeRoomCount = activeRoomCount;
        this.blockedRoomCount = blockedRoomCount;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public boolean isBlocked() {
        return blocked;
    }

    public void setBlocked(boolean blocked) {
        this.blocked = blocked;
    }

    public int getRoomCount() {
        return roomCount;
    }

    public void setRoomCount(int roomCount) {
        this.roomCount = roomCount;
    }

    public long getActiveRoomCount() {
        return activeRoomCount;
    }

    public void setActiveRoomCount(long activeRoomCount) {
        this.activeRoomCount = activeRoomCount;
    }

    public long getBlockedRoomCount() {
        return blockedRoomCount;
    }

    public void setBlockedRoomCount(long blockedRoomCount) {
        this.blockedRoomCount = blockedRoomCount;
    }
}
