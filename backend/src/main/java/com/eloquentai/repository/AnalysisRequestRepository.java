package com.eloquentai.repository;

import com.eloquentai.entity.AnalysisRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnalysisRequestRepository extends JpaRepository<AnalysisRequest, Long> {
    
    List<AnalysisRequest> findByStatusOrderByCreatedAtDesc(AnalysisRequest.AnalysisStatus status);
    
    List<AnalysisRequest> findByFileTypeOrderByCreatedAtDesc(String fileType);
    
    List<AnalysisRequest> findAllByOrderByCreatedAtDesc();
} 