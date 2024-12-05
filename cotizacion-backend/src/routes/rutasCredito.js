const express = require('express');
const { dbConexion } = require('../database/config');
const { generarJwt } = require('../helpers/jwt');
const { validarJWT } = require('./middlewares/validarJWT');

const router = express.Router();
const db = dbConexion();

// Ruta para obtener el crédito
router.get('/obtener-credito', validarJWT, async (req, res) => {
    const { idCredito } = req.query;

    if (!idCredito) {
        return res.status(400).json({ errors: ['El id de crédito es requerido'] });
    }

    console.log('Usuario autenticado:', req.usuario);

    const query = `
        SELECT 
            c.idCredito,
            c.idCliente,
            c.cantidad_autori AS monto,
            c.meses,
            c.interes,
            c.fecha_prestamo_real AS fechaPrestamo,
            getClienteCredito(c.idCredito) AS nombreCompleto,
            saldoCredito(c.idCredito) AS saldo,
            (SELECT COUNT(*) 
             FROM abonos_reales 
             WHERE abonos_reales.idCredito = c.idCredito AND abonos_reales.status = 1) AS movimientos
        FROM 
            creditos AS c
        WHERE 
            c.idCredito = ?;
    `;

    try {
        // Inicializa el arreglo de errores
        const errores = [];

        const [results] = await db.query(query, [idCredito]);

        if (results.length === 0) {
            return res.status(404).json({ errors: ['El crédito no existe'] });
        }

        const credito = results[0];
        const fechaPrestamo = new Date(credito.fechaPrestamo).toISOString().split('T')[0];
        const fechaActual = new Date().toISOString().split('T')[0];

        if (fechaPrestamo !== fechaActual) {
            errores.push('Este crédito no es del día de hoy');
        }

        if (credito.saldo <= 0) {
            errores.push('El saldo del crédito es igual a 0');
        }

        if (credito.movimientos > 0) {
            errores.push('El crédito ya tiene movimientos registrados');
        }

        // Si hay errores, devolverlos
        if (errores.length > 0) {
            return res.status(400).json({ errors: errores });
        }

        // Si no hay errores, enviar los datos del crédito
        return res.status(200).json({
            idCredito: credito.idCredito,
            idCliente: credito.idCliente,
            nombreCompleto: credito.nombreCompleto,
            monto: credito.monto,
            meses: credito.meses,
            interes: credito.interes,
            fechaPrestamo: fechaPrestamo,
            saldo: credito.saldo,
        });
    } catch (err) {
        console.error('Error al obtener el crédito:', err);
        return res.status(500).json({ errors: ['Error en el servidor'] });
    }
});

// Ruta para iniciar sesión
router.post('/login', async (req, res) => {
    const { usuario, password } = req.body;

    if (!usuario || !password) {
        return res.status(400).json({ message: 'Usuario y contraseña son requeridos' });
    }

    const query = 'SELECT * FROM usuarios WHERE usuario = ? AND password = ?';

    try {
        const [results] = await db.query(query, [usuario, password]);

        if (results.length === 0) {
            return res.status(401).json({ message: 'Usuario no encontrado' });
        }

        const user = results[0];

        if (user.password !== password) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        const token = await generarJwt(user.usuario, user.idUsuario);

        return res.status(200).json({
            token,
            usuario: user.usuario,
            id: user.idUsuario,
            nombre: user.nombre
        });
    } catch (err) {
        console.error('Error al iniciar sesión:', err);
        return res.status(500).json({ message: 'Error en el servidor' });
    }
});

router.put('/actualizar-abonos/:idCredito', validarJWT, async (req, res) => {
    const { idCredito } = req.params;
    const { pagos, idUsuario } = req.body;

    // Validación de datos requeridos
    if (!idCredito || !pagos || !idUsuario) {
        return res.status(400).json({ message: 'Faltan datos necesarios' });
    }

    if (!Array.isArray(pagos) || pagos.length === 0) {
        return res.status(400).json({ message: 'Debe generar la tabla de pagos antes de actualizar.' });
    }

    try {
        // Mapear y transformar los datos al formato esperado por la base de datos
        const valoresTransformados = pagos.map(pago => {
            const [dia, mes, anio] = pago.fecha.split('/');
            return {
                num_pago: pago.npago,
                cantidad: parseFloat(pago.importe),
                fecha_programada: `${anio}-${mes}-${dia}`,
                abono: 0.00
            };
        });


        const deleteQuery = 'DELETE FROM abonos_programados WHERE idCredito = ?';
        await db.query(deleteQuery, [idCredito]);

        // 2. Insertar los nuevos pagos
        const insertQuery = `
            INSERT INTO abonos_programados 
            (idCredito, num_pago, cantidad, abono, fecha_programada, idUsuario) 
            VALUES ?
        `;

        // Construir el array de valores para la inserción
        const values = valoresTransformados.map(pago => [
            idCredito,
            pago.num_pago,
            pago.cantidad,
            pago.abono,
            pago.fecha_programada,
            idUsuario,
        ]);

        // Ejecutar la inserción
        if (values.length > 0) {
            await db.query(insertQuery, [values]);
        }

        return res.status(200).json({ message: 'Abonos actualizados correctamente' });
    } catch (error) {
        console.error('Error al actualizar los abonos:', error);
        return res.status(500).json({ message: 'Error al actualizar los abonos' });
    }
});


module.exports = router;
