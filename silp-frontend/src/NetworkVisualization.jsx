import React, { useState, useEffect, useCallback, useMemo, useRef, memo } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import * as d3 from 'd3-force';
import {
  Box,
  Drawer,
  Typography,
  Divider,
  Chip,
  IconButton,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  Button,
  Paper,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import CenterFocusStrongIcon from '@mui/icons-material/CenterFocusStrong';
import MapIcon from '@mui/icons-material/Map';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import axios from 'axios';
import { getApiUrl } from './config';

// Configuración para layout con simulación de fuerzas
const nodeWidth = 8;
const nodeHeight = 8;

// Función para calcular layout con simulación de fuerzas (d3-force)
const getForceDirectedLayout = (nodes, edges) => {
  // Copiar nodos para no mutar originales y agregar posiciones iniciales
  const simulationNodes = nodes.map(n => ({ 
    ...n, 
    x: (Math.random() - 0.5) * 2000 + 1000, // Posición inicial aleatoria centrada
    y: (Math.random() - 0.5) * 2000 + 1000,
    vx: 0, // Velocidad inicial
    vy: 0
  }));
  
  // Crear mapa de nodos por ID para acceso rápido
  const nodeMap = new Map();
  simulationNodes.forEach(node => {
    nodeMap.set(node.id, node);
  });
  
  // Crear mapa de usuarios propietarios para contactos
  const contactOwnerMap = new Map();
  
  // Crear links en formato d3 (con referencias directas a nodos)
  const simulationLinks = edges
    .filter(edge => {
      // Solo incluir edges usuario->contacto y contacto->contacto
      // Ocultar edges usuario->usuario
      return !(edge.source.startsWith('user-') && edge.target.startsWith('user-'));
    })
    .map(edge => {
      const sourceNode = nodeMap.get(edge.source);
      const targetNode = nodeMap.get(edge.target);
      
      if (!sourceNode || !targetNode) {
        return null;
      }
      
      // Mapear contactos a sus usuarios propietarios
      if (edge.source.startsWith('user-') && edge.target.startsWith('contact-')) {
        contactOwnerMap.set(edge.target, edge.source);
      }
      
      return {
        source: sourceNode, // Referencia directa al nodo
        target: targetNode, // Referencia directa al nodo
        sourceId: edge.source,
        targetId: edge.target,
        strength: edge.source.startsWith('user-') ? 0.8 : 0.3, // Más fuerte usuario->contacto
        originalEdge: edge
      };
    })
    .filter(link => link !== null);
  
  // Fuerza personalizada para mantener contactos cerca de su usuario
  const radialForce = (alpha) => {
    simulationNodes.forEach(node => {
      if (node.type === 'contact') {
        const ownerId = contactOwnerMap.get(node.id);
        if (ownerId) {
          const owner = nodeMap.get(ownerId);
          
          if (owner) {
            const dx = node.x - owner.x;
            const dy = node.y - owner.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const targetDistance = 50; // Radio objetivo para nube compacta
            
            if (distance > 0) {
              // Fuerza proporcional a la diferencia de distancia y alpha
              const force = (distance - targetDistance) * alpha * 0.15;
              const fx = (dx / distance) * force;
              const fy = (dy / distance) * force;
              
              node.vx -= fx;
              node.vy -= fy;
            }
          }
        }
      }
    });
  };
  
  // Configurar simulación de fuerzas
  const simulation = d3.forceSimulation(simulationNodes)
    // Fuerza de atracción entre nodos conectados (usuario -> contactos)
    .force('link', d3.forceLink(simulationLinks)
      .id(d => d.id) // Usar el ID del nodo
      .distance(d => {
        // Contactos cerca de su usuario (distancia corta)
        const sourceNode = d.source;
        const targetNode = d.target;
        
        if (sourceNode?.type === 'user' && targetNode?.type === 'contact') {
          return 50; // 50px usuario->contacto (nube compacta)
        }
        if (sourceNode?.type === 'contact' && targetNode?.type === 'contact') {
          return 30; // 30px contacto->contacto (muy compactos)
        }
        return 100; // Distancia por defecto
      })
      .strength(d => d.strength)
    )
    // Fuerza de repulsión entre TODOS los nodos (evita overlap)
    .force('charge', d3.forceManyBody()
      .strength(d => {
        if (d.type === 'user') return -1200; // Usuarios se repelen más fuerte
        return -100; // Contactos se repelen menos (para mantener nube compacta)
      })
      .distanceMax(400) // Rango máximo de repulsión
    )
    // Fuerza de colisión (evita que nodos se traslapen físicamente)
    .force('collision', d3.forceCollide()
      .radius(d => {
        // Radio de colisión = tamaño nodo + espacio extra
        if (d.type === 'user') return 100; // Usuarios + espacio para su nube
        return 12; // Contactos compactos entre sí
      })
      .strength(0.9) // Qué tan fuerte es la colisión (0-1)
    )
    // Fuerza de centro (mantiene el grafo centrado en el canvas)
    .force('center', d3.forceCenter(1000, 1000))
    // Configuración de la simulación
    .alpha(1) // Energía inicial
    .alphaDecay(0.02) // Qué tan rápido se enfría
    .velocityDecay(0.4); // Fricción (más alto = menos movimiento)
  
  // Agregar fuerza radial personalizada
  simulation.on('tick', () => {
    radialForce(simulation.alpha());
  });
  
  // Ejecutar simulación sincrónicamente (no animada)
  const numIterations = 300; // Más iteraciones = mejor layout
  for (let i = 0; i < numIterations; i++) {
    simulation.tick();
  }
  
  // Detener simulación
  simulation.stop();
  
  // Convertir posiciones de vuelta a formato ReactFlow
  const layoutedNodes = simulationNodes.map(n => ({
    ...n,
    position: { x: n.x || 1000, y: n.y || 1000 }
  }));
  
  // Filtrar y ajustar edges
  const filteredEdges = edges
    .filter(edge => {
      // Ocultar edges usuario -> usuario
      return !(edge.source.startsWith('user-') && edge.target.startsWith('user-'));
    })
    .map(edge => {
      // Ajustar opacidad de edges contacto->contacto
      if (edge.source.startsWith('contact-') && edge.target.startsWith('contact-')) {
        return {
          ...edge,
          style: { ...edge.style, opacity: 0.3 }
        };
      }
      return edge;
    });
  
  return { nodes: layoutedNodes, edges: filteredEdges };
};

// Componente interno que tiene acceso a useReactFlow (memoizado para performance)
const NetworkFlow = memo(({ 
  nodes, 
  edges, 
  onNodesChange, 
  onEdgesChange, 
  onNodeClick, 
  getNodeColor,
  selectedNode,
  onInit,
  showMiniMap
}) => {
  const reactFlowInstance = useReactFlow();

  // Pasar la instancia de ReactFlow al componente padre cuando esté lista
  useEffect(() => {
    if (onInit && reactFlowInstance) {
      onInit(reactFlowInstance);
    }
  }, [reactFlowInstance, onInit]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      onNodeClick={onNodeClick}
      fitView
      attributionPosition="bottom-left"
      minZoom={0.1}
      maxZoom={4}
    >
      <Background color="#aaa" gap={16} />
      <Controls />
      {showMiniMap && (
        <MiniMap
          nodeColor={(node) => getNodeColor(node)}
          maskColor="rgba(0, 0, 0, 0.1)"
          style={{
            backgroundColor: '#f5f5f5',
            width: 150,
            height: 100,
          }}
        />
      )}
    </ReactFlow>
  );
});

const NetworkVisualization = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [allNodes, setAllNodes] = useState([]); // Todos los nodos sin filtrar
  const [allEdges, setAllEdges] = useState([]); // Todas las conexiones sin filtrar
  const [selectedNode, setSelectedNode] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Ref para almacenar la instancia de ReactFlow
  const reactFlowInstanceRef = useRef(null);
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showMiniMap, setShowMiniMap] = useState(false);

  // Definir colores según especificaciones
  const getNodeColor = useCallback((node) => {
    if (node.type === 'user') {
      if (node.data.role === 'superadmin') return '#E91E63'; // Fucsia
      if (node.data.role === 'admin') return '#1A237E'; // Azul oscuro
      if (node.data.role === 'lider') return '#03A9F4'; // Azul cielo
    }
    return node.data.is_active ? '#4CAF50' : '#F44336'; // Verde o Rojo
  }, []);

  const getBorderColor = useCallback((node) => {
    // Borde más brillante si el nodo está seleccionado
    if (selectedNode && (
      (node.type === 'user' && selectedNode.id && node.id && node.id.includes(selectedNode.id)) ||
      (node.type === 'contact' && selectedNode.id && node.id && node.id.includes(selectedNode.id))
    )) {
      return '#FFD700'; // Dorado para nodo seleccionado
    }
    return 'transparent';
  }, [selectedNode]);

  // Estilo de nodos optimizado para performance (puntos simples)
  const getNodeStyle = useCallback((node) => {
    const borderColor = getBorderColor(node);
    return {
      background: getNodeColor(node),
      border: borderColor !== 'transparent' ? `1px solid ${borderColor}` : 'none',
      borderRadius: '50%',
      width: node.type === 'user' ? 8 : 6,
      height: node.type === 'user' ? 8 : 6,
      cursor: 'pointer',
    };
  }, [getNodeColor, getBorderColor]);

  // Callback para recibir la instancia de ReactFlow
  const handleReactFlowInit = useCallback((instance) => {
    reactFlowInstanceRef.current = instance;
  }, []);

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

        const response = await axios.get(getApiUrl('/network/graph-data'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const { nodes: apiNodes, edges: apiEdges } = response.data;

        // Procesar nodos (optimizado - sin labels visibles, con tooltip)
        const processedNodes = apiNodes.map((node) => ({
          ...node,
          style: getNodeStyle(node),
          data: {
            ...node.data,
            label: '', // Sin label visible para mejor performance
            fullLabel: node.data.label, // Guardar label completo para tooltip
          },
          // Agregar tooltip nativo de ReactFlow
          title: node.data.label || `${node.data.first_name} ${node.data.last_name}`,
        }));

        // Procesar edges (optimizado - más delgadas y transparentes)
        const processedEdges = apiEdges.map(edge => ({
          ...edge,
          style: { stroke: '#BDBDBD', strokeWidth: 1, opacity: 0.5 },
          type: 'default', // Cambiado a 'default' para mejor performance
          animated: false,
        }));

        // Aplicar layout con simulación de fuerzas
        const { nodes: layoutedNodes, edges: layoutedEdges } = getForceDirectedLayout(
          processedNodes,
          processedEdges
        );

        setAllNodes(layoutedNodes);
        setAllEdges(layoutedEdges);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        
        setLoading(false);
        
        // Ajustar vista después de cargar usando ref
        setTimeout(() => {
          if (reactFlowInstanceRef.current) {
            reactFlowInstanceRef.current.fitView({ padding: 0.2, duration: 800 });
          }
        }, 100);
      } catch (err) {
        console.error('Error fetching graph data:', err);
        setError('Error al cargar los datos de la red. Por favor, intenta de nuevo.');
        setLoading(false);
      }
    };

    fetchGraphData();
  }, []);

  // Aplicar filtros y búsqueda (optimizado con useMemo)
  const { filteredNodes, filteredEdges } = useMemo(() => {
    if (allNodes.length === 0) {
      return { filteredNodes: [], filteredEdges: [] };
    }

    let filtered = [...allNodes];

    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(node => 
        node.data.fullLabel?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.data.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.data.phone?.includes(searchTerm)
      );
    }

    // Filtro por tipo
    if (typeFilter !== 'all') {
      filtered = filtered.filter(node => node.type === typeFilter);
    }

    // Filtro por rol (solo usuarios)
    if (roleFilter !== 'all') {
      filtered = filtered.filter(node => 
        node.type === 'contact' || node.data.role === roleFilter
      );
    }

    // Filtro por estado
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      filtered = filtered.filter(node => node.data.is_active === isActive);
    }

    // Filtrar edges para mostrar solo conexiones entre nodos visibles
    const filteredNodeIds = new Set(filtered.map(n => n.id));
    const filteredEdges = allEdges.filter(edge => 
      filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    );

    return { filteredNodes: filtered, filteredEdges };
  }, [searchTerm, roleFilter, statusFilter, typeFilter, allNodes, allEdges]);

  // Actualizar nodos y edges cuando cambien los filtros
  useEffect(() => {
    setNodes(filteredNodes);
    setEdges(filteredEdges);

    // Re-ajustar vista cuando cambien filtros usando ref
    if (filteredNodes.length > 0) {
      setTimeout(() => {
        if (reactFlowInstanceRef.current) {
          reactFlowInstanceRef.current.fitView({ padding: 0.2, duration: 500 });
        }
      }, 100);
    }
  }, [filteredNodes, filteredEdges, setNodes, setEdges]);

  // Click en nodo
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node.data);
    setDrawerOpen(true);
    
    // Centrar vista en el nodo seleccionado usando ref
    const x = node.position.x + nodeWidth / 2;
    const y = node.position.y + nodeHeight / 2;
    setTimeout(() => {
      if (reactFlowInstanceRef.current) {
        reactFlowInstanceRef.current.setCenter(x, y, { zoom: 1.5, duration: 800 });
      }
    }, 100);
  }, []);

  // Cerrar drawer
  const handleCloseDrawer = () => {
    setDrawerOpen(false);
    setSelectedNode(null);
  };

  // Limpiar filtros
  const handleClearFilters = () => {
    setSearchTerm('');
    setRoleFilter('all');
    setStatusFilter('all');
    setTypeFilter('all');
  };

  // Resetear vista usando ref
  const handleResetView = () => {
    if (reactFlowInstanceRef.current) {
      reactFlowInstanceRef.current.fitView({ padding: 0.2, duration: 800 });
    }
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
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 3 }}>
        <Alert severity="error" sx={{ maxWidth: 600 }}>{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, margin: 0, padding: 0 }}>
      {/* Barra de herramientas superior */}
      <Paper 
        elevation={2} 
        sx={{ 
          p: 2, 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center',
          flexWrap: 'wrap',
          zIndex: 10,
        }}
      >
        {/* Búsqueda */}
        <TextField
          size="small"
          placeholder="Buscar por nombre, email o teléfono..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        {/* Filtro por tipo */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Tipo</InputLabel>
          <Select
            value={typeFilter}
            label="Tipo"
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="user">Usuarios</MenuItem>
            <MenuItem value="contact">Contactos</MenuItem>
          </Select>
        </FormControl>

        {/* Filtro por rol */}
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Rol</InputLabel>
          <Select
            value={roleFilter}
            label="Rol"
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <MenuItem value="all">Todos los roles</MenuItem>
            <MenuItem value="superadmin">Superadmin</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
            <MenuItem value="lider">Líder</MenuItem>
          </Select>
        </FormControl>

        {/* Filtro por estado */}
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Estado</InputLabel>
          <Select
            value={statusFilter}
            label="Estado"
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <MenuItem value="all">Todos</MenuItem>
            <MenuItem value="active">Activos</MenuItem>
            <MenuItem value="inactive">Inactivos</MenuItem>
          </Select>
        </FormControl>

        {/* Botones de acción */}
        <Button
          variant="outlined"
          size="small"
          onClick={handleClearFilters}
          startIcon={<FilterListIcon />}
        >
          Limpiar Filtros
        </Button>

        {/* Contador de nodos */}
        <Box sx={{ ml: 'auto' }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {nodes.length} de {allNodes.length} nodos
          </Typography>
        </Box>
      </Paper>

      {/* Visualización ReactFlow */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <ReactFlowProvider>
          <NetworkFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onNodeClick={onNodeClick}
            getNodeColor={getNodeColor}
            selectedNode={selectedNode}
            onInit={handleReactFlowInit}
            showMiniMap={showMiniMap}
          />
        </ReactFlowProvider>

        {/* Controles flotantes en el centro superior del canvas */}
        <Paper
          elevation={4}
          sx={{
            position: 'absolute',
            top: 16,
            left: '50%',
            transform: 'translateX(-50%)',
            p: 1,
            display: 'flex',
            gap: 1,
            zIndex: 6,
            borderRadius: 2,
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={handleResetView}
            startIcon={<CenterFocusStrongIcon />}
            sx={{ 
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            Centrar Vista
          </Button>

          <Button
            variant="contained"
            size="small"
            onClick={() => setShowMiniMap(!showMiniMap)}
            startIcon={showMiniMap ? <MapIcon /> : <MapOutlinedIcon />}
            sx={{ 
              textTransform: 'none',
              fontWeight: 'bold',
            }}
          >
            {showMiniMap ? 'Ocultar Mapa' : 'Mostrar Mapa'}
          </Button>
        </Paper>

        {/* Leyenda de colores */}
        <Paper
          elevation={3}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            p: 2,
            minWidth: 200,
            zIndex: 5,
          }}
        >
          <Typography variant="subtitle2" gutterBottom fontWeight="bold">
            Leyenda
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <Stack spacing={1}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#E91E63' }} />
              <Typography variant="caption">Superadmin</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#1A237E' }} />
              <Typography variant="caption">Admin</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#03A9F4' }} />
              <Typography variant="caption">Líder</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#4CAF50' }} />
              <Typography variant="caption">Activo</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#F44336' }} />
              <Typography variant="caption">Inactivo</Typography>
            </Box>
          </Stack>
        </Paper>
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
            <Stack spacing={2} sx={{ mt: 2 }}>
              {selectedNode.email && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Email
                  </Typography>
                  <Typography variant="body1">{selectedNode.email}</Typography>
                </Box>
              )}

              {selectedNode.phone && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Teléfono
                  </Typography>
                  <Typography variant="body1">{selectedNode.phone}</Typography>
                </Box>
              )}

              {selectedNode.mdv && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    MDV
                  </Typography>
                  <Typography variant="body1">{selectedNode.mdv}</Typography>
                </Box>
              )}

              {selectedNode.municipality && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Municipio
                  </Typography>
                  <Typography variant="body1">{selectedNode.municipality}</Typography>
                </Box>
              )}

              {selectedNode.occupation && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Ocupación
                  </Typography>
                  <Typography variant="body1">{selectedNode.occupation}</Typography>
                </Box>
              )}

              {selectedNode.contact_count !== undefined && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Cantidad de Contactos
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {selectedNode.contact_count}
                  </Typography>
                </Box>
              )}

              {selectedNode.owner_name && (
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Propietario
                  </Typography>
                  <Typography variant="body1">{selectedNode.owner_name}</Typography>
                </Box>
              )}
            </Stack>
          </>
        )}
      </Drawer>
    </Box>
  );
};

export default NetworkVisualization;