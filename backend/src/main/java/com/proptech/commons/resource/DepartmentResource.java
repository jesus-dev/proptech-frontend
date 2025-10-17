package com.proptech.commons.resource;

import com.proptech.commons.entity.Department;
import com.proptech.commons.repository.DepartmentRepository;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/departments")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class DepartmentResource {
    @Inject
    DepartmentRepository departmentRepository;

    @GET
    public List<Department> getAll() {
        return departmentRepository.listAll();
    }

    @GET
    @Path("/{id}")
    public Response getById(@PathParam("id") Long id) {
        Department department = departmentRepository.findById(id);
        if (department == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }
        return Response.ok(department).build();
    }
} 