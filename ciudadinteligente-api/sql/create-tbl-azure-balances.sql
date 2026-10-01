-- =============================================================================
-- Caché de la Balances API de Azure (Microsoft.Consumption/balances)
-- Tabla: tbl_azure_balances
-- =============================================================================
--
-- QUÉ ES
--   Guarda el balance de créditos (disponible, consumido, ajustes, etc.) de
--   cada contrato Azure por mes calendario. Objetivo: que el reporte
--   "Créditos por Contrato" no tenga que consultar la Balances API real de
--   Azure en cada carga de página — esa API es lenta y se puede saturar si
--   entran varios usuarios al mismo tiempo.
--
-- CÓMO LA USA EL API (src/app/services/azure-balances.service.js, función
-- getCachedBalance):
--   - Mes YA CERRADO y guardado aquí -> se sirve siempre de esta tabla,
--     nunca se vuelve a consultar Azure (un mes cerrado no cambia).
--   - Mes VIGENTE guardado hace menos de 1 día -> se sirve de esta tabla.
--   - Mes VIGENTE guardado hace más de 1 día, o sin fila todavía -> se
--     consulta Azure y se crea/actualiza la fila.
--
-- CÓMO CORRERLO
--   Es EL MISMO script para cualquier ambiente (local/QA/prod); lo único que
--   cambia es el nombre del schema en el SET search_path de abajo — ajústalo
--   al schema que corresponda en cada ambiente.
--
-- IDEMPOTENTE: se puede correr más de una vez sin romper nada — todo usa
-- IF NOT EXISTS, no borra ni modifica datos existentes.
-- =============================================================================

BEGIN;

SET search_path TO billing; -- ajustar al schema que corresponda en cada ambiente

CREATE TABLE IF NOT EXISTS tbl_azure_balances (
  "id"                UUID PRIMARY KEY,
  "billingAccountId"  VARCHAR(255) NOT NULL,
  -- Formato "YYYYMM", ej. "202606" para junio 2026.
  "billingPeriodName" VARCHAR(6)   NOT NULL,
  "beginningBalance"  DECIMAL,
  "endingBalance"     DECIMAL,
  "newPurchases"      DECIMAL,
  "adjustments"       DECIMAL,
  "utilized"          DECIMAL,
  "currency"          VARCHAR(10) DEFAULT 'USD',
  -- Auditoría: cuándo se creó la fila / cuándo se guardó por última vez.
  -- Las administra Sequelize solo (modelo AzureBalanceCache) — el DBA no
  -- necesita tocarlas ni llenarlas a mano.
  "createdAt"         TIMESTAMP WITH TIME ZONE NOT NULL,
  "updatedAt"         TIMESTAMP WITH TIME ZONE NOT NULL,

  -- Una sola fila por contrato+mes; es la que usa el api para hacer upsert.
  CONSTRAINT uq_azure_balances_contrato_periodo UNIQUE ("billingAccountId", "billingPeriodName")
);

CREATE INDEX IF NOT EXISTS idx_azure_balances_periodo
  ON tbl_azure_balances ("billingPeriodName");

COMMIT;

-- Si deseas deshacer los cambios en lugar de confirmarlos:
-- ROLLBACK;

-- Verificación: debe devolver una fila con el schema y nombre de la tabla.
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_name = 'tbl_azure_balances';
