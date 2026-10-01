-- Relaciona cada contrato con el proyecto asignado a una secretaría.
-- La tabla debe estar vacía o los contratos existentes deben actualizarse
-- antes de establecer la columna como NOT NULL.

ALTER TABLE "ciudadinteligente-test".tbl_contracts
ADD COLUMN "idRelation" integer NOT NULL;

ALTER TABLE "ciudadinteligente-test".tbl_contracts
ADD CONSTRAINT fk_contracts_dependency_project
FOREIGN KEY ("idRelation")
REFERENCES "ciudadinteligente-test".tbl_dependency_projects ("idRelation");

CREATE INDEX idx_contracts_idrelation
ON "ciudadinteligente-test".tbl_contracts ("idRelation");

ALTER TABLE "ciudadinteligente-test".tbl_contracts
ALTER COLUMN "budget" SET DEFAULT 0;

UPDATE "ciudadinteligente-test".tbl_contracts
SET "budget" = 0
WHERE "budget" IS NULL;

ALTER TABLE "ciudadinteligente-test".tbl_contracts
ALTER COLUMN "budget" SET NOT NULL;
