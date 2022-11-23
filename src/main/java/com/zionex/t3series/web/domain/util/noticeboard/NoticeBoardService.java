package com.zionex.t3series.web.domain.util.noticeboard;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import com.zionex.t3series.web.domain.admin.menu.badge.BadgeService;
import com.zionex.t3series.web.domain.admin.user.User;
import com.zionex.t3series.web.domain.admin.user.UserService;
import com.zionex.t3series.web.domain.util.filestorage.FileStorageService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import lombok.extern.java.Log;
@Log
@Service
@Transactional
@RequiredArgsConstructor
public class NoticeBoardService {

    private final NoticeBoardRepository noticeBoardRepository;
    private final NoticeBoardFileRepository noticeBoardFileRepository;

    private final FileStorageService fileStorageService;
    private final UserService userService;
    private final BadgeService badgeService;

    private static final int TITLE_SEARCH = 1;
    private static final int CONTENT_SEARCH = 2;

    public List<NoticeBoard> getCertain() {
        List<NoticeBoard> certainList = noticeBoardRepository.findByNoticeYnAndDeleteYnOrderByCreateDttmDesc("Y",
        "N");        
    
        return certainList;
    }

    public NoticeBoardResults getData(String search, int option, int page, int size) {
        List<NoticeBoard> certainList = noticeBoardRepository.findFirst3ByNoticeYnAndDeleteYnOrderByCreateDttmDesc("Y",
                "N");
        certainList.forEach(notice -> {
            User user = userService.getUser(notice.getCreateBy());
            notice.setCreateByDisplayName(user.getDisplayName());
        });

        Page<NoticeBoard> pageContent;
        if (option == TITLE_SEARCH) {
            pageContent = noticeBoardRepository
                    .findByTitleContainingAndContentContainingAndDeleteYnAndNoticeYnOrderByCreateDttmDesc(search, "",
                            "N", "N", PageRequest.of(page, size - (certainList.size())));

        } else if (option == CONTENT_SEARCH) {
            pageContent = noticeBoardRepository
                    .findByTitleContainingAndContentContainingAndDeleteYnAndNoticeYnOrderByCreateDttmDesc("", search,
                            "N", "N", PageRequest.of(page, size - (certainList.size())));
        } else {
            pageContent = noticeBoardRepository
                    .findByTitleContainingAndDeleteYnAndNoticeYnOrContentContainingAndDeleteYnAndNoticeYnOrderByCreateDttmDesc(
                            search, "N", "N", search, "N", "N", PageRequest.of(page, size - (certainList.size())));
        }

        pageContent.forEach(notice -> {
            User user = userService.getUser(notice.getCreateBy());
            String displayName = user.getDisplayName();
            if (displayName == null) {
                notice.setCreateByDisplayName(notice.getCreateBy());
            } else {
                notice.setCreateByDisplayName(displayName);
            }
        });

        return NoticeBoardResults.builder().certainList(certainList).pageContent(pageContent).build();
    }

    public int getNewContentsCount(LocalDateTime baseDttm) {
        List<NoticeBoard> newContents = noticeBoardRepository.findByDeleteYnAndCreateDttmAfter("N", baseDttm);
        return newContents.size();
    }

    public void saveData(NoticeBoard notice) {
        if(!this.isValidUpdate(notice)) {
            return;
        }

        String boardId;
        LocalDateTime now = LocalDateTime.now();

        notice.setContent(this.cleanXss(notice.getContent()));
        notice.setDeleteYn("N");

        
        if (notice.getId() == null) {
            notice.setCreateDttm(now);
            boardId = noticeBoardRepository.save(notice).getId();

            LocalDateTime expiredDttm = now.plusDays(1);
            expiredDttm = LocalDateTime.of(expiredDttm.toLocalDate(), LocalTime.of(23, 59, 59));
            badgeService.updateNoticeBoardBadge(expiredDttm);
        } else {
            notice.setModifyDttm(now);
            boardId = noticeBoardRepository.save(notice).getId();
        }

        if (notice.getFiles() != null) {
            notice.getFiles().forEach(fileId -> {
                NoticeBoardFile noticeBoardFile = new NoticeBoardFile();
                noticeBoardFile.setBoardId(boardId);
                noticeBoardFile.setFileStorageId(fileId);
                noticeBoardFileRepository.save(noticeBoardFile);
            });
        }

    }

    private boolean isValidUpdate(NoticeBoard notice) {
        String noticeId = notice.getId();
        String updateUserId = notice.getModifyBy();

        if (noticeId != null) {
            NoticeBoard originNotice = noticeBoardRepository.findByIdAndDeleteYn(noticeId, "N");
            if(originNotice == null) {
                log.info(String.format("Invalid noticeboard id (%s)", noticeId));
                return false;
            }
            String owner = originNotice.getCreateBy();            
            if(owner == null || updateUserId == null || !owner.equals(updateUserId)) {
                log.info(String.format("The user(%s) does not have permission to update.", updateUserId));
                return false;
            }            
        }
        return true;
    }

