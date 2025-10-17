package com.proptech.commons.resource;

import com.proptech.commons.dto.CityZoneDTO;
import com.proptech.commons.service.CityZoneService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.List;

@Path("/api/city-zones")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "City Zones", description = "Gestión de zonas urbanas")
public class CityZoneResource {

    @Inject
    CityZoneService cityZoneService;

    @GET
    @Operation(summary = "Listar todas las zonas urbanas", 
               description = "Retorna una lista de todas las zonas urbanas")
    public Response getAll() {
        try {
            List<CityZoneDTO> cityZones = cityZoneService.listAll();
            return Response.ok(cityZones).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error getting city zones: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Obtener zona urbana por ID", 
               description = "Retorna la información de una zona urbana específica")
    public Response getById(@PathParam("id") Long id) {
        try {
            CityZoneDTO cityZone = cityZoneService.findById(id);
            return Response.ok(cityZone).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error getting city zone: " + e.getMessage())
                    .build();
        }
    }

    @GET
    @Path("/city/{cityId}")
    @Operation(summary = "Obtener zonas urbanas por ciudad", 
               description = "Retorna todas las zonas urbanas de una ciudad específica")
    public Response getByCityId(@PathParam("cityId") Long cityId) {
        try {
            List<CityZoneDTO> cityZones = cityZoneService.findByCityId(cityId);
            return Response.ok(cityZones).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error getting city zones by city: " + e.getMessage())
                    .build();
        }
    }

    @POST
    @Operation(summary = "Crear nueva zona urbana", 
               description = "Crea una nueva zona urbana en el sistema")
    public Response create(CityZoneDTO cityZoneDTO) {
        try {
            CityZoneDTO created = cityZoneService.create(cityZoneDTO);
            return Response.status(Response.Status.CREATED)
                    .entity(created)
                    .build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error creating city zone: " + e.getMessage())
                    .build();
        }
    }

    @PUT
    @Path("/{id}")
    @Operation(summary = "Actualizar zona urbana", 
               description = "Actualiza la información de una zona urbana existente")
    public Response update(@PathParam("id") Long id, CityZoneDTO cityZoneDTO) {
        try {
            CityZoneDTO updated = cityZoneService.update(id, cityZoneDTO);
            return Response.ok(updated).build();
        } catch (NotFoundException e) {
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(e.getMessage())
                    .build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error updating city zone: " + e.getMessage())
                    .build();
        }
    }

    @DELETE
    @Path("/{id}")
    @Operation(summary = "Eliminar zona urbana", 
               description = "Elimina una zona urbana del sistema")
    public Response delete(@PathParam("id") Long id) {
        try {
            boolean deleted = cityZoneService.delete(id);
            if (!deleted) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity("City zone not found")
                        .build();
            }
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("Error deleting city zone: " + e.getMessage())
                    .build();
        }
    }
}
