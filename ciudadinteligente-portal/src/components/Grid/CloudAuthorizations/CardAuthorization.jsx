import { Box, Paper, Typography, Button, Chip, IconButton, Link, Tooltip } from "@mui/material";
import {
    AttachFile as AttachFileIcon,
    CheckCircle as CheckCircleIcon,
    Computer as ComputerIcon,
    Download as DownloadIcon,
    Edit as EditIcon,
    PendingActions as PendingActionsIcon,
    PictureAsPdf as PdfIcon
} from "@mui/icons-material";
import { formatMoney } from "../../../utils/formatMoney";
import ApprovalFlowPanel from "./ApprovalFlowPanel";

import PropTypes from "prop-types";
export default function CardAuthorization({ auth, onApprove, canApprove, onEdit }) {
    if (!auth) return null;

    // Calculamos el costo total usando encadenamiento opcional (?.) para evitar errores si no hay servicios
    const totalCost = auth?.Services?.reduce((acc, curr) => acc + Number(curr.monthlyCost), 0) || 0;

    const approverName = auth?.Approver?.UserProfile
        ? `${auth.Approver.UserProfile.name} ${auth.Approver.UserProfile.lastName}`
        : auth?.Approver?.username || "Subsecretaría";
    const servicesCount = auth.Services?.length || 0;
    const attachmentsCount = auth.Attachments?.length || 0;

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                border: "1px solid #e7ebf0",
                p: 2.5,
                display: "flex",
                flexDirection: "column",
                width: "100%",
                height: "100%",
                minHeight: 460,
                backgroundColor: "#fff",
                transition: "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
                boxShadow: "0 4px 16px rgba(15,23,42,0.05)",
                "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "#b7d2ff",
                    boxShadow: "0 12px 28px rgba(15,23,42,0.1)"
                }
            }}
        >
            {/* CABECERA */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 2.5 }}>
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 58,
                            height: 58,
                            backgroundColor: auth.isApproved ? "#e8f5e9" : "#e8eaf6",
                            borderRadius: 2,
                            color: auth.isApproved ? "#2e7d32" : "#3f51b5",
                            display: "grid",
                            placeItems: "center",
                            flexShrink: 0
                        }}
                    >
                        <ComputerIcon sx={{ fontSize: 34 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: "#172033", lineHeight: 1.2, mb: 0.7, wordBreak: "break-word" }}>
                            {auth.systemName}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#7f8c8d", fontWeight: 700, lineHeight: 1.5 }}>
                            Secretaría: {auth.secretaria}
                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", justifyContent: "flex-end" }}>
                    {/* BOTÓN DE EDICIÓN: Solo si NO está aprobado */}
                    {!auth.isApproved && (
                        <Tooltip title="Editar solicitud">
                            <IconButton
                                size="small"
                                color="primary"
                                onClick={() => onEdit(auth)}
                                sx={{ backgroundColor: '#f0f4ff', '&:hover': { backgroundColor: '#e0e8ff' } }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}

                    <Chip
                        label={auth.isApproved ? "APROBADO" : "SIN APROBAR"}
                        size="small"
                        icon={auth.isApproved ? <CheckCircleIcon /> : <PendingActionsIcon />}
                        sx={{
                            fontWeight: 900,
                            borderRadius: 1,
                            backgroundColor: auth.isApproved ? "#e8f5e9" : "#fff3e0",
                            color: auth.isApproved ? "#2e7d32" : "#e57917",
                            "& .MuiChip-icon": { color: "inherit" }
                        }}
                    />
                </Box>
            </Box>

            {/* INFO SISTEMA */}
            <Box
                sx={{
                    backgroundColor: "#f8fafc",
                    border: "1px solid #edf0f4",
                    borderRadius: 2,
                    p: 2,
                    mb: 2.5
                }}
            >
                <Typography variant="caption" sx={{ color: "#7f8c8d", fontWeight: 900, textTransform: "uppercase" }}>
                    Descripción
                </Typography>
                <Typography variant="body2" sx={{ color: "#34495e", wordBreak: "break-word", mt: 0.7, lineHeight: 1.6 }}>
                    {auth.description || "Sin descripción registrada"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1.5 }}>
                    <Chip
                        size="small"
                        label={`${servicesCount} servicio${servicesCount === 1 ? "" : "s"}`}
                        sx={{ fontWeight: 800, backgroundColor: "#e8f1ff", color: "#1769d2" }}
                    />
                    <Chip
                        size="small"
                        icon={<AttachFileIcon />}
                        label={`${attachmentsCount} adjunto${attachmentsCount === 1 ? "" : "s"}`}
                        sx={{ fontWeight: 800, backgroundColor: "#f3f4f6", color: "#4b5563", "& .MuiChip-icon": { color: "inherit" } }}
                    />
                </Box>
            </Box>

            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: "#172033", mb: 1 }}>
                Servicios requeridos de Azure
            </Typography>

            {/* TABLA DE SERVICIOS */}
            <Box sx={{
                border: "1px solid #e7ebf0",
                borderRadius: 2,
                overflow: "hidden",
                mb: 2.5,
                display: "flex",
                flexDirection: "column"
            }}>
                <Box sx={{ display: "flex", backgroundColor: "#f8fafc", px: 1.5, py: 1.2, borderBottom: "1px solid #e7ebf0" }}>
                    <Typography variant="caption" sx={{ flex: 2, fontWeight: 900, color: "#7f8c8d" }}>Servicio</Typography>
                    <Typography variant="caption" sx={{ flex: 1, fontWeight: 900, color: "#7f8c8d", textAlign: "right" }}>Costo (USD)</Typography>
                </Box>

                <Box sx={{ maxHeight: "160px", overflowY: "auto" }}>
                    {auth.Services?.map((svc) => (
                        <Box key={svc.serviceName} sx={{ display: "flex", px: 1.5, py: 1.3, borderBottom: "1px solid #f1f3f6", gap: 1 }}>
                            <Typography variant="body2" sx={{ flex: 2, color: "#34495e", fontWeight: 700, wordBreak: "break-word" }}>{svc.serviceName}</Typography>
                            <Typography variant="body2" sx={{ flex: 1, textAlign: "right", color: "#34495e", fontWeight: 800, whiteSpace: "nowrap" }}>
                                {formatMoney(Number(svc.monthlyCost), 'USD')}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                <Box sx={{ display: "flex", p: 1.5, backgroundColor: "#f0f8ff", borderTop: "1px solid #d8eafb" }}>
                    <Typography variant="body2" sx={{ flex: 2, fontWeight: 900, color: "#1976d2", textAlign: "right", pr: 2 }}>
                        TOTAL MENSUAL
                    </Typography>
                    <Typography variant="body2" sx={{ flex: 1, fontWeight: 900, color: "#1976d2", textAlign: "right" }}>
                        {formatMoney(totalCost, 'USD')}
                    </Typography>
                </Box>
            </Box>

            {/* FLUJO DE APROBACIÓN */}
            <ApprovalFlowPanel
                isApproved={auth.isApproved}
                isApproved2={auth.isApproved2}
                isApproved3={auth.isApproved3}
            />

            {/* FOOTER: ADJUNTOS Y APROBACIÓN */}
            <Box sx={{ display: "flex", gap: 2, mt: "auto", borderTop: "1px solid #edf0f4", pt: 2, flexDirection: { xs: "column", sm: "row" } }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="caption" sx={{ fontWeight: 900, color: "#7f8c8d", display: "block", mb: 1 }}>
                        Adjuntos ({attachmentsCount})
                    </Typography>
                    {attachmentsCount > 0 ? (
                        auth.Attachments?.map((att) => (
                            <Box
                                key={att.fileName}
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    mb: 0.7,
                                    minWidth: 0,
                                    backgroundColor: "#f8fafc",
                                    borderRadius: 1.5,
                                    px: 1,
                                    py: 0.6
                                }}
                            >
                                <PdfIcon color="action" fontSize="small" />
                                <Link href={att.url} target="_blank" underline="hover" variant="caption" sx={{ color: "#34495e", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {att.fileName}
                                </Link>
                                <IconButton size="small" href={att.url} target="_blank"><DownloadIcon sx={{ fontSize: 16 }} /></IconButton>
                            </Box>
                        ))
                    ) : (
                        <Typography variant="caption" sx={{ color: "#9aa4b2" }}>
                            Sin archivos adjuntos
                        </Typography>
                    )}
                </Box>

                <Box sx={{ width: { xs: "100%", sm: 240 }, flexShrink: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "stretch" }}>
                    {auth.isApproved ? (
                        <Box sx={{ textAlign: "center", backgroundColor: "#f1f8f3", borderRadius: 2, p: 1.5 }}>
                            <Typography variant="body2" sx={{ color: "#2e7d32", fontWeight: 900, display: "flex", alignItems: "center", gap: 0.5, justifyContent: "center", mb: 1 }}>
                                <CheckCircleIcon fontSize="small" /> Aprobado
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#7f8c8d", display: "block" }}>
                                Aprobado por:  <b>{approverName}</b>
                            </Typography>
                            <Typography variant="caption" sx={{ color: "#7f8c8d", display: "block" }}>
                                Fecha: {new Date(auth.approvalDate).toLocaleString('es-CO', {
                                    dateStyle: 'short',
                                    timeStyle: 'short'
                                })}
                            </Typography>
                        </Box>
                    ) : (
                        canApprove ? (
                            <Button
                                variant="contained"
                                color="primary"
                                fullWidth
                                onClick={() => onApprove(auth.authId)}
                                sx={{ fontWeight: 900, borderRadius: 2, py: 1.2, minHeight: 44 }}
                            >
                                Aprobar Sistema
                            </Button>
                        ) : (
                            <Typography variant="caption" sx={{ color: "#9e9e9e", fontStyle: "italic", textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 2, p: 1.5 }}>
                                Requiere firma de administrador autorizado
                            </Typography>
                        )
                    )}
                </Box>
            </Box>
        </Paper>
    );
}

CardAuthorization.propTypes = {
    auth: PropTypes.object,
    onApprove: PropTypes.func,
    canApprove: PropTypes.bool,
    onEdit: PropTypes.func,
};
