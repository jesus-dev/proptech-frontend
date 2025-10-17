-- Script para corregir el esquema de la tabla subscription_sales_agents
-- Este script elimina los registros problemáticos y permite que el sistema se reinicie correctamente

-- Eliminar registros de subscription_sales_agents que tienen user_id null
DELETE FROM proptech.subscription_sales_agents WHERE user_id IS NULL;

-- Opcional: Si quieres permitir user_id null en el futuro, descomenta la siguiente línea:
-- ALTER TABLE proptech.subscription_sales_agents ALTER COLUMN user_id DROP NOT NULL;

-- Verificar que no hay más registros con user_id null
SELECT COUNT(*) as registros_con_user_id_null 
FROM proptech.subscription_sales_agents 
WHERE user_id IS NULL;

-- Mostrar la estructura actual de la tabla
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_schema = 'proptech' 
AND table_name = 'subscription_sales_agents'
ORDER BY ordinal_position;
