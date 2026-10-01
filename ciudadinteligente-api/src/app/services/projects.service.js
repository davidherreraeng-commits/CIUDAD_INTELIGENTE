const { Op, col, fn, where } = require('sequelize');

const { UserLogActions } = require('../../enums/user-log-actions.enum');
const { sequelize } = require('../../infrastructure/database/database');
const { ProjectStatus } = require('../../enums/project-status.enum');


const { Dependency } = require('../../infrastructure/models/projects/dependencies.model');
const { Projects } = require('../../infrastructure/models/projects/projects.model');
const { DependencyProjects } = require('../../infrastructure/models/projects/dependencies-projects.model');
const { UserProfile } = require('../../infrastructure/models/user/user-profile.model');
const { User } = require('../../infrastructure/models/user/user.model')
const { Systems } = require('../../infrastructure/models/projects/systems.model');
const { Progress } = require('../../infrastructure/models/projects/progress.model');
const { Contractor } = require('../../infrastructure/models/projects/contractor.model');
const { Contracts } = require('../../infrastructure/models/projects/contracts.model');
const { ContractSystems } = require('../../infrastructure/models/projects/contract-systems.model');

const { parseDate } = require('../helpers/parse-date.hepler')
const { logUserAction } = require('../helpers/log-user-actions.helper');
const { transformDependencies } = require('../helpers/dependencies.helper');
const validateModelRequired = require('../helpers/model-required.helper');

const { ProgressEvidence } = require('../../infrastructure/models/projects/progress-evidence.model');
const { uploadFileToAzure, deleteFileFromAzure } = require('./storage.service');

const getAllDependencyService = async (filters, path, ip, userId) => {
  return sequelize.transaction(async (t) => {

    let validDependencyIds = null;

    if (filters.systemName || filters.status) {
      // 1. Buscamos qué sistemas coinciden con el texto ingresado
      const systems = await Systems.findAll({
        where: {
          ...(filters.systemName && { name: { [Op.iLike]: `%${filters.systemName}%` } }),
          ...(filters.status && { status: filters.status }),
          isDelete: false
        },
        attributes: ['idRelation'],
        raw: true,
        transaction: t
      });

      const systemIdRelations = systems.map(s => s.idRelation);

      // 2. Buscamos a qué Secretarías pertenecen esos sistemas
      const depProjs = await DependencyProjects.findAll({
        where: {
          idRelation: { [Op.in]: systemIdRelations },
          ...(filters.projectsId && { projectsId: filters.projectsId }),
          isDelete: false
        },
        attributes: ['dependencyId'],
        raw: true,
        transaction: t
      });

      validDependencyIds = depProjs.map(dp => dp.dependencyId);
    }


   const dependenciesFilter = await Dependency.findAll({
      // Observa cómo el 'where' principal ahora recibe directamente la propiedad 'name'
      where: {
        ...(filters.name && { name: { [Op.iLike]: `%${filters.name}%` } }),
        ...(validDependencyIds && { dependencyId: { [Op.in]: validDependencyIds } }),
      },
      attributes: { exclude: ['createdAt'] },
      include: [
        {
          model: Projects,
          as: 'Projects',
          through: {
            where: { isDelete: false },
            attributes: ['budget']
          },
          ...(filters.projectsId && { where: { projectsId: filters.projectsId } }),
          required: !!filters.projectsId
        }
      ],
      order: [['name', 'ASC']],
      raw: false,
      transaction: t
    });

    // Obtener el total REAL de proyectos por dependencia (sin filtros del endpoint)
    const dependencyIds = dependenciesFilter.map(d => d.dependencyId);

    const totals = await DependencyProjects.findAll({
      where: {
        dependencyId: { [Op.in]: dependencyIds },
        isDelete: false,
      },
      attributes: [
        'dependencyId',
        [sequelize.fn('COUNT', sequelize.col('projectsId')), 'totalProjects'],
      ],
      group: ['dependencyId'],
      raw: true,
      transaction: t,
    });

    const totalsByDependencyId = totals.reduce((acc, row) => {
      acc[row.dependencyId] = parseInt(row.totalProjects, 10) || 0;
      return acc;
    }, {});

    const dependencies = transformDependencies(dependenciesFilter, totalsByDependencyId);

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.GET_ALL_DEPENDENCIES,
      url: path,
      transaction: t
    });

    // 1. Buscamos todos los sistemas que tengan alerta
    const alertSystems = await Systems.findAll({
      where: { hasAlert: true, isDelete: false },
      attributes: ['idRelation'],
      raw: true,
      transaction: t
    });
    const alertIdRelations = alertSystems.map(s => s.idRelation);

    // 2. Buscamos los proyectos que corresponden a esos sistemas
    const alertDependencies = await DependencyProjects.findAll({
      where: { idRelation: { [Op.in]: alertIdRelations }, isDelete: false },
      attributes: ['dependencyId'],
      raw: true,
      transaction: t
    });
    
    // 3. Creamos un Set con los IDs de las dependencias afectadas para búsqueda rápida
    const dependenciesWithAlerts = new Set(alertDependencies.map(d => d.dependencyId));

    // 4. Se lo inyectamos al arreglo de dependencias que ya estaba formateado
    dependencies.forEach(dep => {
      dep.hasSystemAlert = dependenciesWithAlerts.has(dep.dependencyId);
    });

    return { dependencies };
  });
};

const getAllProgressForSystemsService = async (systemsId, idContractSystem, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const progress = await Progress.findAll({
      where: {
        systemsId,
        isDelete: false,
        ...(idContractSystem && { idContractSystem })
      },
      include: [
        {
          model: User,
          as: 'User',
          include: [
            {
              model: UserProfile,
              as: 'UserProfile',
              attributes: { exclude: ['createdAt', 'email', 'emailDelete', 'isActive', 'updatedAt', 'userId'] }
            },
          ],
          attributes: { exclude: ['isActive', 'username', 'roleId', 'password', 'createdAt', 'token', 'updatedAt'] }
        },

        {
          model: ProgressEvidence,
          as: 'Evidence',
          attributes: ['evidenceId', 'url', 'fileName', 'mimeType']
        }
      ],
      order: [['year', 'DESC'], ['month', 'ASC']],
      raw: false,
      transaction: t
    });

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.GET_ALL_PROGRESS_FOR_SYSTEMS,
      url: path,
      transaction: t
    });

    // Agrupar por Año → Mes
    const grouped = {};

    progress.forEach(item => {
      const year = item.year;
      const month = item.month;

      if (!grouped[year]) grouped[year] = {};
      if (!grouped[year][month]) grouped[year][month] = [];

      grouped[year][month].push(item);
    });

    return { progress: grouped };
  });
};

