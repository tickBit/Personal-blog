package com.backend.api.controller;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

public record PostRequest(
        @NotBlank String title,
        @NotBlank String excerpt,
        @NotBlank String body,
        @NotEmpty List<String> tags,
        String coverImage) {
}