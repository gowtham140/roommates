package com.roomates.webModel;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class RoomRequest implements Serializable {

    private static final long serialVersionUID = 1L;

    @NotBlank
    @Size(max = 120)
    private String title;

    @Size(max = 2000)
    private String description;

    @NotBlank
    @Size(max = 120)
    private String location;

    @NotNull
    @DecimalMin(value = "0.01", message = "Rent must be greater than zero")
    @DecimalMax(value = "100000000", message = "Rent is too large")
    private BigDecimal rent;

    @DecimalMin(value = "0", message = "Deposit cannot be negative")
    @DecimalMax(value = "100000000", message = "Deposit is too large")
    private BigDecimal deposit;

    @Pattern(regexp = "^(1RK|1BHK|2BHK|3BHK)$", message = "Invalid room type")
    private String roomType;

    @Pattern(regexp = "^(Single|Double|Triple)$", message = "Invalid sharing type")
    private String sharing;

    @Pattern(regexp = "^(ANY|MALE|FEMALE)$", message = "Invalid gender preference")
    private String gender;

    private Boolean food;

    @Size(max = 100)
    private String foodPreference;

    private LocalDate availableFrom;

    @Size(max = 20)
    private List<@Size(max = 50) String> amenities;

    @Size(max = 8)
    private List<@Pattern(regexp = "^/uploads/rooms/[A-Za-z0-9._-]+$") String> imageUrls;

    @Pattern(regexp = "^(ACTIVE|INACTIVE|RENTED|BLOCKED|BLOCKED_BY_USER)$", message = "Invalid room status")
    private String status;

    @DecimalMin("-90")
    @DecimalMax("90")
    private Double latitude;

    @DecimalMin("-180")
    @DecimalMax("180")
    private Double longitude;

    public RoomRequest() {
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

    public String getFoodPreference() {
        return foodPreference;
    }

    public void setFoodPreference(String foodPreference) {
        this.foodPreference = foodPreference;
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

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
