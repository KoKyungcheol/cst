package com.zionex.t3series.web.domain.util.filestorage;

public class FileStorageUploadException extends RuntimeException {

    private static final long serialVersionUID = 5425643144529338903L;

    public FileStorageUploadException() {
        super("Fail to upload file into file storage.");
    }

    public FileStorageUploadException(String message) {
        super(message);
    }

}
