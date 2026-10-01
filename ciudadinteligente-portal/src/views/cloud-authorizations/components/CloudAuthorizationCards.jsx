import { Box, Typography, Button, CircularProgress, LinearProgress, Chip, IconButton, Link } from "@mui/material";
import {
    AccessTime as AccessTimeIcon,
    AccountBalance as AccountBalanceIcon,
    ArrowForward as ArrowForwardIcon,
    AttachFile as AttachFileIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    Computer as ComputerIcon,
    Download as DownloadIcon,
    DeleteOutline as DeleteOutlineIcon,
    Edit as EditIcon,
    HealthAndSafety as HealthAndSafetyIcon,
    LocalPolice as LocalPoliceIcon,
    MenuBook as MenuBookIcon,
    Nature as NatureIcon,
    PictureAsPdf as PdfIcon,
    PieChartOutline as PieChartOutlineIcon,
    Storage as StorageIcon,
    WorkOutline as WorkOutlineIcon
} from "@mui/icons-material";

import { formatMoney } from "../../../utils/formatMoney";
import ApprovalFlowPanel from "../../../components/Grid/CloudAuthorizations/ApprovalFlowPanel";
import { getAuthTotalCost, getPercentage, getProgressColor } from "../utils";

import PropTypes from "prop-types";
const secretariaStyles = [
    { color: "#0f9f82", bg: "#dff8f2", icon: AccountBalanceIcon },
    { color: "#1769d2", bg: "#e8f1ff", icon: LocalPoliceIcon },
    { color: "#6a45c9", bg: "#efe8ff", icon: MenuBookIcon },
    { color: "#d83262", bg: "#ffe6ee", icon: HealthAndSafetyIcon },
    { color: "#f2991b", bg: "#fff3dc", icon: PieChartOutlineIcon },
    { color: "#0f8f7c", bg: "#def7ef", icon: WorkOutlineIcon },
    { color: "#5a45c9", bg: "#ede9ff", icon: StorageIcon },
    { color: "#209f62", bg: "#e5f7ec", icon: NatureIcon }
];

export function DetailStatCard({ icon, title, value, subtitle }) {
    return (
        <Box
            sx={{
                border: "1px solid #e7ebf0",
                borderRadius: 2,
                p: 2,
                minHeight: 112,
                backgroundColor: "#fff",
                display: "flex",
                alignItems: "center",
                gap: 1.5
            }}
        >
            <Box
                sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 1.5,
                    backgroundColor: "#e8f1ff",
                    color: "#1769d2",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0
                }}
            >
                <Box component={icon} sx={{ fontSize: 26 }} />
            </Box>
            <Box>
                <Typography sx={{ fontWeight: 850, color: "#172033", lineHeight: 1.2, mb: 0.8 }}>
                    {title}
                </Typography>
                <Typography sx={{ fontSize: 24, lineHeight: 1, fontWeight: 950, color: "#172033" }}>
                    {value}
                </Typography>
                <Typography sx={{ color: "#5f6b7a", mt: 0.8, fontSize: 14 }}>
                    {subtitle}
                </Typography>
            </Box>
        </Box>
    );
}

