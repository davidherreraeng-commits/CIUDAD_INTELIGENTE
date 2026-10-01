import { useState } from 'react';
import { Box } from '@mui/material';

import FilterDependency from '../../../components/Forms/FilterDependency';
import { GridDependencies } from '../../../components/Grid/Dependencies';
import { DependencyHeaderInfo } from '../../../components/Header/Dependency';
import { GridProjects } from '../../../components/Grid/Projects';
import { SystemHeaderInfo } from '../../../components/Header/Systems';
import { GridSystems } from '../../../components/Grid/Systems';
import { GridContracts } from '../../../components/Grid/Contracts';
import { ContractHeaderInfo } from '../../../components/Header/Contract';
import { ProgressHeaderInfo } from '../../../components/Header/Progress';
import { GridSystem } from '../../../components/Grid/System';
import { AssociateSystemContractDialog } from '../../../components/Forms/AssociateSystemContract';

import PropTypes from "prop-types";
export default function ProjectsContent(props) {
  const {
    selectedDependency,
    selectedProject,
    selectedSystem,
    selectedContract,
    filtersDependency,
    handleFilterChange,
    projectsList,
    dependencies,
    setSelectedDependency,
    handleAddDependency,
    handleUpdateDependencyBudget,
    projectsForDependency,
    anchorAsignarProyecto,
    setAnchorAsignarProyecto,
    addProject,
    setAnchorDeleteConfirm,
    anchorDeleteConfirm,
    deleteProject,
    setSelectedProject,
    editProjectInfo,
    setEditProjectInfo,
    changeDateProject,
    editProjectBudget,
    setEditProjectBudget,
    changeBudgetProject,
    anchorNuevoSistema,
    setAnchorNuevoSistema,
    addSystem,
    systemsForProject,
    contractsForProject,
    setSelectedContract,
    anchorDeleteSystem,
    setAnchorDeleteSystem,
    deleteSystem,
    handleStatusChange,
    handleToggleSystemAlert,
    handleCreateContract,
    handleReuseContract,
    canManageContracts,
    handleUpdateContract,
    handleAssociateSystemToContract,
    setSelectedSystem,
    editSystemDescription,
    setEditSystemDescription,
    updateSystemDescription,
    editSystemDates,
    setEditSystemDates,
    updateSystemDates,
    anchorNuevoAvance,
    setAnchorNuevoAvance,
    handleCreateProgress,
    progress,
    setProgress,
    updateProgress,
    anchorDeleteProgress,
    setAnchorDeleteProgress,
    deleteProgress,
    handleAddEvidence,
    handleDeleteEvidence,
    handleOpenFilteredSystem
  } = props;
  const [systemToAssociate, setSystemToAssociate] = useState(null);

  const associatedSystemIds = new Set(
    (contractsForProject || []).flatMap((contract) => (
      contract.ContractSystems?.map((relation) => relation.System?.systemsId).filter(Boolean) || []
    ))
  );
  const systemsWithoutContract = systemsForProject?.filter(
    (system) => !associatedSystemIds.has(system.systemsId)
  );
  const systemsForSelectedContract = selectedContract?.ContractSystems?.map((relation) => {
    const completeSystem = systemsForProject?.find(
      (system) => system.systemsId === relation.System?.systemsId
    );

    return {
      ...(completeSystem || relation.System),
      status: relation.status,
      idContractSystem: relation.idContractSystem,
      contractNumber: selectedContract.contractNumber
    };
  }) || [];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: 1000, width: '100%' }}>
      {!selectedDependency && !selectedProject && !selectedSystem && (
        <>
          <FilterDependency
            filters={filtersDependency}
            handleFilterChange={handleFilterChange}
            projects={projectsList}
            onSelectSystem={handleOpenFilteredSystem}
          />
          <GridDependencies
            dependencies={dependencies}
            setSelectedDependency={setSelectedDependency}
            addDependency={handleAddDependency}
          />
        </>
      )}

      {selectedDependency && !selectedProject && !selectedSystem && (
        <>
          <DependencyHeaderInfo
            selectedDependency={selectedDependency}
            updateDependencyBudget={handleUpdateDependencyBudget}
          />
          <GridProjects
            selectedDependency={selectedDependency}
            projectsList={projectsList}
            projectsForDependency={projectsForDependency}
            anchorAsignarProyecto={anchorAsignarProyecto}
            setAnchorAsignarProyecto={setAnchorAsignarProyecto}
            addProject={addProject}
            setAnchorDeleteConfirm={setAnchorDeleteConfirm}
            anchorDeleteConfirm={anchorDeleteConfirm}
            deleteProject={deleteProject}
            setSelectedProject={setSelectedProject}
          />
        </>
      )}

      {selectedDependency && selectedProject && !selectedSystem && !selectedContract && (
        <>
          <SystemHeaderInfo
            selectedProject={selectedProject}
            systemsForProject={systemsForProject}
            contracts={contractsForProject}
            onCreateContract={handleCreateContract}
            onReuseContract={handleReuseContract}
            canManageContracts={canManageContracts}
            setSelectedProject={setSelectedProject}
            editProjectInfo={editProjectInfo}
            setEditProjectInfo={setEditProjectInfo}
            changeDateProject={changeDateProject}
            editProjectBudget={editProjectBudget}
            setEditProjectBudget={setEditProjectBudget}
            changeBudgetProject={changeBudgetProject}
          />
          <GridContracts
            contracts={contractsForProject}
            onSelectContract={setSelectedContract}
            onUpdateContract={handleUpdateContract}
            canManageContracts={canManageContracts}
          />
          <GridSystems
            anchorNuevoSistema={anchorNuevoSistema}
            setAnchorNuevoSistema={setAnchorNuevoSistema}
            addSystem={addSystem}
            systemsForProject={systemsWithoutContract}
            hasContracts={Boolean(contractsForProject?.length)}
            anchorDeleteSystem={anchorDeleteSystem}
            setAnchorDeleteSystem={setAnchorDeleteSystem}
            deleteSystem={deleteSystem}
            setSelectedSystem={setSelectedSystem}
            onStatusChange={handleStatusChange}
            toggleSystemAlert={handleToggleSystemAlert}
            showCreateButton
            availableContracts={canManageContracts
              ? (contractsForProject || []).filter((contract) => contract.status === 'ACTIVO')
              : []}
            showAssociateButton={canManageContracts && Boolean(
              contractsForProject?.some((contract) => contract.status === 'ACTIVO')
            )}
            onAssociateSystem={setSystemToAssociate}
          />
          {canManageContracts && (
            <AssociateSystemContractDialog
              open={Boolean(systemToAssociate)}
              system={systemToAssociate}
              contracts={contractsForProject}
              onClose={() => setSystemToAssociate(null)}
              onAssociate={handleAssociateSystemToContract}
            />
          )}
        </>
      )}

      {selectedDependency && selectedProject && selectedContract && !selectedSystem && (
        <>
          <ContractHeaderInfo
            contract={selectedContract}
            onBack={() => setSelectedContract(null)}
          />
          <GridSystems
            anchorNuevoSistema={anchorNuevoSistema}
            setAnchorNuevoSistema={setAnchorNuevoSistema}
            addSystem={addSystem}
            systemsForProject={systemsForSelectedContract}
            anchorDeleteSystem={anchorDeleteSystem}
            setAnchorDeleteSystem={setAnchorDeleteSystem}
            deleteSystem={deleteSystem}
            setSelectedSystem={setSelectedSystem}
            onStatusChange={handleStatusChange}
            toggleSystemAlert={handleToggleSystemAlert}
            title="Sistemas del contrato"
            emptyMessage="Este contrato todavía no tiene sistemas asociados."
            showCreateButton={canManageContracts && selectedContract.status === 'ACTIVO'}
            availableContracts={canManageContracts ? [selectedContract] : []}
            defaultContractId={selectedContract.idContract}
            lockContractSelection
            showDeleteButton={false}
          />
        </>
      )}

      {selectedDependency && selectedProject && selectedSystem && (
        <>
          <ProgressHeaderInfo
            selectedSystem={selectedSystem}
            contractNumber={selectedSystem.contractNumber}
            setSelectedSystem={setSelectedSystem}
            editSystemDescription={editSystemDescription}
            setEditSystemDescription={setEditSystemDescription}
            updateSystemDescription={updateSystemDescription}
            editSystemDates={editSystemDates}
            setEditSystemDates={setEditSystemDates}
            updateSystemDates={updateSystemDates}
            onStatusChange={(status) => handleStatusChange(status)}
          />
          <GridSystem
            anchorNuevoAvance={anchorNuevoAvance}
            setAnchorNuevoAvance={setAnchorNuevoAvance}
            handleCreateProgress={handleCreateProgress}
            progress={progress}
            setProgress={setProgress}
            updateProgress={updateProgress}
            anchorDeleteProgress={anchorDeleteProgress}
            setAnchorDeleteProgress={setAnchorDeleteProgress}
            deleteProgress={deleteProgress}
            handleAddEvidence={handleAddEvidence}
            handleDeleteEvidence={handleDeleteEvidence}
          />
        </>
      )}
    </Box>
  );
}

