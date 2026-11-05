import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import pool from './config/db.js';
import productosRoutes from './routes/productosRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const publicDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '../public');

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(publicDirectory));

app.get('/api/health', (req, res) => {
    res.json({
        mensaje: 'API Semana 10 funcionando correctamente'
    });
});

app.use('/api/productos', productosRoutes);

app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Endpoint no encontrado' });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Recurso no encontrado' });
});

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && 'body' in error) {
        return res.status(400).json({ error: 'El cuerpo de la solicitud debe ser JSON válido' });
    }

    console.error('Error en la solicitud:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, async () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);

    let conexion;
    try {
        conexion = await pool.getConnection();
        console.log('Conexion exitosa con MySQL');
    } catch (error) {
        console.error('Error MySQL:', error.message);
    } finally {
        conexion?.release();
    }
});