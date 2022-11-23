package com.zionex.t3series.web.domain.util.noticeboard;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoticeBoardRepository extends JpaRepository<NoticeBoard, String> {

    /* Select Board By title And content And deleteYn AND noticeYn */
    Page<NoticeBoard> findByTitleContainingAndContentContainingAndDeleteYnAndNoticeYnOrderByCreateDttmDesc(String title,
                    String content, String deleteFlag, String noticeFlag, Pageable pageable);

    /* Select Board By title Or content And deleteYn AND noticeYn */
    Page<NoticeBoard> findByTitleContainingAndDeleteYnAndNoticeYnOrContentContainingAndDeleteYnAndNoticeYnOrderByCreateDttmDesc(
                    String title, String deleteFlag1, String noticeFlag1, String content, String deleteFlag2,
                    String noticeFlag2, Pageable pageble);

    /* Select Board By NoticeYn And deleteYn */
    List<NoticeBoard> findFirst3ByNoticeYnAndDeleteYnOrderByCreateDttmDesc(String noticeYn, String deleteFlag);

    List<NoticeBoard> findByNoticeYnAndDeleteYnOrderByCreateDttmDesc(String noticeYn, String deleteFlag);

    List<NoticeBoard> findByDeleteYnAndCreateDttmAfter(String deleteFlag, LocalDateTime baseDttm);

    List<NoticeBoard> findByDeleteYnOrderByCreateDttmDesc(String deleteFlag);

    NoticeBoard findByIdAndDeleteYn(String id, String deleteFlag);

}