ProjectsContent.propTypes = {
  selectedDependency: PropTypes.object,
  selectedProject: PropTypes.object,
  selectedSystem: PropTypes.object,
  selectedContract: PropTypes.object,
  filtersDependency: PropTypes.object,
  handleOpenFilteredSystem: PropTypes.func,
  handleFilterChange: PropTypes.func,
  projectsList: PropTypes.array,
  dependencies: PropTypes.array,
  setSelectedDependency: PropTypes.func,
  handleAddDependency: PropTypes.func,
  handleUpdateDependencyBudget: PropTypes.func,
  projectsForDependency: PropTypes.array,
  anchorAsignarProyecto: PropTypes.object,
  setAnchorAsignarProyecto: PropTypes.func,
  addProject: PropTypes.func,
  setAnchorDeleteConfirm: PropTypes.func,
  anchorDeleteConfirm: PropTypes.object,
  deleteProject: PropTypes.func,
  setSelectedProject: PropTypes.func,
  editProjectInfo: PropTypes.any,
  setEditProjectInfo: PropTypes.func,
  changeDateProject: PropTypes.func,
  editProjectBudget: PropTypes.any,
  setEditProjectBudget: PropTypes.func,
  changeBudgetProject: PropTypes.func,
  anchorNuevoSistema: PropTypes.object,
  setAnchorNuevoSistema: PropTypes.func,
  addSystem: PropTypes.func,
  systemsForProject: PropTypes.array,
  contractsForProject: PropTypes.array,
  setSelectedContract: PropTypes.func,
  anchorDeleteSystem: PropTypes.object,
  setAnchorDeleteSystem: PropTypes.func,
  deleteSystem: PropTypes.func,
  handleStatusChange: PropTypes.func,
  handleToggleSystemAlert: PropTypes.func,
  handleCreateContract: PropTypes.func,
  handleReuseContract: PropTypes.func,
  canManageContracts: PropTypes.bool,
  handleUpdateContract: PropTypes.func,
  handleAssociateSystemToContract: PropTypes.func,
  setSelectedSystem: PropTypes.func,
  editSystemDescription: PropTypes.any,
  setEditSystemDescription: PropTypes.func,
  updateSystemDescription: PropTypes.func,
  editSystemDates: PropTypes.any,
  setEditSystemDates: PropTypes.func,
  updateSystemDates: PropTypes.func,
  anchorNuevoAvance: PropTypes.object,
  setAnchorNuevoAvance: PropTypes.func,
  handleCreateProgress: PropTypes.func,
  progress: PropTypes.any,
  setProgress: PropTypes.func,
  updateProgress: PropTypes.func,
  anchorDeleteProgress: PropTypes.object,
  setAnchorDeleteProgress: PropTypes.func,
  deleteProgress: PropTypes.func,
  handleAddEvidence: PropTypes.func,
  handleDeleteEvidence: PropTypes.func,
};
