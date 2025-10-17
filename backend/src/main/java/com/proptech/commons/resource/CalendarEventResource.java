package com.proptech.commons.resource;

import java.util.Arrays;
import java.util.List;

import com.proptech.commons.dto.CalendarEventDTO;
import com.proptech.commons.entity.CalendarEvent.EventStatus;
import com.proptech.commons.entity.CalendarEvent.EventType;
import com.proptech.commons.service.CalendarEventService;

import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/calendar-events")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CalendarEventResource {
    @Inject
    CalendarEventService service;

    @GET
    public List<CalendarEventDTO> listAll() {
        return service.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        CalendarEventDTO dto = service.findById(id);
        if (dto == null) return Response.status(Response.Status.NOT_FOUND).build();
        return Response.ok(dto).build();
    }

    @POST
    public Response create(CalendarEventDTO dto) {
        try {
            
            // Validar campos requeridos
            if (dto.title == null || dto.title.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"title is required\"}")
                    .build();
            }
            
            if (dto.start == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"start date is required\"}")
                    .build();
            }
            
            if (dto.end == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"end date is required\"}")
                    .build();
            }
            
            if (dto.type == null) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"type is required\"}")
                    .build();
            }
            
            CalendarEventDTO created = service.create(dto);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error creating event: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response update(@PathParam("id") Long id, CalendarEventDTO dto) {
        try {
            CalendarEventDTO updated = service.update(id, dto);
            if (updated == null) return Response.status(Response.Status.NOT_FOUND).build();
            return Response.ok(updated).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error updating event: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response delete(@PathParam("id") Long id) {
        try {
            boolean deleted = service.delete(id);
            if (!deleted) return Response.status(Response.Status.NOT_FOUND).build();
            return Response.noContent().build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity("{\"error\": \"Error deleting event: " + e.getMessage() + "\"}")
                .build();
        }
    }

    @GET
    @Path("/types")
    public List<EventType> getTypes() {
        return Arrays.asList(EventType.values());
    }

    @GET
    @Path("/statuses")
    public List<EventStatus> getStatuses() {
        return Arrays.asList(EventStatus.values());
    }
} 