import axios from 'axios';

export function rolesGetAll () {
  return new Promise((resolve, reject) => {
    axios.get("/roles/getAll")
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}