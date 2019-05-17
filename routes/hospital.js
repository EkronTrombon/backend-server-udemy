var express = require('express');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

// Modelo de hospital
var Hospital = require('../models/hospital');

// =================================
// Obtener todos los hospitales (GET).
// =================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Hospital.find({}).populate('usuario', 'nombre email').skip(desde).limit(5).exec(
        (err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando hospital',
                    errors: err
                });
            }
            Hospital.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    totalHopitales: conteo,
                    hospitales: hospitales
                });
            });
        });
});

// =================================
// Actualizar hospital (PUT).
// =================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Hospital.findById(id, (err, hospital) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }
        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El hospital con el id: ' + id + 'no existe',
                errors: err
            });
        }
        hospital.nombre = body.nombre;
        hospital.usuario = body.usuario;
        hospital.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el hospital',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
});

// =================================
// Crear un nuevo hospital (POST).
// =================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var hospital = new Hospital({
        nombre: body.nombre,
        usuario: body.usuario._id
    });
    hospital.save((err, hospitalGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: { message: 'No existe un hospital con ese id' }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalGuardado,
            hospitalToken: req.hospital
        });
    });
});

// =================================
// Eliminar un hospital (DELETE).
// =================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }
        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un hospital con ese id',
                errors: { message: 'No existe un hospital con el id: ' + id }
            });
        }
        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado
        });
    });
});

module.exports = app;