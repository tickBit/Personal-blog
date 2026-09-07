package com.backend.api.controller;

import java.util.List;

public record PostRequest(
        String title,
        String excerpt,
        String body,
        List<String> tags,
        String coverImage) {
}