const getAllSystemsForProjectsService = async (idRelation, systemName, status, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const systems = await Systems.findAll({
      where: { 
        idRelation, 
        isDelete: false,
        ...(systemName && { name: { [Op.iLike]: `%${systemName}%` } }),
        ...(status && { status })
      },
      order: [['name', 'ASC']],
      attributes: { exclude: ['createdAt'] },
      raw: false,
      transaction: t
    });

    const systemIds = systems.map((system) => system.systemsId);
    const [contractHistory, unassignedProgress] = systemIds.length
      ? await Promise.all([
        ContractSystems.findAll({
          where: { systemId: { [Op.in]: systemIds }, isDelete: false },
          attributes: ['systemId'],
          group: ['systemId'],
          raw: true,
          transaction: t
        }),
        Progress.findAll({
          where: {
            systemsId: { [Op.in]: systemIds },
            idContractSystem: null,
            isDelete: false
          },
          attributes: ['systemsId'],
          group: ['systemsId'],
          raw: true,
          transaction: t
        })
      ])
      : [[], []];

    const systemsWithContracts = new Set(contractHistory.map((row) => row.systemId));
    const systemsWithUnassignedProgress = new Set(unassignedProgress.map((row) => row.systemsId));
    const enrichedSystems = systems.map((system) => ({
      ...system.toJSON(),
      hasContractHistory: systemsWithContracts.has(system.systemsId),
      hasUnassignedProgress: systemsWithUnassignedProgress.has(system.systemsId)
    }));

    await logUserAction({ userId, ip, action: UserLogActions.GET_ALL_SYSTEMS_FOR_PROJECTS, url: path, transaction: t });

    return { systems: enrichedSystems };
  });
};

const createServiceError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizedTextWhere = (columnName, value) => where(
  fn('LOWER', fn('TRIM', col(columnName))),
  value.trim().toLocaleLowerCase()
);

