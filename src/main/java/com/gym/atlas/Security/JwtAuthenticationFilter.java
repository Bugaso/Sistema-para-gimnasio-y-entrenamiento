package com.gym.atlas.Security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsService userDetailsService;

    // Inyección de dependencias
    public JwtAuthenticationFilter(JwtService jwtService, UserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Obtener la cabecera "Authorization"
        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String username;

        // 2. Comprobar si no hay token o no tiene el formato correcto (Bearer token)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Pasamos al siguiente filtro de la cadena (el endpoint podría ser público)
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraer el token (ignorando los primeros 7 caracteres de "Bearer ")
        jwt = authHeader.substring(7);

        // 4. Extraer el nombre de usuario (o email) desde el token
        username = jwtService.extractUsername(jwt);

        // 5. Si hay usuario en el token y aún no hay una autenticación activa en el contexto
        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {

            // Cargar los detalles del usuario desde la base de datos
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);

            // 6. Validar que el token sea correcto y no haya expirado
            if (jwtService.isTokenValid(jwt, userDetails)) {

                // Crear el objeto de autenticación requerido por Spring Security
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null, // No pasamos credenciales (contraseña) por seguridad
                        userDetails.getAuthorities()
                );

                // Añadir detalles adicionales de la petición web (como la dirección IP)
                authToken.setDetails(
                        new WebAuthenticationDetailsSource().buildDetails(request)
                );

                // 7. Establecer la autenticación en el contexto de seguridad
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // 8. Continuar con el resto de la cadena de filtros
        filterChain.doFilter(request, response);
    }
}