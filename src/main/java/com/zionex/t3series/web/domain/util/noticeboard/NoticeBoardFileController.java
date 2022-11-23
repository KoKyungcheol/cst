package com.zionex.t3series.web.domain.util.noticeboard;

import java.util.List;

import com.zionex.t3series.web.domain.util.filestorage.FileStorage;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class NoticeBoardFileController {

    private final NoticeBoardFileService noticeBoardFileService;

    @GetMapping("/noticeboard-file")
    public List<FileStorage> getData(@RequestParam("BOARD_ID") String boardId) {
        return noticeBoardFileService.getData(boardId);
    }

    @PostMapping("/noticeboard-file/clear-deletefiles")
    public void clearDeleteFiles(@RequestBody List<Integer> ids) {
        noticeBoardFileService.clearDeleteFiles(ids);
    }

}