const createContractService = async (contractData, userId) => {
  return sequelize.transaction(async (t) => {
    const {
      idRelation,
      contractNumber,
      contractor,
      initDate,
      finalDate,
      budget,
      status,
      systems
    } = contractData;

    if (!Array.isArray(systems) || systems.length === 0) {
      throw createServiceError('Debes seleccionar al menos un sistema');
    }

    if (finalDate < initDate) {
      throw createServiceError('La fecha final debe ser posterior a la fecha inicial');
    }

    if (!['ACTIVO', 'FINALIZADO'].includes(status)) {
      throw createServiceError('El estado del contrato no es válido');
    }

    const normalizedBudget = Number(budget);
    if (!Number.isSafeInteger(normalizedBudget) || normalizedBudget < 0) {
      throw createServiceError('El presupuesto debe ser un número entero mayor o igual a cero');
    }

    const normalizedContractNumber = contractNumber.trim();
    const contractorName = contractor.trim();
    if (!normalizedContractNumber || !contractorName) {
      throw createServiceError('El número del contrato y el contratista son obligatorios');
    }

    const existingContract = await Contracts.findOne({
      where: {
        idRelation,
        isDelete: false,
        [Op.and]: [normalizedTextWhere('contractNumber', normalizedContractNumber)]
      },
      transaction: t
    });

    if (existingContract) {
      throw createServiceError('Ya existe un contrato con ese número', 409);
    }

    const uniqueSystemIds = [...new Set(systems.map((item) => Number(item.systemsId)))];
    if (uniqueSystemIds.some((systemsId) => !Number.isInteger(systemsId) || systemsId <= 0)) {
      throw createServiceError('La selección contiene un sistema inválido');
    }

    if (uniqueSystemIds.length !== systems.length) {
      throw createServiceError('No puedes asociar el mismo sistema más de una vez');
    }

    const dependencyProject = await DependencyProjects.findOne({
      where: { idRelation, isDelete: false },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!dependencyProject) {
      throw createServiceError('El proyecto seleccionado no existe');
    }

    const projectSystems = await Systems.findAll({
      where: {
        systemsId: { [Op.in]: uniqueSystemIds },
        idRelation,
        isDelete: false
      },
      transaction: t
    });

    if (projectSystems.length !== uniqueSystemIds.length) {
      throw createServiceError('Uno o más sistemas no pertenecen al proyecto seleccionado');
    }

    let contractorRecord = await Contractor.findOne({
      where: {
        isDelete: false,
        [Op.and]: [normalizedTextWhere('nameContractor', contractorName)]
      },
      transaction: t
    });

    if (!contractorRecord) {
      contractorRecord = await Contractor.create(
        { nameContractor: contractorName, isDelete: false },
        { transaction: t }
      );
    }

    const previousProjectContracts = await Contracts.count({
      where: { idRelation, isDelete: false },
      transaction: t
    });
    const isFirstContract = previousProjectContracts === 0;
    const hasLegacyContractData = isFirstContract && Boolean(
      dependencyProject.initDate ||
      dependencyProject.finalDate ||
      Number(dependencyProject.budget || 0) > 0
    );
    const contractBudget = normalizedBudget;
    const contractInitDate = initDate;
    const contractFinalDate = finalDate;

    const contract = await Contracts.create({
      contractNumber: normalizedContractNumber,
      idRelation,
      initDate: contractInitDate,
      finalDate: contractFinalDate,
      budget: contractBudget,
      status,
      idContractor: contractorRecord.idContractor,
      userId,
      isDelete: false
    }, { transaction: t });

    if (hasLegacyContractData) {
      await dependencyProject.update(
        { initDate: null, finalDate: null, budget: 0 },
        { transaction: t }
      );
    }

    const createdAssociations = [];

    for (const selectedSystem of systems) {
      const systemsId = Number(selectedSystem.systemsId);
      const includeHistory = selectedSystem.includeHistory === true;

      const previousContracts = await ContractSystems.count({
        where: { systemId: systemsId, isDelete: false },
        transaction: t
      });

      if (status === 'ACTIVO') {
        const activeContracts = await ContractSystems.count({
          where: { systemId: systemsId, isDelete: false },
          include: [{
            model: Contracts,
            as: 'Contract',
            required: true,
            where: { status: 'ACTIVO', isDelete: false }
          }],
          transaction: t
        });

        if (activeContracts > 0) {
          throw createServiceError('Uno de los sistemas seleccionados ya tiene un contrato activo', 409);
        }
      }

      if (includeHistory && previousContracts > 0) {
        throw createServiceError('El histórico solamente puede organizarse durante la primera asociación del sistema');
      }

      if (includeHistory && !isFirstContract) {
        throw createServiceError('El histórico solamente puede migrarse al primer contrato del proyecto');
      }

      const association = await ContractSystems.create({
        idContract: contract.idContract,
        systemId: systemsId,
        status: includeHistory
          ? projectSystems.find((system) => system.systemsId === systemsId)?.status || ProjectStatus.EN_PROCESO
          : ProjectStatus.EN_PROCESO,
        isDelete: false
      }, { transaction: t });

      let migratedProgress = 0;
      if (includeHistory) {
        const [, affectedRows] = await Progress.update(
          { idContractSystem: association.idContractSystem },
          {
            where: {
              systemsId,
              idContractSystem: null,
              isDelete: false
            },
            returning: true,
            transaction: t
          }
        );
        migratedProgress = affectedRows.length;
      }

      createdAssociations.push({
        idContractSystem: association.idContractSystem,
        systemsId,
        includeHistory,
        status: association.status,
        migratedProgress
      });
    }

    return {
      contract: {
        ...contract.toJSON(),
        isFirstContract,
        migratedLegacyData: hasLegacyContractData,
        migratedBudget: contractBudget,
        Contractor: contractorRecord.toJSON(),
        systems: createdAssociations
      }
    };
  });
};

const getContractsForProjectService = async (idRelation) => {
  const dependencyProject = await DependencyProjects.findOne({
    where: { idRelation, isDelete: false },
    attributes: ['idRelation']
  });

  if (!dependencyProject) {
    throw createServiceError('El proyecto seleccionado no existe', 404);
  }

  const contracts = await Contracts.findAll({
    where: { idRelation, isDelete: false },
    include: [
      {
        model: Contractor,
        as: 'Contractor',
        attributes: ['idContractor', 'nameContractor']
      },
      {
        model: ContractSystems,
        as: 'ContractSystems',
        where: { isDelete: false },
        required: false,
        attributes: ['idContractSystem', 'status'],
        include: [{
          model: Systems,
          as: 'System',
          attributes: ['systemsId', 'name', 'status']
        }]
      }
    ],
    order: [['idContract', 'DESC']]
  });

  return { contracts };
};

const getContractCatalogService = async (idRelation) => {
  const [contracts, contractors] = await Promise.all([
    Contracts.findAll({
      where: {
        isDelete: false,
        ...(idRelation && { idRelation })
      },
      attributes: [
        'idContract',
        'contractNumber',
        'idRelation',
        'initDate',
        'finalDate',
        'budget',
        'status'
      ],
      include: [
        {
          model: Contractor,
          as: 'Contractor',
          attributes: ['idContractor', 'nameContractor']
        },
        {
          model: ContractSystems,
          as: 'ContractSystems',
          where: { isDelete: false },
          required: false,
          attributes: ['idContractSystem', 'systemId', 'status']
        }
      ],
      order: [['contractNumber', 'ASC']],
    }),
    Contractor.findAll({
      where: { isDelete: false },
      attributes: ['idContractor', 'nameContractor'],
      order: [['nameContractor', 'ASC']],
      raw: true
    })
  ]);

  const serializedContracts = contracts.map((contract) => contract.toJSON());
  const uniqueContractors = [...new Map(
    contractors.map((contractor) => [contractor.nameContractor.trim().toLocaleLowerCase(), contractor])
  ).values()];

  return {
    contracts: serializedContracts,
    contractors: uniqueContractors
  };
};

const updateContractService = async (contractData) => {
  return sequelize.transaction(async (t) => {
    const {
      idContract,
      contractNumber,
      contractor,
      initDate,
      finalDate,
      budget,
      status
    } = contractData;

    const normalizedContractNumber = contractNumber.trim();
    const contractorName = contractor.trim();
    const normalizedBudget = Number(budget);

    if (!normalizedContractNumber || !contractorName) {
      throw createServiceError('El número del contrato y el contratista son obligatorios');
    }

    if (finalDate < initDate) {
      throw createServiceError('La fecha final debe ser posterior a la fecha inicial');
    }

    if (!['ACTIVO', 'FINALIZADO'].includes(status)) {
      throw createServiceError('El estado del contrato no es válido');
    }

    if (!Number.isSafeInteger(normalizedBudget) || normalizedBudget < 0) {
      throw createServiceError('El presupuesto debe ser un número entero mayor o igual a cero');
    }

    const contract = await Contracts.findOne({
      where: { idContract, isDelete: false },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!contract) {
      throw createServiceError('El contrato seleccionado no existe', 404);
    }

    if (contract.status === 'FINALIZADO') {
      throw createServiceError('Los contratos finalizados no pueden editarse', 409);
    }

    const duplicateNumber = await Contracts.findOne({
      where: {
        idRelation: contract.idRelation,
        idContract: { [Op.ne]: idContract },
        isDelete: false,
        [Op.and]: [normalizedTextWhere('contractNumber', normalizedContractNumber)]
      },
      transaction: t
    });

    if (duplicateNumber) {
      throw createServiceError('Ya existe otro contrato con ese número', 409);
    }

    if (status === 'ACTIVO') {
      const contractSystems = await ContractSystems.findAll({
        where: { idContract, isDelete: false },
        attributes: ['systemId'],
        raw: true,
        transaction: t
      });
      const systemIds = contractSystems.map((relation) => relation.systemId);

      if (systemIds.length) {
        const conflictingActiveContract = await ContractSystems.findOne({
          where: {
            systemId: { [Op.in]: systemIds },
            idContract: { [Op.ne]: idContract },
            isDelete: false
          },
          include: [{
            model: Contracts,
            as: 'Contract',
            required: true,
            where: { status: 'ACTIVO', isDelete: false },
            attributes: []
          }],
          transaction: t
        });

        if (conflictingActiveContract) {
          throw createServiceError(
            'No puedes activar este contrato porque uno de sus sistemas ya pertenece a otro contrato activo',
            409
          );
        }
      }
    }

    let contractorRecord = await Contractor.findOne({
      where: {
        isDelete: false,
        [Op.and]: [normalizedTextWhere('nameContractor', contractorName)]
      },
      transaction: t
    });

    if (!contractorRecord) {
      contractorRecord = await Contractor.create(
        { nameContractor: contractorName, isDelete: false },
        { transaction: t }
      );
    }

    await contract.update({
      contractNumber: normalizedContractNumber,
      initDate,
      finalDate,
      budget: normalizedBudget,
      status,
      idContractor: contractorRecord.idContractor
    }, { transaction: t });

    const updatedContract = await Contracts.findOne({
      where: { idContract, isDelete: false },
      include: [
        {
          model: Contractor,
          as: 'Contractor',
          attributes: ['idContractor', 'nameContractor']
        },
        {
          model: ContractSystems,
          as: 'ContractSystems',
          where: { isDelete: false },
          required: false,
          attributes: ['idContractSystem', 'status'],
          include: [{
            model: Systems,
            as: 'System',
            attributes: ['systemsId', 'name', 'status']
          }]
        }
      ],
      transaction: t
    });

    return { contract: updatedContract };
  });
};

const associateSystemToContractService = async ({ idContract, systemsId, includeHistory }) => {
  return sequelize.transaction(async (t) => {
    const contract = await Contracts.findOne({
      where: { idContract, isDelete: false },
      transaction: t,
      lock: t.LOCK.UPDATE
    });

    if (!contract) {
      throw createServiceError('El contrato seleccionado no existe', 404);
    }

    if (contract.status !== 'ACTIVO') {
      throw createServiceError('No puedes asociar sistemas a un contrato finalizado', 409);
    }

    const system = await Systems.findOne({
      where: {
        systemsId,
        idRelation: contract.idRelation,
        isDelete: false
      },
      transaction: t
    });

    if (!system) {
      throw createServiceError('El sistema no existe o no pertenece al proyecto del contrato', 404);
    }

    const existingAssociation = await ContractSystems.findOne({
      where: { idContract, systemId: systemsId, isDelete: false },
      transaction: t
    });

    if (existingAssociation) {
      throw createServiceError('El sistema ya está asociado a este contrato', 409);
    }

    const activeAssociation = await ContractSystems.findOne({
      where: { systemId: systemsId, isDelete: false },
      include: [{
        model: Contracts,
        as: 'Contract',
        required: true,
        where: { status: 'ACTIVO', isDelete: false },
        attributes: []
      }],
      transaction: t
    });

    if (activeAssociation) {
      throw createServiceError('El sistema ya pertenece a otro contrato activo', 409);
    }

    const previousAssociations = await ContractSystems.count({
      where: { systemId: systemsId, isDelete: false },
      transaction: t
    });

    const firstProjectContract = await Contracts.findOne({
      where: { idRelation: contract.idRelation, isDelete: false },
      attributes: ['idContract'],
      order: [['idContract', 'ASC']],
      transaction: t
    });

    if (includeHistory && previousAssociations > 0) {
      throw createServiceError('El histórico solamente puede organizarse durante la primera asociación del sistema');
    }

    if (includeHistory && firstProjectContract?.idContract !== contract.idContract) {
      throw createServiceError('El histórico solamente puede migrarse al primer contrato del proyecto');
    }

    const contractSystem = await ContractSystems.create({
      idContract,
      systemId: systemsId,
      status: includeHistory ? system.status || ProjectStatus.EN_PROCESO : ProjectStatus.EN_PROCESO,
      isDelete: false
    }, { transaction: t });

    let migratedProgress = 0;
    if (includeHistory) {
      const [, affectedRows] = await Progress.update(
        { idContractSystem: contractSystem.idContractSystem },
        {
          where: {
            systemsId,
            idContractSystem: null,
            isDelete: false
          },
          returning: true,
          transaction: t
        }
      );
      migratedProgress = affectedRows.length;
    }

    return {
      contractSystem: {
        ...contractSystem.toJSON(),
        migratedProgress,
        System: system.toJSON()
      }
    };
  });
};

const getSystemsSummaryService = async (filters, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const systems = await Systems.findAll({
      where: {
        isDelete: false,
        ...(filters.systemName && { name: { [Op.iLike]: `%${filters.systemName}%` } })
      },
      attributes: ['systemsId', 'name', 'description', 'initDate', 'finalDate', 'status', 'hasAlert'],
      include: [{
        model: DependencyProjects,
        as: 'DependencyProjects',
        required: true,
        where: {
          isDelete: false,
          ...(filters.projectsId && { projectsId: filters.projectsId })
        },
        attributes: ['idRelation'],
        include: [
          {
            model: Projects,
            as: 'Project',
            attributes: ['projectsId', 'name'],
            required: true
          },
          {
            model: Dependency,
            as: 'Dependency',
            attributes: ['dependencyId', 'name'],
            required: true,
            ...(filters.name && { where: { name: { [Op.iLike]: `%${filters.name}%` } } })
          }
        ]
      }],
      order: [['name', 'ASC']],
      transaction: t
    });

    const systemIds = systems.map((system) => system.systemsId);
    const contractRelations = systemIds.length
      ? await ContractSystems.findAll({
        where: {
          systemId: { [Op.in]: systemIds },
          isDelete: false
        },
        attributes: ['idContractSystem', 'systemId', 'status'],
        include: [{
          model: Contracts,
          as: 'Contract',
          required: true,
          where: { isDelete: false },
          attributes: ['idContract', 'contractNumber', 'status'],
          include: [{
            model: Contractor,
            as: 'Contractor',
            attributes: ['idContractor', 'nameContractor']
          }]
        }],
        transaction: t
      })
      : [];

    const relationsBySystem = contractRelations.reduce((grouped, relation) => {
      const current = grouped.get(relation.systemId) || [];
      current.push(relation);
      grouped.set(relation.systemId, current);
      return grouped;
    }, new Map());

    const summary = systems.flatMap((system) => {
      const baseSystem = {
        systemsId: system.systemsId,
        systemName: system.name,
        description: system.description,
        initDate: system.initDate,
        finalDate: system.finalDate,
        hasAlert: system.hasAlert,
        idRelation: system.DependencyProjects.idRelation,
        dependencyId: system.DependencyProjects.Dependency.dependencyId,
        dependencyName: system.DependencyProjects.Dependency.name,
        projectsId: system.DependencyProjects.Project.projectsId,
        projectName: system.DependencyProjects.Project.name
      };
      const relations = relationsBySystem.get(system.systemsId) || [];

      if (!relations.length) {
        return [{
          ...baseSystem,
          status: system.status,
          idContractSystem: null,
          idContract: null,
          contractNumber: null,
          contractStatus: null,
          contractorName: null
        }];
      }

      return relations.map((relation) => ({
        ...baseSystem,
        status: relation.status,
        idContractSystem: relation.idContractSystem,
        idContract: relation.Contract.idContract,
        contractNumber: relation.Contract.contractNumber,
        contractStatus: relation.Contract.status,
        contractorName: relation.Contract.Contractor?.nameContractor || null
      }));
    }).filter((system) => {
      if (filters.status && system.status !== filters.status) return false;

      const contractFilter = String(filters.contractFilter || '');
      if (!contractFilter) return true;
      if (contractFilter === 'WITHOUT_CONTRACT') return !system.idContract;
      if (contractFilter === 'ACTIVE_CONTRACTS') return system.contractStatus === 'ACTIVO';
      if (contractFilter === 'FINALIZED_CONTRACTS') return system.contractStatus === 'FINALIZADO';
      if (contractFilter.startsWith('CONTRACT_')) {
        return system.idContract === Number(contractFilter.replace('CONTRACT_', ''));
      }
      return true;
    });

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.GET_ALL_SYSTEMS_FOR_PROJECTS,
      url: path,
      transaction: t
    });

    return { systems: summary };
  });
};

