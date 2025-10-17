package com.proptech.auth.dto;

public class ChangePasswordRequest {
    
    private String oldPassword;
    
    private String newPassword;
    
    private String confirmPassword;
    
    // Constructors
    public ChangePasswordRequest() {}
    
    public ChangePasswordRequest(String oldPassword, String newPassword, String confirmPassword) {
        this.oldPassword = oldPassword;
        this.newPassword = newPassword;
        this.confirmPassword = confirmPassword;
    }
    
    // Getters and Setters
    public String getOldPassword() {
        return oldPassword;
    }
    
    public void setOldPassword(String oldPassword) {
        this.oldPassword = oldPassword;
    }
    
    public String getNewPassword() {
        return newPassword;
    }
    
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
    
    public String getConfirmPassword() {
        return confirmPassword;
    }
    
    public void setConfirmPassword(String confirmPassword) {
        this.confirmPassword = confirmPassword;
    }
    
    // Validation methods
    public boolean isNewPasswordConfirmed() {
        return newPassword != null && newPassword.equals(confirmPassword);
    }
    
    public boolean isNewPasswordDifferent() {
        return oldPassword != null && newPassword != null && !oldPassword.equals(newPassword);
    }
    
    public boolean isValid() {
        return oldPassword != null && !oldPassword.trim().isEmpty() &&
               newPassword != null && !newPassword.trim().isEmpty() && newPassword.length() >= 8 &&
               confirmPassword != null && !confirmPassword.trim().isEmpty();
    }
    
    public String getValidationError() {
        if (oldPassword == null || oldPassword.trim().isEmpty()) {
            return "La contraseña actual es requerida";
        }
        if (newPassword == null || newPassword.trim().isEmpty()) {
            return "La nueva contraseña es requerida";
        }
        if (newPassword.length() < 8) {
            return "La nueva contraseña debe tener al menos 8 caracteres";
        }
        if (confirmPassword == null || confirmPassword.trim().isEmpty()) {
            return "La confirmación de contraseña es requerida";
        }
        if (!isNewPasswordConfirmed()) {
            return "La nueva contraseña y su confirmación no coinciden";
        }
        if (!isNewPasswordDifferent()) {
            return "La nueva contraseña debe ser diferente a la actual";
        }
        return null;
    }
}
