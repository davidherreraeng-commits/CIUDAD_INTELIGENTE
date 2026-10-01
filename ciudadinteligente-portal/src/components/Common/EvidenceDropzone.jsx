import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, IconButton, ImageList, ImageListItem, ImageListItemBar, Paper, Chip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ArticleIcon from '@mui/icons-material/Article';
import TableChartIcon from '@mui/icons-material/TableChart';
import PropTypes from "prop-types";

const EvidenceDropzone = ({ onFilesSelected, previewVariant = 'image', disabled = false }) => {
  // Ahora guardamos un objeto separado: el File real y la URL de preview
  const [filesData, setFilesData] = useState([]);

  useEffect(() => {
    onFilesSelected(filesData.map(f => f.file));
  }, [filesData, onFilesSelected]);

  const onDrop = useCallback((acceptedFiles) => {
    const newFiles = acceptedFiles.map(file => ({
      file: file,
      preview: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      extension: getFileExtension(file.name)
    }));

    // Ahora el actualizador de estado es "puro"
    setFilesData(prev => [...prev, ...newFiles]);
  }, []);

  useEffect(() => {
    return () => filesData.forEach(item => URL.revokeObjectURL(item.preview));
  }, [filesData]);

  const removeFile = (fileName) => {
    setFilesData(prev => prev.filter(f => f.name !== fileName));
  };

  function getFileExtension(fileName) {
    return fileName.split('.').pop()?.toUpperCase() || 'FILE';
  }

  function formatFileSize(bytes) {
    if (!bytes) return '0 KB';
    const units = ['B', 'KB', 'MB', 'GB'];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const size = bytes / (1024 ** unitIndex);
    return `${size >= 10 || unitIndex === 0 ? Math.round(size) : size.toFixed(1)} ${units[unitIndex]}`;
  }

  function getTypeStyles(extension) {
    if (extension === 'PDF') return { bg: '#efe8ff', color: '#6b3fd6' };
    if (['JPG', 'JPEG'].includes(extension)) return { bg: '#e5f7ec', color: '#159857' };
    if (extension === 'PNG') return { bg: '#fff3dc', color: '#d98a00' };
    if (extension === 'DOCX') return { bg: '#e8f1ff', color: '#1769d2' };
    if (extension === 'XLSX') return { bg: '#e5fbf6', color: '#0f9f82' };
    return { bg: '#f3f4f6', color: '#5f6b7a' };
  }

  function getFileTypeIcon(extension) {
    if (extension === 'PDF') return PictureAsPdfIcon;
    if (['JPG', 'JPEG', 'PNG'].includes(extension)) return ImageIcon;
    if (extension === 'DOCX') return ArticleIcon;
    if (extension === 'XLSX') return TableChartIcon;
    return InsertDriveFileIcon;
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled,
    accept: {
      'image/*': ['.jpeg', '.png', '.jpg'],
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    },
    maxSize: 10485760,
  });

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      {/* --- ZONA DE DROP --- */}
      <Paper
        {...getRootProps()}
        variant="outlined"
        sx={{
          p: 3,
          borderStyle: 'dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.400',
          backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.6 : 1,
          textAlign: 'center',
          transition: 'all 0.3s ease'
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          {disabled ? "No se pueden modificar archivos de un sistema aprobado" : (isDragActive ? "Suelta los archivos aquí..." : "Arrastra imágenes o haz clic para seleccionar")}
        </Typography>
        <Typography variant="caption" color="text.disabled">
          (Máximo 10MB por archivo - .pdf, .docx, .xlsx, .jpg, .png)
        </Typography>
      </Paper>

      {filesData.length > 0 && previewVariant === 'cards' && (
        <Box sx={{ mt: 2 }}>
          <Typography sx={{ fontWeight: 800, color: '#172033', mb: 1.5 }}>
            Documentos cargados
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' }, gap: 2 }}>
            {filesData.map((item) => {
              const typeStyles = getTypeStyles(item.extension);
              const FileIcon = getFileTypeIcon(item.extension);

              return (
                <Paper
                  key={item.name}
                  variant="outlined"
                  sx={{
                    position: 'relative',
                    p: 2,
                    borderRadius: 2,
                    minHeight: 150,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    gap: 1.2,
                    backgroundColor: '#fff',
                    borderColor: '#e1e7ef'
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={(event) => { event.stopPropagation(); removeFile(item.name); }}
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      color: '#f44336',
                      backgroundColor: '#fff1f1',
                      '&:hover': { backgroundColor: '#ffe3e3' }
                    }}
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>

                  <Box sx={{ width: 64, height: 64, borderRadius: 2, display: 'grid', placeItems: 'center', backgroundColor: typeStyles.bg, color: typeStyles.color }}>
                    <FileIcon sx={{ fontSize: 36 }} />
                  </Box>

                  <Typography sx={{ width: '100%', color: '#172033', fontWeight: 850, lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.name}>
                    {item.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={item.extension} size="small" sx={{ height: 24, backgroundColor: typeStyles.bg, color: typeStyles.color, fontWeight: 850 }} />
                    <Typography sx={{ color: '#5f6b7a', fontSize: 14 }}>
                      {formatFileSize(item.size)}
                    </Typography>
                  </Box>
                </Paper>
              );
            })}
          </Box>
        </Box>
      )}

      {/* --- PREVISUALIZACIÓN --- */}
      {filesData.length > 0 && previewVariant === 'image' && (
        <ImageList sx={{ width: '100%', height: 160, mt: 2 }} cols={3} rowHeight={160}>
          {filesData.map((item) => (
            <ImageListItem key={item.name}>
              <img
                src={item.preview}
                alt={item.name}
                loading="lazy"
                style={{ height: '100%', objectFit: 'cover', borderRadius: 4 }}
              />
              <ImageListItemBar
                sx={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)' }}
                position="top"
                actionIcon={
                  <IconButton sx={{ color: 'white' }} onClick={(e) => { e.stopPropagation(); removeFile(item.name); }}>
                    <DeleteIcon />
                  </IconButton>
                }
                actionPosition="right"
              />
            </ImageListItem>
          ))}
        </ImageList>
      )}
    </Box>
  );
};

export default EvidenceDropzone;

EvidenceDropzone.propTypes = {
    onFilesSelected: PropTypes.func,
    previewVariant: PropTypes.oneOf(['image', 'cards']),
    disabled: PropTypes.bool,
};
