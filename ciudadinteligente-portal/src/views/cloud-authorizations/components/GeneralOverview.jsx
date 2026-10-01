import { useMemo, useState } from "react";
import { Box, Button, Chip, Dialog, DialogContent, DialogTitle, FormControl, Grid, IconButton, InputAdornment, InputLabel, MenuItem, Select, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Typography } from "@mui/material";
import {
    AccessTime as AccessTimeIcon,
    AccountBalance as AccountBalanceIcon,
    CheckCircleOutline as CheckCircleOutlineIcon,
    Close as CloseIcon,
    DonutLarge as DonutLargeIcon,
    Search as SearchIcon,
    Storage as StorageIcon
} from "@mui/icons-material";

import { getPercentage } from "../utils";
import { MetricCard, SecretariaSummaryCard } from "./CloudAuthorizationCards";

import PropTypes from "prop-types";
export function GeneralOverview({
    dashboardStats,
    generalSearch,
    onGeneralSearchChange,
    secretarias,
    allSecretarias = secretarias,
    allAuthorizations = [],
    onSelectSecretaria,
    approvedAuthorizations = [],
    pendingAuthorizations = []
}) {
    const [secretariasDialogOpen, setSecretariasDialogOpen] = useState(false);
    const [secretariasSearch, setSecretariasSearch] = useState("");
    const [systemsDialogOpen, setSystemsDialogOpen] = useState(false);
    const [systemsSearch, setSystemsSearch] = useState("");
    const [systemsSecretariaFilter, setSystemsSecretariaFilter] = useState("all");
    const [approvedDialogOpen, setApprovedDialogOpen] = useState(false);
    const [approvedSearch, setApprovedSearch] = useState("");
    const [approvedSecretariaFilter, setApprovedSecretariaFilter] = useState("all");
    const [pendingDialogOpen, setPendingDialogOpen] = useState(false);
    const [pendingSearch, setPendingSearch] = useState("");
    const [pendingSecretariaFilter, setPendingSecretariaFilter] = useState("all");

    const approvedSystems = useMemo(() => (
        [...approvedAuthorizations].sort((authA, authB) => (
            new Date(authB?.approvalDate || 0) - new Date(authA?.approvalDate || 0)
        ))
    ), [approvedAuthorizations]);

    const pendingSystems = useMemo(() => (
        [...pendingAuthorizations].sort((authA, authB) => (authB?.authId || 0) - (authA?.authId || 0))
    ), [pendingAuthorizations]);

    const allSystems = useMemo(() => (
        [...allAuthorizations].sort((authA, authB) => (authB?.authId || 0) - (authA?.authId || 0))
    ), [allAuthorizations]);

    const normalizeSecretariaKey = (secretaria) => (
        (secretaria || "Sin secretaría")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .trim()
            .replace(/\s+/g, " ")
            .toLowerCase()
    );

    const normalizeSearchText = (value) => (
        (value || "")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
    );

    const secretariaRows = useMemo(() => (
        allSecretarias.map(([secretaria, secretariaAuthorizations]) => {
            const approvedCount = secretariaAuthorizations.filter((auth) => auth?.isApproved).length;

            return {
                name: secretaria,
                total: secretariaAuthorizations.length,
                approved: approvedCount,
                pending: secretariaAuthorizations.length - approvedCount
            };
        })
    ), [allSecretarias]);

    const filteredSecretariaRows = useMemo(() => {
        const normalizedSearch = normalizeSearchText(secretariasSearch.trim());
        if (!normalizedSearch) return secretariaRows;

        return secretariaRows.filter((secretaria) =>
            normalizeSearchText(secretaria.name).includes(normalizedSearch)
        );
    }, [secretariaRows, secretariasSearch]);

    const hasSecretariasFilters = Boolean(secretariasSearch.trim());

    const systemsSecretariaMap = useMemo(() => {
        const secretariaMap = new Map();

        allSystems.forEach((auth) => {
            const secretaria = auth?.secretaria || "Sin secretaría";
            const key = normalizeSecretariaKey(secretaria);
            const currentLabel = secretariaMap.get(key);
            const shouldPreferLabel = !currentLabel || secretaria.normalize("NFD") !== secretaria;

            if (shouldPreferLabel) {
                secretariaMap.set(key, secretaria);
            }
        });

        return secretariaMap;
    }, [allSystems]);

    const systemsSecretarias = useMemo(() => (
        [...systemsSecretariaMap.entries()]
            .map(([key, label]) => ({ key, label }))
            .sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }))
    ), [systemsSecretariaMap]);

    const filteredSystems = useMemo(() => {
        const normalizedSearch = normalizeSearchText(systemsSearch.trim());

        return allSystems.filter((auth) =>
            (!normalizedSearch || normalizeSearchText(auth?.systemName || "").includes(normalizedSearch)) &&
            (systemsSecretariaFilter === "all" || normalizeSecretariaKey(auth?.secretaria) === systemsSecretariaFilter)
        );
    }, [allSystems, systemsSearch, systemsSecretariaFilter]);

    const hasSystemsFilters = Boolean(systemsSearch.trim()) || systemsSecretariaFilter !== "all";

    const approvedSecretariaMap = useMemo(() => {
        const secretariaMap = new Map();

        approvedSystems.forEach((auth) => {
            const secretaria = auth?.secretaria || "Sin secretaría";
            const key = normalizeSecretariaKey(secretaria);
            const currentLabel = secretariaMap.get(key);
            const shouldPreferLabel = !currentLabel || secretaria.normalize("NFD") !== secretaria;

            if (shouldPreferLabel) {
                secretariaMap.set(key, secretaria);
            }
        });

        return secretariaMap;
    }, [approvedSystems]);

    const approvedSecretarias = useMemo(() => (
        [...approvedSecretariaMap.entries()]
            .map(([key, label]) => ({ key, label }))
            .sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }))
    ), [approvedSecretariaMap]);

    const pendingSecretariaMap = useMemo(() => {
        const secretariaMap = new Map();

        pendingSystems.forEach((auth) => {
            const secretaria = auth?.secretaria || "Sin secretaría";
            const key = normalizeSecretariaKey(secretaria);
            const currentLabel = secretariaMap.get(key);
            const shouldPreferLabel = !currentLabel || secretaria.normalize("NFD") !== secretaria;

            if (shouldPreferLabel) {
                secretariaMap.set(key, secretaria);
            }
        });

        return secretariaMap;
    }, [pendingSystems]);

    const pendingSecretarias = useMemo(() => (
        [...pendingSecretariaMap.entries()]
            .map(([key, label]) => ({ key, label }))
            .sort((a, b) => a.label.localeCompare(b.label, "es", { sensitivity: "base" }))
    ), [pendingSecretariaMap]);

    const filteredApprovedSystems = useMemo(() => {
        const normalizedSearch = normalizeSearchText(approvedSearch.trim());

        return approvedSystems.filter((auth) =>
            (!normalizedSearch || normalizeSearchText(auth?.systemName || "").includes(normalizedSearch)) &&
            (approvedSecretariaFilter === "all" || normalizeSecretariaKey(auth?.secretaria) === approvedSecretariaFilter)
        );
    }, [approvedSearch, approvedSecretariaFilter, approvedSystems]);

    const hasApprovedFilters = Boolean(approvedSearch.trim()) || approvedSecretariaFilter !== "all";

    const filteredPendingSystems = useMemo(() => {
        const normalizedSearch = normalizeSearchText(pendingSearch.trim());

        return pendingSystems.filter((auth) =>
            (!normalizedSearch || normalizeSearchText(auth?.systemName || "").includes(normalizedSearch)) &&
            (pendingSecretariaFilter === "all" || normalizeSecretariaKey(auth?.secretaria) === pendingSecretariaFilter)
        );
    }, [pendingSearch, pendingSecretariaFilter, pendingSystems]);

    const hasPendingFilters = Boolean(pendingSearch.trim()) || pendingSecretariaFilter !== "all";

    const updateApprovedSearch = (value) => {
        setApprovedSearch(value);
    };

    const updateApprovedSecretariaFilter = (value) => {
        setApprovedSecretariaFilter(value);
    };

    const clearApprovedFilters = () => {
        setApprovedSearch("");
        setApprovedSecretariaFilter("all");
    };

    const closeApprovedDialog = () => {
        setApprovedDialogOpen(false);
        clearApprovedFilters();
    };

    const updateSystemsSearch = (value) => {
        setSystemsSearch(value);
    };

    const updateSystemsSecretariaFilter = (value) => {
        setSystemsSecretariaFilter(value);
    };

    const clearSystemsFilters = () => {
        setSystemsSearch("");
        setSystemsSecretariaFilter("all");
    };

    const closeSystemsDialog = () => {
        setSystemsDialogOpen(false);
        clearSystemsFilters();
    };

    const clearSecretariasFilters = () => {
        setSecretariasSearch("");
    };

    const closeSecretariasDialog = () => {
        setSecretariasDialogOpen(false);
        clearSecretariasFilters();
    };

    const updatePendingSearch = (value) => {
        setPendingSearch(value);
    };

    const updatePendingSecretariaFilter = (value) => {
        setPendingSecretariaFilter(value);
    };

    const clearPendingFilters = () => {
        setPendingSearch("");
        setPendingSecretariaFilter("all");
    };

    const closePendingDialog = () => {
        setPendingDialogOpen(false);
        clearPendingFilters();
    };

    function getApproverName(auth) {
        if (auth?.Approver?.UserProfile) {
            return `${auth.Approver.UserProfile.name || ""} ${auth.Approver.UserProfile.lastName || ""}`.trim();
        }

        return auth?.Approver?.username || "Sin registro";
    }

    function formatApprovalDateTime(date) {
        if (!date) return "Sin fecha";

        return new Date(date).toLocaleString("es-CO", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    }

    function getSecretariaLabel(secretaria, secretariaMap = approvedSecretariaMap) {
        const key = normalizeSecretariaKey(secretaria);
        return secretariaMap.get(key) || secretaria || "Sin secretaría";
    }

    return (
        <>
            <Grid container columnSpacing={3} rowSpacing={3} sx={{ mb: 3, alignItems: "stretch" }}>
                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} sx={{ display: "flex" }}>
                    <MetricCard
                        icon={AccountBalanceIcon}
                        title="Total de Secretarías"
                        value={dashboardStats.totalSecretarias}
                        subtitle="Dependencias"
                        color="#6b3fd6"
                        bg="#efe8ff"
                        onClick={() => setSecretariasDialogOpen(true)}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} sx={{ display: "flex" }}>
                    <MetricCard
                        icon={StorageIcon}
                        title="Total de Sistemas"
                        value={dashboardStats.totalSystems}
                        subtitle="Sistemas registrados"
                        color="#1769d2"
                        bg="#e8f1ff"
                        onClick={() => setSystemsDialogOpen(true)}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} sx={{ display: "flex" }}>
                    <MetricCard
                        icon={CheckCircleOutlineIcon}
                        title="Sistemas Aprobados"
                        value={dashboardStats.approvedSystems}
                        subtitle={`${dashboardStats.approvalPercentage}% del total`}
                        color="#0aa85a"
                        bg="#e6f7ed"
                        onClick={() => setApprovedDialogOpen(true)}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} sx={{ display: "flex" }}>
                    <MetricCard
                        icon={AccessTimeIcon}
                        title="Sistemas Sin Aprobar"
                        value={dashboardStats.pendingSystems}
                        subtitle={`${getPercentage(dashboardStats.pendingSystems, dashboardStats.totalSystems)}% del total`}
                        color="#f08217"
                        bg="#fff0dd"
                        onClick={() => setPendingDialogOpen(true)}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 4, xl: 2.4 }} sx={{ display: "flex" }}>
                    <MetricCard
                        icon={DonutLargeIcon}
                        title="Porcentaje de Aprobación General"
                        value={`${dashboardStats.approvalPercentage}%`}
                        subtitle="Del total de sistemas"
                        color="#28c9a6"
                        bg="#e5fbf6"
                        progress={dashboardStats.approvalPercentage}
                    />
                </Grid>
            </Grid>

            <Dialog
                open={secretariasDialogOpen}
                onClose={closeSecretariasDialog}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            maxHeight: "92vh"
                        }
                    }
                }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, px: 3, pt: 3, pb: 1 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 950, color: "#172033", fontSize: 24 }}>
                            Secretarías
                        </Typography>
                        <Typography sx={{ color: "#5f6b7a", mt: 0.4, fontSize: 15 }}>
                            Listado de secretarías con sus sistemas registrados.
                        </Typography>
                    </Box>
                    <IconButton onClick={closeSecretariasDialog} aria-label="Cerrar">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 2.5 }}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.3, backgroundColor: "#f1ecff", borderRadius: 1.5, px: 1.5, py: 1.2, mt: 1, mb: 3 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#e5dcff", color: "#6b3fd6", display: "grid", placeItems: "center" }}>
                            <AccountBalanceIcon />
                        </Box>
                        <Typography sx={{ color: "#6b3fd6", fontSize: 26, fontWeight: 950, lineHeight: 1 }}>
                            {secretariaRows.length}
                        </Typography>
                        <Typography sx={{ color: "#172033", fontWeight: 850 }}>
                            secretarías
                        </Typography>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "560px max-content" }, gap: 2, alignItems: "center", justifyContent: "flex-start", mb: 2.5 }}>
                        <TextField
                            fullWidth
                            size="medium"
                            placeholder="Buscar por secretaría..."
                            value={secretariasSearch}
                            onChange={(event) => setSecretariasSearch(event.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        {hasSecretariasFilters && (
                            <Button
                                variant="outlined"
                                onClick={clearSecretariasFilters}
                                sx={{ height: 56, minWidth: 150, px: 2.5, borderRadius: 1.3, fontWeight: 850, whiteSpace: "nowrap", textTransform: "none" }}
                            >
                                Limpiar filtros
                            </Button>
                        )}
                    </Box>

                    {filteredSecretariaRows.length > 0 ? (
                        <TableContainer sx={{ height: 520, border: "1px solid #e7ebf0", borderRadius: 1.5 }}>
                            <Table stickyHeader size="small" sx={{ minWidth: 820, tableLayout: "fixed" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: "46%", fontWeight: 900, color: "#5f6b7a" }}>Secretaría</TableCell>
                                        <TableCell sx={{ width: "18%", fontWeight: 900, color: "#5f6b7a" }}>Sistemas</TableCell>
                                        <TableCell sx={{ width: "18%", fontWeight: 900, color: "#5f6b7a" }}>Aprobados</TableCell>
                                        <TableCell sx={{ width: "18%", fontWeight: 900, color: "#5f6b7a" }}>Sin aprobar</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSecretariaRows.map((secretaria) => (
                                        <TableRow
                                            key={secretaria.name}
                                            hover
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => {
                                                closeSecretariasDialog();
                                                onSelectSecretaria(secretaria.name);
                                            }}
                                        >
                                            <TableCell sx={{ color: "#172033", fontWeight: 850 }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#f1ecff", color: "#6b3fd6", display: "grid", placeItems: "center", flexShrink: 0 }}>
                                                        <AccountBalanceIcon fontSize="small" />
                                                    </Box>
                                                    {secretaria.name}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: "#34495e", fontWeight: 850 }}>
                                                {secretaria.total}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={secretaria.approved}
                                                    size="small"
                                                    sx={{ backgroundColor: "#dff6e8", color: "#188b49", fontWeight: 850 }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={secretaria.pending}
                                                    size="small"
                                                    sx={{ backgroundColor: "#fff0dd", color: "#d86c0d", fontWeight: 850 }}
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography sx={{ color: "#7f8c8d", textAlign: "center", py: 4 }}>
                            No hay secretarías que coincidan con la búsqueda.
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={systemsDialogOpen}
                onClose={closeSystemsDialog}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            maxHeight: "92vh"
                        }
                    }
                }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, px: 3, pt: 3, pb: 1 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 950, color: "#172033", fontSize: 24 }}>
                            Sistemas registrados
                        </Typography>
                        <Typography sx={{ color: "#5f6b7a", mt: 0.4, fontSize: 15 }}>
                            Listado de todos los sistemas registrados con su secretaría y estado.
                        </Typography>
                    </Box>
                    <IconButton onClick={closeSystemsDialog} aria-label="Cerrar">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 2.5 }}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.3, backgroundColor: "#eef5ff", borderRadius: 1.5, px: 1.5, py: 1.2, mt: 1, mb: 3 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#dcecff", color: "#1769d2", display: "grid", placeItems: "center" }}>
                            <StorageIcon />
                        </Box>
                        <Typography sx={{ color: "#1769d2", fontSize: 26, fontWeight: 950, lineHeight: 1 }}>
                            {allSystems.length}
                        </Typography>
                        <Typography sx={{ color: "#172033", fontWeight: 850 }}>
                            sistemas registrados
                        </Typography>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "560px 360px max-content" }, gap: 2, alignItems: "center", justifyContent: "flex-start", mb: 2.5 }}>
                        <TextField
                            fullWidth
                            size="medium"
                            placeholder="Buscar por sistema..."
                            value={systemsSearch}
                            onChange={(event) => updateSystemsSearch(event.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        <FormControl fullWidth size="medium">
                            <InputLabel>Secretaría</InputLabel>
                            <Select
                                label="Secretaría"
                                value={systemsSecretariaFilter}
                                onChange={(event) => updateSystemsSecretariaFilter(event.target.value)}
                            >
                                <MenuItem value="all">Todas</MenuItem>
                                {systemsSecretarias.map((secretaria) => (
                                    <MenuItem key={secretaria.key} value={secretaria.key}>{secretaria.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {hasSystemsFilters && (
                            <Button
                                variant="outlined"
                                onClick={clearSystemsFilters}
                                sx={{ height: 56, minWidth: 150, px: 2.5, borderRadius: 1.3, fontWeight: 850, whiteSpace: "nowrap", textTransform: "none" }}
                            >
                                Limpiar filtros
                            </Button>
                        )}
                    </Box>

                    {filteredSystems.length > 0 ? (
                        <TableContainer sx={{ height: 520, border: "1px solid #e7ebf0", borderRadius: 1.5 }}>
                            <Table stickyHeader size="small" sx={{ minWidth: 820, tableLayout: "fixed" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: "38%", fontWeight: 900, color: "#5f6b7a" }}>Sistema</TableCell>
                                        <TableCell sx={{ width: "38%", fontWeight: 900, color: "#5f6b7a" }}>Secretaría</TableCell>
                                        <TableCell sx={{ width: "24%", fontWeight: 900, color: "#5f6b7a" }}>Estado</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredSystems.map((auth) => {
                                        const approved = Boolean(auth?.isApproved);
                                        return (
                                            <TableRow
                                                key={auth.authId}
                                                hover
                                                sx={{ cursor: "pointer" }}
                                                onClick={() => {
                                                    closeSystemsDialog();
                                                    onSelectSecretaria(auth.secretaria || "Sin secretaría", auth.authId);
                                                }}
                                            >
                                                <TableCell sx={{ fontWeight: 850, color: "#172033" }}>
                                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                        <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: approved ? "#e6f7ed" : "#fff0dd", color: approved ? "#179750" : "#f08217", display: "grid", placeItems: "center", flexShrink: 0 }}>
                                                            {approved ? <CheckCircleOutlineIcon fontSize="small" /> : <AccessTimeIcon fontSize="small" />}
                                                        </Box>
                                                        {auth.systemName || "Sistema sin nombre"}
                                                    </Box>
                                                </TableCell>
                                                <TableCell sx={{ color: "#34495e" }}>
                                                    {getSecretariaLabel(auth.secretaria, systemsSecretariaMap)}
                                                </TableCell>
                                                <TableCell>
                                                    <Chip
                                                        label={approved ? "Aprobado" : "Pendiente"}
                                                        size="small"
                                                        sx={{
                                                            backgroundColor: approved ? "#dff6e8" : "#fff0dd",
                                                            color: approved ? "#188b49" : "#d86c0d",
                                                            fontWeight: 850,
                                                            "& .MuiChip-label": { px: 1 }
                                                        }}
                                                    />
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography sx={{ color: "#7f8c8d", textAlign: "center", py: 4 }}>
                            No hay sistemas que coincidan con la búsqueda.
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={approvedDialogOpen}
                onClose={closeApprovedDialog}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            maxHeight: "92vh"
                        }
                    }
                }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, px: 3, pt: 3, pb: 1 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 950, color: "#172033", fontSize: 24 }}>
                            Sistemas aprobados
                        </Typography>
                        <Typography sx={{ color: "#5f6b7a", mt: 0.4, fontSize: 15 }}>
                            Listado de sistemas aprobados con su secretaría, fecha y responsable.
                        </Typography>
                    </Box>
                    <IconButton onClick={closeApprovedDialog} aria-label="Cerrar">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 2.5 }}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.3, backgroundColor: "#eefaf3", borderRadius: 1.5, px: 1.5, py: 1.2, mt: 1, mb: 3 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#d9f5e5", color: "#179750", display: "grid", placeItems: "center" }}>
                            <CheckCircleOutlineIcon />
                        </Box>
                        <Typography sx={{ color: "#178143", fontSize: 26, fontWeight: 950, lineHeight: 1 }}>
                            {approvedSystems.length}
                        </Typography>
                        <Typography sx={{ color: "#172033", fontWeight: 850 }}>
                            sistemas aprobados
                        </Typography>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "560px 360px max-content" }, gap: 2, alignItems: "center", justifyContent: "flex-start", mb: 2.5 }}>
                        <TextField
                            fullWidth
                            size="medium"
                            placeholder="Buscar por sistema..."
                            value={approvedSearch}
                            onChange={(event) => updateApprovedSearch(event.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        <FormControl fullWidth size="medium">
                            <InputLabel>Secretaría</InputLabel>
                            <Select
                                label="Secretaría"
                                value={approvedSecretariaFilter}
                                onChange={(event) => updateApprovedSecretariaFilter(event.target.value)}
                            >
                                <MenuItem value="all">Todas</MenuItem>
                                {approvedSecretarias.map((secretaria) => (
                                    <MenuItem key={secretaria.key} value={secretaria.key}>{secretaria.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {hasApprovedFilters && (
                            <Button
                                variant="outlined"
                                onClick={clearApprovedFilters}
                                sx={{ height: 56, minWidth: 150, px: 2.5, borderRadius: 1.3, fontWeight: 850, whiteSpace: "nowrap", textTransform: "none" }}
                            >
                                Limpiar filtros
                            </Button>
                        )}
                    </Box>

                    {filteredApprovedSystems.length > 0 ? (
                        <TableContainer sx={{ height: 520, border: "1px solid #e7ebf0", borderRadius: 1.5 }}>
                            <Table stickyHeader size="small" sx={{ minWidth: 1250 }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 900, color: "#5f6b7a" }}>Sistema</TableCell>
                                        <TableCell sx={{ fontWeight: 900, color: "#5f6b7a" }}>Secretaría</TableCell>
                                        <TableCell sx={{ fontWeight: 900, color: "#5f6b7a" }}>Fecha de aprobación</TableCell>
                                        <TableCell sx={{ fontWeight: 900, color: "#5f6b7a" }}>Aprobado por</TableCell>
                                        <TableCell sx={{ fontWeight: 900, color: "#5f6b7a" }}>Estado</TableCell>
                                        <TableCell sx={{ fontWeight: 900, color: "#5f6b7a", minWidth: 250 }}>Observaciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredApprovedSystems.map((auth) => (
                                        <TableRow
                                            key={auth.authId}
                                            hover
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => {
                                                closeApprovedDialog();
                                                onSelectSecretaria(auth.secretaria || "Sin secretaría", auth.authId);
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 850, color: "#172033" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#e6f7ed", color: "#179750", display: "grid", placeItems: "center", flexShrink: 0 }}>
                                                        <CheckCircleOutlineIcon fontSize="small" />
                                                    </Box>
                                                    {auth.systemName || "Sistema sin nombre"}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: "#34495e" }}>
                                                {getSecretariaLabel(auth.secretaria)}
                                            </TableCell>
                                            <TableCell sx={{ color: "#34495e" }}>
                                                {formatApprovalDateTime(auth.approvalDate)}
                                            </TableCell>
                                            <TableCell sx={{ color: "#34495e" }}>
                                                <Typography sx={{ color: "#172033", fontWeight: 850, lineHeight: 1.25 }}>
                                                    {getApproverName(auth)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label="Aprobado"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: "#dff6e8",
                                                        color: "#188b49",
                                                        fontWeight: 850,
                                                        "& .MuiChip-label": { px: 1 }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: "#5f6b7a" }}>
                                                <Typography
                                                    title={auth.observations || "Sin observaciones"}
                                                    sx={{
                                                        fontSize: "inherit",
                                                        color: "inherit",
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden"
                                                    }}
                                                >
                                                    {auth.observations || "Sin observaciones"}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography sx={{ color: "#7f8c8d", textAlign: "center", py: 4 }}>
                            {approvedSystems.length > 0 ? "No hay sistemas aprobados que coincidan con la búsqueda." : "No hay sistemas aprobados."}
                        </Typography>
                    )}

                </DialogContent>
            </Dialog>

            <Dialog
                open={pendingDialogOpen}
                onClose={closePendingDialog}
                maxWidth="lg"
                fullWidth
                slotProps={{
                    paper: {
                        sx: {
                            borderRadius: 2,
                            maxHeight: "92vh"
                        }
                    }
                }}
            >
                <DialogTitle sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 2, px: 3, pt: 3, pb: 1 }}>
                    <Box>
                        <Typography sx={{ fontWeight: 950, color: "#172033", fontSize: 24 }}>
                            Sistemas sin aprobar
                        </Typography>
                        <Typography sx={{ color: "#5f6b7a", mt: 0.4, fontSize: 15 }}>
                            Listado de sistemas pendientes con su secretaría y estado actual.
                        </Typography>
                    </Box>
                    <IconButton onClick={closePendingDialog} aria-label="Cerrar">
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent sx={{ px: 3, pb: 2.5 }}>
                    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.3, backgroundColor: "#fff4e5", borderRadius: 1.5, px: 1.5, py: 1.2, mt: 1, mb: 3 }}>
                        <Box sx={{ width: 44, height: 44, borderRadius: "50%", backgroundColor: "#ffe8cc", color: "#f08217", display: "grid", placeItems: "center" }}>
                            <AccessTimeIcon />
                        </Box>
                        <Typography sx={{ color: "#d86c0d", fontSize: 26, fontWeight: 950, lineHeight: 1 }}>
                            {pendingSystems.length}
                        </Typography>
                        <Typography sx={{ color: "#172033", fontWeight: 850 }}>
                            sistemas sin aprobar
                        </Typography>
                    </Box>

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "560px 360px max-content" }, gap: 2, alignItems: "center", justifyContent: "flex-start", mb: 2.5 }}>
                        <TextField
                            fullWidth
                            size="medium"
                            placeholder="Buscar por sistema..."
                            value={pendingSearch}
                            onChange={(event) => updatePendingSearch(event.target.value)}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon />
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />

                        <FormControl fullWidth size="medium">
                            <InputLabel>Secretaría</InputLabel>
                            <Select
                                label="Secretaría"
                                value={pendingSecretariaFilter}
                                onChange={(event) => updatePendingSecretariaFilter(event.target.value)}
                            >
                                <MenuItem value="all">Todas</MenuItem>
                                {pendingSecretarias.map((secretaria) => (
                                    <MenuItem key={secretaria.key} value={secretaria.key}>{secretaria.label}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {hasPendingFilters && (
                            <Button
                                variant="outlined"
                                onClick={clearPendingFilters}
                                sx={{ height: 56, minWidth: 150, px: 2.5, borderRadius: 1.3, fontWeight: 850, whiteSpace: "nowrap", textTransform: "none" }}
                            >
                                Limpiar filtros
                            </Button>
                        )}
                    </Box>

                    {filteredPendingSystems.length > 0 ? (
                        <TableContainer sx={{ height: 520, border: "1px solid #e7ebf0", borderRadius: 1.5 }}>
                            <Table stickyHeader size="small" sx={{ minWidth: 1050, tableLayout: "fixed" }}>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ width: "25%", fontWeight: 900, color: "#5f6b7a" }}>Sistema</TableCell>
                                        <TableCell sx={{ width: "28%", fontWeight: 900, color: "#5f6b7a" }}>Secretaría</TableCell>
                                        <TableCell sx={{ width: "15%", fontWeight: 900, color: "#5f6b7a" }}>Estado</TableCell>
                                        <TableCell sx={{ width: "32%", fontWeight: 900, color: "#5f6b7a" }}>Observaciones</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredPendingSystems.map((auth) => (
                                        <TableRow
                                            key={auth.authId}
                                            hover
                                            sx={{ cursor: "pointer" }}
                                            onClick={() => {
                                                closePendingDialog();
                                                onSelectSecretaria(auth.secretaria || "Sin secretaría", auth.authId);
                                            }}
                                        >
                                            <TableCell sx={{ fontWeight: 850, color: "#172033" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                    <Box sx={{ width: 32, height: 32, borderRadius: "50%", backgroundColor: "#fff0dd", color: "#f08217", display: "grid", placeItems: "center", flexShrink: 0 }}>
                                                        <AccessTimeIcon fontSize="small" />
                                                    </Box>
                                                    {auth.systemName || "Sistema sin nombre"}
                                                </Box>
                                            </TableCell>
                                            <TableCell sx={{ color: "#34495e" }}>
                                                {getSecretariaLabel(auth.secretaria, pendingSecretariaMap)}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label="Pendiente"
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: "#fff0dd",
                                                        color: "#d86c0d",
                                                        fontWeight: 850,
                                                        "& .MuiChip-label": { px: 1 }
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell sx={{ color: "#5f6b7a" }}>
                                                <Typography
                                                    title={auth.observations || "Sin observaciones"}
                                                    sx={{
                                                        fontSize: "inherit",
                                                        color: "inherit",
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden"
                                                    }}
                                                >
                                                    {auth.observations || "Sin observaciones"}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Typography sx={{ color: "#7f8c8d", textAlign: "center", py: 4 }}>
                            {pendingSystems.length > 0 ? "No hay sistemas pendientes que coincidan con la búsqueda." : "No hay sistemas sin aprobar."}
                        </Typography>
                    )}
                </DialogContent>
            </Dialog>

            <Box
                sx={{
                    borderRadius: 2,
                    p: 2.5,
                    width: { xs: "100%", md: "60%" },
                    maxWidth: 720,
                    mx: "auto",
                    mb: 4
                }}
            >
                <TextField
                    fullWidth
                    size="medium"
                    sx={{
                        backgroundColor: "white",
                        "& .MuiOutlinedInput-root": {
                            "& fieldset": { borderColor: "#1769d2" },
                            "&:hover fieldset": { borderColor: "#1769d2" },
                            "&.Mui-focused fieldset": { borderColor: "#1769d2" }
                        }
                    }}
                    placeholder="Buscar por sistema o secretaría..."
                    value={generalSearch}
                    onChange={(event) => onGeneralSearchChange(event.target.value)}
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

            <Grid container columnSpacing={4} rowSpacing={6} sx={{ mt: 3, mb: 5, alignItems: "stretch" }}>
                {secretarias.map(([secretaria, secretariaAuthorizations], index) => {
                    const approvedCount = secretariaAuthorizations.filter((auth) => auth.isApproved).length;
                    const pendingCount = secretariaAuthorizations.length - approvedCount;

                    return (
                        <Grid
                            size={{ xs: 12, sm: 6, lg: 4, xl: 3 }}
                            key={secretaria}
                            sx={{ display: "flex", mb: 2 }}
                        >
                            <SecretariaSummaryCard
                                secretaria={secretaria}
                                total={secretariaAuthorizations.length}
                                approved={approvedCount}
                                pending={pendingCount}
                                index={index}
                                isSelected={false}
                                onViewDetails={() => onSelectSecretaria(secretaria)}
                            />
                        </Grid>
                    );
                })}
            </Grid>

            {secretarias.length === 0 && (
                <Box sx={{ textAlign: "center", color: "#7f8c8d", mt: 2, mb: 5 }}>
                    No hay secretarías o sistemas que coincidan con la búsqueda.
                </Box>
            )}
        </>
    );
}

GeneralOverview.propTypes = {
    dashboardStats: PropTypes.object,
    generalSearch: PropTypes.any,
    onGeneralSearchChange: PropTypes.func,
    secretarias: PropTypes.array,
    allSecretarias: PropTypes.array,
    allAuthorizations: PropTypes.array,
    onSelectSecretaria: PropTypes.func,
    approvedAuthorizations: PropTypes.array,
    pendingAuthorizations: PropTypes.array,
};
