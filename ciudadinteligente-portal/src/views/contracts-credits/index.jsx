import { useState } from 'react';
import { Button, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ContractsCreditsPanel from './components/ContractsCreditsPanel';

const MESES = [
  { value: 1, label: 'Enero' }, { value: 2, label: 'Febrero' }, { value: 3, label: 'Marzo' },
  { value: 4, label: 'Abril' }, { value: 5, label: 'Mayo' }, { value: 6, label: 'Junio' },
  { value: 7, label: 'Julio' }, { value: 8, label: 'Agosto' }, { value: 9, label: 'Septiembre' },
  { value: 10, label: 'Octubre' }, { value: 11, label: 'Noviembre' }, { value: 12, label: 'Diciembre' },
];

// Últimos días de cada mes de un año (considera bisiesto para febrero)
const ultimoDiaDelMes = (year, month) => new Date(year, month, 0).getDate();

const pad2 = (n) => String(n).padStart(2, '0');

export default function ContractsCreditsDashboard() {
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const anioActual = hoy.getFullYear();

  // Valores de los selects (cambian al elegir, todavía no disparan la consulta)
  const [inputMonth, setInputMonth] = useState(mesActual);
  const [inputYear, setInputYear] = useState(anioActual);

  // Valores "aplicados": solo cambian cuando se presiona Buscar
  const [appliedMonth, setAppliedMonth] = useState(mesActual);
  const [appliedYear, setAppliedYear] = useState(anioActual);
  const [lastSearchedAt, setLastSearchedAt] = useState(null);

  const hayCambiosSinAplicar = inputMonth !== appliedMonth || inputYear !== appliedYear;

  const handleBuscar = () => {
    setAppliedMonth(inputMonth);
    setAppliedYear(inputYear);
    setLastSearchedAt(new Date());
  };

  const startDate = `${appliedYear}-${pad2(appliedMonth)}-01`;
  const endDate = `${appliedYear}-${pad2(appliedMonth)}-${pad2(ultimoDiaDelMes(appliedYear, appliedMonth))}`;

  const anios = Array.from({ length: 6 }, (_, i) => anioActual - 4 + i); // 4 años atrás + actual + 1 adelante

  return (
    <div style={{ padding: '30px', backgroundColor: '#f4f7fa', minHeight: '100vh', width: '100%' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
        <div>
          <p style={{ color: '#666', margin: 0 }}>
            Consumo y créditos disponibles de cada contrato Azure, filtrado por mes
          </p>
        </div>

        {/* FILTRO MES / AÑO */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ display: 'flex', gap: '15px', alignItems: 'center', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <FormControl size="small" style={{ minWidth: '140px' }}>
              <InputLabel id="mes-label">Mes</InputLabel>
              <Select labelId="mes-label" label="Mes" value={inputMonth} onChange={(e) => setInputMonth(e.target.value)}>
                {MESES.map((m) => (
                  <MenuItem key={m.value} value={m.value}>{m.label}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" style={{ minWidth: '110px' }}>
              <InputLabel id="anio-label">Año</InputLabel>
              <Select labelId="anio-label" label="Año" value={inputYear} onChange={(e) => setInputYear(e.target.value)}>
                {anios.map((a) => (
                  <MenuItem key={a} value={a}>{a}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<SearchIcon />}
              onClick={handleBuscar}
              color={hayCambiosSinAplicar ? 'warning' : 'primary'}
            >
              Buscar
            </Button>
          </div>
          <div style={{ fontSize: '12px', color: '#888', textAlign: 'right' }}>
            {hayCambiosSinAplicar
              ? 'Cambiaste el periodo — presiona Buscar para actualizar'
              : lastSearchedAt
                ? `Última búsqueda: ${lastSearchedAt.toLocaleTimeString('es-CO')}`
                : ''}
          </div>
        </div>
      </div>

      <ContractsCreditsPanel startDate={startDate} endDate={endDate} month={appliedMonth} year={appliedYear} />
    </div>
  );
}
