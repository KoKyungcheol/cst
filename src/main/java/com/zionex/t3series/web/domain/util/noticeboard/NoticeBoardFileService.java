package com.zionex.t3series.web.domain.util.noticeboard;

import java.util.ArrayList;
import java.util.List;

import javax.transaction.Transactional;

import com.zionex.t3series.web.domain.util.filestorage.FileStorage;
import com.zionex.t3series.web.domain.util.filestorage.FileStorageRepository;
import com.zionex.t3series.web.domain.util.filestorage.FileStorageService;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class NoticeBoardFileService {

    private final NoticeBoardFileRepository noticeBoardFileRepository;

    private final FileStorageService fileStorageService;
    private final FileStorageRepository fileStorageRepository;

    public List<FileStorage> getData(String boardId) {
        List<Integer> fileStorageIdList = new ArrayList<>();

        noticeBoardFileRepository.findByBoardId(boardId).forEach(mNotceBoardFile -> fileStorageIdList.add(mNotceBoardFile.getFileStorageId()));

        return fileStorageService.getFilesInfo(fileStorageIdList);
    }

    public void saveData(NoticeBoardFile noticeBoardFile) {
        noticeBoardFileRepository.save(noticeBoardFile);
    }

	public void clearDeleteFiles(List<Integer> ids) {
        List<FileStorage> files = fileStorageRepository.findAllById(ids);

        files.forEach(file -> {
            file.setDeleteBy(null);
            file.setDeleteDttm(null);
            file.setDeleteYn("N");
        });

        fileStorageRepository.saveAll(files);
	}

}
