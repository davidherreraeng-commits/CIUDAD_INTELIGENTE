import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Popover,
  TextField,
  Typography,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem,
  ImageListItemBar,
} from "@mui/material";
import { useState } from "react";
import {
  ExpandMore as ExpandMoreIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Flag as FlagIcon,            // Bandera rellena (Activo)
  OutlinedFlag as FlagOutlinedIcon, // Bandera vacía (Inactivo)
  AttachFile as AttachFileIcon
} from "@mui/icons-material"
import EvidenceDropzone from "../../Common/EvidenceDropzone";
import PropTypes from "prop-types";

const monthOrder = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
];

// ─── Helper: thumbnail de evidencia en modo edición ──────────────────────────

function EvidenceThumb({ ev, year, month, i, onRequestDelete }) {
  return (
    <Box key={ev.evidenceId} sx={{ position: 'relative', width: 80, height: 80 }}>
      <img
        src={ev.url}
        alt={ev.fileName}
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }}
      />
      <IconButton
        size="small"
        color="error"
        sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'white', boxShadow: 1, '&:hover': { bgcolor: '#ffebee' } }}
        onClick={(e) => onRequestDelete(ev.evidenceId, year, month, i, e.currentTarget)}
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}

EvidenceThumb.propTypes = {
  ev: PropTypes.shape({
    evidenceId: PropTypes.any,
    url: PropTypes.string,
    fileName: PropTypes.string,
  }).isRequired,
  year: PropTypes.any.isRequired,
  month: PropTypes.string.isRequired,
  i: PropTypes.number.isRequired,
  onRequestDelete: PropTypes.func.isRequired,
};

// ─── Helper: tarjeta de un avance individual ─────────────────────────────────

function ProgressCard({
  p, i, year, month,
  progressDescription, setProgressDescription,
  progressHasPending, setProgressHasPending,
  newEditFiles, setNewEditFiles,
  onStartEditing, onCancelEditing, onSave,
  onRequestDelete, onOpenEvidence,
  onRequestDeleteImage,
}) {
  const hasPending = p.isEditing ? progressHasPending : p.hasPending;

  return (
    <Paper
      key={p.progressId}
      elevation={0}
      sx={{
        borderRadius: 3,
        border: hasPending ? "2px solid #ef5350" : "2px solid #1976D2",
        backgroundColor: hasPending ? "#fff8f8" : "#fff",
        p: 2.5,
        display: "flex",
        gap: 2,
        alignItems: "start",
        mt: 1,
        transition: "0.2s",
        '&:hover': { transform: "scale(1.01)" }
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasPending && (
            <Tooltip title="Compromiso Pendiente">
              <FlagIcon color="error" fontSize="small" />
            </Tooltip>
          )}
          <Typography sx={{ fontWeight: 700, color: hasPending ? "#d32f2f" : "#0D47A1", fontSize: 16 }}>
            {p.name}
          </Typography>
        </Box>

        {p.isEditing ? (
          <Box sx={{ mt: 1, width: '100%' }}>
            <TextField
              fullWidth
              multiline
              size="small"
              value={progressDescription}
              onChange={(e) => setProgressDescription(e.target.value)}
              placeholder="Descripción del avance..."
              sx={{ mb: 2 }}
            />

            <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2, mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Evidencias Adjuntas
              </Typography>

              {p.Evidence && p.Evidence.length > 0 && (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
                  {p.Evidence.map(ev => (
                    <EvidenceThumb
                      key={ev.evidenceId}
                      ev={ev}
                      year={year}
                      month={month}
                      i={i}
                      onRequestDelete={onRequestDeleteImage}
                    />
                  ))}
                </Box>
              )}

              <Typography variant="caption" sx={{ fontWeight: 'bold' }}>Agregar nuevas imágenes:</Typography>
              <EvidenceDropzone onFilesSelected={(files) => setNewEditFiles(files)} />
            </Box>

            <Box
              sx={{
                display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer',
                width: 'fit-content', p: 0.5, borderRadius: 1, '&:hover': { bgcolor: 'rgba(0,0,0,0.05)' }
              }}
              onClick={() => setProgressHasPending(!progressHasPending)}
            >
              {progressHasPending ? <FlagIcon color="error" /> : <FlagOutlinedIcon color="action" />}
              <Typography variant="caption" color={progressHasPending ? "error" : "text.secondary"}>
                {progressHasPending ? "Este avance tiene un compromiso pendiente" : "Marcar como pendiente"}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Typography sx={{ color: "#444", fontSize: 14, mt: .5, whiteSpace: 'pre-wrap' }}>
            {p.description}
          </Typography>
        )}

        <Typography sx={{ color: "#555", fontSize: 13, mt: 1, fontStyle: "italic" }}>
          Creado por: {p?.User?.UserProfile?.name} {p?.User?.UserProfile?.lastName} — {new Date(p.createdAt).toLocaleDateString()}
        </Typography>
      </Box>

      {!p.isEditing ? (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <IconButton
            color="error"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onRequestDelete({ ...p, year, month }, e.currentTarget);
            }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            color="primary"
            size="small"
            onClick={() => onStartEditing(p, year, month, i)}
          >
            <EditIcon />
          </IconButton>

          <Tooltip title="Ver Evidencias Adjuntas">
            <IconButton
              color="primary"
              size="small"
              onClick={() => onOpenEvidence(p.Evidence)}
            >
              <AttachFileIcon fontSize="small" />
              <Typography variant="caption" sx={{ ml: 0.5, fontWeight: 'bold' }}>
                {p.Evidence.length}
              </Typography>
            </IconButton>
          </Tooltip>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <IconButton
            color="error"
            size="small"
            onClick={() => onCancelEditing(p, year, month, i)}
          >
            <CloseIcon />
          </IconButton>
          <IconButton
            color="success"
            size="small"
            onClick={() => onSave(p, i, year, month, newEditFiles)}
          >
            <CheckIcon />
          </IconButton>
        </Box>
      )}
    </Paper>
  );
}

