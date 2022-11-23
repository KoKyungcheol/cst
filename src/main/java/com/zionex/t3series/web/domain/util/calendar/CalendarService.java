package com.zionex.t3series.web.domain.util.calendar;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CalendarService {

    private final CalendarRepository calendarRepository;

    public List<Calendar> getCalendar(LocalDate date) {
        LocalDate monthStartDate = LocalDate.of(date.getYear(), date.getMonthValue(), 1);
        LocalDate monthEndDate = LocalDate.of(date.getYear(), date.getMonthValue(), date.lengthOfMonth());

        return calendarRepository.findByStartDateBetweenOrEndDateBetweenOrderByStartDateAsc(monthStartDate, monthEndDate, monthStartDate, monthEndDate);
    }

    public void saveCalendar(Calendar calendar) {
        calendarRepository.save(calendar);
    }

    public void deleteCalendar(Calendar calendar) {
        calendarRepository.delete(calendar);
    }

}