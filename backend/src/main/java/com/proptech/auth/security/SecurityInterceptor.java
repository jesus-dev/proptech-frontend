package com.proptech.auth.security;

import com.proptech.auth.service.AuthService;

import jakarta.annotation.Priority;
import jakarta.inject.Inject;
import jakarta.interceptor.AroundInvoke;
import jakarta.interceptor.Interceptor;
import jakarta.interceptor.InvocationContext;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.HttpHeaders;

@Interceptor
@Secured
@Priority(Interceptor.Priority.APPLICATION)
public class SecurityInterceptor {
    
    @Inject
    AuthService authService;
    
    @Context
    HttpHeaders headers;
    
    @AroundInvoke
    public Object intercept(InvocationContext context) throws Exception {
        // Get the Secured annotation
        Secured secured = context.getMethod().getAnnotation(Secured.class);
        if (secured == null) {
            secured = context.getTarget().getClass().getAnnotation(Secured.class);
        }
        
        if (secured == null) {
            return context.proceed();
        }
        
        // Extract token from Authorization header
        String authorization = headers.getHeaderString("Authorization");
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new SecurityException("Authorization header required");
        }
        
        String token = authorization.substring(7);
        
        // Validate token
        if (!authService.validateToken(token)) {
            throw new SecurityException("Invalid token");
        }
        
        // Check permissions if specified
        String[] requiredPermissions = secured.value();
        if (requiredPermissions.length > 0) {
            // For now, we'll skip permission checking in this simple implementation
            // In a full implementation, you would check the user's permissions here
        }
        
        return context.proceed();
    }
    

} 