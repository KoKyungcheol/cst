package com.zionex.t3series.web.domain.admin.log;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ViewExecutionService {

    private final ViewExecutionRepository viewExecutionRepository;
    private final ViewExecutionQueryRepository viewExecutionQueryRepository;

    public List<ViewExecution> getViewExecutionLog(LocalDate startDate, LocalDate endDate, String menuCd, String menuNm, String username) {
        LocalDateTime startDateTime = LocalDateTime.of(startDate, LocalTime.MIN);
        LocalDateTime endDateTime = LocalDateTime.of(endDate, LocalTime.MAX);

        return viewExecutionQueryRepository.getViewExecutionLog(startDateTime, endDateTime, menuCd, menuNm, username);
    }

    public ViewExecution saveViewExecutionLog(ViewExecution viewExecution) {
        ViewExecutionPK viewExecutionPK = new ViewExecutionPK();
        viewExecutionPK.setId(viewExecution.getId());
        viewExecutionPK.setViewCd(viewExecution.getViewCd());

        Optional<ViewExecution> existsViewExecution = viewExecutionRepository.findById(viewExecutionPK);
        if (existsViewExecution.isPresent()) {
            viewExecution.setExecutionDttm(existsViewExecution.get().getExecutionDttm());
        }

        return viewExecutionRepository.save(viewExecution);
    }

}
