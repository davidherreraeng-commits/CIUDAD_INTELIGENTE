const decodeFilters = (filters) => {
  const decoded = {};
  for (const key in filters) {
    if (filters[key] !== undefined && filters[key] !== null) {
      decoded[key] = decodeURIComponent(filters[key]);
    }
  }
  return decoded;
};

module.exports = { decodeFilters };