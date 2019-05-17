var express = require('express');
var fileUpload = require('express-fileupload');
var fs = require('fs');
var app = express();

// Modelos
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// Middleware
app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    var tipo = req.params.tipo;
    var id = req.params.id;

    // Validamos que el tipo sea válido
    var tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no válida',
            errrors: { message: 'Tipo de colección no válida' }
        });
    }

    // Validamos que existan ficheros a subir
    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No hay archivo para subir',
            errrors: { message: 'Debe seleccionar un fichero' }
        });
    }
    // Obtener el nombre del archivo
    var archivo = req.files.imagen;
    var nombreCortado = archivo.name.split('.');
    var extensionArchivo = nombreCortado[nombreCortado.length - 1];

    // Validar extensiones
    var extValidas = ['png', 'jpg', 'gif', 'jpeg'];
    if (extValidas.indexOf(extensionArchivo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de archivo no válido',
            errrors: { message: 'Los archivos válidos son del tipo: ' + extValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado: <id del usuario-'Nº random'.extension>
    var nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extensionArchivo}`;

    // Mover el archivo del temporal a un path
    var path = `./uploads/${tipo}/${nombreArchivo}`;
    archivo.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                errrors: err
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);

        // res.status(200).json({
        //     ok: true,
        //     mensaje: 'Archivo movido'
        // });
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    if (tipo === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {
            // Validación del id
            if (!usuario) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El id del usuario no existe!',
                    errrors: { message: 'El id del usuario no existe!' }
                });
            }
            var pathViejo = './upload/usuarios/' + usuario.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            usuario.img = nombreArchivo;
            usuario.save((err, usuarioActualizado) => {
                usuarioActualizado.password = ':)';
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuario: usuarioActualizado
                });
            });
        });
    }
    if (tipo === 'medicos') {
        Medico.findById(id, (err, medico) => {
            // Validación del id
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El id del medico no existe!',
                    errrors: { message: 'El id del medico no existe!' }
                });
            }
            var pathViejo = './upload/medicos/' + medico.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            medico.img = nombreArchivo;
            medico.save((err, medicoActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medico: medicoActualizado
                });
            });
        });
    }
    if (tipo === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {
            // Validación del id
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El id del hospital no existe!',
                    errrors: { message: 'El id del hospital no existe!' }
                });
            }
            var pathViejo = './upload/hospitales/' + hospital.img;
            // Si existe, elimina la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            hospital.img = nombreArchivo;
            hospital.save((err, hospitalActualizado) => {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospital: hospitalActualizado
                });
            });
        });
    }
}

module.exports = app;