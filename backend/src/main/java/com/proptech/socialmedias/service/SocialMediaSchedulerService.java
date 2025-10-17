package com.proptech.socialmedias.service;

import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;
import org.jboss.logging.Logger;

import com.proptech.socialmedias.dto.SocialMediaPostDTO;
import com.proptech.socialmedias.entity.SocialMediaPublication;
import com.proptech.properties.dto.PropertyDTO;
import com.proptech.properties.service.PropertyService;
import com.proptech.properties.service.PropertyStatusHelper;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@ApplicationScoped
public class SocialMediaSchedulerService {

    private static final Logger LOG = Logger.getLogger(SocialMediaSchedulerService.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Inject
    PropertyService propertyService;

    @Inject
    SocialMediaService socialMediaService;

    @ConfigProperty(name = "social.media.auto.publish", defaultValue = "false")
    boolean autoPublish;

    @ConfigProperty(name = "social.media.scheduler.enabled", defaultValue = "true")
    boolean schedulerEnabled;

    @ConfigProperty(name = "social.media.scheduler.max.properties.per.day", defaultValue = "1")
    int maxPropertiesPerDay;

    @ConfigProperty(name = "social.media.scheduler.platforms", defaultValue = "facebook,instagram")
    String defaultPlatforms;

    private final Random random = new Random();

    /**
     * Publica una propiedad automáticamente todos los días a las 8:00 AM
     * con restricción de que cada propiedad no se puede publicar más de una vez cada 8 días
     * 
     * COMENTADO: Activar cuando esté listo para usar
     */
    // @Scheduled(cron = "0 0 8 * * ?")
    void publishDailyWithRotation() {
        if (!schedulerEnabled || !autoPublish) {
            LOG.info("🕐 Social Media Scheduler: Deshabilitado o publicación automática desactivada");
            return;
        }

        LOG.info("🚀 Social Media Scheduler: Iniciando publicación diaria con rotación - " + 
                LocalDateTime.now().format(formatter));

        try {
            // Obtener propiedades elegibles (que no han sido publicadas en los últimos 8 días)
            List<PropertyDTO> eligibleProperties = getEligiblePropertiesForRotation();
            
            if (eligibleProperties.isEmpty()) {
                LOG.info("📭 Social Media Scheduler: No hay propiedades elegibles para publicar hoy (todas fueron publicadas recientemente)");
                return;
            }

            // Seleccionar UNA propiedad aleatoria para publicar
            PropertyDTO propertyToPublish = selectOnePropertyForToday(eligibleProperties);
            
            if (propertyToPublish != null) {
                LOG.info("📋 Social Media Scheduler: Propiedad seleccionada para publicar: " + 
                        propertyToPublish.title + " (ID: " + propertyToPublish.id + ")");

                // Publicar la propiedad
                publishProperty(propertyToPublish);

                // Registrar la publicación para evitar repetición
                recordPublication(propertyToPublish);

                LOG.info("✅ Social Media Scheduler: Publicación diaria con rotación completada exitosamente");
            } else {
                LOG.warn("⚠️ Social Media Scheduler: No se pudo seleccionar una propiedad para publicar");
            }

        } catch (Exception e) {
            LOG.error("❌ Social Media Scheduler: Error en publicación diaria con rotación", e);
        }
    }

    /**
     * Publica propiedades destacadas inmediatamente cuando se marcan como destacadas
     * 
     * COMENTADO: Activar cuando esté listo para usar
     */
    // @Scheduled(cron = "0 */15 * * * ?") // Cada 15 minutos
    void publishFeaturedProperties() {
        if (!schedulerEnabled || !autoPublish) {
            return;
        }

        try {
            // Buscar propiedades destacadas que no han sido publicadas recientemente
            List<PropertyDTO> featuredProperties = getFeaturedProperties();
            
            for (PropertyDTO property : featuredProperties) {
                if (shouldPublishFeaturedProperty(property)) {
                    LOG.info("⭐ Social Media Scheduler: Publicando propiedad destacada: " + property.title);
                    publishProperty(property);
                    recordPublication(property);
                }
            }
        } catch (Exception e) {
            LOG.error("❌ Social Media Scheduler: Error publicando propiedades destacadas", e);
        }
    }

    /**
     * Obtiene propiedades elegibles para rotación (no publicadas en los últimos 8 días)
     */
    private List<PropertyDTO> getEligiblePropertiesForRotation() {
        List<PropertyDTO> allProperties = propertyService.listAll();
        
        // Filtrar solo propiedades activas para publicación
        List<PropertyDTO> activeProperties = allProperties.stream()
            .filter(property -> property.propertyStatusCode != null && 
                    (PropertyStatusHelper.ACTIVE_CODE.equalsIgnoreCase(property.propertyStatusCode) ||
                     PropertyStatusHelper.FOR_SALE_CODE.equalsIgnoreCase(property.propertyStatusCode) ||
                     PropertyStatusHelper.FOR_RENT_CODE.equalsIgnoreCase(property.propertyStatusCode)))
            .collect(Collectors.toList());

        // Filtrar propiedades que no han sido publicadas recientemente
        return activeProperties.stream()
                .filter(this::isEligibleForRotation)
                .toList();
    }

    /**
     * Obtiene TODAS las propiedades para el sorteo (sin filtros)
     */
    @SuppressWarnings("unused")
	private List<PropertyDTO> getAllPropertiesForSorteo() {
        return propertyService.listAll();
    }

    /**
     * Obtiene propiedades elegibles para publicación diaria
     */
    @SuppressWarnings("unused")
	private List<PropertyDTO> getEligibleProperties() {
        List<PropertyDTO> allProperties = propertyService.listAll();
        
        return allProperties.stream()
                .filter(this::isEligibleForDailyPublication)
                .toList();
    }

    /**
     * Obtiene propiedades destacadas
     */
    private List<PropertyDTO> getFeaturedProperties() {
        List<PropertyDTO> allProperties = propertyService.listAll();
        
        return allProperties.stream()
                .filter(p -> p.featured != null && p.featured)
                .toList();
    }

    /**
     * Verifica si una propiedad es elegible para rotación (no publicada en los últimos 8 días)
     */
    private boolean isEligibleForRotation(PropertyDTO property) {
        // Verificar si la propiedad fue publicada recientemente (últimos 8 días)
        return !SocialMediaPublication.wasPublishedRecently(property.id, 8);
    }

    /**
     * Registra una publicación para evitar repetición
     */
    @Transactional
    public void recordPublication(PropertyDTO property) {
        try {
            SocialMediaPublication publication = new SocialMediaPublication();
            publication.setPropertyId(property.id);
            publication.setPropertyTitle(property.title);
            publication.setPlatform("both"); // facebook,instagram
            publication.setPublishedAt(LocalDateTime.now());
            publication.setStatus("success");
            publication.setMessage("Publicación automática diaria con rotación");
            
            publication.persist();
            
            LOG.info("📝 Social Media Scheduler: Registrando publicación de propiedad ID: " + property.id);
        } catch (Exception e) {
            LOG.error("❌ Social Media Scheduler: Error registrando publicación", e);
        }
    }

    /**
     * Verifica si una propiedad es elegible para publicación diaria
     */
    private boolean isEligibleForDailyPublication(PropertyDTO property) {
        // Propiedades activas
        if (property.propertyStatus == null || !property.propertyStatus.equalsIgnoreCase("active")) {
            return false;
        }

        // Debe tener imagen destacada
        if (property.featuredImage == null || property.featuredImage.trim().isEmpty()) {
            return false;
        }

        // Debe tener información básica
        if (property.title == null || property.title.trim().isEmpty()) {
            return false;
        }

        // Debe tener precio
        if (property.price == null) {
            return false;
        }

        return true;
    }

    /**
     * Selecciona UNA propiedad aleatoria para publicar hoy
     */
    private PropertyDTO selectOnePropertyForToday(List<PropertyDTO> allProperties) {
        if (allProperties.isEmpty()) {
            return null;
        }
        
        // Seleccionar una propiedad aleatoria
        int randomIndex = random.nextInt(allProperties.size());
        return allProperties.get(randomIndex);
    }

    /**
     * Selecciona propiedades aleatorias para publicar hoy
     */
    @SuppressWarnings("unused")
	private List<PropertyDTO> selectPropertiesForToday(List<PropertyDTO> eligibleProperties) {
        int propertiesToSelect = Math.min(maxPropertiesPerDay, eligibleProperties.size());
        
        // Mezclar la lista para selección aleatoria
        List<PropertyDTO> shuffled = eligibleProperties.stream()
                .sorted((a, b) -> random.nextInt(3) - 1) // Orden aleatorio
                .toList();

        return shuffled.subList(0, propertiesToSelect);
    }

    /**
     * Verifica si una propiedad destacada debe ser publicada
     */
    private boolean shouldPublishFeaturedProperty(PropertyDTO property) {
        // Verificar si ya fue publicada recientemente (1 día para destacadas)
        return !SocialMediaPublication.wasPublishedRecently(property.id, 1) && 
               isEligibleForDailyPublication(property);
    }

    /**
     * Publica una propiedad en redes sociales
     */
    private void publishProperty(PropertyDTO property) {
        try {
            List<String> platforms = List.of(defaultPlatforms.split(","));
            
            LOG.info("📤 Social Media Scheduler: Publicando propiedad '" + property.title + 
                    "' en plataformas: " + String.join(", ", platforms));

            SocialMediaPostDTO result = socialMediaService.publishPropertyToSocialMedia(property, platforms);
            
            if ("published".equals(result.status)) {
                LOG.info("✅ Social Media Scheduler: Propiedad '" + property.title + 
                        "' publicada exitosamente. Facebook ID: " + result.facebookPostId + 
                        ", Instagram ID: " + result.instagramPostId);
            } else {
                LOG.warn("⚠️ Social Media Scheduler: Error publicando propiedad '" + property.title + 
                        "': " + result.errorMessage);
            }

        } catch (Exception e) {
            LOG.error("❌ Social Media Scheduler: Error publicando propiedad '" + property.title + "'", e);
        }
    }

    /**
     * Publica una propiedad específica manualmente
     */
    public SocialMediaPostDTO publishSpecificProperty(Long propertyId) {
        try {
            PropertyDTO property = propertyService.findById(propertyId);
            if (property == null) {
                LOG.error("❌ Social Media Scheduler: Propiedad no encontrada con ID: " + propertyId);
                return null;
            }

            List<String> platforms = List.of(defaultPlatforms.split(","));
            
            LOG.info("📤 Social Media Scheduler: Publicación manual de propiedad '" + property.title + "'");
            
            return socialMediaService.publishPropertyToSocialMedia(property, platforms);

        } catch (Exception e) {
            LOG.error("❌ Social Media Scheduler: Error en publicación manual", e);
            return null;
        }
    }

    /**
     * Obtiene estadísticas del scheduler
     */
    public String getSchedulerStats() {
        List<PropertyDTO> allProperties = propertyService.listAll();
        List<PropertyDTO> eligibleProperties = getEligiblePropertiesForRotation();
        List<PropertyDTO> featuredProperties = getFeaturedProperties();

        return String.format(
            "📊 Social Media Scheduler Stats:\n" +
            "- Total propiedades: %d\n" +
            "- Propiedades elegibles para rotación: %d\n" +
            "- Propiedades destacadas: %d\n" +
            "- Máximo por día: %d\n" +
            "- Plataformas: %s\n" +
            "- Scheduler habilitado: %s\n" +
            "- Auto-publish habilitado: %s\n" +
            "- Frecuencia: Diaria a las 8:00 AM (rotación cada 8 días por propiedad)",
            allProperties.size(),
            eligibleProperties.size(),
            featuredProperties.size(),
            maxPropertiesPerDay,
            defaultPlatforms,
            schedulerEnabled ? "Sí" : "No",
            autoPublish ? "Sí" : "No"
        );
    }
} 