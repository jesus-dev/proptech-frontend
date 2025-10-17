package com.proptech.commons.dto;

import java.util.List;

public class PaginatedResponse<T> {
    public List<T> content;
    public int page;
    public int size;
    public long totalElements;

    public PaginatedResponse(List<T> content, int page, int size, long totalElements) {
        this.content = content;
        this.page = page;
        this.size = size;
        this.totalElements = totalElements;
    }
} 