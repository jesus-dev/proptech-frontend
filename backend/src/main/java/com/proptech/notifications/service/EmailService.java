package com.proptech.notifications.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.Map;
import java.util.HashMap;

@ApplicationScoped
public class EmailService {

    /**
     * Enviar email de notificación (simulado por ahora)
     */
    public void sendNotificationEmail(String to, String subject, String message) {
        try {
            // Por ahora solo logueamos el email
            System.out.println("=== EMAIL NOTIFICATION ===");
            System.out.println("To: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("Message: " + message);
            System.out.println("==========================");
            
        } catch (Exception e) {
            System.err.println("Error sending email notification: " + e.getMessage());
            throw new RuntimeException("Failed to send email notification", e);
        }
    }

    /**
     * Enviar email de notificación con HTML (simulado)
     */
    public void sendNotificationEmailHTML(String to, String subject, String htmlContent) {
        try {
            // Por ahora solo logueamos el email HTML
            System.out.println("=== HTML EMAIL NOTIFICATION ===");
            System.out.println("To: " + to);
            System.out.println("Subject: " + subject);
            System.out.println("HTML Content: " + htmlContent);
            System.out.println("================================");
            
        } catch (Exception e) {
            System.err.println("Error sending HTML email notification: " + e.getMessage());
            throw new RuntimeException("Failed to send HTML email notification", e);
        }
    }

    /**
     * Enviar email de nueva vista en propiedad
     */
    public void sendPropertyViewEmail(String to, String propertyTitle, String propertyAddress, int views) {
        String subject = "Nueva vista en tu propiedad";
        String message = String.format(
            "Hola,\n\n" +
            "Tu propiedad '%s' en %s recibió una nueva vista.\n" +
            "Total de vistas: %d\n\n" +
            "¡Mantén tu propiedad actualizada para atraer más interés!\n\n" +
            "Saludos,\n" +
            "Equipo Proptech",
            propertyTitle, propertyAddress, views
        );
        
        sendNotificationEmail(to, subject, message);
    }

    /**
     * Enviar email de nuevo favorito
     */
    public void sendPropertyFavoriteEmail(String to, String propertyTitle, int favorites) {
        String subject = "¡Nuevo favorito en tu propiedad!";
        String message = String.format(
            "Hola,\n\n" +
            "¡Excelente noticia! Tu propiedad '%s' fue agregada a favoritos.\n" +
            "Total de favoritos: %d\n\n" +
            "Esto indica un alto interés en tu propiedad. " +
            "Considera contactar a los interesados.\n\n" +
            "Saludos,\n" +
            "Equipo Proptech",
            propertyTitle, favorites
        );
        
        sendNotificationEmail(to, subject, message);
    }

    /**
     * Enviar email de nuevo contacto
     */
    public void sendPropertyContactEmail(String to, String contactName, String propertyTitle) {
        String subject = "¡Nuevo contacto interesado!";
        String message = String.format(
            "Hola,\n\n" +
            "¡Excelente! %s está interesado en tu propiedad '%s'.\n\n" +
            "No pierdas esta oportunidad. Contacta al cliente lo antes posible.\n\n" +
            "Saludos,\n" +
            "Equipo Proptech",
            contactName, propertyTitle
        );
        
        sendNotificationEmail(to, subject, message);
    }
}