const getAllProjectsService = async (path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const projects = await Projects.findAll({
      attributes: { exclude: ['createdAt'] },
      raw: false,
      transaction: t,
      order: [['name', 'ASC']]
    });

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.GET_ALL_PROJECTS,
      url: path,
      transaction: t
    });

    return { projects };
  });
};

const getAllDependenciesForProjectsService = async (dependencyId, systemName, status, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    
    // Si viene filtro de sistema, buscamos qué relaciones (proyectos) lo contienen
    let validIdRelations = null;
    if (systemName || status) {
      const matchingSystems = await Systems.findAll({
        where: {
          ...(systemName && { name: { [Op.iLike]: `%${systemName}%` } }),
          ...(status && { status }),
          isDelete: false
        },
        attributes: ['idRelation'],
        raw: true,
        transaction: t
      });
      validIdRelations = matchingSystems.map(s => s.idRelation);
    }

    const projects = await DependencyProjects.findAll({
      where: { 
        dependencyId, 
        isDelete: false,
        ...(validIdRelations && { idRelation: { [Op.in]: validIdRelations } }) // Aplicamos el filtro si existe
      },
      include: [
        { model: Projects, as: 'Project', attributes: ['projectsId', 'name'] },
        {
          model: User, as: 'User', where: { isActive: true },
          include: [{ model: UserProfile, as: 'UserProfile', where: { isActive: true }, attributes: { exclude: ['updatedAt', 'userId', 'emailDelete', 'createdAt', 'email', 'isActive'] } }],
          attributes: { exclude: ['createdAt', 'password', 'token', 'username', 'isActive', 'roleId'] }
        }
      ],
      attributes: { exclude: ['createdAt'] },
      order: [[{ model: Projects, as: 'Project' }, 'name', 'ASC']],
      raw: false,
      transaction: t
    });

    // --- INICIO EFECTO BURBUJA (PROYECTOS) ---
    const idRelations = projects.map(p => p.idRelation);
    const alertSystems = await Systems.findAll({
      where: { idRelation: { [Op.in]: idRelations }, hasAlert: true, isDelete: false },
      attributes: ['idRelation'],
      raw: true,
      transaction: t
    });
    const relationsWithAlerts = new Set(alertSystems.map(s => s.idRelation));

    const projectContracts = idRelations.length
      ? await Contracts.findAll({
        where: { idRelation: { [Op.in]: idRelations }, isDelete: false },
        attributes: ['idRelation', 'status'],
        raw: true,
        transaction: t
      })
      : [];
    const contractSummaryByProject = projectContracts.reduce((summary, contract) => {
      const current = summary.get(contract.idRelation) || {
        totalContracts: 0,
        activeContracts: 0,
        finalizedContracts: 0
      };
      current.totalContracts += 1;
      if (contract.status === 'ACTIVO') current.activeContracts += 1;
      if (contract.status === 'FINALIZADO') current.finalizedContracts += 1;
      summary.set(contract.idRelation, current);
      return summary;
    }, new Map());

    const projectsWithAlerts = projects.map(p => {
      const proj = p.toJSON();
      proj.hasSystemAlert = relationsWithAlerts.has(proj.idRelation);
      const contractSummary = contractSummaryByProject.get(proj.idRelation) || {
        totalContracts: 0,
        activeContracts: 0,
        finalizedContracts: 0
      };
      Object.assign(proj, contractSummary);
      return proj;
    });
    // --- FIN EFECTO BURBUJA ---

    await logUserAction({ userId, ip, action: UserLogActions.GET_ALL_PROJECTS_FOR_DEPENDENCIES, url: path, transaction: t });

    return { projects: projectsWithAlerts };
  });
};

