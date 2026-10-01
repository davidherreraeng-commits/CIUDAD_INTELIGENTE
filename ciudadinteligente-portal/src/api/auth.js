import axios from 'axios';

export function authLogin (dataLogin) {
  return new Promise((resolve, reject) => {
    axios.post("/auth/login", dataLogin)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function authLogout (userId) {
  return new Promise((resolve, reject) => {
    axios.post("/auth/logout", { userId: userId })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  })
}

export function authResetPassword (username) {
  return new Promise((resolve, reject) => {
    axios.post("/auth/reset-password", username)
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  })
}
