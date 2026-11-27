package com.roomates.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.roomates.model.User;

public interface UserRepository extends JpaRepository<User, Integer>{

    User findByMailID(String mailID);

    @Query("select u from User u where u.phone_no = :phoneNo")
    User findFirstByPhoneNo(@Param("phoneNo") String phoneNo);

    boolean existsByMailID(String mailID);
}
