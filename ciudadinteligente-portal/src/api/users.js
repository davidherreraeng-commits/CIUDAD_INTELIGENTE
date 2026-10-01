import axios from 'axios';

export function usersGetAll (filters) {
  return new Promise((resolve, reject) => {
    axios.get("/users/getAll", { params: filters })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function usersCreate (dataForm) {
  return new Promise((resolve, reject) => {
    axios.post("/users/create", dataForm)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function usersUpdate (dataForm) {
  return new Promise((resolve, reject) => {
    axios.put("/users/update", dataForm)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function usersDelete (dataForm) {
  return new Promise((resolve, reject) => {
    axios.delete("/users/delete", { data: dataForm })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function updatePassword (data) {
  return new Promise((resolve, reject) => {
    axios.put("/users/update-password", data)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}
