package com.proptech.commons.repository;

import com.proptech.commons.entity.CalendarEvent;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CalendarEventRepository implements PanacheRepository<CalendarEvent> {
} 