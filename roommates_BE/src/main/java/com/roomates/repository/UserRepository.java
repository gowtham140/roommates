package com.roomates.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.roomates.model.User;

public interface UserRepository extends JpaRepository<User, Integer>{

    User findByMailID(String mailID);

    @Query("select u from User u where u.phone_no = :phoneNo order by u.id asc")
    List<User> findByPhoneNo(@Param("phoneNo") String phoneNo);

    @Query("select count(u) > 0 from User u where u.phone_no = :phoneNo")
    boolean existsByPhoneNo(@Param("phoneNo") String phoneNo);

    boolean existsByMailID(String mailID);
}