const postProjectsForDependenciesService = async (dependencyId, projectsId, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const result = await DependencyProjects.create(
      {
        dependencyId,
        projectsId,
        initDate: new Date(),
        finalDate: null,
        isDelete: false,
        userId
      },
      { transaction: t }
    );

    // 3. Registrar acción del usuario
    await logUserAction({
      userId,
      ip,
      action: UserLogActions.CREATE_PROJECT_FOR_DEPENDENCY,
      url: path,
      transaction: t
    });

    return { relation: result };
  });
};

const deleteProjectsForDependenciesService = async (dependencyId, projectsId, path, ip, userId) => {
  return sequelize.transaction(async (t) => {

    // Obtener la relación para conseguir idRelation
    const relation = await DependencyProjects.findOne({
      where: { dependencyId, projectsId, isDelete: false },
      transaction: t
    });

    // Eliminar el proyecto
    await relation.update({ isDelete: true }, { transaction: t });

    // Eliminar todos los sistemas asociados con ese idRelation
    await Systems.update(
      { isDelete: true },
      { where: { idRelation: relation.idRelation }, transaction: t }
    );

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.DELETE_PROJECT_FOR_DEPENDENCY,
      url: path,
      transaction: t
    });

    return { deletedProject: relation.idRelation, deletedSystems: true };
  });
};