export function MetricCard({ icon, title, value, subtitle, color, bg, progress, onClick, isActive }) {
    const isInteractive = Boolean(onClick);

    return (
        <Box
            component={isInteractive ? "button" : "div"}
            type={isInteractive ? "button" : undefined}
            onClick={onClick}
            sx={{
                width: "100%",
                height: 118,
                boxSizing: "border-box",
                backgroundColor: "#fff",
                border: "1px solid #e7ebf0",
                borderRadius: 2,
                p: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.6,
                textAlign: "left",
                cursor: isInteractive ? "pointer" : "default",
                font: "inherit",
                appearance: "none",
                transition: "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
                boxShadow: isActive ? `inset 0 0 0 1px ${color}, 0 12px 28px rgba(15,23,42,0.12)` : "0 3px 12px rgba(15,23,42,0.05)",
                "&:hover": {
                    transform: isInteractive ? "translateY(-3px)" : "none",
                    borderColor: isInteractive ? color : "#b7d2ff",
                    boxShadow: isInteractive ? "0 12px 28px rgba(15,23,42,0.1)" : "0 3px 12px rgba(15,23,42,0.05)"
                },
                "&:focus-visible": {
                    outline: `3px solid ${color}33`,
                    outlineOffset: 3
                }
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    backgroundColor: progress === undefined ? bg : "transparent",
                    color,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0
                }}
            >
                {progress === undefined ? (
                    <Box component={icon} sx={{ fontSize: 28 }} />
                ) : (
                    <Box sx={{ position: "relative", display: "inline-flex" }}>
                        <CircularProgress
                            variant="determinate"
                            value={100}
                            size={48}
                            thickness={5}
                            sx={{ color: "#e5e7eb" }}
                        />
                        <CircularProgress
                            variant="determinate"
                            value={progress}
                            size={48}
                            thickness={5}
                            sx={{ color, position: "absolute", left: 0 }}
                        />
                    </Box>
                )}
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 850, color: "#172033", mb: 0.4, lineHeight: 1.2, fontSize: 15 }}>
                    {title}
                </Typography>
                <Typography sx={{ fontSize: 28, lineHeight: 1, fontWeight: 900, color, letterSpacing: 0 }}>
                    {value}
                </Typography>
                <Typography sx={{ color: "#5f6b7a", mt: 0.6, lineHeight: 1.3, fontSize: 14 }}>
                    {subtitle}
                </Typography>
            </Box>
        </Box>
    );
}

export function SecretariaSummaryCard({ secretaria, total, approved, pending, index, isSelected, onViewDetails }) {
    const percentage = getPercentage(approved, total);
    const style = secretariaStyles[index % secretariaStyles.length];
    const Icon = style.icon;
    const progressColor = getProgressColor(percentage);

    return (
        <Box
            sx={{
                width: "100%",
                height: "100%",
                minHeight: 390,
                backgroundColor: "#fff",
                border: isSelected ? "2px solid #1976d2" : "1px solid #e7ebf0",
                borderRadius: 2,
                p: 3.5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                transition: "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
                boxShadow: isSelected ? "0 10px 26px rgba(25,118,210,0.16)" : "0 4px 16px rgba(15,23,42,0.05)",
                "&:hover": {
                    transform: "translateY(-3px)",
                    borderColor: "#b7d2ff",
                    boxShadow: "0 12px 28px rgba(15,23,42,0.1)"
                }
            }}
        >
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: "50%",
                    backgroundColor: style.bg,
                    color: style.color,
                    display: "grid",
                    placeItems: "center",
                    mb: 3
                }}
            >
                <Icon sx={{ fontSize: 34 }} />
            </Box>

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 850,
                    color: "#172033",
                    textAlign: "center",
                    minHeight: 64,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    lineHeight: 1.25
                }}
            >
                {secretaria}
            </Typography>

            <Typography sx={{ color: "#5f6b7a", mt: 1 }}>
                Total de Sistemas
            </Typography>
            <Typography sx={{ fontSize: 26, lineHeight: 1.2, fontWeight: 900, color: "#172033", mb: 2.5 }}>
                {total}
            </Typography>

            <Box sx={{ width: "100%", borderTop: "1px solid #edf0f4", pt: 2.5 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 3, mb: 1.5 }}>
                    <Box>
                        <Typography sx={{ color: "#159857", fontWeight: 800, fontSize: 14 }}>
                            Aprobados
                        </Typography>
                        <Typography sx={{ color: "#159857", fontWeight: 900, fontSize: 24 }}>
                            {approved}
                        </Typography>
                    </Box>
                    <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ color: "#e57917", fontWeight: 800, fontSize: 14 }}>
                            Sin aprobar
                        </Typography>
                        <Typography sx={{ color: "#e57917", fontWeight: 900, fontSize: 24 }}>
                            {pending}
                        </Typography>
                    </Box>
                </Box>

                <Typography sx={{ color: "#4b5563", mb: 0.8, fontSize: 14 }}>
                    {percentage}% de aprobación
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    sx={{
                        height: 8,
                        borderRadius: 999,
                        backgroundColor: "#e9edf2",
                        "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            backgroundColor: progressColor
                        }
                    }}
                />
            </Box>

            <Button
                variant={isSelected ? "contained" : "outlined"}
                size="small"
                endIcon={<ArrowForwardIcon />}
                onClick={onViewDetails}
                sx={{ mt: "auto", pt: 0.8, borderRadius: 1.5, fontWeight: 800, textTransform: "none", px: 3 }}
            >
                Ver detalles
            </Button>
        </Box>
    );
}

