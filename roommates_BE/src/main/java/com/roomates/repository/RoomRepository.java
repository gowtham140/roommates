package com.roomates.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.roomates.model.Room;

public interface RoomRepository extends JpaRepository<Room, Integer> {

    @Query("SELECT r FROM Room r WHERE r.isDelete = false AND r.status = 'ACTIVE' "
            + "AND (:location IS NULL OR LOWER(r.location) LIKE LOWER(CONCAT('%', :location, '%'))) "
            + "AND (:minRent IS NULL OR r.rent >= :minRent) "
            + "AND (:maxRent IS NULL OR r.rent <= :maxRent) "
            + "AND (:roomType IS NULL OR r.roomType = :roomType) "
            + "AND (:gender IS NULL OR r.gender = :gender OR r.gender = 'ANY') "
            + "AND (:food IS NULL OR r.food = :food) "
            + "AND (:foodPreference IS NULL OR r.foodPreference = :foodPreference)")
    Page<Room> search(@Param("location") String location,
            @Param("minRent") BigDecimal minRent,
            @Param("maxRent") BigDecimal maxRent,
            @Param("roomType") String roomType,
            @Param("gender") String gender,
            @Param("food") Boolean food,
            @Param("foodPreference") String foodPreference,
            Pageable pageable);

    @EntityGraph(attributePaths = "owner")
    List<Room> findByOwnerId(Integer ownerId);

    @EntityGraph(attributePaths = "owner")
    Page<Room> findAll(Pageable pageable);

    @EntityGraph(attributePaths = "owner")
    Page<Room> findAllByIsDeleteFalse(Pageable pageable);

    List<Room> findByLocationIgnoreCase(String location);

    @Query("SELECT COUNT(r) > 0 FROM Room r JOIN r.imageUrls image WHERE image = :imageUrl AND r.id <> :roomId")
    boolean existsByImageUrlAndRoomIdNot(@Param("imageUrl") String imageUrl, @Param("roomId") Integer roomId);
}
