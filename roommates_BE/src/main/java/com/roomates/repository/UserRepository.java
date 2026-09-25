package com.roomates.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomates.model.User;

public interface UserRepository extends JpaRepository<User, Integer>{

    User findByMailID(String mailID);
    
    boolean existsByMailID(String mailID);
}
