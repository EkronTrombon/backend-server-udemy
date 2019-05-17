var express = require('express');
var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

// =================================
// Búsqueda por colección
// =================================
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    var tabla = req.params.tabla;
    var busqueda = req.params.busqueda;
    var regExp = new RegExp(busqueda, 'i');
    var promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regExp);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regExp);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regExp);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'La tabla de búsqueda debe ser usuarios, medicos u hospitales',
                error: { message: 'Tipo de colección/tabla no válida' }
            });
            break;
    }

    promesa.then(data => {
        return res.status(200).json({
            ok: true,
            [tabla]: data
        });
    });
});

// ==========================================
// Búsqueda general en todas las colecciones.
// ==========================================
app.get('/todo/:busqueda', (req, res, next) => {
    var busqueda = req.params.busqueda;
    var regExp = new RegExp(busqueda, 'i');

    Promise.all([buscarHospitales(busqueda, regExp), buscarMedicos(busqueda, regExp), buscarUsuarios(busqueda, regExp)]).then(respuestas => {
        res.status(200).json({
            ok: true,
            hospitales: respuestas[0],
            medicos: respuestas[1],
            usuarios: respuestas[2]
        });
    });
});

function buscarHospitales(busqueda, regExp) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regExp }).populate('usuario', 'nombre email').exec((err, hospitales) => {
            if (err) {
                reject('Error al cargar hospitales', err);
            } else {
                resolve(hospitales);
            }
        });
    });
}

function buscarMedicos(busqueda, regExp) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regExp }).populate('usuario', 'nombre email').populate('hospital').exec((err, medicos) => {
            if (err) {
                reject('Error al cargar médicos', err);
            } else {
                resolve(medicos);
            }
        });
    });
}

function buscarUsuarios(busqueda, regExp) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role').or([{ 'nombre': regExp }, { 'email': regExp }]).exec((err, usuarios) => {
            if (err) {
                reject('Error al cargar usuarios');
            } else {
                resolve(usuarios);
            }
        });
    });
}

module.exports = app;