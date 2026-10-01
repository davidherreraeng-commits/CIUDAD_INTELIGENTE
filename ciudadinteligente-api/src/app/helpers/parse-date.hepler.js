/**
 * Convierte una fecha en Date o retorna null si es inválida.
 * Admite ISO strings, timestamps y objetos Date.
 * Evita que postgres reciba "Invalid Date"
 */

const parseDate = (value, fallback = null) => {
  if (!value) return fallback;

  const date = new Date(value);
  return isNaN(date.getTime()) ? fallback : date;
};

/**
 * Convierte una fecha como "2025-07-08 00:00:00.000 -0500"
 * a un formato legible: "08 de Julio de 2025".
 */

const readableDate = (value, fallback = null) => {
  if (!value) return fallback;

  const date = new Date(value);
  if (isNaN(date.getTime())) return fallback;

  const months = [
    "Enero","Febrero","Marzo","Abril","Mayo","Junio",
    "Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
  ];

  return `${date.getDate().toString().padStart(2, "0")} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
};

module.exports = { parseDate, readableDate };
