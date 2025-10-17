package com.proptech.contracts.resource;

import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;

import com.proptech.contracts.entity.ContractDocument;
import com.proptech.contracts.respository.ContractDocumentRepository;
import com.proptech.contracts.service.ContractService;

import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.FormParam;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

@Path("/api/contracts/{contractId}/documents")
@Consumes(MediaType.MULTIPART_FORM_DATA)
@Produces(MediaType.APPLICATION_JSON)
public class ContractDocumentResource {

    @Inject
    ContractDocumentRepository contractDocumentRepository;

    @Inject
    ContractService contractService;

    @POST
    @Transactional
    // @RolesAllowed({"admin", "agent"})
    public Response uploadContractDocument(
        @PathParam("contractId") Long contractId,
        @FormParam("file") InputStream file,
        @FormParam("fileName") String fileName,
        @FormParam("fileType") String fileType,
        @FormParam("propertyId") Long propertyId,
        @Context SecurityContext securityContext
    ) throws IOException {

        ContractDocument doc = new ContractDocument();
        doc.setContractId(contractId);
        doc.setPropertyId(propertyId);
        doc.setFileName(fileName);
        doc.setFileType(fileType);
        doc.setUploadedBy(securityContext.getUserPrincipal() != null ? 
                         securityContext.getUserPrincipal().getName() : "system");
        doc.setUploadedAt(LocalDateTime.now());

        contractDocumentRepository.persist(doc);

        // Actualizar el estado del contrato a SIGNED_PHYSICAL
        contractService.updateStatus(contractId, "SIGNED_PHYSICAL");

        return Response.ok(doc).build();
    }

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    // @RolesAllowed({"admin", "agent"})
    public List<ContractDocument> listDocuments(@PathParam("contractId") Long contractId) {
        return contractDocumentRepository.list("contractId", contractId);
    }

    @DELETE
    @Path("/{documentId}")
    @Transactional
    // @RolesAllowed({"admin", "agent"})
    public Response deleteDocument(
        @PathParam("contractId") Long contractId,
        @PathParam("documentId") Long documentId
    ) {
        ContractDocument document = contractDocumentRepository.findById(documentId);
        if (document == null) {
            return Response.status(Response.Status.NOT_FOUND).build();
        }

        if (!document.getContractId().equals(contractId)) {
            return Response.status(Response.Status.FORBIDDEN).build();
        }
        
        // Eliminar registro de la base de datos
        contractDocumentRepository.deleteById(documentId);

        return Response.ok().build();
    }

    
} 