ProgressCard.propTypes = {
  p: PropTypes.object.isRequired,
  i: PropTypes.number.isRequired,
  year: PropTypes.any.isRequired,
  month: PropTypes.string.isRequired,
  progressDescription: PropTypes.string.isRequired,
  setProgressDescription: PropTypes.func.isRequired,
  progressHasPending: PropTypes.bool.isRequired,
  setProgressHasPending: PropTypes.func.isRequired,
  newEditFiles: PropTypes.array.isRequired,
  setNewEditFiles: PropTypes.func.isRequired,
  onStartEditing: PropTypes.func.isRequired,
  onCancelEditing: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onRequestDelete: PropTypes.func.isRequired,
  onOpenEvidence: PropTypes.func.isRequired,
  onRequestDeleteImage: PropTypes.func.isRequired,
};

// ─────────────────────────────────────────────────────────────────────────────

export function GridSystem({
  anchorNuevoAvance,
  setAnchorNuevoAvance,
  handleCreateProgress,
  progress,
  setProgress,
  updateProgress,
  anchorDeleteProgress,
  setAnchorDeleteProgress,
  deleteProgress,
  handleAddEvidence,
  handleDeleteEvidence
}) {
  // Estado para la descripción mientras editamos
  const [progressDescription, setProgressDescription] = useState("");
  // Estado para el flag mientras editamos
  const [progressHasPending, setProgressHasPending] = useState(false);

  const [progressToDelete, setProgressToDelete] = useState(null);

  const [evidenceFiles, setEvidenceFiles] = useState([]);

  const [anchorDeleteImage, setAnchorDeleteImage] = useState(null);
  const [imageToDelete, setImageToDelete] = useState(null);

  const [newProgress, setNewProgress] = useState({
    year: new Date().getFullYear(),
    month: new Date().toLocaleString('es-ES', { month: 'long' }).replace(/^./, m => m.toUpperCase()),
    name: '',
    description: '',
    hasPending: false
  });
  const [newEditFiles, setNewEditFiles] = useState([]);

  const handleCloseNuevoAvance = () => {
    setAnchorNuevoAvance(null);
    setNewProgress({
      year: new Date().getFullYear(),
      month: new Date().toLocaleString('es-ES', { month: 'long' }).replace(/^./, m => m.toUpperCase()),
      name: '',
      description: '',
      hasPending: false
    });
  }

  const [evidenceModalOpen, setEvidenceModalOpen] = useState(false);
  const [selectedEvidence, setSelectedEvidence] = useState([]);

  const handleOpenEvidence = (evidenceArray) => {
    setSelectedEvidence(evidenceArray);
    setEvidenceModalOpen(true);
  };

  const handleCloseEvidence = () => {
    setEvidenceModalOpen(false);
    setSelectedEvidence([]);
  };

  // Helper para iniciar la edición cargando los datos actuales
  const startEditing = (p, year, month, index) => {
    setProgressDescription(p.description);
    setProgressHasPending(p.hasPending || false); // Cargamos el estado actual del flag

    setProgress(prev => {
      const updated = structuredClone(prev); // Usamos structuredClone para copia profunda segura
      updated[year][month][index].isEditing = true;
      return updated;
    });
  };

  const cancelEditing = (p, year, month, index) => {
    setProgress(prev => {
      const updated = structuredClone(prev);
      updated[year][month][index].isEditing = false;
      return updated;
    });
  };

  const handleSaveCard = async (p, i, year, month, editFiles) => {
    // 1. Guardar la descripción y el flag
    await updateProgress({
      progressId: p.progressId,
      description: progressDescription,
      hasPending: progressHasPending
    }, i);

    // 2. Si hay archivos nuevos en el Dropzone, los enviamos
    if (editFiles.length > 0) {
      await handleAddEvidence(p.progressId, editFiles, year, month, i);
    }

    // 3. Limpiamos y cerramos
    setNewEditFiles([]);
    cancelEditing(p, year, month, i);
  };

  const handleRequestDeleteProgress = (progressData, anchor) => {
    setProgressToDelete(progressData);
    setAnchorDeleteProgress(anchor);
  };

  const handleRequestDeleteImage = (evidenceId, year, month, i, anchor) => {
    setImageToDelete({ evidenceId, year, month, i });
    setAnchorDeleteImage(anchor);
  };

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
          Avances por Mes
        </Typography>
        <Button
          variant="contained"
          sx={{ ml: 'auto' }}
          onClick={(e) => setAnchorNuevoAvance(e.currentTarget)}
        >
          Nuevo avance
        </Button>

        {/* --- POPOVER NUEVO AVANCE --- */}
        <Popover
          open={Boolean(anchorNuevoAvance)}
          anchorEl={anchorNuevoAvance}
          onClose={handleCloseNuevoAvance}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Box sx={{ p: 2, width: 320, display: "flex", flexDirection: "column", gap: 2 }}>
            <Typography sx={{ fontWeight: 700 }}>Registrar avance</Typography>

            <TextField
              label="Año"
              size="small"
              type="number"
              value={newProgress.year}
              onChange={(e) => setNewProgress(prev => ({ ...prev, year: e.target.value }))}
            />

            <TextField
              select
              label="Mes"
              size="small"
              value={newProgress.month}
              onChange={(e) => setNewProgress(prev => ({ ...prev, month: e.target.value }))}
            >
              {monthOrder.map(month => (
                <MenuItem key={month} value={month}>{month}</MenuItem>
              ))}
            </TextField>

            <TextField
              label="Objetivo"
              placeholder="Título del avance"
              size="small"
              value={newProgress.name}
              onChange={(e) => setNewProgress(prev => ({ ...prev, name: e.target.value }))}
            />

            <TextField
              label="Descripción"
              multiline
              rows={3}
              size="small"
              value={newProgress.description}
              onChange={(e) => setNewProgress(prev => ({ ...prev, description: e.target.value }))}
            />

            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, display: 'block' }}>
                Evidencias (Fotos)
              </Typography>
              <EvidenceDropzone
                onFilesSelected={(files) => setEvidenceFiles(files)}
              />
            </Box>

            {/* --- 2. SELECCIÓN DE FLAG (NUEVO) --- */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                cursor: 'pointer',
                p: 1,
                borderRadius: 1,
                border: newProgress.hasPending ? '1px solid #d32f2f' : '1px solid #e0e0e0',
                bgcolor: newProgress.hasPending ? '#ffebee' : 'transparent'
              }}
              onClick={() => setNewProgress(prev => ({ ...prev, hasPending: !prev.hasPending }))}
            >
              {newProgress.hasPending ? <FlagIcon color="error" /> : <FlagOutlinedIcon color="action" />}
              <Typography variant="body2" color={newProgress.hasPending ? "error" : "text.secondary"} fontWeight={500}>
                {newProgress.hasPending ? "Compromiso Pendiente" : "Sin compromisos"}
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              disabled={!newProgress.name?.trim() || !newProgress.description?.trim()}
              onClick={() => {
                handleCreateProgress({
                  ...newProgress,
                  files: evidenceFiles
                });
                handleCloseNuevoAvance();
              }}
            >
              Guardar avance
            </Button>
          </Box>
        </Popover>
{/* --- POPOVER ELIMINAR AVANCE --- */}
        <Popover
          open={Boolean(anchorDeleteProgress)}
          anchorEl={anchorDeleteProgress}
          onClose={() => setAnchorDeleteProgress(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Box sx={{ p: 2, maxWidth: 250 }}>
            <Typography sx={{ mb: 1 }}>
              ¿Estás seguro de eliminar el avance <b>{progressToDelete?.name}</b>?
            </Typography>
            <Button variant="contained" color="error" onClick={() => deleteProgress({ progressId: progressToDelete.progressId }, progressToDelete.year, progressToDelete.month)}>
              Confirmar
            </Button>
            <Button sx={{ ml: 1 }} onClick={() => setAnchorDeleteProgress(null)}>Cancelar</Button>
          </Box>
        </Popover>

        {/* --- POPOVER ELIMINAR IMAGEN --- */}
        <Popover
          open={Boolean(anchorDeleteImage)}
          anchorEl={anchorDeleteImage}
          onClose={() => setAnchorDeleteImage(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Box sx={{ p: 2, maxWidth: 250 }}>
            <Typography sx={{ mb: 1 }}>
              ¿Estás seguro de eliminar esta imagen?
            </Typography>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                handleDeleteEvidence(imageToDelete.evidenceId, imageToDelete.year, imageToDelete.month, imageToDelete.i);
                setAnchorDeleteImage(null);
              }}
            >
              Confirmar
            </Button>
            <Button sx={{ ml: 1 }} onClick={() => setAnchorDeleteImage(null)}>Cancelar</Button>
          </Box>
        </Popover>
      </Box>

      {/* --- LISTADO DE AVANCES --- */}
      <Box>
        {[...Object.keys(progress)]
          .sort((a, b) => Number(b) - Number(a))
          .map((year) => {
            const months = progress[year];
            return (
              <Box key={year} sx={{ mb: 3 }}>
                {[...monthOrder].reverse().filter(m => months?.[m]).map(month => (
                  <Accordion key={month} elevation={0} sx={{ borderRadius: 2, border: "2px solid #1976D2", mt: 1 }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography sx={{ fontWeight: 700, fontSize: 18 }}>{month} — {year}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {months[month]
                        .map((p, i) => ({ p, i }))
                        .sort((a, b) => new Date(b.p.createdAt) - new Date(a.p.createdAt))
                        .map(({ p, i }) => (
                          <ProgressCard
                            key={p.progressId}
                            p={p}
                            i={i}
                            year={year}
                            month={month}
                            progressDescription={progressDescription}
                            setProgressDescription={setProgressDescription}
                            progressHasPending={progressHasPending}
                            setProgressHasPending={setProgressHasPending}
                            newEditFiles={newEditFiles}
                            setNewEditFiles={setNewEditFiles}
                            onStartEditing={startEditing}
                            onCancelEditing={cancelEditing}
                            onSave={handleSaveCard}
                            onRequestDelete={handleRequestDeleteProgress}
                            onOpenEvidence={handleOpenEvidence}
                            onRequestDeleteImage={handleRequestDeleteImage}
                          />
                        ))}
                    </AccordionDetails>
                  </Accordion>
                ))}
                <Divider sx={{ mt: 3 }} />
              </Box>
            );
          })}
      </Box>

      <Dialog
        open={evidenceModalOpen}
        onClose={handleCloseEvidence}
        maxWidth="md"
        fullWidth
        scroll="paper"
        slotProps={{ paper: {
          sx: { borderRadius: 3 } // Bordes del modal más redondeados
        } }}
      >
        {/* Cabecera del Modal */}
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: '#f8f9fa' }}>
          <Typography variant="h6" component="span" sx={{ fontWeight: 'bold', color: '#1976D2', display: 'flex', alignItems: 'center', gap: 1 }}>
            Galería de Evidencias
          </Typography>
          <IconButton
            aria-label="close"
            onClick={handleCloseEvidence}
            sx={{ color: (theme) => theme.palette.grey[500] }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        {/* Contenido (Las Imágenes) */}
        <DialogContent dividers sx={{ p: 3, bgcolor: '#ffffff' }}>
          {selectedEvidence?.length > 0 ? (
            <ImageList cols={3} gap={16}>
              {selectedEvidence.map((item) => (
                <ImageListItem
                  key={item.evidenceId || item.url}
                  sx={{
                    borderRadius: 2,
                    overflow: 'hidden',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'scale(1.03)' }
                  }}
                >
                  <img
                    src={item.url}
                    alt={item.fileName}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '200px',
                      objectFit: 'cover', // Evita que se deformen
                      cursor: 'zoom-in'
                    }}
                    onClick={() => window.open(item.url, '_blank')}
                  />
                  
                  {/* Barra oscura con el título y botón */}
                  <ImageListItemBar
                    title={item.fileName}
                    subtitle="Clic para ampliar"
                    sx={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                    }}
                    actionIcon={
                      <IconButton
                        sx={{ color: 'rgba(255, 255, 255, 0.8)' }}
                        onClick={() => window.open(item.url, '_blank')}
                      >
                        <AttachFileIcon />
                      </IconButton>
                    }
                  />
                </ImageListItem>
              ))}
            </ImageList>
          ) : (
            
            <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
              <Typography variant="h6" color="text.secondary">No hay imágenes adjuntas</Typography>
              <Typography variant="body2" color="text.secondary">Este avance no cuenta con evidencias visuales.</Typography>
            </Box>
          )}
        </DialogContent>

        {/* Pie del Modal */}
        <DialogActions sx={{ p: 2, bgcolor: '#f8f9fa' }}>
          <Button onClick={handleCloseEvidence} variant="outlined" sx={{ borderRadius: 2 }}>
            Cerrar Galería
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

GridSystem.propTypes = {
    anchorNuevoAvance: PropTypes.any,
    setAnchorNuevoAvance: PropTypes.any,
    handleCreateProgress: PropTypes.func,
    progress: PropTypes.object,
    setProgress: PropTypes.func,
    updateProgress: PropTypes.func,
    anchorDeleteProgress: PropTypes.any,
    setAnchorDeleteProgress: PropTypes.func,
    deleteProgress: PropTypes.func,
    handleAddEvidence: PropTypes.func,
    handleDeleteEvidence: PropTypes.func,
};
