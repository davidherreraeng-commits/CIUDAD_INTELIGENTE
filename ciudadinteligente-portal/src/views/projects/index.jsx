import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Box, Breadcrumbs, Divider, Paper, Typography, CircularProgress } from "@mui/material";

import { useAuth } from '../../provider/useAuth';
import { useErrorAlert, useSuccessAlert } from "../../hooks/errorAlert";
import { useProjectsList } from "../../hooks/useProjectsList";
import {
  projectsGetAllDependency,
  projectsGetAllProjectsForDependencies,
  projectsAddNewProjectForDependency,
  projectsDeleteProjectForDependency,
  projectsGetAllSystemsForProjects,
  projectsUpdateDates,
  projectsUpdateBudgetProject,
  projectsAddNewSystemForProject,
  projectsDeleteSystemForProject,
  projectsUpdateSystemsDescription,
  projectsUpdateSystemsDates,
  projectsGetProgressForSystem,
  projectsCreateProgress,
  projectsUpdateProgressDescription,
  projectsDeleteProgressForSystem,
  projectsUpdateSystemStatus,
  projectsCreateDependency,
  projectsUpdateBudgetDependency,
  projectsAddEvidence,
  projectsDeleteEvidence,
  projectsToggleSystemAlert,
  projectsCreateContract,
  projectsGetContracts,
  projectsUpdateContract,
  projectsAssociateSystemToContract
} from "../../api/projects";
import ProjectsContent from './components/ProjectsContent';

// ─── Funciones puras (fuera del componente para no contar en su complejidad) ──

function buildEnrichedProgress(rawProgress) {
  const enriched = {};
  Object.entries(rawProgress).forEach(([year, months]) => {
    enriched[year] = {};
    Object.entries(months).forEach(([month, items]) => {
      enriched[year][month] = items.map(p => ({
        ...p,
        originalDescription: p.description
      }));
    });
  });
  return enriched;
}

function compareByName(a, b) {
  return (a?.name || '').localeCompare(b?.name || '', 'es', { sensitivity: 'base' });
}

// ─────────────────────────────────────────────────────────────────────────────

