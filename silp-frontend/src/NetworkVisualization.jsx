import React, { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Drawer,
  Typography,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

const NetworkVisualization = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Definir colores según especificaciones
  const getNodeColor = (node) => {
    if (node.type === 'user') {
      // Colores por rol
      if (node.data.role === 'superadmin') return '#E91E63'; // Fucsia
      if (node.data.role === 'admin') return '#1A237E'; // Azul oscuro
      if (node.data.role === 'lider') return '#03A9F4'; // Azul cielo
    }
    
    // Colores por estado (para contactos y usuarios sin rol específico)
    return node.data.is_active ? '#4CAF50' : '#F44336'; // Verde o Rojo
  };

  // Estilo de nodos
  const getNodeStyle = (node) => ({
    background: getNodeColor(node),
    color: 'white',
    border: '2px solid #fff',
    borderRadius: '50%',
    width: node.type === 'user' ? 60 : 40,
    height: node.type === 'user' ? 60 : 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: node.type === 'user' ? '12px' : '10px',
    fontWeight: 'bold',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
  });

  // Fetch datos del grafo
  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setError('No se encontró token de autenticación. Por favor, inicia sesión.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://127.0.0.1:8000/api/v1/network/graph-data', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { nodes: apiNodes, edges: apiEdges } = response.data;

        // Aplicar layout automático simple (distribución en círculo)
        const processedNodes = apiNodes.map((node, index) => {
          const angle = (index / apiNodes.length) * 2 * Math.PI;
          const radius = 300;
          
          return {
            ...node,
            position: {
              x: 400 + radius * Math.cos(angle),
              y: 300 + radius * Math.sin(angle),
            },
            style: getNodeStyle(node),
            data: {
              ...node.data,
              label: node.data.label && node.data.label.length > 15 
                ? node.data.label.substring(0, 15) + '...' 
                : node.data.label || '',
            },
          };
        });

        setNodes(processedNodes);
        setEdges(apiEdges.map(edge => ({
          ...edge,
          style: { stroke: '#BDBDBD', strokeWidth: 2 },
          type: 'smoothstep',
        })));
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError('Error al cargar los datos de la red. Por favor, intenta de nuevo.');
        setLoading(false);
      }
    };

    fetchGraphData();
  }, [setNodes, setEdges]);

  // Click en nodo
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data);
    setDrawerOpen(true);
  }, []);

  // Cerrar drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedNode(null);
  };

  if (loading) {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      width: '100%', 
      height: 'calc(100vh - 64px)', 
      display: 'flex', 
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      margin: 0,
      padding: 0
    }}>
      {/* Visualización ReactFlow */}
      <Box sx={{ flex: 1, position: 'relative', width: '100%', height: '100%' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#aaa" gap={16} />
          <Controls />
          <MiniMap
            nodeColor={(node) => getNodeColor(node)}
            maskColor="rgba(0, 0, 0, 0.1)"
          />
        </ReactFlow>
      </Box>

      {/* Drawer lateral derecho */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleCloseDrawer}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            padding: 3,
          },
        }}
      >
        {selectedNode && (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" component="h2">
                Detalles
              </Typography>
              <IconButton onClick={handleCloseDrawer}>
                <CloseIcon />
              </IconButton>
            </Box>

            <Divider sx={{ mb: 2 }} />

            <Typography variant="h6" gutterBottom>
              {selectedNode.first_name} {selectedNode.last_name}
            </Typography>

            {/* Chips de estado y rol */}
            <Box sx={{ mb: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {selectedNode.role && (
                <Chip
                  label={selectedNode.role.toUpperCase()}
                  color={
                    selectedNode.role === 'superadmin' ? 'secondary' :
                    selectedNode.role === 'admin' ? 'primary' : 'info'
                  }
                  size="small"
                />
              )}
              <Chip
                label={selectedNode.is_active ? 'ACTIVO' : 'INACTIVO'}
                color={selectedNode.is_active ? 'success' : 'error'}
                size="small"
              />
            </Box>

            {/* Información detallada */}
            <Box sx={{ mt: 2 }}>
              {selectedNode.email && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{selectedNode.email}</Typography>
                </Box>
              )}

              {selectedNode.phone && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1">{selectedNode.phone}</Typography>
                </Box>
              )}

              {selectedNode.mdv && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    MDV
                  </Typography>
                  <Typography variant="body1">{selectedNode.mdv}</Typography>
                </Box>
              )}

              {selectedNode.municipality && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Municipio
                  </Typography>
                  <Typography variant="body1">{selectedNode.municipality}</Typography>
                </Box>
              )}

              {selectedNode.occupation && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Ocupación
                  </Typography>
                  <Typography variant="body1">{selectedNode.occupation}</Typography>
                </Box>
              )}

              {selectedNode.contact_count !== undefined && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Cantidad de Contactos
                  </Typography>
                  <Typography variant="body1">{selectedNode.contact_count}</Typography>
                </Box>
              )}

              {selectedNode.owner_name && (
                <Box sx={{ mb: 1.5 }}>
                  <Typography variant="body2" color="text.secondary">
                    Propietario
                  </Typography>
                  <Typography variant="body1">{selectedNode.owner_name}</Typography>
                </Box>
              )}
            </Box>
          </>
        )}
      </Drawer>
    </Box>
  );
};

export default NetworkVisualization;

