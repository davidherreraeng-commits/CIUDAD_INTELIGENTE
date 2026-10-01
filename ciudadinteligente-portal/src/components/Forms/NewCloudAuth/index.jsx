// src/components/Forms/NewCloudAuth/index.jsx
import { useState, useEffect } from "react"; // <-- SOLUCIÓN 1: Importamos useEffect
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Box, Typography, IconButton, Grid, Divider, MenuItem
} from "@mui/material";
import { Add as AddIcon, Close as CloseIcon, Delete as DeleteIcon, CloudQueue as CloudIcon } from "@mui/icons-material";
import EvidenceDropzone from "../../Common/EvidenceDropzone";
// Importamos tu formateador de moneda
import { formatMoney } from "../../../utils/formatMoney";

import PropTypes from "prop-types";

const createService = (serviceName = "", monthlyCost = "") => ({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    serviceName,
    monthlyCost
});

const SECRETARIAS = [
    "Secretaría de Hacienda", "Secretaría General", "Secretaría de Gestión Humana y Servicio a la Ciudadanía",
    "Secretaría de Suministros y Servicios", "Secretaría de Educación", "Secretaría de Participación Ciudadana",
    "Secretaría de Cultura Ciudadana", "Secretaría de Salud", "Secretaría de Inclusión Social, Familia y Derechos Humanos",
    "Secretaría de las Mujeres", "Secretaría de la Juventud", "Secretaría de la No-Violencia",
    "Secretaría de Seguridad y Convivencia", "Departamento Administrativo de Gestión del Riesgo y Desastres",
    "Secretaría de Infraestructura Física", "Secretaría de Medio Ambiente", "Secretaría de Movilidad",
    "Secretaría de Desarrollo Económico", "Secretaría de Innovación Digital", "Departamento Administrativo de Planeación",
    "Gestión y Control Territorial", "Gobierno y Gestión del Gabinete", "Secretaria Privada",
    "Comunicaciones", "Evaluación y Control", "Gerencia de Proyectos Estratégicos",
    "Gerencia de Diversidades Sexuales e Identidades de Género", "Gerencia Étnica", "Gerencia del Centro", "Gerencia Corregimientos"
];