const updateProjectBudgetService = async (idRelation, value, path, ip, userId) => {
  return sequelize.transaction(async (t) => {

    const relation = await DependencyProjects.findOne({
      where: { idRelation, isDelete: false },
      transaction: t
    });

    if (!relation) throw new Error("No existe relación de proyecto con dependencia");

    await relation.update(
      { budget: value },
      { transaction: t }
    );

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.UPDATE_PROJECT_BUDGET,
      url: path,
      transaction: t
    });

    return { relation };
  });
};

const updateProjectDatesService = async (idRelation, initDate, finalDate, path, ip, userId) => {
  return sequelize.transaction(async (t) => {

    const relation = await DependencyProjects.findOne({
      where: { idRelation, isDelete: false },
      transaction: t
    });

    if (!relation) throw new Error("No existe relación de proyecto con dependencia");

    await relation.update(
      { initDate: parseDate(initDate), finalDate: parseDate(finalDate) },
      { transaction: t }
    );

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.UPDATE_PROJECT_DATES,
      url: path,
      transaction: t
    });

    return { relation };
  });
};

const addSystemForProjectService = async (
  idRelation,
  name,
  description,
  initDate,
  finalDate,
  idContract,
  path,
  ip,
  userId
) => {
  return sequelize.transaction(async (t) => {

    let contract = null;
    if (idContract) {
      contract = await Contracts.findOne({
        where: { idContract, idRelation, isDelete: false },
        transaction: t,
        lock: t.LOCK.UPDATE
      });

      if (!contract) {
        throw createServiceError('El contrato seleccionado no existe o no pertenece al proyecto', 404);
      }

      if (contract.status !== 'ACTIVO') {
        throw createServiceError('No puedes agregar sistemas a un contrato finalizado', 409);
      }
    }

    const system = await Systems.create(
      {
        idRelation,
        name,
        description,
        isDelete: false,
        initDate: parseDate(initDate),
        finalDate: parseDate(finalDate)
      },
      { transaction: t }
    );

    const contractSystem = contract
      ? await ContractSystems.create({
        idContract: contract.idContract,
        systemId: system.systemsId,
        status: ProjectStatus.EN_PROCESO,
        isDelete: false
      }, { transaction: t })
      : null;

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.CREATE_SYSTEM_FOR_PROJECT,
      url: path,
      transaction: t
    });

    return { system, contractSystem };
  });
};

const deleteSystemForProjectService = async (systemsId, path, ip, userId) => {
  return sequelize.transaction(async (t) => {

    const system = await Systems.findOne({
      where: { systemsId, isDelete: false },
      transaction: t
    });

    await system.update(
      { isDelete: true },
      { transaction: t }
    );

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.DELETE_SYSTEM_FOR_PROJECT,
      url: path,
      transaction: t
    });

    return { system };
  });
};

const updateSystemsDescriptionService = async (systemsId, description, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const system = await Systems.findOne({
      where: { systemsId, isDelete: false },
      transaction: t
    });

    await system.update(
      { description },
      { transaction: t }
    );

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.UPDATE_SYSTEM_DESCRIPTION,
      url: path,
      transaction: t
    });

    return { system };
  });
};

const updateSystemsDatesService = async (systemsId, initDate, finalDate, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const system = await Systems.findOne({
      where: { systemsId, isDelete: false },
      transaction: t
    });

    await system.update(
      { initDate: parseDate(initDate), finalDate: parseDate(finalDate) },
      { transaction: t }
    );

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.UPDATE_SYSTEM_DATES,
      url: path,
      transaction: t
    });

    return { system };
  });
};

