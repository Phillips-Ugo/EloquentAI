package com.eloquentai.service;

import com.eloquentai.entity.AnalysisRequest;
import com.eloquentai.repository.AnalysisRequestRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.MediaType;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class AnalysisService {
    
    private static final Logger logger = LoggerFactory.getLogger(AnalysisService.class);
    
    @Autowired
    private AnalysisRequestRepository repository;
    
    @Autowired
    private WebClient.Builder webClientBuilder;
    
    @Autowired
    private ObjectMapper objectMapper;
    
    @Value("${app.services.speech.url}")
    private String speechServiceUrl;
    
    @Value("${app.services.video.url}")
    private String videoServiceUrl;
    
    @Value("${app.upload.directory}")
    private String uploadDirectory;
    
    public AnalysisRequest uploadFile(MultipartFile file) throws IOException {
        // Validate file
        validateFile(file);
        
        // Create upload directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDirectory);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }
        
        // Generate unique filename
        String originalFilename = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFilename);
        String uniqueFilename = UUID.randomUUID().toString() + "." + fileExtension;
        Path filePath = uploadPath.resolve(uniqueFilename);
        
        // Save file
        Files.copy(file.getInputStream(), filePath);
        
        // Determine file type
        String fileType = determineFileType(fileExtension);
        
        // Create analysis request
        AnalysisRequest request = new AnalysisRequest(
            originalFilename,
            fileType,
            filePath.toString(),
            file.getSize()
        );
        
        // Save to database
        request = repository.save(request);
        
        // Start async analysis
        processAnalysis(request);
        
        return request;
    }
    
    public AnalysisRequest getAnalysisById(Long id) {
        return repository.findById(id)
            .orElseThrow(() -> new RuntimeException("Analysis request not found"));
    }
    
    public List<AnalysisRequest> getAllAnalyses() {
        return repository.findAllByOrderByCreatedAtDesc();
    }
    
    @Async
    public void processAnalysis(AnalysisRequest request) {
        try {
            logger.info("Starting analysis for request ID: {}", request.getId());
            request.setStatus(AnalysisRequest.AnalysisStatus.PROCESSING);
            repository.save(request);
            
            File file = new File(request.getFilePath());
            
            // Process based on file type
            if ("AUDIO".equals(request.getFileType())) {
                String speechResult = analyzeSpeech(file);
                request.setSpeechAnalysisResult(speechResult);
            } else if ("VIDEO".equals(request.getFileType())) {
                String speechResult = analyzeSpeech(file);
                String videoResult = analyzeVideo(file);
                request.setSpeechAnalysisResult(speechResult);
                request.setVideoAnalysisResult(videoResult);
            }
            
            request.setStatus(AnalysisRequest.AnalysisStatus.COMPLETED);
            repository.save(request);
            
            logger.info("Analysis completed for request ID: {}", request.getId());
            
        } catch (Exception e) {
            logger.error("Error processing analysis for request ID: {}", request.getId(), e);
            request.setStatus(AnalysisRequest.AnalysisStatus.FAILED);
            request.setErrorMessage(e.getMessage());
            repository.save(request);
        }
    }
    
    private String analyzeSpeech(File file) {
        try {
            WebClient webClient = webClientBuilder.baseUrl(speechServiceUrl).build();
            
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new FileSystemResource(file));
            
            return webClient.post()
                .uri("/analyze-speech")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(String.class)
                .block();
                
        } catch (Exception e) {
            logger.error("Error calling speech service", e);
            throw new RuntimeException("Speech analysis failed: " + e.getMessage());
        }
    }
    
    private String analyzeVideo(File file) {
        try {
            WebClient webClient = webClientBuilder.baseUrl(videoServiceUrl).build();
            
            MultipartBodyBuilder builder = new MultipartBodyBuilder();
            builder.part("file", new FileSystemResource(file));
            
            return webClient.post()
                .uri("/analyze-video")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(builder.build()))
                .retrieve()
                .bodyToMono(String.class)
                .block();
                
        } catch (Exception e) {
            logger.error("Error calling video service", e);
            throw new RuntimeException("Video analysis failed: " + e.getMessage());
        }
    }
    
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new RuntimeException("File is empty");
        }
        
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.trim().isEmpty()) {
            throw new RuntimeException("Invalid filename");
        }
        
        String extension = getFileExtension(originalFilename).toLowerCase();
        if (!isValidFileType(extension)) {
            throw new RuntimeException("Unsupported file type: " + extension);
        }
    }
    
    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        return lastDotIndex > 0 ? filename.substring(lastDotIndex + 1) : "";
    }
    
    private String determineFileType(String extension) {
        String ext = extension.toLowerCase();
        if (ext.matches("mp3|wav|m4a|flac")) {
            return "AUDIO";
        } else if (ext.matches("mp4|avi|mov|wmv")) {
            return "VIDEO";
        } else {
            throw new RuntimeException("Unsupported file type: " + extension);
        }
    }
    
    private boolean isValidFileType(String extension) {
        return extension.matches("mp3|wav|m4a|flac|mp4|avi|mov|wmv");
    }
} 