export function Projects() {
  const { authUser } = useAuth();
  const canManageContracts = String(authUser?.roleName || '')
    .trim()
    .toLocaleLowerCase() === 'system_manager';
  const location = useLocation();
  const { errorAlert } = useErrorAlert();
  const { successAlert } = useSuccessAlert();

  const { projectsList } = useProjectsList(errorAlert);

  // --- 1. TODOS LOS ESTADOS ---
  const [loading, setLoading] = useState(false);

  const [dependencies, setDependencies] = useState(null);
  const [selectedDependency, setSelectedDependency] = useState(null);
  const [filtersDependency, setFilters] = useState({
    name: null,
    projectsId: null,
    systemName: null,
    contractFilter: null,
    status: null
  });

  const [projectsForDependency, setProjectsForDependency] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);

  const [systemsForProject, setSystemsForProject] = useState(null);
  const [contractsForProject, setContractsForProject] = useState([]);
  const [selectedContract, setSelectedContract] = useState(null);
  const [selectedSystem, setSelectedSystem] = useState(null);

  const [anchorAsignarProyecto, setAnchorAsignarProyecto] = useState(null);
  const [anchorDeleteConfirm, setAnchorDeleteConfirm] = useState(null);
  const [anchorDeleteSystem, setAnchorDeleteSystem] = useState(null);

  const [editProjectInfo, setEditProjectInfo] = useState(false);
  const [editProjectBudget, setEditProjectBudget] = useState(false);
  const [anchorNuevoSistema, setAnchorNuevoSistema] = useState(null);

  const [editSystemDescription, setEditSystemDescription] = useState(false);
  const [editSystemDates, setEditSystemDates] = useState(false);

  const [anchorNuevoAvance, setAnchorNuevoAvance] = useState(null);
  const [progress, setProgress] = useState({});
  const [anchorDeleteProgress, setAnchorDeleteProgress] = useState(null);

  // --- 2. LÓGICA DE NAVEGACIÓN DESDE CAMPANA ---
  useEffect(() => {
    if (!location.state) return;
    const { targetDependencyId, targetProjectId, targetSystemId, targetDependencyName, targetProjectName } = location.state;
    if (targetDependencyId) {
      setSelectedDependency({ dependencyId: targetDependencyId, name: targetDependencyName });
      setFilters(prev => ({ ...prev, dependencyId: targetDependencyId }));
    }
    if (targetProjectId) {
      setSelectedProject({ idRelation: targetProjectId, Project: { name: targetProjectName } });
    }
    if (targetSystemId) {
      setSelectedSystem({ systemsId: targetSystemId });
    }
    window.history.replaceState({}, document.title);
  }, [location]);

  // --- 3. EFECTOS DE CONSULTA ---

  // A. Carga de Secretarías
  useEffect(() => {
    setLoading(true);
    const delay = setTimeout(async () => {
      try {
        const res = await projectsGetAllDependency(filtersDependency);
        const deps = res.data.dependencies;
        setDependencies(deps);
      } catch (err) {
        errorAlert("No se pudo consultar las secretarías", err);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(delay);
  }, [filtersDependency, errorAlert]);

  const handleFilterChange = (field, value) => { setFilters(prev => ({ ...prev, [field]: value })); };

  const handleOpenFilteredSystem = async (system) => {
    setFilters({
      name: system.dependencyName,
      projectsId: system.projectsId,
      systemName: system.systemName,
      contractFilter: system.idContract ? `CONTRACT_${system.idContract}` : 'WITHOUT_CONTRACT',
      status: system.status
    });
    setSelectedDependency({
      dependencyId: system.dependencyId,
      name: system.dependencyName
    });
    setSelectedProject({
      idRelation: system.idRelation,
      projectsId: system.projectsId,
      Project: { name: system.projectName }
    });
    setLoading(true);
    try {
      const contractsResponse = await projectsGetContracts(system.idRelation);
      const projectContracts = contractsResponse.data.contracts || [];
      setContractsForProject(projectContracts);

      if (system.idContract) {
        setSelectedContract(projectContracts.find(
          (contract) => contract.idContract === system.idContract
        ) || null);
      } else {
        setSelectedContract(null);
      }

      setSelectedSystem({
        systemsId: system.systemsId,
        name: system.systemName,
        description: system.description,
        initDate: system.initDate,
        finalDate: system.finalDate,
        hasAlert: system.hasAlert,
        status: system.status,
        idRelation: system.idRelation,
        idContractSystem: system.idContractSystem,
        contractNumber: system.contractNumber
      });
    } catch (err) {
      errorAlert('No se pudo abrir el sistema seleccionado', err);
    } finally {
      setLoading(false);
    }
  };

  // B. Carga de Proyectos
  useEffect(() => {
    if (!selectedDependency) return;
    setLoading(true);
    const load = async () => {
      try {
        const res = await projectsGetAllProjectsForDependencies({
          dependencyId: selectedDependency.dependencyId,
          systemName: filtersDependency.systemName,
          status: filtersDependency.status
        });
        const projs = res.data.projects;
        setProjectsForDependency(projs);
      } catch (err) {
        errorAlert("No se pudo consultar los proyectos", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedDependency, filtersDependency.systemName, filtersDependency.status, errorAlert])

  // C. Carga de Sistemas
  useEffect(() => {
    if (!selectedProject) return;
    setLoading(true);
    const load = async () => {
      try {
        const res = await projectsGetAllSystemsForProjects({
          idRelation: selectedProject.idRelation,
          systemName: filtersDependency.systemName,
          status: filtersDependency.status
        });
        const sys = res.data.systems;
        setSystemsForProject(sys);
      } catch (err) {
        errorAlert("No se pudo consultar los sistemas", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedProject, filtersDependency.systemName, filtersDependency.status, errorAlert])

  useEffect(() => {
    if (!selectedProject?.idRelation) {
      setContractsForProject([]);
      return;
    }

    const loadContracts = async () => {
      try {
        const res = await projectsGetContracts(selectedProject.idRelation);
        setContractsForProject(res.data.contracts || []);
      } catch (err) {
        errorAlert('No se pudieron consultar los contratos', err);
      }
    };

    loadContracts();
  }, [selectedProject?.idRelation, errorAlert]);

  // D. Carga de Avances
  useEffect(() => {
    if (!selectedSystem) return;
    setLoading(true);
    const load = async () => {
      try {
        const res = await projectsGetProgressForSystem({
          systemsId: selectedSystem.systemsId,
          ...(selectedSystem.idContractSystem && {
            idContractSystem: selectedSystem.idContractSystem
          })
        });
        setProgress(buildEnrichedProgress(res.data.progress || {}));
      } catch (err) {
        errorAlert("No se pudieron cargar los avances del sistema", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedSystem, errorAlert])

  // --- 4. FUNCIONES MANEJADORAS (CRUD) ---

  const handleAddDependency = async (name) => {
    setLoading(true);
    try {
      const res = await projectsCreateDependency({ name });
      successAlert("Secretaría creada con éxito", res);

      const newDep = res.data.dependency;
      newDep.dependencyId = newDep.dependencyId || newDep.id;
      newDep.totalProjects = 0;

      const updatedList = [...(dependencies || []), newDep].sort(compareByName);
      setDependencies(updatedList);
    } catch (err) {
      errorAlert("No se pudo crear la secretaría", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateDependencyBudget = async (newGlobalBudget, newCurrency) => {
    setLoading(true);
    const depId = selectedDependency.dependencyId || selectedDependency.id;

    try {
      const res = await projectsUpdateBudgetDependency({
        dependencyId: depId,
        globalBudget: newGlobalBudget,
        currency: newCurrency
      });
      successAlert("Presupuesto actualizado", res);

      setSelectedDependency(prev => {
        const global = Number(newGlobalBudget);
        const distributed = prev.distributedBudget || 0;
        return { ...prev, globalBudget: global, currency: newCurrency, availableBudget: global - distributed };
      });

      setDependencies(prev => prev.map(d => {
        const currentId = d.dependencyId || d.id;
        if (currentId !== depId) return d;
        const global = Number(newGlobalBudget);
        const distributed = d.distributedBudget || 0;
        return { ...d, globalBudget: global, currency: newCurrency, availableBudget: global - distributed };
      }));
    } catch (err) {
      errorAlert("No se pudo actualizar el presupuesto", err);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectsId, dependencyId) => {
    setLoading(true);

    try {
      const res = await projectsAddNewProjectForDependency({ projectsId, dependencyId });
      successAlert('Agregado con éxito', res);

      const newRelation = {
        dependencyId,
        projectsId,
        initDate: res.data.relation.initDate,
        finalDate: res.data.relation.finalDate,
        Project: projectsList?.find(p => p.projectsId === projectsId) || null
      };

      const updatedProjects = [...(projectsForDependency || []), newRelation]
        .sort((a, b) => compareByName(a?.Project, b?.Project));
      setProjectsForDependency(updatedProjects);

      setDependencies(prev => prev.map(d =>
        d.dependencyId === dependencyId ? { ...d, totalProjects: (d.totalProjects || 0) + 1 } : d
      ));
      setSelectedDependency(prev => ({ ...prev, totalProjects: (prev.totalProjects || 0) + 1 }));
      setAnchorAsignarProyecto(null);
    } catch (err) {
      errorAlert("No se pudo asignar proyecto", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProject = async (projectsId, dependencyId) => {
    setLoading(true);

    try {
      const res = await projectsDeleteProjectForDependency({ projectsId, dependencyId });
      successAlert('Eliminado con éxito', res);

      setProjectsForDependency(prev => prev.filter(p => p.projectsId !== projectsId));
      setDependencies(prev => prev.map(d =>
        d.dependencyId === dependencyId ? { ...d, totalProjects: (d.totalProjects || 1) - 1 } : d
      ));
      setSelectedDependency(prev => ({ ...prev, totalProjects: (prev.totalProjects || 0) - 1 }));
      setAnchorDeleteConfirm(null);
    } catch (err) {
      errorAlert("Error al eliminar proyecto de la dependencia", err);
    } finally {
      setLoading(false);
    }
  };

  const resetAllView = () => {
    setFilters(prev => ({ ...prev, status: null }));
    setSelectedDependency(null);
    setProjectsForDependency(null);
    setAnchorAsignarProyecto(null);
    setAnchorDeleteConfirm(null);
    resetDependencyView();
  };

  const resetDependencyView = () => {
    setSelectedProject(null);
    setEditProjectInfo(false);
    setEditProjectBudget(false);
    setSystemsForProject(null);
    setContractsForProject([]);
    setSelectedContract(null);
    setAnchorDeleteSystem(false);
    resetSystemView();
  };

  const resetSystemView = () => {
    setSelectedSystem(null);
    setEditSystemDescription(false);
    setEditSystemDates(false);
    setAnchorNuevoAvance(null);
    setProgress({});
  };

  const resetContractView = () => {
    setSelectedContract(null);
    resetSystemView();
  };

  const changeDateProject = async (initDate, finalDate) => {
    const payload = { idRelation: selectedProject.idRelation, initDate, finalDate };
    setLoading(true);
    try {
      const res = await projectsUpdateDates(payload);
      successAlert("Fechas del proyecto actualizadas", res);
      setSelectedProject(prev => ({ ...prev, initDate, finalDate }));
      setProjectsForDependency(prev =>
        prev.map(p => p.idRelation === selectedProject.idRelation ? { ...p, initDate, finalDate } : p)
      );
      setEditProjectInfo(false);
    } catch (err) {
      errorAlert("No se pudo actualizar fechas del proyecto", err);
    } finally {
      setLoading(false);
    }
  };

  const changeBudgetProject = async (budget) => {
    const payload = { idRelation: selectedProject.idRelation, value: budget };
    setLoading(true);
    try {
      const res = await projectsUpdateBudgetProject(payload);
      successAlert("Presupuesto del proyecto actualizado", res);
      setSelectedProject(prev => ({ ...prev, budget }));
      setProjectsForDependency(prev =>
        prev.map(p => p.idRelation === selectedProject.idRelation ? { ...p, budget } : p)
      );
      setEditProjectBudget(false);
    } catch (err) {
      errorAlert("No se pudo actualizar el presupuesto", err);
    } finally {
      setLoading(false);
    }
  };

  const addSystem = async (form, idContract = null) => {
    const targetContractId = idContract || form.idContract || null;
    const systemForm = {
      name: form.name,
      description: form.description,
      initDate: form.initDate,
      finalDate: form.finalDate
    };
    const payload = {
      idRelation: selectedProject.idRelation,
      ...(targetContractId && { idContract: targetContractId }),
      ...systemForm
    };
    setLoading(true);
    try {
      const res = await projectsAddNewSystemForProject(payload);
      successAlert("Sistema agregado con éxito", res);

      const createdSystem = {
        ...res.data.system,
        hasContractHistory: Boolean(targetContractId),
        hasUnassignedProgress: false
      };
      const updatedSystems = [...(systemsForProject || []), createdSystem].sort(compareByName);
      setSystemsForProject(updatedSystems);

      if (res.data.contractSystem && targetContractId) {
        const newRelation = {
          ...res.data.contractSystem,
          System: createdSystem
        };

        setContractsForProject((current) => current.map((contract) => (
          contract.idContract === Number(targetContractId)
            ? {
              ...contract,
              ContractSystems: [...(contract.ContractSystems || []), newRelation]
            }
            : contract
        )));
        setSelectedContract((current) => (
          current?.idContract === Number(targetContractId)
            ? {
              ...current,
              ContractSystems: [...(current.ContractSystems || []), newRelation]
            }
            : current
        ));
      }

      setAnchorNuevoSistema(null);
      return true;
    } catch (err) {
      errorAlert("No se pudo agregar sistema", err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteSystem = async (systemsId) => {
    setLoading(true);
    try {
      const res = await projectsDeleteSystemForProject(systemsId);
      successAlert("Sistema eliminado correctamente", res);
      setSystemsForProject(prev => prev.filter(s => s.systemsId !== systemsId.systemsId));
      setAnchorDeleteSystem(null);
    } catch (err) {
      errorAlert("No se pudo eliminar el sistema", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSystemDescription = async (description) => {
    setLoading(true);
    try {
      const res = await projectsUpdateSystemsDescription({ systemsId: selectedSystem.systemsId, description });
      successAlert("Descripción del sistema actualizada", res);
      setSelectedSystem(prev => ({ ...prev, description }));
      setSystemsForProject(prev => prev.map(s =>
        s.systemsId === selectedSystem.systemsId ? { ...s, description } : s
      ));
      setEditSystemDescription(false);
    } catch (err) {
      errorAlert("No se pudo actualizar la descripción del sistema", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSystemDates = async (initDate, finalDate) => {
    const payload = { systemsId: selectedSystem.systemsId, initDate, finalDate };
    setLoading(true);
    try {
      const res = await projectsUpdateSystemsDates(payload);
      successAlert("Fechas del sistema actualizadas", res);
      setSelectedSystem(prev => ({
        ...prev,
        initDate: res.data.system?.initDate,
        finalDate: res.data.system?.finalDate
      }));
      setSystemsForProject(prev => prev.map(s =>
        s.systemsId === selectedSystem.systemsId ? { ...s, initDate, finalDate } : s
      ));
      setEditSystemDates(false);
    } catch (err) {
      errorAlert("No se pudo actualizar las fechas del sistema", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus, specificSystemId, idContractSystem) => {
    const targetId = specificSystemId || selectedSystem?.systemsId;
    if (!targetId) return;
    if (selectedSystem && selectedSystem.systemsId === targetId) {
      setSelectedSystem(prev => ({ ...prev, status: newStatus }));
    }
    if (systemsForProject && !idContractSystem) {
      setSystemsForProject(prev => prev.map(s =>
        s.systemsId === targetId ? { ...s, status: newStatus } : s
      ));
    }
    if (idContractSystem) {
      setContractsForProject((current) => current.map((contract) => ({
        ...contract,
        ContractSystems: contract.ContractSystems?.map((relation) => (
          relation.idContractSystem === idContractSystem
            ? { ...relation, status: newStatus }
            : relation
        ))
      })));
      setSelectedContract((current) => current ? {
        ...current,
        ContractSystems: current.ContractSystems?.map((relation) => (
          relation.idContractSystem === idContractSystem
            ? { ...relation, status: newStatus }
            : relation
        ))
      } : current);
    }
    try {
      await projectsUpdateSystemStatus({
        systemsId: targetId,
        status: newStatus,
        ...(idContractSystem && { idContractSystem })
      });
    } catch (err) {
      errorAlert("Error al sincronizar estado", err);
    }
  };

  const handleCreateProgress = async (form) => {
    const payload = {
      systemsId: selectedSystem.systemsId,
      ...(selectedSystem.idContractSystem && {
        idContractSystem: selectedSystem.idContractSystem
      }),
      ...form
    };
    setLoading(true);
    try {
      const res = await projectsCreateProgress(payload);
      successAlert("Nuevo avance registrado", res);

      setProgress(prev => {
        const updated = structuredClone(prev);
        if (!updated[payload.year]) updated[payload.year] = {};
        if (!updated[payload.year][payload.month]) updated[payload.year][payload.month] = [];
        updated[payload.year][payload.month].push({
          ...res.data.progress,
          originalDescription: res.data.progress.description,
          User: { userId: authUser.userId, UserProfile: authUser.userProfile }
        });
        updated[payload.year][payload.month].sort(compareByName);
        return updated;
      });

      setAnchorNuevoAvance(null);
    } catch (err) {
      errorAlert("Error al registrar avance", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEvidence = async (progressId, files, year, month, index) => {
    try {
      const formData = new FormData();
      formData.append('progressId', progressId);
      files.forEach(file => formData.append('files', file));
      const res = await projectsAddEvidence(formData);
      if (res.data.success) {
        setProgress(prev => {
          const updated = structuredClone(prev);
          const currentEvidences = updated[year][month][index].Evidence || [];
          updated[year][month][index].Evidence = [...currentEvidences, ...res.data.data.evidences];
          return updated;
        });
        successAlert('Evidencias agregadas', res.data);
      }
    } catch (error) {
      errorAlert('Error al agregar evidencias', error);
    }
  };

  const handleDeleteEvidence = async (evidenceId, year, month, progressIndex) => {
    try {
      const res = await projectsDeleteEvidence({ evidenceId });
      if (res.data.success) {
        setProgress(prev => {
          const updated = structuredClone(prev);
          updated[year][month][progressIndex].Evidence =
            updated[year][month][progressIndex].Evidence.filter(e => e.evidenceId !== evidenceId);
          return updated;
        });
        successAlert('Imagen eliminada', res.data);
      }
    } catch (error) {
      errorAlert('Error al eliminar imagen', error);
    }
  };

  const refreshAlertsState = async () => {
    const depsRes = await projectsGetAllDependency(filtersDependency);
    setDependencies(depsRes.data.dependencies);
    if (!selectedDependency) return;
    const projsRes = await projectsGetAllProjectsForDependencies({
      dependencyId: selectedDependency.dependencyId
    });
    setProjectsForDependency(projsRes.data.projects);
    setSelectedProject(prev => {
      const updated = projsRes.data.projects.find(p => p.idRelation === prev?.idRelation);
      return updated || prev;
    });
  };

  const handleToggleSystemAlert = async (systemsId, currentAlertState) => {
    try {
      setLoading(true);
      const res = await projectsToggleSystemAlert({ systemsId, hasAlert: !currentAlertState });
      if (!res.data.success) return;
      setSystemsForProject(prev =>
        prev.map(s => s.systemsId === systemsId ? { ...s, hasAlert: !currentAlertState } : s)
      );
      successAlert('Estado del sistema actualizado', res.data);
      await refreshAlertsState();
    } catch (error) {
      errorAlert('Error al actualizar el estado del sistema', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async (contractForm) => {
    setLoading(true);
    try {
      const res = await projectsCreateContract({
        idRelation: selectedProject.idRelation,
        ...contractForm
      });
      successAlert('Contrato creado correctamente', res);
      const createdContract = res.data.contract;

      if (res.data.contract?.migratedLegacyData) {
        setSelectedProject((current) => ({
          ...current,
          initDate: null,
          finalDate: null,
          budget: 0
        }));
        setProjectsForDependency((current) => current.map((project) => (
          project.idRelation === selectedProject.idRelation
            ? { ...project, initDate: null, finalDate: null, budget: 0 }
            : project
        )));
      }

      const contractsResponse = await projectsGetContracts(selectedProject.idRelation);
      setContractsForProject(contractsResponse.data.contracts || []);
      setProjectsForDependency((current) => current.map((project) => (
        project.idRelation === selectedProject.idRelation
          ? {
            ...project,
            totalContracts: Number(project.totalContracts || 0) + 1,
            activeContracts: Number(project.activeContracts || 0) + (createdContract.status === 'ACTIVO' ? 1 : 0),
            finalizedContracts: Number(project.finalizedContracts || 0) + (createdContract.status === 'FINALIZADO' ? 1 : 0)
          }
          : project
      )));

      const associatedIds = new Set(contractForm.systems.map((system) => system.systemsId));
      setSystemsForProject((current) => current.map((system) => (
        associatedIds.has(system.systemsId)
          ? { ...system, hasContractHistory: true, hasUnassignedProgress: false }
          : system
      )));

      return true;
    } catch (error) {
      errorAlert('No se pudo crear el contrato', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleReuseContract = async ({ idContract, systems }) => {
    setLoading(true);
    try {
      await Promise.all(systems.map((system) => (
        projectsAssociateSystemToContract(idContract, {
          systemsId: system.systemsId,
          includeHistory: system.includeHistory
        })
      )));

      const contractsResponse = await projectsGetContracts(selectedProject.idRelation);
      setContractsForProject(contractsResponse.data.contracts || []);

      const selectedSystems = new Map(
        systems.map((system) => [system.systemsId, system.includeHistory])
      );
      setSystemsForProject((current) => current.map((system) => (
        selectedSystems.has(system.systemsId)
          ? {
            ...system,
            hasContractHistory: true,
            hasUnassignedProgress: selectedSystems.get(system.systemsId)
              ? false
              : system.hasUnassignedProgress
          }
          : system
      )));

      successAlert('Sistemas asociados correctamente', {
        message: 'El contrato existente se reutilizó sin crear registros duplicados.'
      });
      return true;
    } catch (error) {
      errorAlert('No se pudieron asociar los sistemas al contrato', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContract = async (idContract, contractForm) => {
    setLoading(true);
    try {
      const previousContract = contractsForProject.find(
        (contract) => contract.idContract === idContract
      );
      const res = await projectsUpdateContract(idContract, contractForm);
      const updatedContract = res.data.contract;

      setContractsForProject((current) => current.map((contract) => (
        contract.idContract === updatedContract.idContract ? updatedContract : contract
      )));
      setSelectedContract((current) => (
        current?.idContract === updatedContract.idContract ? updatedContract : current
      ));

      if (previousContract && previousContract.status !== updatedContract.status) {
        setProjectsForDependency((current) => current.map((project) => (
          project.idRelation === selectedProject.idRelation
            ? {
              ...project,
              activeContracts: Number(project.activeContracts || 0)
                - (previousContract.status === 'ACTIVO' ? 1 : 0)
                + (updatedContract.status === 'ACTIVO' ? 1 : 0),
              finalizedContracts: Number(project.finalizedContracts || 0)
                - (previousContract.status === 'FINALIZADO' ? 1 : 0)
                + (updatedContract.status === 'FINALIZADO' ? 1 : 0)
            }
            : project
        )));
      }

      successAlert('Contrato actualizado correctamente', res);
      return true;
    } catch (error) {
      errorAlert('No se pudo actualizar el contrato', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleAssociateSystemToContract = async ({ idContract, system, includeHistory }) => {
    setLoading(true);
    try {
      const res = await projectsAssociateSystemToContract(idContract, {
        systemsId: system.systemsId,
        includeHistory
      });
      const newRelation = res.data.contractSystem;

      setContractsForProject((current) => current.map((contract) => (
        contract.idContract === idContract
          ? {
            ...contract,
            ContractSystems: [...(contract.ContractSystems || []), newRelation]
          }
          : contract
      )));
      setSystemsForProject((current) => current.map((currentSystem) => (
        currentSystem.systemsId === system.systemsId
          ? {
            ...currentSystem,
            hasContractHistory: true,
            hasUnassignedProgress: includeHistory ? false : currentSystem.hasUnassignedProgress
          }
          : currentSystem
      )));

      successAlert('Sistema asociado al contrato correctamente', res);
      return true;
    } catch (error) {
      errorAlert('No se pudo asociar el sistema al contrato', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (payload, i) => {
    setLoading(true);
    try {
      const res = await projectsUpdateProgressDescription(payload);
      setProgress(prev => {
        const updated = structuredClone(prev);
        const target = updated[res.data.progress.year][res.data.progress.month][i];
        target.description = res.data.progress.description;
        target.originalDescription = res.data.progress.description;
        target.hasPending = res.data.progress.hasPending;
        target.isEditing = false;
        return updated;
      });
    } catch (err) {
      errorAlert("Error al actualizar avance", err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProgress = async (systemsId, year, month) => {
    setLoading(true);
    try {
      const res = await projectsDeleteProgressForSystem(systemsId);
      successAlert("Sistema eliminado correctamente", res);

      setProgress(prev => {
        const updated = structuredClone(prev);
        if (!updated[year]?.[month]) return prev;
        updated[year][month] = updated[year][month].filter(p => p.progressId !== res.data.progress.progressId);
        if (updated[year][month].length === 0) delete updated[year][month];
        if (Object.keys(updated[year]).length === 0) delete updated[year];
        return updated;
      });

      setAnchorDeleteProgress(null);
    } catch (err) {
      errorAlert("No se pudo eliminar el sistema", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper
        elevation={2}
        sx={{
          position: 'sticky',
          top: '64px',
          background: '#fff',
          border: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          mt: 1,
          width: '100%',
          maxWidth: 1000,
          mx: 'auto',
          py: 3,
          zIndex: 1000,
          borderRadius: 2
        }}
      >
        <Breadcrumbs
          aria-label="breadcrumb"
          sx={{ width: '100%', maxWidth: 1000, px: 1 }}
        >
          <Typography
            color="text.primary"
            sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={resetAllView}
          >
            Secretarías
          </Typography>
          {selectedDependency &&
            <Typography
              color="text.secondary"
              sx={{ cursor: "pointer", '&:hover': { textDecoration: 'underline' } }}
              onClick={resetDependencyView}
            >
              {selectedDependency.name}
            </Typography>
          }
          {selectedProject &&
            <Typography color="text.secondary" sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={resetContractView}>
              {selectedProject.Project?.name}
            </Typography>
          }
          {selectedContract &&
            <Typography
              color="text.secondary"
              sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={resetSystemView}
            >
              Contrato {selectedContract.contractNumber}
            </Typography>
          }
          {selectedSystem &&
            <Typography color="text.secondary">
              {selectedSystem.name}
            </Typography>
          }
        </Breadcrumbs>
      </Paper>
      <Divider sx={{ my: 2, width: '100%', maxWidth: 1000, mx: 'auto' }} />
      <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: 1000, width: '100%', mx: 'auto' }}>
        {loading && (
          <Box
            sx={{
              position: 'fixed',
              height: '100%',
              width: '100%',
              background: 'rgba(0, 0, 0, .4)',
              top: 0,
              left: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 20000
            }}
          >
            <CircularProgress />
          </Box>
        )}
        <ProjectsContent
          selectedDependency={selectedDependency}
          selectedProject={selectedProject}
          selectedSystem={selectedSystem}
          selectedContract={selectedContract}
          filtersDependency={filtersDependency}
          handleFilterChange={handleFilterChange}
          projectsList={projectsList}
          dependencies={dependencies}
          setSelectedDependency={setSelectedDependency}
          handleAddDependency={handleAddDependency}
          handleUpdateDependencyBudget={handleUpdateDependencyBudget}
          projectsForDependency={projectsForDependency}
          anchorAsignarProyecto={anchorAsignarProyecto}
          setAnchorAsignarProyecto={setAnchorAsignarProyecto}
          addProject={addProject}
          setAnchorDeleteConfirm={setAnchorDeleteConfirm}
          anchorDeleteConfirm={anchorDeleteConfirm}
          deleteProject={deleteProject}
          setSelectedProject={setSelectedProject}
          editProjectInfo={editProjectInfo}
          setEditProjectInfo={setEditProjectInfo}
          changeDateProject={changeDateProject}
          editProjectBudget={editProjectBudget}
          setEditProjectBudget={setEditProjectBudget}
          changeBudgetProject={changeBudgetProject}
          anchorNuevoSistema={anchorNuevoSistema}
          setAnchorNuevoSistema={setAnchorNuevoSistema}
          addSystem={addSystem}
          systemsForProject={systemsForProject}
          contractsForProject={contractsForProject}
          setSelectedContract={setSelectedContract}
          anchorDeleteSystem={anchorDeleteSystem}
          setAnchorDeleteSystem={setAnchorDeleteSystem}
          deleteSystem={deleteSystem}
          handleStatusChange={handleStatusChange}
          handleToggleSystemAlert={handleToggleSystemAlert}
          handleCreateContract={handleCreateContract}
          handleReuseContract={handleReuseContract}
          canManageContracts={canManageContracts}
          handleUpdateContract={handleUpdateContract}
          handleAssociateSystemToContract={handleAssociateSystemToContract}
          setSelectedSystem={setSelectedSystem}
          editSystemDescription={editSystemDescription}
          setEditSystemDescription={setEditSystemDescription}
          updateSystemDescription={updateSystemDescription}
          editSystemDates={editSystemDates}
          setEditSystemDates={setEditSystemDates}
          updateSystemDates={updateSystemDates}
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
          handleOpenFilteredSystem={handleOpenFilteredSystem}
        />
      </Box>
    </>
  );
}
