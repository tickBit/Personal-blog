package com.backend.api.controller;

import java.util.Date;
import java.util.List;

public record PostResponse(
        String id,
        String slug,
        String title,
        String excerpt,
        String body,
        List<String> tags,
        String coverImage,
        Date createdAt,
        Date updatedAt,
        float[] emojies) {
}