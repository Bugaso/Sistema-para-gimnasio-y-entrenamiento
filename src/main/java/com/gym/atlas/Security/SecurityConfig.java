package com.gym.atlas.Security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthFilter;

    // Inyección de dependencias a través del constructor
    public SecurityConfig(JwtAuthenticationFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    // Rutas accesibles para usuarios no registrados (públicas)
    private static final String[] PUBLIC_ENDPOINTS = {
            "/",
            "/me",
            "/componentes/**",
            "/error",
            "/api/v1/public/**",
            "/membresia",
            "/membresia/**",
            "/usuarios",
            "/usuarios/**",
            "/cliente-membresias/**",
            // Endpoints de documentación (Swagger/OpenAPI) si los utilizas
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/css/**",
            "/js/**",
            "/images/**",
            "/favicon.ico"
    };

    private static final String[] AUTH_ENDPOINTS = {

            "/login",
            "/register",
            "/api/v1/auth/login",
            "/api/v1/auth/register",
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // 1. Deshabilitar CSRF (Cross-Site Request Forgery) ya que usamos JWT
                .csrf(AbstractHttpConfigurer::disable)

                // 2. Configurar la autorización de las peticiones HTTP
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(AUTH_ENDPOINTS).anonymous()
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll() // Acceso libre
                        .anyRequest().authenticated()                  // El resto requiere JWT válido
                )

                // 3. Configurar la gestión de sesiones como STATELESS
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendRedirect("/");
                        })
                )

                // 4. Añadir nuestro filtro JWT antes del filtro de autenticación estándar
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}