    private String cleanXss(String value) {
        String cleanedValue = value;
        cleanedValue = cleanedValue.replaceAll("(?i)javascript", "x-javascript");
        cleanedValue = cleanedValue.replaceAll("(?i)script", "x-script");
        cleanedValue = cleanedValue.replaceAll("(?i)iframe", "x-iframe");
        cleanedValue = cleanedValue.replaceAll("(?i)document", "x-document");
        cleanedValue = cleanedValue.replaceAll("(?i)vbscript", "x-vbscript");
        cleanedValue = cleanedValue.replaceAll("(?i)applet", "x-applet");
        cleanedValue = cleanedValue.replaceAll("(?i)embed", "x-embed");  // embed 태그를 사용하지 않을 경우만
        cleanedValue = cleanedValue.replaceAll("(?i)object", "x-object");    // object 태그를 사용하지 않을 경우만
        cleanedValue = cleanedValue.replaceAll("(?i)frame", "x-frame");
        cleanedValue = cleanedValue.replaceAll("(?i)grameset", "x-grameset");
        cleanedValue = cleanedValue.replaceAll("(?i)layer", "x-layer");
        cleanedValue = cleanedValue.replaceAll("(?i)bgsound", "x-bgsound");
        cleanedValue = cleanedValue.replaceAll("(?i)alert", "x-alert");
        cleanedValue = cleanedValue.replaceAll("(?i)onblur", "x-onblur");
        cleanedValue = cleanedValue.replaceAll("(?i)onchange", "x-onchange");
        cleanedValue = cleanedValue.replaceAll("(?i)onclick", "x-onclick");
        cleanedValue = cleanedValue.replaceAll("(?i)ondblclick","x-ondblclick");
        cleanedValue = cleanedValue.replaceAll("(?i)onerror", "x-onerror");
        cleanedValue = cleanedValue.replaceAll("(?i)onfocus", "x-onfocus");
        cleanedValue = cleanedValue.replaceAll("(?i)onload", "x-onload");
        cleanedValue = cleanedValue.replaceAll("(?i)onmouse", "x-onmouse");
        cleanedValue = cleanedValue.replaceAll("(?i)onscroll", "x-onscroll");
        cleanedValue = cleanedValue.replaceAll("(?i)onsubmit", "x-onsubmit");
        cleanedValue = cleanedValue.replaceAll("(?i)onunload", "x-onunload");
        return cleanedValue;
    }

    public void deleteData(List<NoticeBoard> notices) {
        if(!this.isValidDelete(notices)) {
            return;
        }

        notices.forEach(notice -> notice.setDeleteDttm(LocalDateTime.now()));
        noticeBoardRepository.saveAll(notices);

        List<Integer> fileIdList = new ArrayList<>();

        String userId = notices.get(0).getDeleteBy();

        notices.stream().filter(entity -> !noticeBoardFileRepository.findByBoardId(entity.getId()).isEmpty())
                .forEach(entity -> {
                    noticeBoardFileRepository.findByBoardId(entity.getId()).forEach(mNoticeBoardFile -> fileIdList.add(mNoticeBoardFile.getFileStorageId()));
                    noticeBoardFileRepository.deleteByBoardId(entity.getId());
                });

        if (!fileIdList.isEmpty()) {
            fileStorageService.deleteFile(fileIdList, userId);
        }
        
        List<NoticeBoard> contents = noticeBoardRepository.findByDeleteYnOrderByCreateDttmDesc("N");
        if(!contents.isEmpty()) {
            NoticeBoard latestContent = contents.get(0);
            LocalDateTime expiredDttm = latestContent.getCreateDttm().plusDays(1);
            expiredDttm = LocalDateTime.of(expiredDttm.toLocalDate(), LocalTime.of(23, 59, 59));            
            badgeService.updateNoticeBoardBadge(expiredDttm);
        }        
    }

    private boolean isValidDelete(List<NoticeBoard> notices) {
        if(notices == null || notices.isEmpty()) {
            return false;
        }

        String deleteUserId = notices.get(0).getDeleteBy();
        boolean isAdminAuthority = userService.checkAdmin(deleteUserId);
        if(isAdminAuthority) {
            return true;
        }

        for(NoticeBoard notice : notices) {
            String noticeId = notice.getId();
            if(noticeId == null) {
                continue;
            }

            NoticeBoard originNotice = noticeBoardRepository.findByIdAndDeleteYn(noticeId, "N");
            if(originNotice == null) {
                log.info(String.format("Invalid noticeboard id (%s)", noticeId));
                return false;
            }

            String owner = originNotice.getCreateBy();
            if(owner == null || deleteUserId == null || !owner.equals(deleteUserId)) {
                log.info(String.format("The user(%s) does not have permission to delete.", deleteUserId));
                return false;
            }
        }
        return true;
    }

}
