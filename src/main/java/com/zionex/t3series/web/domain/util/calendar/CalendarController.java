package com.zionex.t3series.web.domain.util.calendar;

import java.time.LocalDate;
import java.util.List;

import com.zionex.t3series.web.util.ResponseMessage;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class CalendarController {

    private final CalendarService calendarService;

    @GetMapping("/calendar")
    public List<Calendar> getCalendar(@RequestParam("date") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate date) {
        return calendarService.getCalendar(date);
    }

    @PostMapping("/calendar")
    public ResponseEntity<ResponseMessage> saveCalendar(@RequestBody Calendar calendar) {
        calendarService.saveCalendar(calendar);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Inserted calendar entity"), HttpStatus.OK);
    }

    @PostMapping("/calendar/delete")
    public ResponseEntity<ResponseMessage> deleteCalendar(@RequestBody Calendar calendar) {
        calendarService.deleteCalendar(calendar);
        return new ResponseEntity<ResponseMessage>(new ResponseMessage(HttpStatus.OK.value(), "Deleted calendar entity"), HttpStatus.OK);
    }
    
}