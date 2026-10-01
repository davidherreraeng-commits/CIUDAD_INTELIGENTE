import { useEffect, useState } from "react";
import { projectsGetAll } from "../api/projects";

// hooks/useProjectsList.js
export const useProjectsList = (errorAlert) => {
  const [projectsList, setProjectsList] = useState(null);

  useEffect(() => {
    if (projectsList) return;
    projectsGetAll()
      .then((res) => { setProjectsList(res.data.projects); })
      .catch((err) => { errorAlert("No se pudo consultar los proyectos", err) });
  }, [projectsList, errorAlert]);

  return { projectsList, setProjectsList };
};