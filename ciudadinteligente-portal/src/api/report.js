import axios from 'axios';

export function reportExportData (filters) {
  return new Promise((resolve, reject) => {
    axios.get("/report/get-all", { params: filters, responseType: "blob" })
      .then(response => resolve(response.data))
      .catch(err => reject(err));
  });
}

export function reportGetAvailableDates (dependency) {
  return new Promise((resolve, reject) => {
    axios.get("/report/get-available-dates", dependency)
      .then(response => resolve(response))
      .catch(err => reject(err));
  });
}

export const getBillingSummary = async (startDate, endDate) => {
  const response = await axios.get('/reports/billing-summary', {
    params: {
      startDate: startDate,
      endDate: endDate
    }
  });
  return response.data;
};

// Cache en memoria del navegador (vive mientras dure la pestaña/SPA sin
// recargar). El endpoint de créditos por contrato consulta la Balances API
// real de Azure cada vez que se llama, así que puede tardar. Esta caché
// evita repetir la consulta mientras el usuario navega entre menús con el
// mismo periodo; solo se vuelve a pedir si cambia el periodo o si se
// recarga la página (F5 reinicia este módulo y borra la caché).
const contractsCreditsCache = new Map();

export const getContractsCreditsSummary = async (startDate, endDate) => {
  const cacheKey = `${startDate}|${endDate}`;

  if (contractsCreditsCache.has(cacheKey)) {
    return contractsCreditsCache.get(cacheKey);
  }

  const requestPromise = axios.get('/reports/contracts-credits', {
    params: {
      startDate: startDate,
      endDate: endDate
    }
  })
    .then(response => response.data)
    .catch(err => {
      // Si falla, no dejamos el error cacheado: que el próximo intento
      // vuelva a pedirlo.
      contractsCreditsCache.delete(cacheKey);
      throw err;
    });

  contractsCreditsCache.set(cacheKey, requestPromise);
  return requestPromise;
};

const contractsCreditsTrendCache = new Map();

export const getContractsCreditsTrend = async (month, year, months = 6) => {
  const cacheKey = `${year}-${month}-${months}`;

  if (contractsCreditsTrendCache.has(cacheKey)) {
    return contractsCreditsTrendCache.get(cacheKey);
  }

  const requestPromise = axios.get('/reports/contracts-credits-trend', {
    params: { month, year, months }
  })
    .then(response => response.data)
    .catch(err => {
      contractsCreditsTrendCache.delete(cacheKey);
      throw err;
    });

  contractsCreditsTrendCache.set(cacheKey, requestPromise);
  return requestPromise;
};