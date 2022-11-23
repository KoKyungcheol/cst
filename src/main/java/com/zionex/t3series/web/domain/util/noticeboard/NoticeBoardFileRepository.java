package com.zionex.t3series.web.domain.util.noticeboard;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeBoardFileRepository extends JpaRepository<NoticeBoardFile, String> {

    List<NoticeBoardFile> findByBoardId(String boardId);

    void deleteByBoardId(String boardId);

}
