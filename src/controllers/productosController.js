import pool from '../config/db.js';

// GET: Obtener todos los productos
export const listarProductos = async (req, res) => {
    try {
        const [productos] = await pool.execute(
            'SELECT * FROM productos'
        );

        res.status(200).json({
            mensaje: 'Productos obtenidos correctamente',
            data: productos
        });

    } catch (error) {
        console.error('Error al listar productos:', error.message);

        res.status(500).json({
            error: 'Error interno al obtener los productos'
        });
    }
};

// POST: Registrar un producto
export const crearProducto = async (req, res) => {
    try {
        const body = req.body;

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return res.status(400).json({
                error: 'El cuerpo debe ser un objeto JSON'
            });
        }

        const { nombre, precio, stock } = body;

        // Validar los datos recibidos
        if (
            typeof nombre !== 'string' ||
            !nombre.trim() ||
            precio === undefined ||
            stock === undefined ||
            !Number.isFinite(Number(precio)) ||
            Number(precio) < 0 ||
            !Number.isInteger(Number(stock)) ||
            Number(stock) < 0
        ) {
            return res.status(400).json({
                error: 'Ingrese nombre, precio y stock válidos'
            });
        }

        const sql = `
            INSERT INTO productos (nombre, precio, stock)
            VALUES (?, ?, ?)
        `;

        const [resultado] = await pool.execute(sql, [
            nombre.trim(),
            Number(precio),
            Number(stock)
        ]);

        res.status(201).json({
            mensaje: 'Producto registrado correctamente',
            id: resultado.insertId,
            producto: {
                nombre: nombre.trim(),
                precio: Number(precio),
                stock: Number(stock)
            }
        });

    } catch (error) {
        console.error('Error al crear producto:', error.message);

        res.status(500).json({
            error: 'Error interno al registrar el producto'
        });
    }
};

// PUT: Actualizar un producto
export const actualizarProducto = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body;

        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            return res.status(400).json({
                error: 'El cuerpo debe ser un objeto JSON'
            });
        }

        const { nombre, precio, stock } = body;

        // Validar ID
        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        // Validar datos
        if (
            typeof nombre !== 'string' ||
            !nombre.trim() ||
            precio === undefined ||
            stock === undefined ||
            !Number.isFinite(Number(precio)) ||
            Number(precio) < 0 ||
            !Number.isInteger(Number(stock)) ||
            Number(stock) < 0
        ) {
            return res.status(400).json({
                error: 'Ingrese nombre, precio y stock válidos'
            });
        }

        const sql = `
            UPDATE productos
            SET nombre = ?, precio = ?, stock = ?
            WHERE id = ?
        `;

        const [resultado] = await pool.execute(sql, [
            nombre.trim(),
            Number(precio),
            Number(stock),
            Number(id)
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Producto actualizado correctamente',
            id: Number(id)
        });

    } catch (error) {
        console.error('Error al actualizar:', error.message);

        res.status(500).json({
            error: 'Error interno al actualizar el producto'
        });
    }
};

// DELETE: Eliminar un producto
export const eliminarProducto = async (req, res) => {
    try {
        const { id } = req.params;

        // Validar ID
        if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
            return res.status(400).json({
                error: 'El ID debe ser un número entero positivo'
            });
        }

        const sql = 'DELETE FROM productos WHERE id = ?';

        const [resultado] = await pool.execute(sql, [
            Number(id)
        ]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                error: 'Producto no encontrado'
            });
        }

        res.status(200).json({
            mensaje: 'Producto eliminado correctamente'
        });

    } catch (error) {
        console.error('Error al eliminar:', error.message);

        res.status(500).json({
            error: 'Error interno al eliminar el producto'
        });
    }
};