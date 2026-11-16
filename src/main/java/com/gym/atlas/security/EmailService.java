package com.gym.atlas.security;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String remitente;

    @Value("${app.frontend.url}")
    private String urlLogin;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void enviarCredencialesNuevoCliente(String destinatario, String nombreCliente, String passwordGenerada) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(remitente);
            helper.setTo(destinatario);
            helper.setSubject("Bienvenido a Atlas Gym — Tus credenciales de acceso");

            String cuerpoHtml = """
                <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #111827; padding: 24px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; letter-spacing: 1px; font-size: 24px;">ATLAS GYM</h1>
                    </div>
                    <div style="padding: 28px 24px; color: #333333; line-height: 1.6;">
                        <h2 style="margin-top: 0; color: #111827;">¡Hola, %s!</h2>
                        <p>Tu cuenta ha sido registrada exitosamente en <strong>Atlas Gym</strong>. Ya puedes ingresar a la plataforma para consultar tus rutinas, registrar tus entrenamientos y ver el estado de tu membresía.</p>
                        
                        <div style="background-color: #f9fafb; border-left: 4px solid #d90429; padding: 16px; margin: 20px 0; border-radius: 4px;">
                            <p style="margin: 0 0 8px 0;"><strong>Correo de acceso:</strong> %s</p>
                            <p style="margin: 0;"><strong>Contraseña asignada:</strong> <span style="font-family: monospace; font-size: 16px; background: #e5e7eb; padding: 2px 8px; border-radius: 4px;">%s</span></p>
                        </div>

                        <div style="text-align: center; margin: 28px 0 12px 0;">
                            <a href="%s" style="background-color: #d90429; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                                Ingresar a mi cuenta
                            </a>
                        </div>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 14px; text-align: center; font-size: 12px; color: #6b7280;">
                        Este es un mensaje automático generado por el sistema de Atlas Gym.
                    </div>
                </div>
                """.formatted(nombreCliente, destinatario, passwordGenerada, urlLogin);

            helper.setText(cuerpoHtml, true);
            mailSender.send(mensaje);

        } catch (MessagingException e) {
            throw new RuntimeException("Error al enviar el correo electrónico: " + e.getMessage(), e);
        }
    }

    public void enviarCodigoRecuperacion(String destinatario, String nombreCliente, String codigo) {
        try {
            MimeMessage mensaje = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mensaje, true, "UTF-8");

            helper.setFrom(remitente);
            helper.setTo(destinatario);
            helper.setSubject("Atlas Gym — Código de recuperación de contraseña");

            String cuerpoHtml = """
                <div style="font-family: Arial, sans-serif; max-width: 540px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #111827; padding: 22px; text-align: center;">
                        <h1 style="color: #ffffff; margin: 0; letter-spacing: 1px; font-size: 22px;">ATLAS GYM</h1>
                    </div>
                    <div style="padding: 28px 24px; color: #333333; line-height: 1.6;">
                        <h2 style="margin-top: 0; color: #111827;">Hola, %s</h2>
                        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta. Ingresa el siguiente código de verificación en la pantalla:</p>
                        
                        <div style="text-align: center; margin: 24px 0;">
                            <span style="display: inline-block; font-family: monospace; font-size: 30px; font-weight: bold; letter-spacing: 8px; color: #d90429; background: #f9fafb; border: 2px dashed #d90429; padding: 14px 24px; border-radius: 8px;">
                                %s
                            </span>
                        </div>

                        <p style="font-size: 0.9rem; color: #555;">Este código es válido por <strong>10 minutos</strong>. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>
                    </div>
                    <div style="background-color: #f3f4f6; padding: 14px; text-align: center; font-size: 12px; color: #6b7280;">
                        Mensaje automático de seguridad — Atlas Gym.
                    </div>
                </div>
                """.formatted(nombreCliente, codigo);

            helper.setText(cuerpoHtml, true);
            mailSender.send(mensaje);

        } catch (MessagingException e) {
            throw new RuntimeException("No se pudo enviar el correo de recuperación: " + e.getMessage(), e);
        }
    }
}
