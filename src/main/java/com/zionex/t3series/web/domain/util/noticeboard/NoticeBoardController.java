package com.zionex.t3series.web.domain.util.noticeboard;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class NoticeBoardController {

    private static final String SEARCH = "SEARCH";
    private static final String OPTION = "OPTION";
    private static final String PAGE = "PAGE";
    private static final String SIZE = "SIZE";

    private final NoticeBoardService noticeBoardService;

    @GetMapping("/noticeboard")
    public NoticeBoardResults getData(@RequestParam(SEARCH) String search, @RequestParam(OPTION) int option,
            @RequestParam(PAGE) int page, @RequestParam(SIZE) int size) {
        return noticeBoardService.getData(search, option, page, size);
    }

    @GetMapping("/noticeboard-home")
    public List<NoticeBoard> getCertain() {
        return noticeBoardService.getCertain();
    }

    @PostMapping("/noticeboard")
    public void saveData(@RequestBody NoticeBoard notice) {
        noticeBoardService.saveData(notice);
    }

    @PostMapping("/noticeboard/delete")
    public void deleteData(@RequestBody List<NoticeBoard> notice) {
        noticeBoardService.deleteData(notice);
    }

}