export function SystemListItem({ auth, selected, onSelect }) {
    const totalCost = getAuthTotalCost(auth);

    return (
        <Box
            component="button"
            type="button"
            onClick={onSelect}
            sx={{
                width: "100%",
                border: selected ? "2px solid #8bbcff" : "1px solid #e7ebf0",
                backgroundColor: selected ? "#f7fbff" : "#fff",
                borderRadius: 2,
                p: 1.6,
                mb: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                textAlign: "left",
                cursor: "pointer",
                transition: "box-shadow 0.2s ease, transform 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                    transform: "translateY(-2px)",
                    borderColor: "#b7d2ff",
                    boxShadow: "0 8px 22px rgba(15,23,42,0.08)"
                }
            }}
        >
            <Box
                sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 1.5,
                    backgroundColor: auth.isApproved ? "#e8f5e9" : "#e8eaf6",
                    color: auth.isApproved ? "#2e7d32" : "#3f51b5",
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0
                }}
            >
                <ComputerIcon sx={{ fontSize: 28 }} />
            </Box>

            <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography sx={{ fontWeight: 900, color: "#172033", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {auth.systemName}
                </Typography>
                <Typography sx={{ color: "#5f6b7a", fontSize: 14, mt: 0.4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    Secretaría: {auth.secretaria}
                </Typography>
            </Box>

            <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Chip
                    label={auth.isApproved ? "APROBADO" : "PENDIENTE"}
                    size="small"
                    sx={{
                        mb: 0.8,
                        fontWeight: 900,
                        backgroundColor: auth.isApproved ? "#e8f5e9" : "#fff3e0",
                        color: auth.isApproved ? "#2e7d32" : "#e57917"
                    }}
                />
                <Typography sx={{ fontWeight: 900, color: "#172033", fontSize: 14 }}>
                    {formatMoney(totalCost, "USD")}/mes
                </Typography>
            </Box>
        </Box>
    );
}

export function SystemDetailPanel({ auth, canApprove, onApprove, onEdit, onDeleteAttachment, deletingAttachmentId }) {
    if (auth == null) {
        return (
            <Box sx={{ backgroundColor: "#fff", border: "1px solid #e7ebf0", borderRadius: 2, p: 4, textAlign: "center", color: "#5f6b7a" }}>
                Selecciona un sistema para ver el detalle.
            </Box>
        );
    }

    const totalCost = getAuthTotalCost(auth);
    const servicesCount = auth.Services?.length || 0;
    const attachmentsCount = auth.Attachments?.length || 0;
    const approverName = auth?.Approver?.UserProfile
        ? `${auth.Approver.UserProfile.name} ${auth.Approver.UserProfile.lastName}`
        : auth?.Approver?.username || "Subsecretaría";
    const approvalAction = (
        <Box sx={{ width: "100%", alignSelf: "center" }}>
            {canApprove ? (
                <Button
                    variant="contained"
                    onClick={() => onApprove(auth.authId)}
                    sx={{ borderRadius: 2, fontWeight: 950, width: "100%", height: 56, p: 0 }}
                >
                    Aprobar Sistema
                </Button>
            ) : (
                <Box sx={{ textAlign: "center", backgroundColor: "#f8fafc", borderRadius: 2, p: 1.8, color: "#7f8c8d", fontStyle: "italic" }}>
                    Requiere firma de administrador autorizado
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ backgroundColor: "#fff", border: "1px solid #e7ebf0", borderRadius: 2, p: 2.5, boxShadow: "0 4px 16px rgba(15,23,42,0.05)", width: "100%", height: "100%", boxSizing: "border-box", overflowY: { xs: "visible", lg: "auto" } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, mb: 2.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0 }}>
                    <Box sx={{ width: 54, height: 54, borderRadius: 1.5, backgroundColor: "#e8eaf6", color: "#3f51b5", display: "grid", placeItems: "center", flexShrink: 0 }}>
                        <ComputerIcon sx={{ fontSize: 32 }} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 950, color: "#172033", lineHeight: 1.2, wordBreak: "break-word" }}>
                            {auth.systemName}
                        </Typography>
                        <Typography sx={{ color: "#5f6b7a", fontWeight: 700, mt: 0.5 }}>
                            Secretaría: {auth.secretaria}
                        </Typography>
                    </Box>
                </Box>

                <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "nowrap", justifyContent: "flex-end", flexShrink: 0 }}>
                    <IconButton
                        onClick={() => onEdit(auth)}
                        title={auth.isApproved ? "Editar observaciones" : "Editar solicitud"}
                        aria-label={auth.isApproved ? "Editar observaciones" : "Editar solicitud"}
                        sx={{ backgroundColor: "#f0f4ff", color: "#1976d2", "&:hover": { backgroundColor: "#e0e8ff" } }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <Chip
                        label={auth.isApproved ? "APROBADO" : "SIN APROBAR"}
                        size="small"
                        icon={auth.isApproved ? <CheckCircleOutlineIcon /> : <AccessTimeIcon />}
                        sx={{
                            fontWeight: 900,
                            backgroundColor: auth.isApproved ? "#e8f5e9" : "#fff3e0",
                            color: auth.isApproved ? "#2e7d32" : "#e57917",
                            "& .MuiChip-icon": { color: "inherit" }
                        }}
                    />
                </Box>
            </Box>

            <Box sx={{ border: "1px solid #e7ebf0", borderRadius: 2, p: 2, backgroundColor: "#f8fafc", mb: 2.5 }}>
                <Typography sx={{ fontSize: 12, textTransform: "uppercase", fontWeight: 900, color: "#7f8c8d", mb: 1 }}>
                    Descripción
                </Typography>
                <Typography sx={{ color: "#34495e", lineHeight: 1.6, mb: 1.5 }}>
                    {auth.description || "Sin descripción registrada"}
                </Typography>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    <Chip label={`${servicesCount} servicio${servicesCount === 1 ? "" : "s"}`} size="small" sx={{ fontWeight: 900, backgroundColor: "#e8f1ff", color: "#1769d2" }} />
                    <Chip icon={<AttachFileIcon />} label={`${attachmentsCount} adjunto${attachmentsCount === 1 ? "" : "s"}`} size="small" sx={{ fontWeight: 900, backgroundColor: "#f3f4f6", color: "#4b5563", "& .MuiChip-icon": { color: "inherit" } }} />
                </Box>
            </Box>

            <Typography sx={{ fontWeight: 900, color: "#172033", mb: 1.2 }}>
                Servicios requeridos de Azure
            </Typography>
            <Box sx={{ border: "1px solid #e7ebf0", borderRadius: 2, overflow: "hidden", mb: 2.5 }}>
                <Box sx={{ display: "flex", px: 1.6, py: 1.2, backgroundColor: "#f8fafc", borderBottom: "1px solid #e7ebf0" }}>
                    <Typography sx={{ flex: 2, fontSize: 13, color: "#7f8c8d", fontWeight: 900 }}>Servicio</Typography>
                    <Typography sx={{ flex: 1, fontSize: 13, color: "#7f8c8d", fontWeight: 900, textAlign: "right" }}>Costo (USD)</Typography>
                </Box>
                {auth.Services?.map((svc) => (
                    <Box key={svc.serviceName} sx={{ display: "flex", gap: 1, px: 1.6, py: 1.3, borderBottom: "1px solid #f1f3f6" }}>
                        <Typography sx={{ flex: 2, color: "#34495e", fontWeight: 750, wordBreak: "break-word" }}>{svc.serviceName}</Typography>
                        <Typography sx={{ flex: 1, textAlign: "right", color: "#34495e", fontWeight: 900, whiteSpace: "nowrap" }}>
                            {formatMoney(Number(svc.monthlyCost), "USD")}
                        </Typography>
                    </Box>
                ))}
                <Box sx={{ display: "flex", px: 1.6, py: 1.3, backgroundColor: "#f0f8ff" }}>
                    <Typography sx={{ flex: 2, color: "#1976d2", fontWeight: 950 }}>TOTAL MENSUAL</Typography>
                    <Typography sx={{ flex: 1, color: "#1976d2", fontWeight: 950, textAlign: "right" }}>
                        {formatMoney(totalCost, "USD")}
                    </Typography>
                </Box>
            </Box>

            <ApprovalFlowPanel
                isApproved={auth.isApproved}
                isApproved2={auth.isApproved2}
                isApproved3={auth.isApproved3}
            />

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 270px" }, gap: 2, alignItems: "center", borderTop: "1px solid #edf0f4", pt: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 900, color: "#7f8c8d", mb: 1 }}>
                        Adjuntos ({attachmentsCount})
                    </Typography>
                    {attachmentsCount > 0 ? (
                        auth.Attachments?.map((att) => (
                            <Box key={att.attachmentId} sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.7, minWidth: 0, backgroundColor: "#f8fafc", borderRadius: 1.5, px: 1, py: 0.7 }}>
                                <PdfIcon color="action" fontSize="small" />
                                <Link href={att.url} target="_blank" underline="hover" sx={{ color: "#34495e", flex: 1, minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                    {att.fileName}
                                </Link>
                                <IconButton size="small" href={att.url} target="_blank" aria-label={`Descargar ${att.fileName}`} title="Descargar archivo">
                                    <DownloadIcon sx={{ fontSize: 16 }} />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    onClick={() => onDeleteAttachment(att)}
                                    disabled={deletingAttachmentId === att.attachmentId}
                                    aria-label={`Eliminar ${att.fileName}`}
                                    title="Eliminar archivo"
                                    sx={{ color: "#d32f2f", "&:hover": { backgroundColor: "#ffebee" } }}
                                >
                                    {deletingAttachmentId === att.attachmentId
                                        ? <CircularProgress size={16} color="inherit" />
                                        : <DeleteOutlineIcon sx={{ fontSize: 18 }} />}
                                </IconButton>
                            </Box>
                        ))
                    ) : (
                        <Typography sx={{ color: "#7f8c8d" }}>Sin archivos adjuntos</Typography>
                    )}
                </Box>

                {auth.isApproved ? (
                    <Box sx={{ width: "100%", alignSelf: "center" }}>
                        <Box sx={{ textAlign: "center", backgroundColor: "#f1f8f3", borderRadius: 2, p: 0, width: "100%", height: 112, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <Typography sx={{ color: "#2e7d32", fontWeight: 950, mb: 0.8 }}>
                                Aprobado
                            </Typography>
                            <Typography sx={{ color: "#5f6b7a", fontSize: 14 }}>
                                Aprobado por: <b>{approverName}</b>
                            </Typography>
                            <Typography sx={{ color: "#5f6b7a", fontSize: 14 }}>
                                Fecha: {new Date(auth.approvalDate).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}
                            </Typography>
                        </Box>
                    </Box>
                ) : approvalAction}
            </Box>
        </Box>
    );
}

DetailStatCard.propTypes = {
    icon: PropTypes.node,
    title: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    subtitle: PropTypes.string,
};

MetricCard.propTypes = {
    icon: PropTypes.node,
    title: PropTypes.string,
    value: PropTypes.string,
    subtitle: PropTypes.string,
    color: PropTypes.string,
    bg: PropTypes.string,
    progress: PropTypes.number,
    onClick: PropTypes.func,
    isActive: PropTypes.bool,
};

SecretariaSummaryCard.propTypes = {
    secretaria: PropTypes.string,
    total: PropTypes.number,
    approved: PropTypes.any,
    pending: PropTypes.any,
    index: PropTypes.number,
    isSelected: PropTypes.bool,
    onViewDetails: PropTypes.func,
};

SystemListItem.propTypes = {
    auth: PropTypes.object,
    selected: PropTypes.any,
    onSelect: PropTypes.func,
};

SystemDetailPanel.propTypes = {
    auth: PropTypes.object,
    canApprove: PropTypes.bool,
    onApprove: PropTypes.func,
    onEdit: PropTypes.func,
    onDeleteAttachment: PropTypes.func,
    deletingAttachmentId: PropTypes.number,
};
