import { useState, useEffect } from 'react';
import { CircularProgress, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import OpenInFullIcon from '@mui/icons-material/OpenInFull';
import { getContractsCreditsSummary, getContractsCreditsTrend } from '../../../api/report';
import { formatMoney } from '../../../utils/formatMoney';

import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

// Los montos de la Balances API vienen con centavos (ej. 1000.99) — nunca
// redondear a entero, a diferencia de otras vistas de la app.
const money = (value) => (value === null || value === undefined ? 'No disponible' : formatMoney(value, 'USD', 2));

/**
 * Tarjeta de resumen clicable: al hacer clic o presionar Enter/Espacio,
 * abre en un popup la gráfica relacionada, ampliada.
 */
function SummaryCard({ onClick, children }) {
  const [hover, setHover] = useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        backgroundColor: '#fff',
        padding: '20px',
        borderRadius: '12px',
        boxShadow: hover ? '0 10px 20px rgba(0,0,0,0.12)' : '0 4px 6px rgba(0,0,0,0.05)',
        transform: hover ? 'translateY(-3px)' : 'translateY(0)',
        transition: 'all 0.2s ease-in-out',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <OpenInFullIcon
        sx={{
          position: 'absolute',
          top: '14px',
          right: '14px',
          fontSize: '16px',
          color: hover ? '#3366cc' : '#ccc',
          transition: 'color 0.2s ease-in-out',
        }}
      />
      {children}
    </div>
  );
}

/**
 * Panel de consumo y créditos disponibles por contrato Azure.
 *
 * TODO sale de la Balances API real de Azure (Microsoft.Consumption/balances)
 * — nada de CSV del blob ni aproximaciones. Requiere AZURE_TENANT_ID/
 * AZURE_CLIENT_ID/AZURE_CLIENT_SECRET con rol EnrollmentReader (ver
 * "Paso a paso - App Registration balance Azure.md"). Si la llamada falla
 * para un contrato, todos sus campos quedan en null y `errorBalancesApi`
 * trae el motivo exacto — no se muestra ningún número inventado.
 */
