import { Box, Grid, Typography, Button, TextField, InputAdornment } from "@mui/material";
import {
    AccountBalance as AccountBalanceIcon,
    ArrowBack as ArrowBackIcon,
    Computer as ComputerIcon,
    Paid as PaidIcon,
    Search as SearchIcon,
    Storage as StorageIcon
} from "@mui/icons-material";

import { formatMoney } from "../../../utils/formatMoney";
import { DetailStatCard, SystemDetailPanel, SystemListItem } from "./CloudAuthorizationCards";

import PropTypes from "prop-types";
export function SecretariaDetailView({
    secretariaName,
    authorizations,
    filteredAuthorizations,
    selectedSystem,
    totalCost,
    systemSearch,
    onSystemSearchChange,
    onBack,
    onSelectSystem,
    canApprove,
    onApprove,
    onEdit,
    onDeleteAttachment,
    deletingAttachmentId
}) {
    return (
        <Box sx={{ width: "100%" }}>
            <Box
                sx={{
                    backgroundColor: "#fff",
                    border: "1px solid #e7ebf0",
                    borderRadius: 2,
                    p: 3,
                    mb: 3,
                    boxShadow: "0 4px 16px rgba(15,23,42,0.05)"
                }}
            >
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={onBack}
                    sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 800, mb: 2 }}
                >
                    Volver
                </Button>

                <Grid container spacing={3} sx={{ alignItems: "center" }}>
                    <Grid size={{ xs: 12, lg: 5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <Box
                                sx={{
                                    width: 78,
                                    height: 78,
                                    borderRadius: "50%",
                                    backgroundColor: "#e8f1ff",
                                    color: "#1769d2",
                                    display: "grid",
                                    placeItems: "center",
                                    flexShrink: 0,
                                    position: "relative"
                                }}
                            >
                                <AccountBalanceIcon sx={{ fontSize: 40 }} />
                                <Box sx={{ width: 14, height: 14, borderRadius: "50%", backgroundColor: "#2fbf71", border: "3px solid #fff", position: "absolute", right: 3, bottom: 8 }} />
                            </Box>
                            <Box>
                                <Typography variant="h5" sx={{ fontWeight: 950, color: "#172033", lineHeight: 1.2 }}>
                                    Detalle de {secretariaName}
                                </Typography>
                                <Typography sx={{ color: "#5f6b7a", mt: 0.7 }}>
                                    Sistemas registrados para esta secretaría
                                </Typography>
                            </Box>
                        </Box>
                    </Grid>

                    <Grid size={{ xs: 12, sm: 4, lg: 2.3 }}>
                        <DetailStatCard
                            icon={ComputerIcon}
                            title="Sistemas"
                            value={authorizations.length}
                            subtitle="registrados"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, lg: 2.7 }}>
                        <DetailStatCard
                            icon={PaidIcon}
                            title="Consumo mensual estimado"
                            value={formatMoney(totalCost, "USD")}
                            subtitle="total"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4, lg: 2 }}>
                        <DetailStatCard
                            icon={StorageIcon}
                            title="Moneda"
                            value="USD"
                            subtitle="dólar estadounidense"
                        />
                    </Grid>
                </Grid>
            </Box>

            <Grid container spacing={3} sx={{ alignItems: "stretch" }}>
                <Grid size={{ xs: 12, lg: 5 }} sx={{ display: "flex", height: { xs: "auto", lg: "clamp(420px, calc(100vh - 320px), 560px)" } }}>
                    <Box sx={{ backgroundColor: "#fff", border: "1px solid #e7ebf0", borderRadius: 2, boxShadow: "0 4px 16px rgba(15,23,42,0.05)", width: "100%", height: "100%", boxSizing: "border-box", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, p: 2.5, borderBottom: "1px solid #edf0f4", flexDirection: { xs: "column", sm: "row" } }}>
                            <Typography sx={{ fontWeight: 950, color: "#172033", alignSelf: { xs: "flex-start", sm: "center" } }}>
                                Sistemas ({authorizations.length})
                            </Typography>
                            <TextField
                                size="small"
                                placeholder="Buscar sistemas..."
                                value={systemSearch}
                                onChange={(event) => onSystemSearchChange(event.target.value)}
                                sx={{ width: { xs: "100%", sm: 260 } }}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        </Box>

                        <Box sx={{ p: 2.5, flex: 1, minHeight: 0, overflowY: { xs: "visible", lg: "auto" } }}>
                            {filteredAuthorizations.length > 0 ? (
                                filteredAuthorizations.map((auth) => (
                                    <SystemListItem
                                        key={auth.authId}
                                        auth={auth}
                                        selected={selectedSystem?.authId === auth.authId}
                                        onSelect={() => onSelectSystem(auth.authId)}
                                    />
                                ))
                            ) : (
                                <Typography sx={{ color: "#7f8c8d", textAlign: "center", py: 4 }}>
                                    No hay sistemas que coincidan con la búsqueda.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                </Grid>

                <Grid size={{ xs: 12, lg: 7 }} sx={{ display: "flex", height: { xs: "auto", lg: "clamp(420px, calc(100vh - 320px), 560px)" } }}>
                    <SystemDetailPanel
                        auth={selectedSystem}
                        canApprove={canApprove}
                        onApprove={onApprove}
                        onEdit={onEdit}
                        onDeleteAttachment={onDeleteAttachment}
                        deletingAttachmentId={deletingAttachmentId}
                    />
                </Grid>
            </Grid>

            <Box sx={{ mt: 3, backgroundColor: "#fff8e6", border: "1px solid #ffe2a8", borderRadius: 2, p: 2, color: "#7a4b00" }}>
                <Typography sx={{ fontWeight: 800 }}>
                    Nota: Los costos pueden variar de acuerdo con el consumo real de los servicios, crecimiento en almacenamiento, tráfico, alta disponibilidad, replicación geográfica, ajustes en la capacidad de infraestructura y variación de la TRM. Los servicios de Azure son facturados en dólares estadounidenses (USD).
                </Typography>
            </Box>
        </Box>
    );
}

SecretariaDetailView.propTypes = {
    secretariaName: PropTypes.string,
    authorizations: PropTypes.object,
    filteredAuthorizations: PropTypes.object,
    selectedSystem: PropTypes.bool,
    totalCost: PropTypes.number,
    systemSearch: PropTypes.object,
    onSystemSearchChange: PropTypes.func,
    onBack: PropTypes.func,
    onSelectSystem: PropTypes.func,
    canApprove: PropTypes.bool,
    onApprove: PropTypes.func,
    onEdit: PropTypes.func,
    onDeleteAttachment: PropTypes.func,
    deletingAttachmentId: PropTypes.number,
};