export default function NewCloudAuthModal({ open, onClose, onSubmit, loading, data }) {
    const isApproved = Boolean(data?.isApproved);
    const [systemInfo, setSystemInfo] = useState({ systemName: "", description: "", observations: "", secretaria: "" });
    const [services, setServices] = useState([createService()]);
    const [files, setFiles] = useState([]);

    useEffect(() => {
        if (data && open) {
            setSystemInfo({
                authId: data.authId, // Importante para el backend
                systemName: data.systemName,
                description: data.description,
                observations: data.observations || "",
                secretaria: data.secretaria
            });

            // Si hay servicios en la data, los cargamos; si no, dejamos uno vacío
            if (data.Services && data.Services.length > 0) {
                setServices(data.Services.map(s => ({
                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
                    serviceName: s.serviceName,
                    monthlyCost: s.monthlyCost
                })));
            } else {
                setServices([createService()]);
            }
        } else if (open && !data) {
            // Limpiar si se abre como "Nueva Solicitud" (sin data)
            setSystemInfo({ systemName: "", description: "", observations: "", secretaria: "" });
            setServices([createService()]);
            setFiles([]);
        }
    }, [data, open]);

    // CÁLCULO AUTOMÁTICO DEL TOTAL
    const totalCost = services.reduce((acc, curr) => acc + (Number(curr.monthlyCost) || 0), 0);

    const handleAddService = () => setServices([...services, createService()]);

    const handleRemoveService = (index) => {
        const newServices = services.filter((_, i) => i !== index);
        setServices(newServices);
    };

    const handleChangeService = (index, field, value) => {
        const newServices = [...services];
        newServices[index][field] = value;
        setServices(newServices);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const payloadServices = services.map(({ serviceName, monthlyCost }) => ({
            serviceName,
            monthlyCost
        }));
        onSubmit({ ...systemInfo, services: payloadServices, files });
    };

    const handleClose = () => {
        setSystemInfo({ systemName: "", description: "", observations: "", secretaria: "" });
        setServices([createService()]);
        setFiles([]);
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={(_, reason) => {
                if (reason === "backdropClick" || reason === "escapeKeyDown") return;
                handleClose();
            }}
            maxWidth="md"
            fullWidth
            disableEscapeKeyDown
            slotProps={{ paper: { sx: { borderRadius: 3 } } }}
        >
            <DialogTitle sx={{
                fontWeight: 800,
                color: "#fff",
                backgroundColor: "#1976d2",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                py: 2.5
            }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <CloudIcon /> {isApproved ? "Editar Observaciones" : (data ? "Editar Solicitud Cloud" : "Nueva Solicitud de Alojamiento Cloud")}
                </Box>
                <IconButton
                    onClick={handleClose}
                    disabled={loading}
                    aria-label="Cerrar"
                    sx={{
                        color: "#fff",
                        backgroundColor: "rgba(255,255,255,0.14)",
                        "&:hover": { backgroundColor: "rgba(255,255,255,0.24)" }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <form onSubmit={handleSubmit}>
                <DialogContent sx={{ p: 4 }}>

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: "#1976d2", textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            1. Información del Sistema
                        </Typography>
                        <Grid container spacing={3}>
                            <Grid item size={{xs:12,sm:6,md:4}}>
                                <TextField
                                    label="Nombre del Sistema"
                                    fullWidth required size="small"
                                    disabled={isApproved}
                                    placeholder="Nombre del sistema"
                                    value={systemInfo.systemName}
                                    onChange={(e) => setSystemInfo({ ...systemInfo, systemName: e.target.value })}
                                />
                            </Grid>
                            <Grid item size={{xs:12,sm:6,md:4}}>
                                <TextField
                                    select
                                    label="Secretaría Solicitante"
                                    fullWidth
                                    required
                                    size="small"
                                    disabled={isApproved}
                                    value={systemInfo.secretaria}
                                    onChange={(e) => setSystemInfo({ ...systemInfo, secretaria: e.target.value })}
                                    slotProps={{ select: { displayEmpty: true }, inputLabel: { shrink: true } }}
                                >
                                    <MenuItem value="" disabled>
                                        <em style={{ color: '#aaa', fontStyle: 'normal' }}>Seleccione una secretaría</em>
                                    </MenuItem>
                                    {SECRETARIAS.map((option) => (
                                        <MenuItem key={option} value={option}>
                                            {option}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                            <Grid item  size={{xs:12,sm:12,md:4}}>
                                <TextField
                                    label="Descripción del Sistema"
                                    fullWidth required multiline rows={3} size="small"
                                    disabled={isApproved}
                                    placeholder="Explique brevemente el propósito de este sistema en la nube..."
                                    value={systemInfo.description}
                                    onChange={(e) => setSystemInfo({ ...systemInfo, description: e.target.value })}
                                    slotProps={{ inputLabel: { shrink: true } }}
                                />
                            </Grid>
                            <Grid item size={{ xs: 12 }}>
                                <TextField
                                    label="Observaciones"
                                    fullWidth
                                    multiline
                                    rows={3}
                                    size="small"
                                    placeholder="Agregue observaciones adicionales sobre la solicitud..."
                                    value={systemInfo.observations}
                                    onChange={(e) => setSystemInfo({ ...systemInfo, observations: e.target.value })}
                                    slotProps={{
                                        htmlInput: { maxLength: 250 },
                                        inputLabel: { shrink: true }
                                    }}
                                    helperText={`${systemInfo.observations.length}/250 caracteres`}
                                />
                            </Grid>
                        </Grid>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: "#1976d2", textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            2. Servicios de Azure Requeridos
                        </Typography>

                        {services.map((svc, index) => (
                            <Box key={svc.id} sx={{
                                p: 2,
                                mb: 2,
                                borderRadius: 2,
                                backgroundColor: "#f8f9fa",
                                border: "1px solid #e9ecef"
                            }}>
                                <Grid container spacing={2} sx={{ alignItems: "center" }}>
                                    <Grid item xs={12} sm={7}>
                                        <TextField
                                            label="Nombre del Servicio"
                                            placeholder="Ej: Azure App Service P1v2"
                                            size="small" required fullWidth
                                            disabled={isApproved}
                                            value={svc.serviceName}
                                            onChange={(e) => handleChangeService(index, "serviceName", e.target.value)}
                                        />
                                    </Grid>
                                    <Grid item xs={10} sm={4}>
                                        <TextField
                                            label="Costo Mensual Estimado (USD)"
                                            type="number" size="small" required fullWidth
                                            disabled={isApproved}
                                            value={svc.monthlyCost}
                                            onChange={(e) => handleChangeService(index, "monthlyCost", e.target.value)}
                                            slotProps={{ input: { startAdornment: <Typography sx={{ mr: 1, color: '#7f8c8d', fontSize: '0.9rem' }}>$</Typography> } }}
                                        />
                                    </Grid>
                                    <Grid item xs={2} sm={1} sx={{ textAlign: "center" }}>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleRemoveService(index)}
                                            disabled={services.length === 1}
                                            sx={{ display: isApproved ? "none" : "inline-flex" }}
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </Grid>
                                </Grid>
                            </Box>
                        ))}

                        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1, mb: 2 }}>
                            <Button
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={handleAddService}
                                disabled={isApproved}
                                variant="contained"
                                sx={{ display: isApproved ? "none" : "inline-flex", borderRadius: 2, textTransform: 'none', fontWeight: 700, boxShadow: "0 3px 8px rgba(25,118,210,0.28)" }}
                            >
                                Agregar Servicio
                            </Button>
                        </Box>

                        {/* CAJA DE TOTAL AUTOMÁTICO */}
                        <Box sx={{
                            display: "flex",
                            justifyContent: "flex-end",
                            alignItems: "center",
                            p: 2,
                            backgroundColor: "#e3f2fd",
                            borderRadius: 2,
                            border: "1px solid #bbdefb",
                            mt: 2
                        }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#1565c0", mr: 2 }}>
                                TOTAL ESTIMADO MENSUAL:
                            </Typography>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: "#1976d2" }}>
                                {formatMoney(totalCost, 'USD')}
                            </Typography>
                        </Box>
                    </Box>

                    <Divider sx={{ mb: 4 }} />

                    <Box>
                        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 700, color: "#1976d2", textTransform: 'uppercase', fontSize: '0.75rem' }}>
                            3. Documentación y Arquitectura
                        </Typography>
                        <EvidenceDropzone onFilesSelected={setFiles} previewVariant="cards" disabled={isApproved} />
                    </Box>

                </DialogContent>
                <DialogActions sx={{ p: 3, backgroundColor: "#f8f9fa", gap: 1 }}>
                    <Button onClick={handleClose} disabled={loading} color="inherit" sx={{ textTransform: 'none', fontWeight: 700 }}>
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={loading || !systemInfo.systemName || !systemInfo.secretaria || totalCost === 0}
                        sx={{ borderRadius: 2, px: 4, textTransform: 'none', fontWeight: 700 }}
                    >
                        {loading ? "Procesando..." : (isApproved ? "Guardar Observaciones" : (data ? "Guardar Cambios" : "Enviar para Aprobación"))}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}

NewCloudAuthModal.propTypes = {
    open: PropTypes.any,
    onClose: PropTypes.func,
    onSubmit: PropTypes.func,
    loading: PropTypes.any,
    data: PropTypes.object,
};
