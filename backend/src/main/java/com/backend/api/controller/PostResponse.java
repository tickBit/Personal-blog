package com.backend.api.controller;

import java.util.List;

public record PostResponse(
        String id,
        String title,
        String excerpt,
        String body,
        List<String> tags,
        String coverImage) {
}