var express = require('express');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var mdAutenticacion = require('../middlewares/autenticacion');
var app = express();

// Modelo de medico
var Medico = require('../models/medico');

// =================================
// Obtener todos los médicos (GET).
// =================================
app.get('/', (req, res, next) => {
    var desde = req.query.desde || 0;
    desde = Number(desde);
    Medico.find({}, 'nombre usuario hospital').skip(desde).limit(5).populate('usuario', 'nombre email').populate('hospital').exec(
        (err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error cargando medicos',
                    errors: err
                });
            }
            // Si no hay error
            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    totalMedicos: conteo,
                    medicos: medicos
                });
            });
        });
});

// =================================
// Actualizar medico (PUT).
// =================================
app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    var body = req.body;
    Medico.findById(id, (err, medico) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }
        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: 'El médico con el id: ' + id + ' no existe',
                errors: err
            });
        }

        medico.nombre = body.nombre;
        medico.usuario = body.usuario;
        medico.hospital = body.hospital;

        medico.save((err, medicoGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar médico',
                    errors: err
                });
            }
            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
});

// =================================
// Crear un nuevo medico (POST).
// =================================
app.post('/', mdAutenticacion.verificaToken, (req, res) => {
    var body = req.body;
    var medico = new Medico({
        nombre: body.nombre,
        usuario: body.usuario._id,
        hospital: body.hospital._id
    });
    medico.save((err, medicoGuardado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: { message: 'No existe un médico con ese id' }
            });
        }
        res.status(201).json({
            ok: true,
            medico: medicoGuardado,
            medicoToken: req.medico
        });
    });
});

// =================================
// Eliminar un medico (DELETE).
// =================================
app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {
    var id = req.params.id;
    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }
        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe un médico con ese id',
                errors: { message: 'No existe un médico con el id: ' + id }
            });
        }
        res.status(200).json({
            ok: true,
            medico: medicoBorrado
        });
    });
});

module.exports = app;