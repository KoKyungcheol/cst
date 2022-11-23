package com.zionex.t3series.web.domain.util.filestorage;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.net.MalformedURLException;
import java.net.URLEncoder;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import javax.servlet.http.HttpServletRequest;

import com.zionex.t3series.web.ApplicationProperties;
import com.zionex.t3series.web.domain.util.exception.NoContentException;

import org.apache.commons.io.FilenameUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class FileStorageService {

    private static final String PATH_SEPARATOR = "/";

    @Autowired
    private FileStorageRepository fileStorageRepository;

    private final ApplicationProperties.Service.File fileProps;
    private final String rootPath;

    @Autowired
    public FileStorageService(ApplicationProperties applicationProperties) {
        fileProps = applicationProperties.getService().getFile();
        rootPath = fileProps.getExternalPath();
    }

    public List<FileStorage> getFilesInfo(List<Integer> ids) {
        List<FileStorage> fileList = fileStorageRepository.findAllById(ids);

        return fileList.stream()
                .filter(it -> it.getDeleteYn().equals("N"))
                .collect(Collectors.toList());
    }

    public List<FileStorage> uploadMultiFiles(MultipartFile[] files, String category, String userId) {
        // Verify category
        verifyCategory(category);

        String uuid = getUuid();
        String today = getTodayDate();
        Timestamp dttm = getDttm();

        String absolutePath = getAbsolutePath(category, today, userId, uuid);
        String relativePath = getRelativePath(category, today, userId, uuid);

        List<FileStorage> transferFiles = new ArrayList<>();
        Arrays.stream(files)
                .filter(this::checkFileValidation)
                .forEach(it -> {
                    doFileTransfer(it, absolutePath);

                    String fileName = it.getOriginalFilename();
                    transferFiles.add(
                            FileStorage.builder()
                                    .category(category)
                                    .fileName(fileName)
                                    .fileType(getFileExtension(fileName))
                                    .fileSize(it.getSize())
                                    .filePath(relativePath + fileName)
                                    .uploadUuid(uuid)
                                    .uploadBy(userId)
                                    .uploadDttm(dttm)
                                    .build());
                });

        if (category.equals(fileProps.getCategory().getTemporary()))
            return transferFiles;
        else
            return fileStorageRepository.saveAll(transferFiles);
    }

    public FileStorage recordErrorFile(FileStorage csvFile) {
        String relativePath = csvFile.getFilePath().substring(0, csvFile.getFilePath().length() - csvFile.getFileName().length());
        String errorFileName = FilenameUtils.getBaseName(csvFile.getFileName()) + "_Error.csv";
        String errorFilePath = relativePath + errorFileName;

        Long fileSize = 0L;

        Timestamp dttm = getDttm();

        try {
            File error = new File(rootPath + errorFilePath);

            if (error.exists()) {
                fileSize = error.length();
            }
        }
        catch (Exception e) {
            fileSize = 0L;
        }

        FileStorage errorFile = FileStorage.builder()
                .category(csvFile.getCategory())
                .fileName(errorFileName)
                .fileType(getFileExtension(errorFileName))
                .fileSize(fileSize)
                .filePath(errorFilePath)
                .uploadUuid(csvFile.getUploadUuid())
                .uploadBy(csvFile.getUploadBy())
                .uploadDttm(dttm)
                .build();

        return fileStorageRepository.save(errorFile);
    }
    
    public FileStorage getFilePathInfo(String fileName, String category, String userId) {
        verifyCategory(category);

        String uuid = getUuid();
        String today = getTodayDate();

        String absolutePath = getAbsolutePath(category, today, userId, uuid);
        String relativePath = getRelativePath(category, today, userId, uuid);

        File fileDir = new File(absolutePath);

        if (!(fileDir.exists() || fileDir.mkdirs()))
            throw new FileStorageUploadException();

        return FileStorage.builder()
                .category(category)
                .fileName(fileName)
                .fileType(getFileExtension(fileName))
                .filePath(relativePath + fileName)
                .build();
    }

    public ResponseEntity<Resource> downloadFile(int id, HttpServletRequest request) throws IOException {
        Resource resource = getFileResource(id);

        String fileName = URLEncoder
                    .encode(resource.getFilename().replace("%20", " "), "utf-8")
                    .replaceAll("\\+", "%20")
                    .replaceAll("%25", "%");
                    
        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }
    
    public ResponseEntity<Resource> downloadFileUseFilePath(FileStorage fileStorage, HttpServletRequest request) throws IOException {
        String relativePath = fileStorage.getFilePath();

        Path absolutePath = Paths.get(rootPath).resolve(relativePath);

        Resource resource = new UrlResource(absolutePath.toUri());
        if (!(resource.exists() || resource.isReadable())) {
            throw new NoContentException();
        }

        String fileName = URLEncoder
                    .encode(resource.getFilename().replace("%20", " "), "utf-8")
                    .replaceAll("\\+", "%20")
                    .replaceAll("%25", "%");

        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(resource);
    }

    public List<FileStorage> deleteFile(List<Integer> ids, String userId) {
        List<FileStorage> deleteList = fileStorageRepository.findAllById(ids);

        if (deleteList.size() == 0)
            throw new NoContentException();

        Timestamp dttm = getDttm();
        return fileStorageRepository.saveAll(
                deleteList.parallelStream()
                        .peek(item -> {
                            item.setDeleteYn("Y");
                            item.setDeleteBy(userId);
                            item.setDeleteDttm(dttm);
                        }).collect(Collectors.toList()));
    }

    private String getUuid() {
        return UUID.randomUUID().toString();
    }

    private String getTodayDate() {
        return LocalDate
                .now()
                .format(DateTimeFormatter.ofPattern("yyyyMMdd"));
    }

    private Timestamp getDttm() {
        return new Timestamp(Instant.now().toEpochMilli());
    }

    private void verifyCategory(String category) {
        fileProps.getCategoryList()
                .stream()
                .filter(it -> it.equals(category))
                .findAny()
                .orElseThrow(FileStorageUploadException::new);
    }

    private String getAbsolutePath(String category, String today, String userId, String uuid) {
        return rootPath + fileProps.getName() + PATH_SEPARATOR +
                category + PATH_SEPARATOR +
                today + PATH_SEPARATOR +
                userId + PATH_SEPARATOR +
                uuid;
    }

    private String getRelativePath(String category, String today, String userId, String uuid) {
        return fileProps.getName() + PATH_SEPARATOR +
                category + PATH_SEPARATOR +
                today + PATH_SEPARATOR +
                userId + PATH_SEPARATOR +
                uuid + PATH_SEPARATOR;
    }

    private Resource getFileResource(int id) throws MalformedURLException {
        String relativePath = fileStorageRepository.findById(id)
                .orElseThrow(NoContentException::new)
                .getFilePath();

        Path absolutePath = Paths.get(rootPath)
                .resolve(relativePath);

        Resource resource = new UrlResource(absolutePath.toUri());
        if (resource.exists() || resource.isReadable()) {
            return resource;
        } else {
            throw new NoContentException();
        }
    }

    private String getFileExtension(String fileName) {
        return FilenameUtils.getExtension(fileName);
    }

    private boolean checkFileValidation(MultipartFile file) {
        String fileName = file.getOriginalFilename();
        String extension = getFileExtension(fileName);

        assert fileName != null;
        if (fileName.contains(".."))
            throw new FileStorageUploadException();

        boolean checkInvalidExtension = Stream.of("asa", "asp", "cdx", "cer", "htr", "aspx", "jsp", "jspx", "html", "htm", "php", "php3", "php4", "php5")
                .parallel().anyMatch(extension::equalsIgnoreCase);

        if (checkInvalidExtension)
            throw new FileStorageUploadException("Failed to upload files : Invalid file extension");

        return true;
    }

    private void doFileTransfer(MultipartFile file, String absolutePath) {
        File fileDir = new File(absolutePath);

        if (!(fileDir.exists() || fileDir.mkdirs()))
            throw new FileStorageUploadException();

        try {
            byte[] data = file.getBytes();
            FileOutputStream out = new FileOutputStream(absolutePath + PATH_SEPARATOR + file.getOriginalFilename());
            out.write(data);
            out.close();
        } catch (IOException e) {
            throw new FileStorageUploadException();
        }
    }

}