package com.gym.atlas.configuracion;

import com.gym.atlas.GimnasioAtlasApplication;
import org.springframework.boot.system.ApplicationHome;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    public static Path obtenerRutaPerfiles() {
        ApplicationHome home = new ApplicationHome(GimnasioAtlasApplication.class);
        return Paths.get(home.getDir().getAbsolutePath(), "perfiles")
                .toAbsolutePath()
                .normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        try {
            Path carpetaPerfiles = obtenerRutaPerfiles();
            Files.createDirectories(carpetaPerfiles);

            String rutaUri = carpetaPerfiles.toUri().toString();
            if (!rutaUri.endsWith("/")) {
                rutaUri += "/";
            }

            registry.addResourceHandler("/perfiles/**")
                    .addResourceLocations(rutaUri);
        } catch (IOException e) {
            throw new RuntimeException("No se pudo inicializar el directorio de fotos de perfil.", e);
        }
    }
}