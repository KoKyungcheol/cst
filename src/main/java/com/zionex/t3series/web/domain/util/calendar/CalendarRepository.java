package com.zionex.t3series.web.domain.util.calendar;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CalendarRepository extends CrudRepository<Calendar, String> {

    List<Calendar> findByStartDateBetweenOrEndDateBetweenOrderByStartDateAsc(LocalDate monthStartDate1, LocalDate monthEndDate1, LocalDate monthStartDate2, LocalDate monthEndDate2);

}