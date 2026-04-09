// MÓDULOS REQUERIDOS
const crypto = require('crypto');
const database = require('./database');

// VARIABLES GLOBALES
const algoritmo_hash = 'sha256';

// FUNCIONES
function hashear_contrasena(contrasena)
{
    return crypto.createHash(algoritmo_hash).update(contrasena).digest('hex');
}

function registrar_usuario(datos_usuario)
{
    const usuarios = database.leer_usuarios();

    if (usuarios.some(usuario => usuario.correo === datos_usuario.correo))
    {
        return { exito: false, mensaje: 'El correo electrónico ya está registrado' };
    }

    const nuevo_usuario = {
        id: Date.now(),
        nombre: datos_usuario.nombre,
        apellido_paterno: datos_usuario.apellido_paterno,
        apellido_materno: datos_usuario.apellido_materno,
        telefono: datos_usuario.telefono,
        direccion: datos_usuario.direccion,
        correo: datos_usuario.correo,
        contrasena: hashear_contrasena(datos_usuario.contrasena),
        fecha_registro: new Date().toISOString()
    };

    usuarios.push(nuevo_usuario);
    database.escribir_usuarios(usuarios);

    return { exito: true, mensaje: 'Usuario registrado exitosamente' };
}

function iniciar_sesion(correo_usuario, contrasena_usuario)
{
    const usuarios = database.leer_usuarios();

    const usuario = usuarios.find(u => u.correo === correo_usuario);

    if (!usuario)
    {
        return { exito: false, mensaje: 'Correo o contraseña incorrectos' };
    }

    if (usuario.contrasena !== hashear_contrasena(contrasena_usuario))
    {
        return { exito: false, mensaje: 'Correo o contraseña incorrectos' };
    }

    return {
        exito: true,
        mensaje: 'Sesión iniciada correctamente',
        usuario: {
            id: usuario.id,
            nombre: usuario.nombre,
            apellido_paterno: usuario.apellido_paterno,
            apellido_materno: usuario.apellido_materno,
            telefono: usuario.telefono,
            direccion: usuario.direccion,
            correo: usuario.correo,
            fecha_registro: usuario.fecha_registro
        }
    };
}

module.exports = {
    hashear_contrasena,
    registrar_usuario,
    iniciar_sesion
};