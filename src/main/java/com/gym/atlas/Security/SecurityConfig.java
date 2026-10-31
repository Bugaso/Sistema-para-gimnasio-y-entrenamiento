package com.gym.atlas.Security;

import jakarta.servlet.http.HttpServletResponse;
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
            "/favicon.ico",
            "/assets/**",
            "/rol",

            // HTMLs de Admin (Públicos)
            "/admin",
            "/admin/**", // Permite servir todas las páginas estáticas de la carpeta admin
            "/admin/personal",
            "/personal.html",       // <- Permite el archivo si está en la raíz
            "/admin/personal.html",  // <- Permite el archivo si está dentro de /admin/

            //HTMLs de Recepción (Públicos)
            "/recepcionista",
            "/recepcionista/**",
            "/coach",
            "/coach/**"
    };

    private static final String[] AUTH_ENDPOINTS = {

            "/login",
            "/register",
            "/api/v1/auth/login",
            "/api/v1/auth/register",
    };

    private static final String[] ADMIN_ENDPOINTS = {
            "/admin/validar", "/admin/personal/registrar", "/api/admin/**"};  /*********/

    //ARREGLO PARA RECEPCIÓN
    private static final String[] RECEPCION_ENDPOINTS = {
                    "/api/recepcion/**"
            };
    private static final String[] COACH_ENDPOINTS = {
            "/api/coach/**"
    };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(AUTH_ENDPOINTS).anonymous()

                        // NUEVA REGLA: Permite que tanto Admin como Coach obtengan la lista
                        .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/admin/ejercicios").hasAnyRole("ADMIN", "COACH")

                        // 1. ¡CAMBIO CLAVE! Ponemos PRIMERO las rutas restringidas por Rol.
                        // Al estar arriba, Spring verificará el rol ANTES de ver si es una ruta pública.
                        .requestMatchers(ADMIN_ENDPOINTS).hasRole("ADMIN")
                        .requestMatchers(RECEPCION_ENDPOINTS).hasAnyRole("RECEPCIONISTA", "ADMIN")
                        .requestMatchers(COACH_ENDPOINTS).hasAnyRole("COACH", "ADMIN")

                        // 2. DESPUÉS ponemos las rutas públicas.
                        // Así, los HTML estáticos de /admin/** siguen siendo accesibles,
                        // pero los endpoints de validación y de la API ya fueron protegidos arriba.
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

                        // 3. Cualquier otra ruta no especificada requiere autenticación básica
                        .anyRequest().authenticated()
                )

                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "No autenticado");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Acceso denegado");
                        })
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}