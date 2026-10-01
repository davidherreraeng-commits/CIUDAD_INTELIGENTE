const transformDependencies = (dependencies, totalsByDependencyId = {}) => {
  return dependencies.map(dep => {
    const { Projects, ...obj } = dep.get({ plain: true });

    const distributedBudget = Projects.reduce((acc, project) => {
      const budget = parseInt(project.tbl_dependency_projects?.budget || 0, 10);
      return acc + (isNaN(budget) ? 0 : budget);
    }, 0);

    const globalBudget = parseInt(obj.globalBudget || 0, 10);

    const availableBudget = globalBudget - distributedBudget;

    // totalProjects debe ser el total real (sin filtros aplicados al include de Projects)
    const dependencyId = obj.dependencyId ?? obj.id ?? obj.dependency_id;
    const totalProjects =
      (dependencyId != null && totalsByDependencyId[dependencyId] != null)
        ? totalsByDependencyId[dependencyId]
        : Projects.length;

    return {
      ...obj,
      globalBudget,
      distributedBudget,
      availableBudget,
      totalProjects,
    };
  });
};

module.exports = { transformDependencies };