import axios from 'axios';

export function projectsGetAllDependency(filters) {
  return new Promise((resolve, reject) => {
    axios.get("/projects/get-dependencies", { params: filters })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsGetAllDependencies() {
  return new Promise((resolve, reject) => {
    axios.get("/projects/get-dependencies")
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsGetAllProjectsForDependencies(filters) {
  return new Promise((resolve, reject) => {
    axios.get("/projects/get-projects-dependencies", { params: filters })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsGetAllSystemsForProjects(filters) {
  return new Promise((resolve, reject) => {
    axios.get("/projects/get-systems-projects", { params: filters })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsGetSystemsSummary(filters) {
  return new Promise((resolve, reject) => {
    axios.get('/projects/get-systems-summary', { params: filters })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsUpdateBudgetDependency(budge) {
  return new Promise((resolve, reject) => {
    axios.put("/projects/dependencies-budget", budge)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsAddNewProjectForDependency(body) {
  return new Promise((resolve, reject) => {
    axios.post("/projects/projects-dependencies", body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsDeleteProjectForDependency(body) {
  return new Promise((resolve, reject) => {
    axios.delete("/projects/projects-dependencies", { data: body })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsGetAll() {
  return new Promise((resolve, reject) => {
    axios.get("/projects/get-projects")
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsUpdateDates(body) {
  return new Promise((resolve, reject) => {
    axios.put("/projects/update-dates", body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsUpdateSystemsDates(body) {
  return new Promise((resolve, reject) => {
    axios.put("/projects/update-systems-dates", body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsUpdateSystemsDescription(body) {
  return new Promise((resolve, reject) => {
    axios.put("/projects/update-systems-description", body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsUpdateBudgetProject(body) {
  return new Promise((resolve, reject) => {
    axios.put("/projects/update-budget-project", body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsAddNewSystemForProject(body) {
  return new Promise((resolve, reject) => {
    axios.post("/projects/add-system-project", body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsDeleteSystemForProject(body) {
  return new Promise((resolve, reject) => {
    axios.delete("/projects/delete-system-project", { data: body })
      .then(res => resolve(res.data))
      .catch(err => reject(err));
  });
}

export function projectsDeleteProgressForSystem(body) {
  return new Promise((resolve, reject) => {
    axios.delete("/projects/delete-progress-system", { data: body })
      .then(res => resolve(res.data))
      .catch(err => reject(err));
  });
}

export function projectsGetProgressForSystem(filters) {
  return new Promise((resolve, reject) => {
    axios.get("/projects/get-progress-system", { params: filters })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsCreateProgress(body) {
  return new Promise((resolve, reject) => {
    
    // 1. Creamos el "FormData" (La caja de envío especial para archivos)
    const formData = new FormData();

    // 2. Pasamos los datos normales del body a la caja
    formData.append('systemsId', body.systemsId);
    if (body.idContractSystem) {
      formData.append('idContractSystem', body.idContractSystem);
    }
    formData.append('year', body.year);
    formData.append('month', body.month);
    formData.append('name', body.name);
    formData.append('description', body.description || '');
    formData.append('hasPending', body.hasPending || false);

    // Asumimos que en el 'body' viene un array llamado 'files'
    if (body.files?.length > 0) {
      body.files.forEach((file) => {
        // 'files' es el nombre que pusimos en el backend (upload.array('files'))
        formData.append('files', file); 
      });
    }

    // 4. Hacemos el POST indicando que es multipart/form-data
    axios.post("/projects/create-progress", formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsUpdateProgressDescription(body) {
  return new Promise((resolve, reject) => {
    axios.put("/projects/update-progress-description", body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsUpdateSystemStatus(body) {
  return new Promise((resolve, reject) => {
    axios.put("/projects/system-status", body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsGetStaleNotifications(){
  return new Promise((resolve, reject) => {
    axios.get('/projects/notifications/stale')
    .then(response => resolve(response.data))
    .catch(err => reject(err));
  })
}

export function projectsCreateDependency (body){
  return new Promise((resolve, reject) => {
    axios.post('/projects/create-dependency', body)
    .then(response => resolve(response.data))
    .catch(err => reject(err))
  })
}

export const projectsAddEvidence = (data) => 
  axios.post('/projects/add-evidence', data, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

export const projectsDeleteEvidence = (data) => 
  axios.delete('/projects/delete-evidence', { data });


export const projectsToggleSystemAlert = (data) => axios.put('/projects/system-alert', data);

export function projectsCreateContract(body) {
  return new Promise((resolve, reject) => {
    axios.post('/projects/contracts', body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsGetContracts(idRelation) {
  return new Promise((resolve, reject) => {
    axios.get('/projects/contracts', { params: { idRelation } })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsGetContractCatalog(idRelation) {
  return new Promise((resolve, reject) => {
    axios.get('/projects/contracts/catalog', { params: { idRelation } })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsUpdateContract(idContract, body) {
  return new Promise((resolve, reject) => {
    axios.put(`/projects/contracts/${idContract}`, body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function projectsAssociateSystemToContract(idContract, body) {
  return new Promise((resolve, reject) => {
    axios.post(`/projects/contracts/${idContract}/systems`, body)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}
