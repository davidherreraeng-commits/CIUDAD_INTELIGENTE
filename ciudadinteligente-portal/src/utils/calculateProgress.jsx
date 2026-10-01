// src/utils/calculateProgress.jsx

// Mantienes tu función original por si se usa en otras partes que solo requieran el entero
export const calculateProgress = (initDate, finalDate) => {
  if (!initDate || !finalDate) return 0;
  const start = new Date(initDate);
  const end = new Date(finalDate);
  const today = new Date();
  if (today <= start) return 0;
  if (today >= end) return 100;
  const total = end - start;
  const elapsed = today - start;
  return Math.round((elapsed / total) * 100);
};

// NUEVA FUNCIÓN SOLICITADA POR TU JEFA
export const calculateExecution = (initDate, finalDate, contractValue = 0) => {
  if (!initDate || !finalDate) return { percentage: 0, executedValue: 0 };

  // Setear las horas a 00:00:00 para comparar solo fechas (días calendario)
  const start = new Date(initDate).setHours(0, 0, 0, 0);
  const end = new Date(finalDate).setHours(0, 0, 0, 0);
  const today = new Date().setHours(0, 0, 0, 0);

  // Reglas de negocio 3 y 4: Contrato no iniciado o ya finalizado
  if (today < start) return { percentage: 0, executedValue: 0 };
  if (today > end) return { percentage: 100, executedValue: contractValue };

  // Reglas de negocio 1 y 2: Cálculos de días transcurridos
  const msInDay = 24 * 60 * 60 * 1000;
  const totalDays = Math.round((end - start) / msInDay) + 1; // +1 para incluir el día actual
  const elapsedDays = Math.round((today - start) / msInDay) + 1;

  // Cálculo del porcentaje (Regla 6: máximo 2 decimales)
  let percentage = (elapsedDays / totalDays) * 100;
  percentage = Number(percentage.toFixed(2)); 

  // Regla 6: Cálculo del valor ejecutado estimado redondeado
  const executedValue = Math.round(contractValue * (percentage / 100));

  return { percentage, executedValue };
};