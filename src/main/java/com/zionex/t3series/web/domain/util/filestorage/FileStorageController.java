package com.zionex.t3series.web.domain.util.filestorage;

import java.io.IOException;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import com.zionex.t3series.web.domain.util.bulkinsert.ResponseDataWithSingleMessage;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
public class FileStorageController {

    private static final String ID = "ID";
    private static final String USER_ID = "USER_ID";
    private static final String CATEGORY = "CATEGORY";
    private static final String FILES = "FILES";

    @Autowired
    FileStorageService fileStorageService;

    @GetMapping("/file-storage/info")
    public List<FileStorage> getFileInfo(@RequestParam(ID) List<Integer> ids) {
        return fileStorageService.getFilesInfo(ids);
    }

    @PostMapping("/file-storage/files")
    public ResponseEntity<ResponseDataWithSingleMessage> uploadMultiFiles(@RequestParam(FILES) MultipartFile[] files,
                                              @RequestParam(CATEGORY) String category,
                                              @RequestParam(USER_ID) String userId) {
        try {
            List<FileStorage> list = fileStorageService.uploadMultiFiles(files, category, userId);
            return ResponseEntity.ok().body(ResponseDataWithSingleMessage.builder().success(true).message("Success!").data(list).build());
        } catch (FileStorageUploadException e) {
            return ResponseEntity.ok().body(ResponseDataWithSingleMessage.builder().success(false).message(e.getMessage()).build());
        }
    }

    @GetMapping("/file-storage/file")
    public ResponseEntity<Resource> downloadFile(@RequestParam(ID) int id, HttpServletRequest request)
            throws IOException {
        return fileStorageService.downloadFile(id, request);
    }

    @PostMapping("/file-storage/files/delete")
    public List<FileStorage> deleteFile(@RequestParam(ID) List<Integer> ids, @RequestParam(USER_ID) String userId) {
        return fileStorageService.deleteFile(ids, userId);
    }

}
