import axios from 'axios';

export function inventoryGetAll() {
  return new Promise((resolve, reject) => {
    axios.get('/inventory/get-all')
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}
