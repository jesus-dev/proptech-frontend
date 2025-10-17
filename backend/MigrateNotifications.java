import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

public class MigrateNotifications {
    public static void main(String[] args) {
        String url = "jdbc:postgresql://localhost:5432/proptech";
        String username = "proptech_user";
        String password = "OnTech25@OnPropTech#25";
        
        try (Connection conn = DriverManager.getConnection(url, username, password)) {
            // Verificar notificaciones antes de la migración
            System.out.println("=== ANTES DE LA MIGRACIÓN ===");
            showNotificationStats(conn);
            
            // Ejecutar la migración
            String updateSql = "UPDATE proptech.notifications SET user_id = agent_id WHERE agent_id IS NOT NULL AND user_id IS NULL";
            try (PreparedStatement stmt = conn.prepareStatement(updateSql)) {
                int updatedRows = stmt.executeUpdate();
                System.out.println("Notificaciones migradas: " + updatedRows);
            }
            
            // Verificar notificaciones después de la migración
            System.out.println("\n=== DESPUÉS DE LA MIGRACIÓN ===");
            showNotificationStats(conn);
            
        } catch (SQLException e) {
            System.err.println("Error: " + e.getMessage());
        }
    }
    
    private static void showNotificationStats(Connection conn) throws SQLException {
        String sql = "SELECT " +
                    "COUNT(*) as total, " +
                    "COUNT(CASE WHEN user_id IS NOT NULL THEN 1 END) as with_user_id, " +
                    "COUNT(CASE WHEN agent_id IS NOT NULL THEN 1 END) as with_agent_id, " +
                    "COUNT(CASE WHEN user_id IS NULL AND agent_id IS NULL THEN 1 END) as without_both " +
                    "FROM proptech.notifications";
        
        try (PreparedStatement stmt = conn.prepareStatement(sql);
             ResultSet rs = stmt.executeQuery()) {
            
            if (rs.next()) {
                System.out.println("Total notificaciones: " + rs.getInt("total"));
                System.out.println("Con user_id: " + rs.getInt("with_user_id"));
                System.out.println("Con agent_id: " + rs.getInt("with_agent_id"));
                System.out.println("Sin ambos: " + rs.getInt("without_both"));
            }
        }
    }
}
