-- Estado independiente del sistema dentro de cada contrato.
-- Los contratos nuevos comienzan en estado En Proceso.

ALTER TABLE "ciudadinteligente-test".tbl_contract_systems
    ADD COLUMN IF NOT EXISTS status varchar(50) DEFAULT 'En Proceso';

ALTER TABLE "ciudadinteligente-test".tbl_contract_systems
    ALTER COLUMN status SET DEFAULT 'En Proceso';

-- Las asociaciones ya existentes corresponden al histórico inicial.
-- Se conserva en ellas el estado que tenía el sistema antes de esta migración.
UPDATE "ciudadinteligente-test".tbl_contract_systems AS contract_system
SET status = system.status
FROM "ciudadinteligente-test".tbl_systems AS system
WHERE system."systemsId" = contract_system."systemId"
  AND contract_system.status IS NULL
  AND contract_system."idContractSystem" = (
      SELECT MIN(first_relation."idContractSystem")
      FROM "ciudadinteligente-test".tbl_contract_systems AS first_relation
      WHERE first_relation."systemId" = contract_system."systemId"
        AND first_relation."isDelete" = false
  );

-- Las asociaciones posteriores no reciben el estado histórico del sistema.
-- Comienzan con el estado inicial definido para un contrato nuevo.
UPDATE "ciudadinteligente-test".tbl_contract_systems
SET status = 'En Proceso'
WHERE status IS NULL;

ALTER TABLE "ciudadinteligente-test".tbl_contract_systems
    ALTER COLUMN status SET NOT NULL;

SELECT "idContractSystem", "idContract", "systemId", status
FROM "ciudadinteligente-test".tbl_contract_systems
ORDER BY "idContractSystem";
