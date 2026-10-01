import { Box, Chip, Typography } from "@mui/material";

import PropTypes from "prop-types";
const APPROVERS = [
    { name: "Diana Ochoa", role: "Aprobadora", statusKey: "isApproved" },
    { name: "Profesional administrativo", role: "Revisor", statusKey: "isApproved2" },
    { name: "Arquitecto", role: "Revisor", statusKey: "isApproved3" }
];

/**
 * Panel reutilizable del flujo de aprobación.
 * Usado en CardAuthorization y SystemDetailPanel para evitar duplicación.
 */
export default function ApprovalFlowPanel({ isApproved, isApproved2, isApproved3 }) {
    const approvers = [
        { ...APPROVERS[0], completed: isApproved },
        { ...APPROVERS[1], completed: isApproved2 },
        { ...APPROVERS[2], completed: isApproved3 }
    ];

    return (
        <Box
            sx={{
                p: 1.5,
                border: "1px solid #eeeeee",
                borderRadius: 2,
                backgroundColor: "#fafafa",
                mb: 2
            }}
        >
            <Typography variant="caption" sx={{ fontWeight: 800, color: "#7f8c8d", display: "block", mb: 1 }}>
                Flujo de aprobación
            </Typography>

            {approvers.map((person, idx) => (
                <Box
                    key={person.name}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                        p: 1,
                        borderRadius: 1.5,
                        backgroundColor: "#ffffff",
                        border: "1px solid #eeeeee",
                        mb: idx === 2 ? 0 : 1
                    }}
                >
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ color: "#34495e", fontWeight: 700, lineHeight: 1.2 }}>
                            {person.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#7f8c8d", fontWeight: 600 }}>
                            {person.role}
                        </Typography>
                    </Box>

                    <Chip
                        label={person.completed ? "Realizado" : "Pendiente"}
                        size="small"
                        color={person.completed ? "success" : "warning"}
                        sx={{ fontWeight: 800, borderRadius: 1, minWidth: 86 }}
                    />
                </Box>
            ))}
        </Box>
    );
}

ApprovalFlowPanel.propTypes = {
    isApproved: PropTypes.bool,
    isApproved2: PropTypes.bool,
    isApproved3: PropTypes.bool,
};
