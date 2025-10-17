package com.proptech.contacts.resource;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;
import java.util.Optional;

import com.proptech.contacts.dto.ContactDTO;
import com.proptech.contacts.service.ContactService;
import com.proptech.commons.dto.PaginatedResponse;

@Path("/api/contacts")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ContactResource {

    @Inject
    ContactService contactService;

    @GET
    public Response getAllContacts(
            @QueryParam("search") String search,
            @QueryParam("type") String type,
            @QueryParam("status") String status,
            @QueryParam("assignedTo") String assignedTo,
            @QueryParam("page") Integer page,
            @QueryParam("size") Integer size) {
        
        // If pagination parameters are provided, return paginated response
        if (page != null && size != null) {
            PaginatedResponse<ContactDTO> paginatedResponse;
            
            if (search != null && !search.trim().isEmpty()) {
                paginatedResponse = contactService.searchPaginated(search, page, size);
            } else if (type != null && !type.trim().isEmpty()) {
                paginatedResponse = contactService.findByTypePaginated(type, page, size);
            } else if (status != null && !status.trim().isEmpty()) {
                paginatedResponse = contactService.findByStatusPaginated(status, page, size);
            } else if (assignedTo != null && !assignedTo.trim().isEmpty()) {
                paginatedResponse = contactService.findByAssignedToPaginated(assignedTo, page, size);
            } else {
                paginatedResponse = contactService.listAllPaginated(page, size);
            }
            
            return Response.ok(paginatedResponse).build();
        }
        
        // Otherwise return all contacts (for backward compatibility)
        List<ContactDTO> contacts;
        
        if (search != null && !search.trim().isEmpty()) {
            contacts = contactService.search(search);
        } else if (type != null && !type.trim().isEmpty()) {
            contacts = contactService.findByType(type);
        } else if (status != null && !status.trim().isEmpty()) {
            contacts = contactService.findByStatus(status);
        } else if (assignedTo != null && !assignedTo.trim().isEmpty()) {
            contacts = contactService.findByAssignedTo(assignedTo);
        } else {
            contacts = contactService.listAll();
        }
        
        return Response.ok(contacts).build();
    }

    @GET
    @Path("/{id}")
    public Response getContactById(@PathParam("id") String id) {
        try {
            Long contactId = Long.valueOf(id);
            Optional<ContactDTO> contact = contactService.findById(contactId);
            if (contact.isPresent()) {
                return Response.ok(contact.get()).build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        } catch (NumberFormatException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Invalid contact ID format").build();
        }
    }

    @POST
    public Response createContact(ContactDTO contactDTO) {
        try {
            // Validate required fields
            if (contactDTO.firstName == null || contactDTO.firstName.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("First name is required").build();
            }
            if (contactDTO.lastName == null || contactDTO.lastName.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Last name is required").build();
            }
            if (contactDTO.email == null || contactDTO.email.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Email is required").build();
            }
            if (contactDTO.phone == null || contactDTO.phone.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity("Phone is required").build();
            }

            // Check if email already exists
            if (contactService.existsByEmail(contactDTO.email)) {
                return Response.status(Response.Status.CONFLICT)
                    .entity("Email already exists").build();
            }

            ContactDTO created = contactService.create(contactDTO);
            return Response.status(Response.Status.CREATED).entity(created).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error creating contact: " + e.getMessage()).build();
        }
    }

    @PUT
    @Path("/{id}")
    public Response updateContact(@PathParam("id") String id, ContactDTO contactDTO) {
        try {
            Long contactId = Long.valueOf(id);
            ContactDTO updated = contactService.update(contactId, contactDTO);
            return Response.ok(updated).build();
        } catch (NumberFormatException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Invalid contact ID format").build();
        } catch (RuntimeException e) {
            return Response.status(Response.Status.NOT_FOUND)
                .entity(e.getMessage()).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Error updating contact: " + e.getMessage()).build();
        }
    }

    @DELETE
    @Path("/{id}")
    public Response deleteContact(@PathParam("id") String id) {
        try {
            Long contactId = Long.valueOf(id);
            boolean deleted = contactService.delete(contactId);
            if (deleted) {
                return Response.noContent().build();
            } else {
                return Response.status(Response.Status.NOT_FOUND).build();
            }
        } catch (NumberFormatException e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Invalid contact ID format").build();
        }
    }

    @GET
    @Path("/search")
    public Response searchContacts(@QueryParam("q") String query) {
        if (query == null || query.trim().isEmpty()) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity("Search query is required").build();
        }
        
        List<ContactDTO> contacts = contactService.search(query);
        return Response.ok(contacts).build();
    }

    @GET
    @Path("/type/{type}")
    public Response getContactsByType(@PathParam("type") String type) {
        List<ContactDTO> contacts = contactService.findByType(type);
        return Response.ok(contacts).build();
    }

    @GET
    @Path("/status/{status}")
    public Response getContactsByStatus(@PathParam("status") String status) {
        List<ContactDTO> contacts = contactService.findByStatus(status);
        return Response.ok(contacts).build();
    }

    @GET
    @Path("/assigned/{assignedTo}")
    public Response getContactsByAssignedTo(@PathParam("assignedTo") String assignedTo) {
        List<ContactDTO> contacts = contactService.findByAssignedTo(assignedTo);
        return Response.ok(contacts).build();
    }
} 