const postAddProgressForSystemsService = async (
  systemsId,
  requestedContractSystemId,
  year,
  month,
  name,
  description,
  hasPending,
  files,
  path,
  ip,
  userId
) => {
  return sequelize.transaction(async (t) => {
    let idContractSystem = null;

    if (requestedContractSystemId) {
      const requestedAssociation = await ContractSystems.findOne({
        where: {
          idContractSystem: requestedContractSystemId,
          systemId: systemsId,
          isDelete: false
        },
        attributes: ['idContractSystem'],
        transaction: t
      });

      if (!requestedAssociation) {
        throw createServiceError('El sistema no pertenece al contrato seleccionado', 404);
      }

      idContractSystem = requestedAssociation.idContractSystem;
    } else {
      const activeContractSystems = await ContractSystems.findAll({
        where: { systemId: systemsId, isDelete: false },
        include: [{
          model: Contracts,
          as: 'Contract',
          required: true,
          where: { status: 'ACTIVO', isDelete: false },
          attributes: []
        }],
        attributes: ['idContractSystem'],
        transaction: t
      });

      if (activeContractSystems.length > 1) {
        throw createServiceError('El sistema tiene más de un contrato activo. Debes finalizar uno antes de registrar avances', 409);
      }

      idContractSystem = activeContractSystems[0]?.idContractSystem || null;
    }

    const progress = await Progress.create(
      {
        systemsId,
        idContractSystem,
        year,
        month,
        name,
        description,
        hasPending: hasPending === 'true' || hasPending === true,
        userId,
        isDelete: false
      },
      { transaction: t }
    );

    const filesArray = files || [];

    // A. CREAMOS UN ARRAY PARA ACUMULAR LAS EVIDENCIAS NUEVAS
    const createdEvidences = [];

    if (filesArray.length > 0) {

      for (const file of filesArray) {
        try {
          const azureInfo = await uploadFileToAzure(file);

          // B. GUARDAMOS EL RESULTADO DE LA CREACIÓN EN UNA VARIABLE
          const newEvidence = await ProgressEvidence.create({
            fileName: azureInfo.fileName,
            url: azureInfo.url,
            blobName: azureInfo.blobName,
            mimeType: azureInfo.mimetype,
            progressId: progress.progressId
          }, { transaction: t });

          // C. LO AGREGAMOS AL ARRAY LOCAL
          createdEvidences.push(newEvidence);

        } catch (innerError) {
          throw innerError;
        }
      }
    }

    // 3. Log de auditoría
    await logUserAction({
      userId,
      ip,
      url: path,
      action: UserLogActions.ADD_PROGRESS_FOR_SYSTEM,
      transaction: t
    });

    // Convertimos la instancia de Sequelize a JSON plano para poder modificarla
    const progressResponse = progress.toJSON();
    // Le pegamos las evidencias que acabamos de crear
    progressResponse.Evidence = createdEvidences;

    // Devolvemos el objeto completo
    return { progress: progressResponse };
  });
};

const updateProgressDescriptionService = async (progressId, description, hasPending, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const progress = await Progress.findOne({
      where: { progressId, isDelete: false },
      transaction: t
    });

    if (!progress) throw new Error("No existe el avance solicitado");

    await progress.update({
      description,
      hasPending: hasPending !== undefined ? hasPending : progress.hasPending,
    }, { transaction: t });

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.UPDATE_PROGRESS_DESCRIPTION,
      url: path,
      transaction: t
    });

    return { progress };
  });
};

const deleteProgressForSystemsService = async (progressId, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const progress = await Progress.findOne({
      where: { progressId, isDelete: false },
      transaction: t
    });

    if (!progress) throw new Error("No existe el avance solicitado");

    await progress.update(
      { isDelete: true },
      { transaction: t }
    );

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.DELETE_PROGRESS_FOR_SYSTEM,
      url: path,
      transaction: t
    });

    return { progress };
  });
};

const updateSystemStatusService = async (
  systemsId,
  status,
  idContractSystem,
  path,
  ip,
  userId
) => {
  return sequelize.transaction(async (t) => {
    if (idContractSystem) {
      const contractSystem = await ContractSystems.findOne({
        where: {
          idContractSystem,
          systemId: systemsId,
          isDelete: false
        },
        transaction: t
      });

      if (!contractSystem) {
        throw createServiceError('El sistema no pertenece al contrato seleccionado', 404);
      }

      await contractSystem.update({ status }, { transaction: t });

      await logUserAction({
        userId,
        ip,
        action: UserLogActions.UPDATE_SYSTEM_STATUS,
        url: path,
        transaction: t
      });

      return { contractSystem };
    }

    const system = await Systems.findOne({
      where: { systemsId, isDelete: false },
      transaction: t
    });

    if (!system) throw new Error("El sistema solicitado no existe");

    await system.update({ status }, { transaction: t });

    await logUserAction({
      userId,
      ip,
      action: UserLogActions.UPDATE_SYSTEM_STATUS,
      url: path,
      transaction: t
    });

    return { system };
  });
};

const getStaleProjectsNotificationService = async (userId, roleId) => {
  // 1. Definimos la fecha límite de "silencio" (5 días atrás)
  const deadlineDate = new Date();
  deadlineDate.setDate(deadlineDate.getDate() - 5);

  // 2. Definimos HOY para comparar vencimientos
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalizamos a media noche para evitar problemas de hora

  const systems = await Systems.findAll({
    where: {
      isDelete: false,
      // CONDICIÓN A: Solo notificar si está "En Proceso"
      // Si está Pausado, Cancelado o Terminado, lo ignoramos.
      status: ProjectStatus.EN_PROCESO,

      // CONDICIÓN B: El sistema debe estar vigente (Hoy <= Fecha Fin)
      // O si finalDate es null (indefinido), asumimos que sigue activo.
      [Op.or]: [
        { finalDate: { [Op.gte]: today } },
        { finalDate: null }
      ]
    },
    attributes: ['systemsId', 'name', 'createdAt', 'finalDate', 'status'], // Traemos campos útiles
    include: [
      {
        model: Progress,
        as: 'Progress',
        required: false,
        where: { isDelete: false },
        attributes: ['updatedAt', 'description', 'hasPending'],
      },
      {
        model: DependencyProjects,
        as: 'DependencyProjects',
        where: roleId !== 1 ? { userId: userId } : {},
        required: true,
        include: [
          {
            model: Projects,
            as: 'Project',
            attributes: ['name']
          },
          {
            model: Dependency,
            as: 'Dependency',
            attributes: ['name']
          }
        ]
      }
    ],
    // Ordenamos por el avance más reciente primero para facilitar el filtro posterior
    order: [[{ model: Progress, as: 'Progress' }, 'updatedAt', 'DESC']]
  });

  // 3. Filtrado de inactividad (Lógica de los 5 días)
  return systems
    .map((sys) => {
      //Tenemos el ultimo avance
      const lastProgress = sys.Progress?.[0] || null;

      // Calculamos inactividad
      const lastUpdateDate = lastProgress ? new Date(lastProgress.updatedAt) : new Date(sys.createdAt);
      const diffTime = Math.abs(new Date() - lastUpdateDate);
      const daysInactive = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let notification = null;

      // COMPROMISO (Prioridad Alta)
      // Verificamos si existe el flag
      if (lastProgress && lastProgress.hasPending) {
        if (daysInactive > 5) {
          notification = {
            type: 'error',
            title: `Compromiso Vencido: ${sys.name}`,
            subtitle: `Pendiente: ${lastProgress.description.substring(0, 50)}...`
          };
        }
      } else {
        // LÓGICA NORMAL (Inactividad - Amarillo)
        // Si no tiene compromiso, pero tampoco actividad reciente
        if (lastUpdateDate < deadlineDate) {
          notification = {
            type: 'warning', 
            title: `Sin avances recientes: ${sys.name}`,
            subtitle: `Proyecto: ${sys.DependencyProjects?.Project?.name || 'Sin asignar'}`
          };
        }
      }

      if (!notification) return null;

      // Construimos el objeto final
      return {
        id: sys.systemsId,
        title: notification.title,
        subtitle: notification.subtitle,
        date: lastUpdateDate,
        type: notification.type, // 'error' o 'warning'

        // Datos de navegación
        projectId: sys.DependencyProjects?.projectsId,
        dependencyId: sys.DependencyProjects?.dependencyId,
        dependencyName: sys.DependencyProjects?.Dependency?.name,
        projectName: sys.DependencyProjects?.Project?.name
      };
    })
    .filter(n => n !== null);
};

