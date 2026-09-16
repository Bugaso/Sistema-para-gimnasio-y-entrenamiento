package com.gym.atlas.dto;

public record AuthRequest(
        String email,
        String password
) {}
