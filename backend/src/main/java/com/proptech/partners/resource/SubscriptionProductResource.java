package com.proptech.partners.resource;

import com.proptech.partners.dto.SubscriptionProductDTO;
import com.proptech.partners.entity.SubscriptionProduct;
import com.proptech.partners.service.SubscriptionProductService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Path("/api/subscription-products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class SubscriptionProductResource {
    
    @Inject
    SubscriptionProductService subscriptionProductService;
    
    @GET
    public Response getAllProducts() {
        try {
            List<SubscriptionProductDTO> products = subscriptionProductService.getAllProducts();
            return Response.ok(products).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/active")
    public Response getActiveProducts() {
        try {
            List<SubscriptionProductDTO> products = subscriptionProductService.getActiveProducts();
            return Response.ok(products).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/popular")
    public Response getPopularProducts() {
        try {
            List<SubscriptionProductDTO> products = subscriptionProductService.getPopularProducts();
            return Response.ok(products).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/recommended")
    public Response getRecommendedProducts() {
        try {
            List<SubscriptionProductDTO> products = subscriptionProductService.getRecommendedProducts();
            return Response.ok(products).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/category/{category}")
    public Response getProductsByCategory(@PathParam("category") String category) {
        try {
            SubscriptionProduct.ProductCategory productCategory = SubscriptionProduct.ProductCategory.valueOf(category.toUpperCase());
            List<SubscriptionProductDTO> products = subscriptionProductService.getProductsByCategory(productCategory);
            return Response.ok(products).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    public Response getProductById(@PathParam("id") Long id) {
        try {
            SubscriptionProductDTO product = subscriptionProductService.getProductById(id);
            return Response.ok(product).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.NOT_FOUND)
                    .entity(error)
                    .build();
        }
    }
    
    @POST
    public Response createProduct(SubscriptionProductDTO productDTO) {
        try {
            SubscriptionProductDTO product = subscriptionProductService.createProduct(productDTO);
            return Response.status(Response.Status.CREATED)
                    .entity(product)
                    .build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    public Response updateProduct(@PathParam("id") Long id, SubscriptionProductDTO productDTO) {
        try {
            SubscriptionProductDTO product = subscriptionProductService.updateProduct(id, productDTO);
            return Response.ok(product).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @DELETE
    @Path("/{id}")
    public Response deleteProduct(@PathParam("id") Long id) {
        try {
            subscriptionProductService.deleteProduct(id);
            return Response.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/activate")
    public Response activateProduct(@PathParam("id") Long id) {
        try {
            SubscriptionProductDTO product = subscriptionProductService.activateProduct(id);
            return Response.ok(product).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}/deactivate")
    public Response deactivateProduct(@PathParam("id") Long id) {
        try {
            SubscriptionProductDTO product = subscriptionProductService.deactivateProduct(id);
            return Response.ok(product).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(error)
                    .build();
        }
    }
    
    @POST
    @Path("/social-dues")
    public Response createSocialDuesPlan() {
        try {
            SubscriptionProductDTO socialDuesPlan = subscriptionProductService.createSocialDuesPlan();
            return Response.status(Response.Status.CREATED)
                    .entity(socialDuesPlan)
                    .build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
    
    @GET
    @Path("/stats")
    public Response getStats() {
        try {
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalProducts", subscriptionProductService.getTotalProducts());
            stats.put("activeProducts", subscriptionProductService.getActiveProductsCount());
            return Response.ok(stats).build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(error)
                    .build();
        }
    }
}
