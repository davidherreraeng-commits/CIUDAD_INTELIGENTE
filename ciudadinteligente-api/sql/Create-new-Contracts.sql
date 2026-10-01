-- ==========================================================
-- Migración: Contratos, Contratistas y Sistemas por Contrato
-- Base de datos: PostgreSQL
-- Schema: ciudadinteligente-test
-- ==========================================================
-- El nombre del schema tiene un guion, por lo que debe ir
-- siempre entre comillas dobles en todas las sentencias.

CREATE SCHEMA IF NOT EXISTS "ciudadinteligente-test";

-- ==========================================================
-- 1. TABLAS NUEVAS
-- ==========================================================

-- ----------------------------------------------------------
-- tbl_contractor
-- ----------------------------------------------------------
CREATE TABLE "ciudadinteligente-test".tbl_contractor (
    "idContractor"   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "nameContractor" varchar(255) NOT NULL,
    "isDelete"       boolean NOT NULL DEFAULT false
);

-- ----------------------------------------------------------
-- tbl_contracts
-- Incluye userId: usuario responsable/creador del contrato
-- ----------------------------------------------------------
CREATE TABLE "ciudadinteligente-test".tbl_contracts (
    "idContract"   integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "contractNumber" varchar(100) NOT NULL,
    "idRelation"   integer NOT NULL,
    "initDate"     date,
    "finalDate"    date,
    "budget"       bigint NOT NULL DEFAULT 0,
    "status"       varchar(50), -- enum de estados (definir valores permitidos)
    "idContractor" integer NOT NULL,
    "userId"       integer NOT NULL,
    "isDelete"     boolean NOT NULL DEFAULT false,
    CONSTRAINT fk_contracts_contractor
        FOREIGN KEY ("idContractor")
        REFERENCES "ciudadinteligente-test".tbl_contractor ("idContractor"),
    CONSTRAINT fk_contracts_user
        FOREIGN KEY ("userId")
        REFERENCES "ciudadinteligente-test".tbl_user ("userId"),
    CONSTRAINT fk_contracts_dependency_project
        FOREIGN KEY ("idRelation")
        REFERENCES "ciudadinteligente-test".tbl_dependency_projects ("idRelation")
);

CREATE INDEX idx_contracts_idcontractor
    ON "ciudadinteligente-test".tbl_contracts ("idContractor");

CREATE INDEX idx_contracts_userid
    ON "ciudadinteligente-test".tbl_contracts ("userId");

CREATE INDEX idx_contracts_idrelation
    ON "ciudadinteligente-test".tbl_contracts ("idRelation");

CREATE UNIQUE INDEX uq_contract_number_active
    ON "ciudadinteligente-test".tbl_contracts ("contractNumber")
    WHERE "isDelete" = false;

-- ----------------------------------------------------------
-- tbl_contract_systems
-- Sistemas cubiertos por cada contrato.
-- No incluye idDepProject: se obtiene por join a través de
-- tbl_systems.idRelation (un sistema siempre pertenece a un
-- único tbl_dependency_projects).
-- ----------------------------------------------------------
CREATE TABLE "ciudadinteligente-test".tbl_contract_systems (
    "idContractSystem" integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "idContract"        integer NOT NULL,
    "systemId"          integer NOT NULL,
    status               varchar(50) NOT NULL DEFAULT 'En Proceso',
    "isDelete"          boolean NOT NULL DEFAULT false,
    CONSTRAINT fk_contractsystems_contract
        FOREIGN KEY ("idContract")
        REFERENCES "ciudadinteligente-test".tbl_contracts ("idContract"),
    CONSTRAINT fk_contractsystems_system
        FOREIGN KEY ("systemId")
        REFERENCES "ciudadinteligente-test".tbl_systems ("systemsId"),
    CONSTRAINT uq_contract_system
        UNIQUE ("idContract", "systemId")
);

CREATE INDEX idx_contractsystems_idcontract
    ON "ciudadinteligente-test".tbl_contract_systems ("idContract");

CREATE INDEX idx_contractsystems_systemid
    ON "ciudadinteligente-test".tbl_contract_systems ("systemId");

-- ==========================================================
-- 2. ALTER TABLE SOBRE TABLAS EXISTENTES
-- ==========================================================

-- ----------------------------------------------------------
-- tbl_progress
-- Se agrega idContractSystem como NULLABLE: un progreso
-- siempre tiene systemsId (retrocompatibilidad), pero solo
-- tendrá idContractSystem cuando el sistema tenga un contrato
-- vigente asociado.
--
-- IMPORTANTE: la aplicación debe validar que
-- tbl_contract_systems(idContractSystem).systemId == tbl_progress.systemsId
-- ya que esta regla no se puede expresar como constraint simple
-- de PostgreSQL sin un trigger.
-- ----------------------------------------------------------
ALTER TABLE "ciudadinteligente-test".tbl_progress
    ADD COLUMN "idContractSystem" integer NULL;

ALTER TABLE "ciudadinteligente-test".tbl_progress
    ADD CONSTRAINT fk_progress_contractsystem
        FOREIGN KEY ("idContractSystem")
        REFERENCES "ciudadinteligente-test".tbl_contract_systems ("idContractSystem");

CREATE INDEX idx_progress_idcontractsystem
    ON "ciudadinteligente-test".tbl_progress ("idContractSystem");

-- ==========================================================
-- FIN DEL SCRIPT
-- ==========================================================
