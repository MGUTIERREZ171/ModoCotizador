const jwt = require('jsonwebtoken');

const validarJWT = (req, res, next) => {
    const token = req.header('x-token');
    if (!token) {
        return res.status(401).json({ message: 'No se encontró token en la petición' });
    }

    try {
        const { id, usuario } = jwt.verify(token, process.env.JWT_SECRET);

        req.idUsuario = id;
        req.usuario = usuario;

        next();
    } catch (error) {
        return res.status(401).json({ message: 'Token no válido o expirado' });
    }
};

module.exports = { validarJWT };
