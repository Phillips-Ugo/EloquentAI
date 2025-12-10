package com.eloquentai.dto;

import com.eloquentai.entity.AnalysisRequest;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AnalysisResponse {
    
    private Long id;
    private String fileName;
    private String fileType;
    private Long fileSize;
    private String status;
    private String speechAnalysisResult;
    private String videoAnalysisResult;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    
    // Constructors
    public AnalysisResponse() {}
    
    public AnalysisResponse(AnalysisRequest request) {
        this.id = request.getId();
        this.fileName = request.getFileName();
        this.fileType = request.getFileType();
        this.fileSize = request.getFileSize();
        this.status = request.getStatus().name();
        this.speechAnalysisResult = request.getSpeechAnalysisResult();
        this.videoAnalysisResult = request.getVideoAnalysisResult();
        this.errorMessage = request.getErrorMessage();
        this.createdAt = request.getCreatedAt();
        this.completedAt = request.getCompletedAt();
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
    
    public Long getFileSize() {
        return fileSize;
    }
    
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
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
} 