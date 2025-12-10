package com.eloquentai.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "analysis_requests")
public class AnalysisRequest {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String fileName;
    
    @Column(nullable = false)
    private String fileType; // AUDIO, VIDEO
    
    @Column(nullable = false)
    private String filePath;
    
    @Column(nullable = false)
    private Long fileSize;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AnalysisStatus status;
    
    @Column(columnDefinition = "TEXT")
    private String speechAnalysisResult;
    
    @Column(columnDefinition = "TEXT")
    private String videoAnalysisResult;
    
    @Column(columnDefinition = "TEXT")
    private String errorMessage;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @Column
    private LocalDateTime completedAt;
    
    // Constructors
    public AnalysisRequest() {
        this.createdAt = LocalDateTime.now();
        this.status = AnalysisStatus.PENDING;
    }
    
    public AnalysisRequest(String fileName, String fileType, String filePath, Long fileSize) {
        this();
        this.fileName = fileName;
        this.fileType = fileType;
        this.filePath = filePath;
        this.fileSize = fileSize;
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getFileName() {
        return fileName;
    }
    
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
    
    public String getFileType() {
        return fileType;
    }
    
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }
    
    public String getFilePath() {
        return filePath;
    }
    
    public void setFilePath(String filePath) {
        this.filePath = filePath;
    }
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public AnalysisStatus getStatus() {
        return status;
    }
    
    public void setStatus(AnalysisStatus status) {
        this.status = status;
        if (status == AnalysisStatus.COMPLETED || status == AnalysisStatus.FAILED) {
            this.completedAt = LocalDateTime.now();
        }
    }
    
    public String getSpeechAnalysisResult() {
        return speechAnalysisResult;
    }
    
    public void setSpeechAnalysisResult(String speechAnalysisResult) {
        this.speechAnalysisResult = speechAnalysisResult;
    }
    
    public String getVideoAnalysisResult() {
        return videoAnalysisResult;
    }
    
    public void setVideoAnalysisResult(String videoAnalysisResult) {
        this.videoAnalysisResult = videoAnalysisResult;
    }
    
    public String getErrorMessage() {
        return errorMessage;
    }
    
    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getCompletedAt() {
        return completedAt;
    }
    
    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
    
    public enum AnalysisStatus {
        PENDING,
        PROCESSING,
        COMPLETED,
        FAILED
    }
} 