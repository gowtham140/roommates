package com.roomates.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.roomates.model.Report;

public interface ReportRepository extends JpaRepository<Report, Integer> {
}