export default function ContractsCreditsPanel({ startDate, endDate, month, year }) {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [trend, setTrend] = useState(null);
  const [trendError, setTrendError] = useState(null);
  const [loadingTrend, setLoadingTrend] = useState(true);

  // 'consumo' | 'creditos' | 'nuevos' | null — controla el popup con la
  // gráfica ampliada al hacer clic en una tarjeta resumen.
  const [expandedChart, setExpandedChart] = useState(null);

  useEffect(() => {
    if (!startDate || !endDate) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getContractsCreditsSummary(startDate, endDate)
      .then((result) => {
        if (cancelled) return;
        if (result.success) setSummary(result.data);
        else setError(result.error || 'No se pudo obtener el resumen de contratos');
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Error al consultar créditos por contrato');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, [startDate, endDate]);

  useEffect(() => {
    if (!month || !year) return;

    let cancelled = false;
    setTrendError(null);
    setLoadingTrend(true);

    getContractsCreditsTrend(month, year, 6)
      .then((result) => {
        if (cancelled) return;
        if (result.success) setTrend(result.data);
        else setTrendError(result.error || 'No se pudo obtener la tendencia');
      })
      .catch((err) => {
        if (!cancelled) setTrendError(err.message || 'Error al consultar la tendencia');
      })
      .finally(() => {
        if (!cancelled) setLoadingTrend(false);
      });

    return () => { cancelled = true; };
  }, [month, year]);

  if (loading && !summary) {
    return <div style={{ padding: '30px', textAlign: 'center', color: '#888' }}>Consultando...</div>;
  }

  if (error) {
    return (
      <div style={{ backgroundColor: '#fdecea', color: '#b71c1c', padding: '20px', borderRadius: '8px' }}>
        Error al cargar créditos por contrato: {error}
      </div>
    );
  }

  if (!summary) return null;

  const { contratos, totales, periodoAnterior, periodo } = summary;

  const donutConsumoData = {
    labels: contratos.map((c) => `Contrato ${c.numeroContrato}${c.porcentajeParticipacion !== null ? ` (${c.porcentajeParticipacion.toFixed(1)}%)` : ''}`),
    datasets: [{
      data: contratos.map((c) => c.consumoPeriodo ?? 0),
      backgroundColor: COLORS,
      borderWidth: 2,
    }],
  };

  const comparativoPeriodosData = {
    labels: [...contratos.map((c) => `C. ${c.numeroContrato}`), 'Total'],
    datasets: [
      {
        label: `Periodo anterior (${periodoAnterior.dias}d)`,
        data: [...contratos.map((c) => c.consumoPeriodoAnterior), periodoAnterior.consumoTotal],
        backgroundColor: '#B0BEC5',
        borderRadius: 5,
      },
      {
        label: `Periodo actual (${periodo.dias}d)`,
        data: [...contratos.map((c) => c.consumoPeriodo), totales.consumoPeriodo],
        backgroundColor: '#3366cc',
        borderRadius: 5,
      },
    ],
  };

  const tendenciaData = trend && trend.meses && trend.meses.length > 0 ? {
    labels: trend.meses.map((m) => m.label),
    datasets: [
      ...trend.contratos.map((c, i) => ({
        label: `Contrato ${c.numeroContrato}`,
        data: c.valores,
        borderColor: COLORS[i % COLORS.length],
        backgroundColor: COLORS[i % COLORS.length],
        tension: 0.3,
      })),
      {
        label: 'Total',
        data: trend.meses.map((m) => m.consumoTotal),
        borderColor: '#1a1a1a',
        backgroundColor: '#1a1a1a',
        borderWidth: 3,
        pointStyle: 'rectRot',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.3,
      },
    ],
  } : null;

  const nuevosAjustesData = {
    labels: contratos.map((c) => `C. ${c.numeroContrato}`),
    datasets: [
      {
        label: 'Nuevos créditos',
        data: contratos.map((c) => c.nuevosCreditos ?? 0),
        backgroundColor: '#2e7d32',
        borderRadius: 5,
      },
      {
        label: 'Ajustes',
        data: contratos.map((c) => c.ajustes ?? 0),
        backgroundColor: '#c62828',
        borderRadius: 5,
      },
    ],
  };

  // Contenido de "Estado de Créditos por Contrato" — se reutiliza tanto en
  // la tarjeta normal como en el popup ampliado.
  const renderEstadoCreditos = ({ barHeight = '14px', gap = '22px' } = {}) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap, justifyContent: 'center' }}>
      {contratos.map((c, i) => {
        // Todo sale del mismo ledger real (Balances API) para que el
        // porcentaje sea coherente: % disponible = cuánto queda del
        // saldo que había al inicio del periodo.
        const disponible = c.creditosDisponiblesFin;
        const inicio = c.creditosDisponiblesInicio;
        const porcentajeDisponible = inicio && inicio > 0 && disponible !== null
          ? Math.min((disponible / inicio) * 100, 100)
          : null;
        const porcentajeGastado = porcentajeDisponible === null ? null : 100 - porcentajeDisponible;

        return (
          <div key={c.numeroContrato}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
              <span style={{ fontWeight: 'bold', color: COLORS[i % COLORS.length] }}>Contrato {c.numeroContrato}</span>
              <span style={{ color: '#888' }}>
                Consumido en el periodo: {money(c.consumoPeriodo)} &nbsp;|&nbsp; Disponible: {money(disponible)}
              </span>
            </div>
            <div style={{ fontSize: '11px', color: '#aaa', marginBottom: '4px' }}>
              100% = {money(inicio)} (saldo disponible al inicio del periodo)
            </div>
            <div style={{ display: 'flex', height: barHeight, borderRadius: '6px', backgroundColor: '#eee', overflow: 'hidden' }}>
              {porcentajeGastado !== null && (
                <div
                  title={`${porcentajeGastado.toFixed(1)}% gastado`}
                  style={{
                    height: '100%',
                    width: `${porcentajeGastado}%`,
                    backgroundColor: '#E0E0E0',
                  }}
                />
              )}
              <div
                title={porcentajeDisponible === null ? undefined : `${porcentajeDisponible.toFixed(1)}% disponible`}
                style={{
                  height: '100%',
                  width: porcentajeDisponible === null ? '0%' : `${porcentajeDisponible}%`,
                  backgroundColor: '#00C49F',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#aaa', marginTop: '4px' }}>
              <span>{porcentajeGastado === null ? '' : `${porcentajeGastado.toFixed(1)}% gastado`}</span>
              <span>{porcentajeDisponible === null ? 'Sin dato de créditos' : `${porcentajeDisponible.toFixed(1)}% disponible`}</span>
            </div>
          </div>
        );
      })}
    </div>
  );

  const variacionTexto = totales.variacionPorcentual === null
    ? 'Sin dato comparable'
    : `${totales.variacionPorcentual >= 0 ? '+' : ''}${totales.variacionPorcentual.toFixed(1)}% (${money(totales.variacionAbsoluta)}) vs ${periodoAnterior.dias} días anteriores`;

  const todosReales = contratos.every((c) => c.fuenteCreditos === 'balances-api');
  const tituloCreditos = todosReales
    ? 'Créditos Disponibles'
    : 'Créditos Disponibles — falló para 1 o más contratos';

  const fuenteBadge = (fuente) => (
    <span
      style={{
        fontSize: '11px',
        fontWeight: 'bold',
        padding: '2px 8px',
        borderRadius: '10px',
        color: fuente === 'balances-api' ? '#1b5e20' : '#b71c1c',
        backgroundColor: fuente === 'balances-api' ? '#e6f4ea' : '#fdecea',
      }}
    >
      {fuente === 'balances-api' ? 'Real' : 'Error'}
    </span>
  );

  return (
    <div style={{ position: 'relative' }}>
      {/* OVERLAY: se muestra mientras se recarga con un mes/año nuevo, sin
          borrar de golpe los datos del mes anterior (evita el salto/parpadeo
          y dice claramente que hay una búsqueda en curso). */}
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(255,255,255,0.75)',
            zIndex: 10,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            borderRadius: '15px',
          }}
        >
          <CircularProgress size={36} />
          <div style={{ fontSize: '14px', color: '#3366cc', fontWeight: 'bold' }}>Consultando...</div>
        </div>
      )}

      {/* TARJETAS RESUMEN */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '25px' }}>
        <SummaryCard onClick={() => setExpandedChart('consumo')}>
          <div style={{ fontSize: '13px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Consumo del Periodo</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#3366cc' }}>{money(totales.consumoPeriodo)}</div>
          <div style={{ fontSize: '13px', color: totales.variacionAbsoluta > 0 ? '#c62828' : '#2e7d32', marginTop: '5px' }}>
            {variacionTexto}
          </div>
        </SummaryCard>

        <SummaryCard onClick={() => setExpandedChart('creditos')}>
          <div style={{ fontSize: '13px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>{tituloCreditos}</div>
          <div style={{ fontSize: '28px', fontWeight: '900', color: '#00C49F' }}>{money(totales.creditosDisponiblesFin)}</div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '5px' }}>
            Antes del periodo: {money(totales.creditosDisponiblesInicio)}
          </div>
        </SummaryCard>

        <SummaryCard onClick={() => setExpandedChart('nuevos')}>
          <div style={{ fontSize: '13px', color: '#888', fontWeight: 'bold', textTransform: 'uppercase' }}>Nuevos Créditos / Ajustes (periodo)</div>
          <div style={{ fontSize: '20px', fontWeight: '900', color: '#1a1a1a' }}>
            {money(contratos.reduce((acc, c) => acc + (c.nuevosCreditos || 0), 0))}
            <span style={{ fontSize: '13px', color: '#888', fontWeight: 'normal' }}> nuevos</span>
          </div>
          <div style={{ fontSize: '13px', color: '#888', marginTop: '5px' }}>
            Ajustes: {money(contratos.reduce((acc, c) => acc + (c.ajustes || 0), 0))}
          </div>
        </SummaryCard>
      </div>

      {/* TABLA */}
      <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', overflowX: 'auto', marginBottom: '25px' }}>
        <h3 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: '700' }}>Detalle por Contrato</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eee', textAlign: 'left' }}>
              <th style={{ padding: '10px' }}>Contrato</th>
              <th style={{ padding: '10px' }}>Fuente</th>
              <th style={{ padding: '10px' }}>Créditos Inicio</th>
              <th style={{ padding: '10px' }}>Nuevos Créditos</th>
              <th style={{ padding: '10px' }}>Ajustes</th>
              <th style={{ padding: '10px' }}>Consumo del Periodo</th>
              <th style={{ padding: '10px' }}>Créditos Fin</th>
              <th style={{ padding: '10px' }}>% Part.</th>
              <th style={{ padding: '10px' }}>Vencimiento</th>
            </tr>
          </thead>
          <tbody>
            {contratos.map((c) => (
              <tr key={c.numeroContrato} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{c.numeroContrato}</td>
                <td style={{ padding: '10px' }}>
                  {fuenteBadge(c.fuenteCreditos)}
                  {c.errorBalancesApi && (
                    <div style={{ fontSize: '11px', color: '#c62828', marginTop: '4px', maxWidth: '220px' }}>
                      {c.errorBalancesApi}
                    </div>
                  )}
                </td>
                <td style={{ padding: '10px' }}>{money(c.creditosDisponiblesInicio)}</td>
                <td style={{ padding: '10px', color: '#2e7d32' }}>{money(c.nuevosCreditos)}</td>
                <td style={{ padding: '10px', color: c.ajustes < 0 ? '#c62828' : '#2e7d32' }}>{money(c.ajustes)}</td>
                <td style={{ padding: '10px', fontWeight: 'bold' }}>{money(c.consumoPeriodo)}</td>
                <td style={{ padding: '10px' }}>{money(c.creditosDisponiblesFin)}</td>
                <td style={{ padding: '10px' }}>{c.porcentajeParticipacion !== null ? `${c.porcentajeParticipacion.toFixed(1)}%` : '—'}</td>
                <td style={{ padding: '10px' }}>{c.fechaVencimiento}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 'bold', borderTop: '2px solid #eee' }}>
              <td style={{ padding: '10px' }}>TOTAL</td>
              <td style={{ padding: '10px' }}>—</td>
              <td style={{ padding: '10px' }}>{money(totales.creditosDisponiblesInicio)}</td>
              <td style={{ padding: '10px' }}>{money(contratos.reduce((acc, c) => acc + (c.nuevosCreditos || 0), 0))}</td>
              <td style={{ padding: '10px' }}>{money(contratos.reduce((acc, c) => acc + (c.ajustes || 0), 0))}</td>
              <td style={{ padding: '10px' }}>{money(totales.consumoPeriodo)}</td>
              <td style={{ padding: '10px' }}>{money(totales.creditosDisponiblesFin)}</td>
              <td style={{ padding: '10px' }}>100%</td>
              <td style={{ padding: '10px' }}>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* GRÁFICAS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '25px', marginBottom: '25px' }}>
        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: '700' }}>Consumo por Contrato</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            <Doughnut data={donutConsumoData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%' }} />
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <div style={{ fontSize: '12px', color: '#888' }}>Total</div>
              <div style={{ fontSize: '18px', fontWeight: '900' }}>{money(totales.consumoPeriodo)}</div>
            </div>
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: '700' }}>Comparativo entre Periodos</h3>
          <div style={{ height: '300px' }}>
            <Bar data={comparativoPeriodosData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ fontSize: '16px', margin: 0, fontWeight: '700' }}>Estado de Créditos por Contrato</h3>
            <div style={{ display: 'flex', gap: '14px', fontSize: '11px', color: '#666' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#E0E0E0', display: 'inline-block' }} />
                Gastado
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '3px', backgroundColor: '#00C49F', display: 'inline-block' }} />
                Disponible
              </span>
            </div>
          </div>
          <div style={{ height: '280px', overflowY: 'auto' }}>
            {renderEstadoCreditos()}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <h3 style={{ fontSize: '16px', marginBottom: '15px', fontWeight: '700' }}>Evolución de los Últimos 6 Meses</h3>
          <div style={{ height: '300px', position: 'relative' }}>
            {loadingTrend && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(255,255,255,0.75)',
                  zIndex: 5,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                }}
              >
                <CircularProgress size={28} />
                <div style={{ fontSize: '13px', color: '#3366cc', fontWeight: 'bold' }}>Cargando tendencia...</div>
              </div>
            )}
            {trendError ? (
              <div style={{ color: '#c62828', fontSize: '13px', padding: '20px' }}>{trendError}</div>
            ) : tendenciaData ? (
              <Line
                data={tendenciaData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      labels: {
                        usePointStyle: true,
                        boxWidth: 8,
                        boxHeight: 8,
                      },
                    },
                  },
                }}
              />
            ) : !loadingTrend ? (
              <div style={{ color: '#888', fontSize: '13px', padding: '20px', textAlign: 'center' }}>Sin datos de tendencia</div>
            ) : null}
          </div>
        </div>
      </div>

      {/* POPUP: gráfica ampliada de la tarjeta resumen que se haya clicado */}
      <Dialog
        open={!!expandedChart}
        onClose={() => setExpandedChart(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 700 }}>
          {expandedChart === 'consumo' && 'Consumo del Periodo'}
          {expandedChart === 'creditos' && tituloCreditos}
          {expandedChart === 'nuevos' && 'Nuevos Créditos y Ajustes por Contrato'}
          <IconButton onClick={() => setExpandedChart(null)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {expandedChart === 'consumo' && (
            <>
              <div style={{ height: '340px', position: 'relative', marginBottom: '30px' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#666', marginBottom: '10px' }}>Consumo por Contrato</div>
                <div style={{ height: '300px', position: 'relative' }}>
                  <Doughnut data={donutConsumoData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%' }} />
                  <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '12px', color: '#888' }}>Total</div>
                    <div style={{ fontSize: '18px', fontWeight: '900' }}>{money(totales.consumoPeriodo)}</div>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#666', marginBottom: '10px' }}>Comparativo entre Periodos</div>
                <div style={{ height: '340px' }}>
                  <Bar data={comparativoPeriodosData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
            </>
          )}

          {expandedChart === 'creditos' && (
            <div style={{ padding: '10px 0' }}>
              {renderEstadoCreditos({ barHeight: '20px', gap: '28px' })}
            </div>
          )}

          {expandedChart === 'nuevos' && (
            <div style={{ height: '420px' }}>
              <Bar
                data={nuevosAjustesData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'top' } },
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
