import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import Swal from 'sweetalert2';

import { usePermission } from "../../hooks/usePermission";
import { useAuth } from "../../provider/useAuth"; 

import { useErrorAlert, useSuccessAlert } from "../../hooks/errorAlert";
import { cloudAuthGetAll, cloudAuthApprove, cloudAuthCreate, cloudAuthDeleteAttachment, cloudAuthUpdateObservations } from "../../api/cloud-authorizations";
import NewCloudAuthModal from "../../components/Forms/NewCloudAuth";
import { GeneralOverview } from "./components/GeneralOverview";
import { SecretariaDetailView } from "./components/SecretariaDetailView";
import { getAuthTotalCost, getPercentage } from "./utils";

export function CloudAuthorizations() {
    const { errorAlert } = useErrorAlert();
    const { successAlert } = useSuccessAlert();
    const [selectedAuth, setSelectedAuth] = useState(null);

    const { authUser } = useAuth();
    const { hasPermission } = usePermission();

    const [authorizations, setAuthorizations] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deletingAttachmentId, setDeletingAttachmentId] = useState(null);

    const [modalOpen, setModalOpen] = useState(false);
    const [selectedSecretaria, setSelectedSecretaria] = useState(null);
    const [selectedSystemId, setSelectedSystemId] = useState(null);
    const [generalSearch, setGeneralSearch] = useState("");
    const [systemSearch, setSystemSearch] = useState("");
    const errorAlertRef = useRef(errorAlert);

    useEffect(() => {
        errorAlertRef.current = errorAlert;
    }, [errorAlert]);

    // CONTROL ESPECÍFICO POR IDs DE USUARIO
    const allowedAdminIds = [7, 8, 3, 12];

    const canApprove = hasPermission([4]) && allowedAdminIds.includes(authUser?.userId);

    const authorizationsBySecretaria = useMemo(() => {
        const grouped = authorizations.reduce((acc, auth) => {
            if (!auth) return acc;

            const secretaria = auth.secretaria || "Sin secretaría";
            if (!acc[secretaria]) {
                acc[secretaria] = [];
            }

            acc[secretaria].push(auth);
            return acc;
        }, {});

        return Object.entries(grouped).sort(([secretariaA], [secretariaB]) =>
            secretariaA.localeCompare(secretariaB, "es", { sensitivity: "base" })
        );
    }, [authorizations]);

    const dashboardStats = useMemo(() => {
        const totalSystems = authorizations.length;
        const approvedSystems = authorizations.filter((auth) => auth?.isApproved).length;
        const pendingSystems = totalSystems - approvedSystems;
        const approvalPercentage = getPercentage(approvedSystems, totalSystems);

        return {
            totalSecretarias: authorizationsBySecretaria.length,
            totalSystems,
            approvedSystems,
            pendingSystems,
            approvalPercentage
        };
    }, [authorizations, authorizationsBySecretaria]);

    const approvedAuthorizations = useMemo(() => (
        authorizations.filter((auth) => auth?.isApproved)
    ), [authorizations]);

    const pendingAuthorizations = useMemo(() => (
        authorizations.filter((auth) => !auth?.isApproved)
    ), [authorizations]);

    const filteredAuthorizationsBySecretaria = useMemo(() => {
        const normalizedSearch = generalSearch.trim().toLowerCase();
        if (!normalizedSearch) return authorizationsBySecretaria;

        return authorizationsBySecretaria.filter(([secretaria, secretariaAuthorizations]) => {
            const secretariaMatches = secretaria.toLowerCase().includes(normalizedSearch);
            const systemMatches = secretariaAuthorizations.some((auth) =>
                `${auth.systemName || ""} ${auth.description || ""}`
                    .toLowerCase()
                    .includes(normalizedSearch)
            );

            return secretariaMatches || systemMatches;
        });
    }, [authorizationsBySecretaria, generalSearch]);

    const selectedSecretariaData = useMemo(() => {
        if (!selectedSecretaria) return null;
        return authorizationsBySecretaria.find(([secretaria]) => secretaria === selectedSecretaria);
    }, [authorizationsBySecretaria, selectedSecretaria]);

    const selectedSecretariaAuthorizations = useMemo(() => (
        selectedSecretariaData?.[1] || []
    ), [selectedSecretariaData]);

    const filteredSecretariaAuthorizations = useMemo(() => {
        const normalizedSearch = systemSearch.trim().toLowerCase();
        if (!normalizedSearch) return selectedSecretariaAuthorizations;

        return selectedSecretariaAuthorizations.filter((auth) =>
            `${auth.systemName || ""} ${auth.description || ""}`
                .toLowerCase()
                .includes(normalizedSearch)
        );
    }, [selectedSecretariaAuthorizations, systemSearch]);

    const selectedSystem = useMemo(() => {
        if (!selectedSecretariaAuthorizations.length) return null;
        return selectedSecretariaAuthorizations.find((auth) => auth.authId === selectedSystemId) || selectedSecretariaAuthorizations[0];
    }, [selectedSecretariaAuthorizations, selectedSystemId]);

    const selectedSecretariaTotalCost = useMemo(() => (
        selectedSecretariaAuthorizations.reduce((acc, auth) => acc + getAuthTotalCost(auth), 0)
    ), [selectedSecretariaAuthorizations]);

    useEffect(() => {
        if (!selectedSecretariaAuthorizations.length) {
            setSelectedSystemId(null);
            return;
        }

        const selectedStillExists = selectedSecretariaAuthorizations.some((auth) => auth.authId === selectedSystemId);
        if (!selectedStillExists) {
            setSelectedSystemId(selectedSecretariaAuthorizations[0].authId);
        }
    }, [selectedSecretariaAuthorizations, selectedSystemId]);

    const handleEditOpen = (auth) => {
        setSelectedAuth(auth);
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setSelectedAuth(null);
    };

    const handleSelectSecretaria = (secretaria, authId = null) => {
        setSelectedSecretaria(secretaria);
        setSelectedSystemId(authId);
    };

    const fetchAuthorizations = useCallback(() => {
        setListLoading(true);
        return cloudAuthGetAll()
            .then(res => {
                const data = res.data.authorizations || [];
                // Orden descendente y eliminamos elementos nulos
                const cleanData = data.filter(item => item !== null && item !== undefined);
                const sortedData = cleanData.sort((a, b) => b.authId - a.authId);

                setAuthorizations(sortedData);
            })
            .catch(err => errorAlertRef.current("No se pudieron cargar las autorizaciones", err))
            .finally(() => setListLoading(false));
    }, []);

    useEffect(() => {
        fetchAuthorizations();
    }, [fetchAuthorizations]);

    const handleCreateRequest = (formData) => {
        setSaving(true);
        const saveRequest = selectedAuth?.isApproved
            ? cloudAuthUpdateObservations(selectedAuth.authId, formData.observations)
            : cloudAuthCreate(formData);

        saveRequest
            .then(res => {
                const successMessage = selectedAuth?.isApproved
                    ? "Observaciones actualizadas correctamente"
                    : (selectedAuth ? "Solicitud actualizada exitosamente" : "Solicitud creada exitosamente");
                successAlert(successMessage, res);
                setSelectedSecretaria(formData.secretaria);
                setSystemSearch("");
                handleCloseModal(); 
                fetchAuthorizations();
            })
            .catch(err => errorAlert("Error al guardar la solicitud", err))
            .finally(() => setSaving(false));
    };

    const handleApprove = (authId) => {
        Swal.fire({
            title: '¿Firmar aprobación?',
            text: "El sistema quedará registrado como aprobado bajo tu firma digital.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, firmar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                setListLoading(true);
                cloudAuthApprove(authId)
                    .then(res => {
                        successAlert("Sistema aprobado exitosamente", res);
                        fetchAuthorizations();
                    })
                    .catch(err => errorAlert("Error al firmar", err))
                    .finally(() => setListLoading(false));
            }
        });
    };

    const handleDeleteAttachment = (attachment) => {
        Swal.fire({
            title: '¿Eliminar archivo?',
            text: `El archivo "${attachment.fileName}" se eliminará permanentemente.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d32f2f',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (!result.isConfirmed) return;

            setDeletingAttachmentId(attachment.attachmentId);
            cloudAuthDeleteAttachment(attachment.attachmentId)
                .then((res) => {
                    setAuthorizations((currentAuthorizations) =>
                        currentAuthorizations.map((authorization) => ({
                            ...authorization,
                            Attachments: authorization.Attachments?.filter(
                                (item) => item.attachmentId !== attachment.attachmentId
                            ) || []
                        }))
                    );
                    successAlert("Archivo adjunto eliminado correctamente", res);
                })
                .catch((err) => errorAlert("No se pudo eliminar el archivo adjunto", err))
                .finally(() => setDeletingAttachmentId(null));
        });
    };

    if (listLoading && authorizations.length === 0) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ width: '100%', maxWidth: 1400, margin: '0 auto' }}>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, backgroundColor: '#fff', p: 3, borderRadius: 3, boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 800, color: '#2c3e50' }}>
                        Autorización de Sistemas Cloud
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#7f8c8d' }}>
                        Auditoría y control presupuestal de infraestructura en Azure
                    </Typography>
                </Box>
                {!selectedSecretaria && (
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        sx={{ borderRadius: 2 }}
                        onClick={() => {
                            setSelectedAuth(null);
                            setModalOpen(true);
                        }}
                    >
                        Nueva Solicitud
                    </Button>
                )}
            </Box>

            <NewCloudAuthModal
                open={modalOpen}
                onClose={handleCloseModal} 
                onSubmit={handleCreateRequest}
                loading={saving}
                data={selectedAuth} 
            />

            {authorizations.length > 0 && !selectedSecretaria && (
                <GeneralOverview
                    dashboardStats={dashboardStats}
                    generalSearch={generalSearch}
                    onGeneralSearchChange={setGeneralSearch}
                    secretarias={filteredAuthorizationsBySecretaria}
                    allSecretarias={authorizationsBySecretaria}
                    allAuthorizations={authorizations}
                    onSelectSecretaria={handleSelectSecretaria}
                    approvedAuthorizations={approvedAuthorizations}
                    pendingAuthorizations={pendingAuthorizations}
                />
            )}

            {authorizations.length > 0 && selectedSecretariaData && (
                <SecretariaDetailView
                    secretariaName={selectedSecretariaData[0]}
                    authorizations={selectedSecretariaAuthorizations}
                    filteredAuthorizations={filteredSecretariaAuthorizations}
                    selectedSystem={selectedSystem}
                    totalCost={selectedSecretariaTotalCost}
                    systemSearch={systemSearch}
                    onSystemSearchChange={setSystemSearch}
                    onBack={() => {
                        setSelectedSecretaria(null);
                        setSystemSearch("");
                        setSelectedSystemId(null);
                    }}
                    onSelectSystem={setSelectedSystemId}
                    canApprove={canApprove}
                    onApprove={handleApprove}
                    onEdit={handleEditOpen}
                    onDeleteAttachment={handleDeleteAttachment}
                    deletingAttachmentId={deletingAttachmentId}
                />
            )}

            {authorizations.length === 0 && !listLoading && (
                <Box sx={{ textAlign: 'center', color: '#7f8c8d', mt: 5 }}>
                    No hay solicitudes de autorización pendientes.
                </Box>
            )}
        </Box>
    );
}
