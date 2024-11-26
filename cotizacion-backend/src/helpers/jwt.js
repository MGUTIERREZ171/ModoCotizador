const jwt = require('jsonwebtoken');

const generarJwt = (usuario, id) => {

    return new Promise((resolve, reject) => {

        const payload = { usuario, id };

        jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: '24h'
        }, (err, token) => {

            if (err) {
                console.log(err)
                reject('No se pudo generar el token')
            }

            resolve(token);

        })

    })

}

module.exports = {
    generarJwt
}