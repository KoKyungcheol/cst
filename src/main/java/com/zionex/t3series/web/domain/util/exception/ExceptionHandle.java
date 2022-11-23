package com.zionex.t3series.web.domain.util.exception;

import com.zionex.t3series.web.domain.util.bulkinsert.BulkImportException;
import com.zionex.t3series.web.domain.util.filestorage.FileStorageUploadException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import lombok.extern.java.Log;

@RestControllerAdvice
@Log
public class ExceptionHandle {

    @ResponseStatus(HttpStatus.NO_CONTENT)
    @ExceptionHandler(NoContentException.class)
    public void processNoContentException(Exception e) {
        log.severe(e.getClass() + ": [Message] " + e.getMessage());
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(FileStorageUploadException.class)
    public void processFileStorageUploadException(Exception e) {
        log.severe(e.getClass() + ": [Message] " + e.getMessage());
    }

    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(BulkImportException.class)
    public void processImportExcelDataException(Exception e) {
        log.severe(e.getClass() + ": [Message] " + e.getMessage());
    }

}
