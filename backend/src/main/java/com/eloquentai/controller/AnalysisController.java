package com.eloquentai.controller;

import com.eloquentai.dto.AnalysisResponse;
import com.eloquentai.entity.AnalysisRequest;
import com.eloquentai.service.AnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
@Tag(name = "Analysis API", description = "Endpoints for file upload and analysis")
@CrossOrigin(origins = "*")
public class AnalysisController {
    
    @Autowired
    private AnalysisService analysisService;
    
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload file for analysis", description = "Upload an audio or video file for AI-powered analysis")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "File uploaded successfully",
            content = @Content(schema = @Schema(implementation = AnalysisResponse.class))),
        @ApiResponse(responseCode = "400", description = "Invalid file or file type"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<AnalysisResponse> uploadFile(
            @Parameter(description = "Audio or video file to analyze")
            @RequestParam("file") MultipartFile file) {
        
        try {
            AnalysisRequest request = analysisService.uploadFile(file);
            return ResponseEntity.ok(new AnalysisResponse(request));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("File upload failed: " + e.getMessage()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                .body(createErrorResponse(e.getMessage()));
        }
    }
    
    @GetMapping("/feedback/{id}")
    @Operation(summary = "Get analysis results", description = "Retrieve analysis results by request ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Analysis results retrieved successfully",
            content = @Content(schema = @Schema(implementation = AnalysisResponse.class))),
        @ApiResponse(responseCode = "404", description = "Analysis request not found"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<AnalysisResponse> getAnalysisResults(
            @Parameter(description = "Analysis request ID")
            @PathVariable Long id) {
        
        try {
            AnalysisRequest request = analysisService.getAnalysisById(id);
            return ResponseEntity.ok(new AnalysisResponse(request));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(createErrorResponse("Analysis request not found"));
        }
    }
    
    @GetMapping("/analyses")
    @Operation(summary = "Get all analyses", description = "Retrieve all analysis requests")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Analyses retrieved successfully",
            content = @Content(schema = @Schema(implementation = AnalysisResponse.class))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<List<AnalysisResponse>> getAllAnalyses() {
        try {
            List<AnalysisResponse> responses = analysisService.getAllAnalyses()
                .stream()
                .map(AnalysisResponse::new)
                .collect(Collectors.toList());
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/health")
    @Operation(summary = "Health check", description = "Check if the service is running")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Service is healthy")
    })
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Eloquent AI Backend is running!");
    }
    
    private AnalysisResponse createErrorResponse(String errorMessage) {
        AnalysisResponse response = new AnalysisResponse();
        response.setStatus("FAILED");
        response.setErrorMessage(errorMessage);
        return response;
    }
} 