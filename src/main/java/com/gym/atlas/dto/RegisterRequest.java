package com.gym.atlas.dto;

import java.sql.Date;

public record RegisterRequest(
        String nomApe,
        Date fechanac,
        Long dni,
        String email,
        Long tel,
        String password,
        Long categoriaId
) {}