const createDependencyService = async (name, path, ip, userId) => {
  return sequelize.transaction(async (t) => {

    const existingDependency = await Dependency.findOne({
      where: { name: { [Op.iLike]: name } },
      transaction: t
    });

    if (existingDependency) {
      throw new ErrorResponse('Ya existe una dependencia con este nombre: ', 400);
    }

    //Creamos una dependencia
    const newDependency = await Dependency.create(
      { name },
      { transaction: t }
    );

    //Registramos la accion en el log de usuarios
    await logUserAction({
      userId,
      ip,
      action: UserLogActions.CREATE_DEPENDENCY,
      url: path,
      transaction: t
    });

    return { dependency: newDependency };
  })
}

const updateDependencyBudgetService = async (dependencyId, globalBudget, currency, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    // 1. Buscamos la dependencia
    const dependency = await Dependency.findOne({
      where: { dependencyId },
      transaction: t
    });

    if (!dependency) throw new ErrorResponse("La dependencia no existe", 404);

    // 2. Actualizamos su bolsa principal
    await dependency.update({ globalBudget, currency}, { transaction: t });

    // 3. Registramos la acción 
    await logUserAction({
      userId,
      ip,
      action: UserLogActions.UPDATE_DEPENDENCY,
      url: path,
      transaction: t
    });

    return { dependency };
  });
};

const addProgressEvidenceService = async (progressId, files, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const progress = await Progress.findOne({ where: { progressId, isDelete: false }, transaction: t });
    if (!progress) throw new Error("El avance no existe");

    const filesArray = files || [];
    const createdEvidences = [];

    if (filesArray.length > 0) {
      for (const file of filesArray) {
        const azureInfo = await uploadFileToAzure(file);
        
        const newEvidence = await ProgressEvidence.create({
          fileName: azureInfo.fileName,
          url: azureInfo.url,
          blobName: azureInfo.blobName,
          mimeType: azureInfo.mimetype,
          progressId: progress.progressId
        }, { transaction: t });
        
        createdEvidences.push(newEvidence);
      }
    }

    await logUserAction({
      userId, ip, url: path, action: UserLogActions.UPDATE_PROGRESS_DESCRIPTION, transaction: t // Usamos esta acción genérica de actualización
    });

    return { evidences: createdEvidences };
  });
};

const deleteProgressEvidenceService = async (evidenceId, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const evidence = await ProgressEvidence.findOne({ where: { evidenceId }, transaction: t });
    if (!evidence) throw new Error("La evidencia no existe");

    // Borramos de Azure primero
    await deleteFileFromAzure(evidence.blobName);

    // Borramos de la Base de Datos
    await evidence.destroy({ transaction: t });

    await logUserAction({
      userId, ip, url: path, action: UserLogActions.UPDATE_PROGRESS_DESCRIPTION, transaction: t
    });

    return { success: true, evidenceId };
  });
};

const toggleSystemAlertService = async (systemsId, hasAlert, path, ip, userId) => {
  return sequelize.transaction(async (t) => {
    const system = await Systems.findOne({
      where: { systemsId, isDelete: false },
      transaction: t
    });

    if (!system) throw new Error("El sistema solicitado no existe");

    await system.update({ hasAlert }, { transaction: t });

    await logUserAction({
      userId, ip, action: UserLogActions.UPDATE_SYSTEM_STATUS, url: path, transaction: t
    });

    return { system };
  });
};


module.exports = {
  getAllDependencyService,
  getAllProjectsService,
  getAllDependenciesForProjectsService,
  postProjectsForDependenciesService,
  deleteProjectsForDependenciesService,
  getAllSystemsForProjectsService,
  getSystemsSummaryService,
  updateProjectBudgetService,
  updateProjectDatesService,
  addSystemForProjectService,
  deleteSystemForProjectService,
  updateSystemsDescriptionService,
  updateSystemsDatesService,
  getAllProgressForSystemsService,
  postAddProgressForSystemsService,
  updateProgressDescriptionService,
  deleteProgressForSystemsService,
  updateSystemStatusService,
  getStaleProjectsNotificationService,
  createDependencyService,
  updateDependencyBudgetService,
  addProgressEvidenceService,
  deleteProgressEvidenceService,
  toggleSystemAlertService,
  createContractService,
  getContractsForProjectService,
  getContractCatalogService,
  updateContractService,
  associateSystemToContractService
};
