package com.zionex.t3series.web.domain.util.noticeboard;

import java.util.List;

import org.springframework.data.domain.Page;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NoticeBoardResults {

    private Page<NoticeBoard> pageContent;
    
    private List<NoticeBoard> certainList;

}
