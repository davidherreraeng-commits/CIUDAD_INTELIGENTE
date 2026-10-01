-- Rol exclusivo para administrar contratos y asociar sistemas.
-- Ejecutar en el mismo esquema donde existe tbl_user_role.

INSERT INTO "ciudadinteligente-test".tbl_user_role (
    name,
    description,
    "createdAt",
    "updatedAt"
)
SELECT
    'system_manager',
    'Responsable de crear y editar contratos y asociar sistemas a contratos',
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1
    FROM "ciudadinteligente-test".tbl_user_role
    WHERE LOWER(TRIM(name)) = 'system_manager'
);

-- Verificación
SELECT "roleId", name, description
FROM "ciudadinteligente-test".tbl_user_role
WHERE LOWER(TRIM(name)) = 'system_manager';
