import { useEffect, useState } from "react";
import { Button, Box, Typography, FormControl, InputLabel, Select, MenuItem, CircularProgress } from "@mui/material";

import { reportExportData, reportGetAvailableDates } from "../../api/report";
import { useErrorAlert } from "../../hooks/errorAlert";
import { projectsGetAllDependencies } from "../../api/projects";

export function Report () {
  const { errorAlert } = useErrorAlert();

  const [loading, setLoading] = useState(false);

  const [dependencies, setDependencies] = useState([]);
  const [selectedDependency, setSelectedDependency] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    if (dependencies.length > 0) return;

    setLoading(true);
    projectsGetAllDependencies()
      .then(res => {
        setDependencies(res.data.dependencies || []);
        setLoading(false);
      })
      .catch(err => errorAlert("No se pudieron obtener dependencias", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[dependencies]);

  useEffect(() => {
    if (!selectedDependency) {
      setAvailableYears([]);
      setSelectedYear("");
      setAvailableMonths({});
      setSelectedMonth("");
      return;
    }

    setLoading(true);
    reportGetAvailableDates({ dependencyId: selectedDependency.dependencyId })
      .then(res => {
        const { years, months } = res.data.data;
        setAvailableYears(years || []);
        setSelectedYear("");
        setAvailableMonths(months || {});
        setSelectedMonth("");
        setLoading(false);
      })
      .catch(err => errorAlert("No se pudieron obtener años y meses disponibles", err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDependency]);

  const handleDownloadReport = async () => {
    if (!selectedDependency?.dependencyId) return errorAlert("Selecciona una dependencia antes de descargar.");

    reportExportData({ dependencyId: selectedDependency.dependencyId, month: selectedMonth, year: selectedYear })
      .then(response=>{
        const blob = new Blob([response], { type:"application/pdf" });
        const link=document.createElement("a");
        link.href=URL.createObjectURL(blob);
        const fileName = `${selectedDependency?.name ?? 'Reporte'}_${selectedMonth}_${selectedYear}.pdf`;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(link.href);
      })
      .catch(err=> errorAlert("No se pudo descargar el reporte", err));
  };

  if (loading) {
    return (
      <Box sx={{
        height: "70vh",
        display: "flex",
        alignItems: "center"
      }}>
        <CircularProgress size={50} />
      </Box>
    );
  }

  return (
    <Box sx={{
      p: 4,
      width: '100%',
      maxWidth: 600,
      margin: "auto",
      mt: 6,
      borderRadius: 4,
      boxShadow: "0px 6px 18px rgba(0,0,0,0.10)",
      backgroundColor: "#ffffff",
      display: "flex",
      flexDirection: "column",
      gap: 3.5
    }}>
      <Typography sx={{fontWeight:800, fontSize:26, textAlign:"center", color:"#333"}}>
        Generación de Reporte PDF
      </Typography>
      <Typography sx={{textAlign:"center", fontSize:14, color:"#666", mt:-1}}>
        Selecciona los filtros y descarga el informe consolidado.
      </Typography>

      <Box sx={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:2 }}>
        <FormControl fullWidth size="small" sx={{ gridColumn:"1 / 3" }}>
          <InputLabel>Dependencia</InputLabel>
          <Select
            label="Dependencia"
            value={selectedDependency?.dependencyId || ""}
            onChange={(e)=>{
              const dep = dependencies.find(d=> d.dependencyId===Number(e.target.value));
              setSelectedDependency(dep);
            }}
          >
            {dependencies.map(dep=>(
              <MenuItem key={dep.dependencyId} value={dep.dependencyId}>
                {dep.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {selectedDependency && <FormControl fullWidth size="small">
          <InputLabel>Año</InputLabel>
          <Select
            label="Año"
            value={selectedYear}
            onChange={(e)=> setSelectedYear(e.target.value)}
          >
            {availableYears.map(y => (
              <MenuItem key={y} value={y}>{y}</MenuItem>
            ))}
          </Select>
        </FormControl>}
        {selectedYear && <FormControl fullWidth size="small">
          <InputLabel>Mes</InputLabel>
          <Select
            label="Mes"
            value={selectedMonth}
            onChange={(e)=> setSelectedMonth(e.target.value)}
            disabled={!selectedDependency || !selectedYear}
          >
            {selectedYear && availableMonths[selectedYear]?.map(m => (
              <MenuItem key={m} value={m}>{m}</MenuItem>
            ))}
          </Select>
        </FormControl>}
      </Box>

      <Button
        variant="contained"
        sx={{
          fontWeight:700,
          py:1.3,
          fontSize:16,
          borderRadius:2,
          mt:1,
          backgroundColor:"#1976d2",
          ":hover":{ backgroundColor:"#115293" },
          display:"flex",
          alignItems:"center",
          gap:1
        }}
        disabled={!selectedDependency || !selectedMonth || !selectedYear}
        onClick={handleDownloadReport}
      >
        Descargar Reporte
      </Button>
    </Box>
  )
}