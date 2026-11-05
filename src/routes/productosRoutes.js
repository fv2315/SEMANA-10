import { Router } from 'express';

import {
    listarProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto
} from '../controllers/productosController.js';

const router = Router();

// GET: Listar productos
router.get('/', listarProductos);

// POST: Registrar producto
router.post('/', crearProducto);

// PUT: Actualizar producto
router.put('/:id', actualizarProducto);

// DELETE: Eliminar producto
router.delete('/:id', eliminarProducto);

export default router;