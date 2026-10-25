package com.gym.atlas.dto.auth;

public record AuthRequest(
        String email,
        String password
) {}
