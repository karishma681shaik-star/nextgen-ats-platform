package com.aiats.dto.resume;

public class ResumeDTO {
    private String id;
    private String userId;
    private String fileName;
    private String fileSize;
    private String fileType;
    private String uploadDate;
    private boolean isPrimary;
    private String status;
    private ParsedDataDTO parsedData;
    private String resumeData;

    public String getId() { return id; } public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; } public void setUserId(String userId) { this.userId = userId; }
    public String getFileName() { return fileName; } public void setFileName(String fileName) { this.fileName = fileName; }
    public String getFileSize() { return fileSize; } public void setFileSize(String fileSize) { this.fileSize = fileSize; }
    public String getFileType() { return fileType; } public void setFileType(String fileType) { this.fileType = fileType; }
    public String getUploadDate() { return uploadDate; } public void setUploadDate(String uploadDate) { this.uploadDate = uploadDate; }
    public boolean isPrimary() { return isPrimary; } public void setPrimary(boolean primary) { isPrimary = primary; }
    public String getStatus() { return status; } public void setStatus(String status) { this.status = status; }
    public ParsedDataDTO getParsedData() { return parsedData; } public void setParsedData(ParsedDataDTO parsedData) { this.parsedData = parsedData; }
    public String getResumeData() { return resumeData; } public void setResumeData(String resumeData) { this.resumeData = resumeData; }
}
