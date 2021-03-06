const express = require('express');
const app = express();

const bcrypt = require("bcrypt");

const _ = require("underscore");



const Usuario = require("../models/usuario");
const { verificaToken, verificaAdmin_Role } = require("../middlewares/autenticacion");




app.get('/usuario', verificaToken, (req, res) => {



    let desde = req.query.desde || 0;
    desde = Number(desde);

    let limite = req.query.limite || 5;
    limite = Number(limite);

    Usuario.find({ estado: true }, "nombre email role estado google img")
        .skip(desde)
        .limit(limite)
        .exec((error, usuarios) => {

            if (error) {
                return res.status(400).json({
                    ok: false,
                    error
                });
            }


            Usuario.countDocuments({ estado: true }, (error, conteo) => {

                res.json({
                    ok: true,
                    usuarios,
                    cuantos: conteo
                });

            });




        });



});






app.post('/usuario', [verificaToken, verificaAdmin_Role], function (req, res) {

    let body = req.body;

    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })


    usuario.save((error, usuarioDB) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }


        res.json({
            ok: true,
            usuario: usuarioDB
        })



    });



});






app.put('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {

    let id = req.params.id;
    let body = _.pick(req.body, ["nombre", "email", "img", "role", "estado"]);


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true }, (error, usuarioDB) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }


        res.json({
            ok: true,
            usuario: usuarioDB

        });


    });




});






app.delete('/usuario/:id', [verificaToken, verificaAdmin_Role], function (req, res) {


    let id = req.params.id;

    let cambiarEstado = {
        estado: false
    }


    /*     Usuario.findByIdAndRemove(id, (error, usuarioBorrado) => { */

    Usuario.findByIdAndUpdate(id, cambiarEstado, { new: true }, (error, usuarioBorrado) => {

        if (error) {
            return res.status(400).json({
                ok: false,
                error
            });
        }


        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                error: {
                    message: "Usuario no encontrado"
                }
            });
        }



        res.json({
            ok: true,
            usuario: usuarioBorrado
        });


    });





});



module.exports = app;