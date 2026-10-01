import { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box, Typography, TextField, Chip, CircularProgress,
  Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, Paper, TablePagination, Tooltip,
  Dialog, DialogTitle, DialogContent, IconButton
} from '@mui/material';
import {
  Search as SearchIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  Cancel as CancelIcon,
  Storage as StorageIcon,
  Bolt as BoltIcon,
  DataObject as DataIcon,
  EditNote as EditNoteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const HEADER_COLOR = '#003A57';

const COLUMNS = [
  { key: 'Nombre_Fuente',                  label: 'Fuente',         width: 170 },
  { key: 'Descripcion',                    label: 'Descripción',    width: 240 },
  { key: 'Dependencia',                    label: 'Dependencia',    width: 155 },
  { key: 'Subdependencia',                 label: 'Subdependencia', width: 155 },
  { key: 'Tipo de Archivo Origen',         label: 'Tipo Origen',    width: 100 },
  { key: 'Frecuencia Actualizacion',       label: 'Frecuencia',     width: 155 },
  { key: 'Tipo de Actualizacion Actual',   label: 'Actualización',  width: 120 },
  { key: 'Destino Actual',                 label: 'Destino',        width: 140 },
  { key: 'Ultima Fecha de Actualizacion',  label: 'Última Act.',    width: 130 },
  { key: 'Fuente Activa',                  label: 'Activa',         width: 80  },
];

function MetricCard({ icon, title, value, subtitle, color, bg, onClick }) {
  return (
    <Box
      onClick={onClick}
      sx={{
        backgroundColor: '#fff', border: '1px solid #e7ebf0', borderRadius: 2, p: 2,
        display: 'flex', alignItems: 'center', gap: 1.5, flex: 1, minWidth: 155,
        boxShadow: '0 3px 12px rgba(15,23,42,0.05)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s, box-shadow 0.15s',
        '&:hover': onClick ? { transform: 'translateY(-2px)', boxShadow: '0 8px 20px rgba(15,23,42,0.12)', borderColor: '#c9d3dd' } : {},
      }}
    >
      <Box sx={{ width: 48, height: 48, borderRadius: 2, backgroundColor: bg, color, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
        <Box component={icon} sx={{ fontSize: 26 }} />
      </Box>
      <Box>
        <Typography sx={{ fontWeight: 850, color: '#172033', fontSize: 15, lineHeight: 1.2, mb: 0.4 }}>{title}</Typography>
        <Typography sx={{ fontSize: 26, fontWeight: 950, color, lineHeight: 1 }}>{value}</Typography>
        <Typography sx={{ color: '#5f6b7a', fontSize: 13, mt: 0.4 }}>{subtitle}</Typography>
      </Box>
    </Box>
  );
}

function renderCell(row, col) {
  const val = row[col.key];
  if (col.key === 'Fuente Activa') {
    return val === 'SI'
      ? <Chip icon={<CheckCircleOutlineIcon />} label="Activa" size="small" sx={{ fontWeight: 800, backgroundColor: '#e8f5e9', color: '#2e7d32', '& .MuiChip-icon': { color: '#2e7d32' } }} />
      : <Chip icon={<CancelIcon />} label="Inactiva" size="small" sx={{ fontWeight: 800, backgroundColor: '#fff3e0', color: '#e57917', '& .MuiChip-icon': { color: '#e57917' } }} />;
  }
  if (col.key === 'Descripcion') {
    return (
      <Tooltip title={val || ''} placement="top" arrow>
        <span style={{ display: 'block', maxWidth: col.width, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', cursor: 'default' }}>{val || '—'}</span>
      </Tooltip>
    );
  }
  if (col.key === 'Tipo de Actualizacion Actual') {
    if (!val || val === 'Manual') return <Chip label="Manual" size="small" sx={{ fontWeight: 800, backgroundColor: '#fff3e0', color: '#e57917' }} />;
    return <Chip label="Automático" size="small" sx={{ fontWeight: 800, backgroundColor: '#e8f5e9', color: '#2e7d32' }} />;
  }
  return val || '—';
}

export default function PublicInventory() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [search, setSearch] = useState('');
  const [depFilter, setDepFilter] = useState('Todas');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);
  const [modalFilter, setModalFilter] = useState(null); // 'activas' | 'inactivas' | 'automaticas' | 'manuales'

  useEffect(() => {
    axios.get(`${import.meta.env.VITE_URL_API}/inventory/public`)
      .then(res => { if (res.data.success) setRows(res.data.data); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const dependencias = ['Todas', ...new Set(rows.map(r => r['Dependencia']).filter(Boolean))];

  const filtered = rows.filter(row => {
    const matchesDep = depFilter === 'Todas' || row['Dependencia'] === depFilter;
    const matchesSearch = COLUMNS.some(col => String(row[col.key] || '').toLowerCase().includes(search.toLowerCase()));
    return matchesDep && matchesSearch;
  });

  const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalActivas = rows.filter(r => r['Fuente Activa'] === 'SI').length;
  const totalInactivas = rows.filter(r => r['Fuente Activa'] !== 'SI').length;
  const totalAuto = rows.filter(r => r['Tipo de Actualizacion Actual'] === 'Automatico').length;
  const totalManual = rows.filter(r => !r['Tipo de Actualizacion Actual'] || r['Tipo de Actualizacion Actual'] === 'Manual').length;

  const MODAL_CONFIG = {
    activas:      { title: 'Fuentes activas',      icon: CheckCircleOutlineIcon, color: '#159857', predicate: r => r['Fuente Activa'] === 'SI' },
    inactivas:    { title: 'Fuentes inactivas',    icon: CancelIcon,             color: '#e57917', predicate: r => r['Fuente Activa'] !== 'SI' },
    automaticas:  { title: 'Fuentes automáticas',  icon: BoltIcon,               color: '#6a45c9', predicate: r => r['Tipo de Actualizacion Actual'] === 'Automatico' },
    manuales:     { title: 'Fuentes manuales',     icon: EditNoteIcon,           color: '#e57917', predicate: r => !r['Tipo de Actualizacion Actual'] || r['Tipo de Actualizacion Actual'] === 'Manual' },
  };

  const modalRows = modalFilter ? rows.filter(MODAL_CONFIG[modalFilter].predicate) : [];

  if (loading) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7fa' }}>
      <CircularProgress sx={{ color: HEADER_COLOR }} />
    </Box>
  );

  if (error) return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7fa' }}>
      <Typography sx={{ color: '#b91c1c', fontWeight: 700 }}>No se pudo cargar el inventario. Intenta más tarde.</Typography>
    </Box>
  );

  return (
    <Box sx={{ backgroundColor: '#f4f7fa', minHeight: '100vh' }}>

      {/* HEADER */}
      <Box sx={{ backgroundColor: HEADER_COLOR, px: 5, py: 2.5, display: 'flex', alignItems: 'center', gap: 2, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
        <Box sx={{ width: 44, height: 44, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', display: 'grid', placeItems: 'center' }}>
          <StorageIcon sx={{ color: '#fff', fontSize: 26 }} />
        </Box>
        <Box>
          <Typography sx={{ color: '#fff', fontWeight: 950, fontSize: 20, lineHeight: 1.2 }}>Inventario fuentes de datos agente alcalde</Typography>
          <Typography sx={{ color: 'rgba(255,255,255,0.65)', fontSize: 13, mt: 0.3 }}>Alcaldía de Medellín · Ciudad Inteligente</Typography>
        </Box>
      </Box>

      <Box sx={{ px: 5, py: 3 }}>

        {/* TOTAL INFORMATIVO */}
        <Typography sx={{ color: '#5f6b7a', fontSize: 13.5, mb: 1.5 }}>
          <Box component="span" sx={{ fontWeight: 900, color: '#172033' }}>{rows.length}</Box> fuentes de datos registradas en total
        </Typography>

        {/* MÉTRICAS */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 3 }}>
          <MetricCard icon={CheckCircleOutlineIcon} title="Activas"       value={totalActivas}   subtitle="en operación"      color="#159857" bg="#e5f7ec" onClick={() => setModalFilter('activas')} />
          <MetricCard icon={CancelIcon}             title="Inactivas"     value={totalInactivas} subtitle="sin actualización" color="#e57917" bg="#fff3dc" onClick={() => setModalFilter('inactivas')} />
          <MetricCard icon={BoltIcon}               title="Automáticas"   value={totalAuto}      subtitle="actualizaciones"   color="#6a45c9" bg="#efe8ff" onClick={() => setModalFilter('automaticas')} />
          <MetricCard icon={EditNoteIcon}           title="Manuales"      value={totalManual}    subtitle="actualizaciones"   color="#e57917" bg="#fff3dc" onClick={() => setModalFilter('manuales')} />
        </Box>

        {/* FILTRO POR DEPENDENCIA */}
        <Box sx={{ backgroundColor: '#fff', border: '1px solid #e7ebf0', borderRadius: 2, p: 2, mb: 2, boxShadow: '0 3px 12px rgba(15,23,42,0.04)' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 900, color: '#7f8c8d', textTransform: 'uppercase', mb: 1.2 }}>
            Filtrar por dependencia
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {dependencias.map(dep => (
              <Chip
                key={dep}
                label={dep}
                onClick={() => { setDepFilter(dep); setPage(0); }}
                sx={{
                  fontWeight: 800, cursor: 'pointer',
                  backgroundColor: depFilter === dep ? HEADER_COLOR : '#f1f3f6',
                  color: depFilter === dep ? '#fff' : '#34495e',
                  '&:hover': { backgroundColor: depFilter === dep ? HEADER_COLOR : '#e2e6ea' },
                  transition: 'all 0.2s',
                }}
              />
            ))}
          </Box>
        </Box>

        {/* BÚSQUEDA */}
        <Box sx={{ backgroundColor: '#fff', border: '1px solid #e7ebf0', borderRadius: 2, p: 2, mb: 2, boxShadow: '0 3px 12px rgba(15,23,42,0.04)' }}>
          <TextField
            fullWidth size="small"
            placeholder="Buscar por nombre, frecuencia, tipo de archivo..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            slotProps={{ input: { startAdornment: <SearchIcon sx={{ color: '#9ca3af', mr: 1 }} /> } }}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </Box>

        {/* TABLA */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid #e7ebf0', boxShadow: '0 3px 12px rgba(15,23,42,0.05)' }}>
          <Box sx={{ px: 2.5, py: 1.5, backgroundColor: '#f8fafc', borderBottom: '1px solid #e7ebf0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <DataIcon sx={{ color: HEADER_COLOR, fontSize: 20 }} />
              <Typography sx={{ fontWeight: 900, color: '#172033', fontSize: 15 }}>Fuentes de datos</Typography>
            </Box>
            <Typography sx={{ color: '#5f6b7a', fontSize: 13 }}>{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  {COLUMNS.map(col => (
                    <TableCell key={col.key} sx={{ width: col.width, minWidth: col.width, backgroundColor: HEADER_COLOR, color: '#fff', fontWeight: 900, fontSize: 12, whiteSpace: 'nowrap', py: 1.4 }}>
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {paginated.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6, color: '#9ca3af' }}>
                      No se encontraron resultados
                    </TableCell>
                  </TableRow>
                ) : (
                  paginated.map((row, i) => (
                    <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f8fafc' }, '&:hover': { backgroundColor: '#f0f4ff' }, transition: 'background-color 0.15s' }}>
                      {COLUMNS.map(col => (
                        <TableCell key={col.key} sx={{ fontSize: 13, maxWidth: col.width, color: '#34495e', borderBottom: '1px solid #f1f3f6', py: 1.2 }}>
                          {renderCell(row, col)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value)); setPage(0); }}
            rowsPerPageOptions={[10, 15, 25]}
            labelRowsPerPage="Filas por página"
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
            sx={{ borderTop: '1px solid #e7ebf0' }}
          />
        </Paper>
      </Box>

      {/* MODAL DE FUENTES POR CATEGORÍA */}
      <Dialog open={Boolean(modalFilter)} onClose={() => setModalFilter(null)} maxWidth="lg" fullWidth>
        {modalFilter && (
          <>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, backgroundColor: HEADER_COLOR, color: '#fff' }}>
              <Box component={MODAL_CONFIG[modalFilter].icon} sx={{ fontSize: 22 }} />
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontWeight: 900, fontSize: 17, color: '#fff' }}>{MODAL_CONFIG[modalFilter].title}</Typography>
                <Typography sx={{ fontSize: 12.5, color: 'rgba(255,255,255,0.7)' }}>{modalRows.length} fuente{modalRows.length !== 1 ? 's' : ''}</Typography>
              </Box>
              <IconButton onClick={() => setModalFilter(null)} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent sx={{ p: 0 }}>
              <TableContainer sx={{ maxHeight: 500 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      {COLUMNS.map(col => (
                        <TableCell key={col.key} sx={{ width: col.width, minWidth: col.width, backgroundColor: '#f8fafc', color: '#172033', fontWeight: 900, fontSize: 12, whiteSpace: 'nowrap', py: 1.4 }}>
                          {col.label}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {modalRows.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={COLUMNS.length} align="center" sx={{ py: 6, color: '#9ca3af' }}>
                          No se encontraron fuentes en esta categoría
                        </TableCell>
                      </TableRow>
                    ) : (
                      modalRows.map((row, i) => (
                        <TableRow key={i} sx={{ '&:nth-of-type(even)': { backgroundColor: '#f8fafc' }, '&:hover': { backgroundColor: '#f0f4ff' } }}>
                          {COLUMNS.map(col => (
                            <TableCell key={col.key} sx={{ fontSize: 13, maxWidth: col.width, color: '#34495e', borderBottom: '1px solid #f1f3f6', py: 1.2 }}>
                              {renderCell(row, col)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}
