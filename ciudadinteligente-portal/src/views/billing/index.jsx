import { useState, useEffect } from 'react';
import { getBillingSummary } from '../../api/report';
import { formatMoney } from '../../utils/formatMoney';
import { Button, ButtonGroup, TextField } from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#ff6384', '#36a2eb', '#4bc0c0', '#9966ff', '#ff9f40'];

export default function BillingDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSecretaria, setSelectedSecretaria] = useState(null);
  const [bolsaActiva, setBolsaActiva] = useState('Todas');

  // ESTADOS DEL CALENDARIO (Por defecto, mes actual)
  const hoy = new Date();
  const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString().split('T')[0];
  const diaActual = hoy.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(primerDiaMes);
  const [endDate, setEndDate] = useState(diaActual);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getBillingSummary(startDate, endDate);
        if (result.success && result.data) setData(result.data);
      } catch (error) {
        console.error("Error al obtener datos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [startDate, endDate]); // Si cambian las fechas, volvemos a llamar a la API

  const handleCambioFiltro = (valor) => {
    setBolsaActiva(valor);
    setSelectedSecretaria(null);
  };

  if (loading && data.length === 0) return <div style={{ padding: '50px', textAlign: 'center' }}>Cargando datos en vivo...</div>;

  // 1. FILTRAR POR BOLSA
  const dataFiltrada = data.filter(d => bolsaActiva === 'Todas' || d.bolsaOrigen === bolsaActiva);

  // 2. CÁLCULO DE LA TORTA
  const costBySecretariaMap = dataFiltrada.reduce((acc, curr) => {
    const cost = Number.parseFloat(curr.totalCost);
    const name = curr.resourceGroupName || 'Otras Dependencias';
    acc[name] = (acc[name] || 0) + cost;
    return acc;
  }, {});

  const labelsTorta = Object.keys(costBySecretariaMap);
  const valoresTorta = Object.values(costBySecretariaMap);

  const pieData = {
    labels: labelsTorta,
    datasets: [{
      data: valoresTorta,
      backgroundColor: COLORS,
      borderWidth: 2,
      hoverOffset: 10,
    }],
  };

  // 3. CÁLCULO DE BARRAS 
  const dataToBar = selectedSecretaria
    ? dataFiltrada.filter(d => (d.resourceGroupName || 'Otras Dependencias') === selectedSecretaria)
    : dataFiltrada;

  // 👇 ESTE ES EL BLOQUE QUE SE HABÍA BORRADO POR ACCIDENTE 👇
  const costByServiceMap = dataToBar.reduce((acc, curr) => {
    acc[curr.serviceName] = (acc[curr.serviceName] || 0) + Number.parseFloat(curr.totalCost);
    return acc;
  }, {});
  // 👆 ======================================================= 👆

  // --- NUEVO: CÁLCULO PARA TABLA DE AUDITORÍA ---
  const resourceBreakdown = dataToBar.reduce((acc, curr) => {
    const sub = curr.realSubscriptionName || 'Sin Subscripción';
    const rg = curr.realResourceGroupName || 'Sin Grupo';
    const key = `${sub} | ${rg}`;

    acc[key] = (acc[key] || 0) + Number.parseFloat(curr.totalCost);
    return acc;
  }, {});

  const sortedBreakdown = Object.entries(resourceBreakdown).sort((a, b) => b[1] - a[1]);
  // ----------------------------------------------

  const sortedServices = Object.entries(costByServiceMap)
    .map(([name, cost]) => ({ name, cost }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  const barData = {
    labels: sortedServices.map(item => item.name),
    datasets: [{
      label: 'Costo (USD)',
      data: sortedServices.map(item => item.cost),
      backgroundColor: selectedSecretaria ? '#FF8042' : '#3366cc',
      borderRadius: 5
    }],
  };

  const currentTotal = dataToBar.reduce((acc, curr) => acc + Number.parseFloat(curr.totalCost), 0);

  return (
    <div style={{ padding: '30px', backgroundColor: '#f4f7fa', minHeight: '100vh', width: '100%' }}>

      {/* FILTROS: BOLSA Y CALENDARIO */}
      <div style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>

        <ButtonGroup variant="contained" sx={{ boxShadow: 2 }}>
          <Button color={bolsaActiva === 'Todas' ? 'primary' : 'inherit'} onClick={() => handleCambioFiltro('Todas')} startIcon={<AccountBalanceWalletIcon />}>
            Consolidado Global
          </Button>
          <Button color={bolsaActiva === 'Subinnovaciondigital' ? 'primary' : 'inherit'} onClick={() => handleCambioFiltro('Subinnovaciondigital')}>
            CONTRATO # 4600105301
          </Button>
          <Button color={bolsaActiva === 'SubInnovacionDigital_Suscripciones' ? 'primary' : 'inherit'} onClick={() => handleCambioFiltro('SubInnovacionDigital_Suscripciones')}>
            CONTRATO # 4600105602
          </Button>
        </ButtonGroup>

        {/* CALENDARIO DE RANGOS */}
        <div style={{ display: 'flex', gap: '15px', backgroundColor: '#fff', padding: '10px 20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <TextField type="date" label="Desde" value={startDate} onChange={e => setStartDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} size="small" />
          <TextField type="date" label="Hasta" value={endDate} onChange={e => setEndDate(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} size="small" />
        </div>
      </div>

      {/* HEADER DINÁMICO */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: '30px', backgroundColor: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#1a1a1a', margin: 0 }}>Facturación Cloud</h1>
          <p style={{ color: '#666', marginTop: '5px', marginBottom: 0 }}>Analizando: {bolsaActiva === 'Todas' ? 'Todas las Bolsas' : bolsaActiva}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span style={{ fontSize: '14px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Inversión del Periodo</span>
          <h2 style={{ fontSize: '32px', color: selectedSecretaria ? '#FF8042' : '#3366cc', margin: 0, fontWeight: '900' }}>{formatMoney(currentTotal, 'USD')}</h2>
        </div>
      </div>

      {/* AVISO DE FILTRO CLARO Y VISIBLE */}
      {selectedSecretaria && (
        <div style={{ backgroundColor: '#fff3e0', borderLeft: '5px solid #ff9800', padding: '15px 20px', borderRadius: '8px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '16px', color: '#e65100' }}>
            Viendo únicamente los gastos de la suscripción: <strong>{selectedSecretaria}</strong>
          </span>
          <Button variant="contained" color="warning" onClick={() => setSelectedSecretaria(null)}>
            ✖ Quitar Filtro y Ver Todo
          </Button>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px' }}>

        {/* GRÁFICA DE TORTA CON LISTA LATERAL */}
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '700', borderLeft: '4px solid #0088FE', paddingLeft: '10px' }}>Distribución por Suscripción</h2>

          <div style={{ display: 'flex', height: '350px', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              {/* Ocultamos la leyenda por defecto de Chart.js */}
              <Pie data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
            </div>

            {/* NUEVA LEYENDA INTERACTIVA (Lista a la derecha) */}
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '10px' }}>
              {labelsTorta.map((name, i) => (
                <div
                  key={name}
                  onClick={() => setSelectedSecretaria(name === selectedSecretaria ? null : name)}
                  style={{
                    padding: '10px',
                    marginBottom: '8px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    backgroundColor: name === selectedSecretaria ? '#e0f7fa' : '#f8f9fa',
                    borderLeft: `5px solid ${COLORS[i % COLORS.length]}`,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                    boxShadow: name === selectedSecretaria ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                  }}
                >
                  <span style={{ fontSize: '12px', fontWeight: name === selectedSecretaria ? 'bold' : '500', color: '#333' }}>
                    {name.length > 25 ? `${name.substring(0, 25)}...` : name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* GRÁFICA DE BARRAS */}
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '700', borderLeft: `4px solid ${selectedSecretaria ? '#FF8042' : '#00C49F'}`, paddingLeft: '10px' }}>Top Servicios Consumidos</h2>
          <div style={{ height: '350px' }}>
            <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false, indexAxis: 'y', plugins: { legend: { display: false } } }} />
          </div>
        </div>

      </div>

      {/* NUEVO: DESGLOSE DETALLADO (AUDITORÍA) */}
      {selectedSecretaria && (
        <div style={{ marginTop: '25px', backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', fontWeight: '700', borderLeft: '4px solid #9c27b0', paddingLeft: '10px' }}>
            Desglose de Recursos en Azure (Auditoría)
          </h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ backgroundColor: '#f4f7fa', borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '12px' }}>Suscripción Real</th>
                  <th style={{ padding: '12px' }}>Grupo de Recursos</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>Costo (USD)</th>
                </tr>
              </thead>
              <tbody>
                {sortedBreakdown.map(([key, cost]) => {
                  const [sub, rg] = key.split(' | ');
                  return (
                    <tr key={key} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '12px', color: '#555', fontWeight: '500' }}>{sub}</td>
                      <td style={{ padding: '12px', color: '#666', fontFamily: 'monospace' }}>{rg}</td>
                      <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>{formatMoney(cost, 'USD')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}