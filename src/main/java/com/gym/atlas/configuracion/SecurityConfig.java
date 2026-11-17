package com.gym.atlas.configuracion;

import com.gym.atlas.security.JwtAuthenticationFilter;
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
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/css/**",
            "/js/**",
            "/images/**",
            "/favicon.ico",
            "/assets/**",
            "/perfiles/**",
            "/rol",

            // HTMLs de Admin (Públicos)
            "/admin", "/admin/**",
            "/admin/personal",
            "/personal.html",
            "/admin/personal.html",

            // HTMLs de Recepción (Públicos)
            "/recepcionista",
            "/recepcionista/**",

            // HTMLs de Coach y Cliente (Públicos)
            "/coach",
            "/coach/**",
            "/cliente",
            "/cliente/**"
    };

    // Solo endpoints de datos protegidos por rol
    private static final String[] RECEPCION_ENDPOINTS = {
            "/api/recepcion/**"
    };

    private static final String[] AUTH_ENDPOINTS = {

            "/login",
            "/register",
            "/api/v1/auth/login",
            "/api/v1/auth/register",
    };

    private static final String[] ADMIN_ENDPOINTS = {
            "/admin/validar", "/admin/personal/registrar", "/api/admin/**"
    };

    // Rutas compartidas solo para lectura (GET) entre Admin y Coach
    private static final String[] CATALOGOS_ENTRENAMIENTO_GET = {
            "/api/admin/ejercicios",
            "/api/admin/categorias-ejercicios",
            "/api/admin/musculos-asociados",
            "/api/admin/grupos-musculares"
    };

    private static final String[] COACH_ENDPOINTS = {
            "/api/coach/**",
            "/api/coach/historial/**"
    };
    // Proteger los datos (API) del cliente
    private static final String[] CLIENTE_ENDPOINTS = { "/api/cliente/**" };

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(AUTH_ENDPOINTS).anonymous()

                        // 1. Lectura (GET) de catálogos de ejercicios permitida para ADMIN y COACH
                        .requestMatchers(org.springframework.http.HttpMethod.GET, CATALOGOS_ENTRENAMIENTO_GET)
                        .hasAnyRole("ADMIN", "COACH")

                        // 2. Restricciones completas por rol (el resto de métodos HTTP en /api/admin/** quedan solo para ADMIN)
                        .requestMatchers(ADMIN_ENDPOINTS).hasRole("ADMIN")
                        .requestMatchers(COACH_ENDPOINTS).hasAnyRole("COACH")
                        .requestMatchers(RECEPCION_ENDPOINTS).hasAnyRole("RECEPCIONISTA")
                        .requestMatchers(CLIENTE_ENDPOINTS).hasAnyRole("CLIENTE", "ADMIN")

                        // 3. Rutas públicas (HTMLs y recursos estáticos)
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()

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