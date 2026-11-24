package com.roomates.webModel;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class RoomResponse implements Serializable {

    private static final long serialVersionUID = 1L;

    private Integer id;
    private Integer ownerId;
    private String ownerName;
    private String title;
    private String description;
    private String location;
    private BigDecimal rent;
    private BigDecimal deposit;
    private String roomType;
    private String sharing;
    private String gender;
    private Boolean food;
    private LocalDate availableFrom;
    private List<String> amenities;
    private List<String> imageUrls;
    private String status;
    private LocalDateTime createdAt;

    public RoomResponse() {
    }

    public RoomResponse(Integer id, Integer ownerId, String ownerName, String title, String description,
            String location, BigDecimal rent, BigDecimal deposit, String roomType, String sharing, String gender,
            Boolean food, LocalDate availableFrom, List<String> amenities, List<String> imageUrls, String status,
            LocalDateTime createdAt) {
        this.id = id;
        this.ownerId = ownerId;
        this.ownerName = ownerName;
        this.title = title;
        this.description = description;
        this.location = location;
        this.rent = rent;
        this.deposit = deposit;
        this.roomType = roomType;
        this.sharing = sharing;
        this.gender = gender;
        this.food = food;
        this.availableFrom = availableFrom;
        this.amenities = amenities;
        this.imageUrls = imageUrls;
        this.status = status;
        this.createdAt = createdAt;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Integer ownerId) {
        this.ownerId = ownerId;
    }

    public String getOwnerName() {
        return ownerName;
    }

    public void setOwnerName(String ownerName) {
        this.ownerName = ownerName;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public BigDecimal getRent() {
        return rent;
    }

    public void setRent(BigDecimal rent) {
        this.rent = rent;
    }

    public BigDecimal getDeposit() {
        return deposit;
    }

    public void setDeposit(BigDecimal deposit) {
        this.deposit = deposit;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public String getSharing() {
        return sharing;
    }

    public void setSharing(String sharing) {
        this.sharing = sharing;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public Boolean getFood() {
        return food;
    }

    public void setFood(Boolean food) {
        this.food = food;
    }

    public LocalDate getAvailableFrom() {
        return availableFrom;
    }

    public void setAvailableFrom(LocalDate availableFrom) {
        this.availableFrom = availableFrom;
    }

    public List<String> getAmenities() {
        return amenities;
    }

    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }

    public List<String> getImageUrls() {
        return imageUrls;
    }

    public void setImageUrls(List<String> imageUrls) {
        this.imageUrls = imageUrls;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
