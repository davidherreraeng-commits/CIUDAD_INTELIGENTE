// src/api/cloud-authorizations.js
import axios from 'axios';

export function cloudAuthGetAll() {
  return new Promise((resolve, reject) => {
    axios.get("/cloud-authorizations/get-all")
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function cloudAuthCreate(body) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    
    // SOLUCIÓN: Agregamos el authId si existe (Esto le dice al backend que es una EDICIÓN)
    if (body.authId) {
        formData.append('authId', body.authId);
    }

    // 1. Agregamos los campos de texto
    formData.append('systemName', body.systemName);
    formData.append('description', body.description);
    formData.append('observations', body.observations || '');
    formData.append('secretaria', body.secretaria);
    
    // 2. Convertimos el array de servicios a JSON para enviarlo
    formData.append('services', JSON.stringify(body.services));

    // 3. Adjuntamos los archivos si existen
    if (body.files?.length > 0) {
      body.files.forEach((file) => {
        formData.append('files', file); 
      });
    }

    axios.post("/cloud-authorizations/create", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function cloudAuthApprove(authId) {
  return new Promise((resolve, reject) => {
    axios.put("/cloud-authorizations/approve", { authId })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function cloudAuthDeleteAttachment(attachmentId) {
  return new Promise((resolve, reject) => {
    axios.delete("/cloud-authorizations/delete-attachment", {
      data: { attachmentId }
    })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function cloudAuthUpdateObservations(authId, observations) {
  return new Promise((resolve, reject) => {
    axios.put("/cloud-authorizations/observations", { authId, observations })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}
