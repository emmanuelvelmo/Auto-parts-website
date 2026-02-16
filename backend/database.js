// MÓDULOS REQUERIDOS
const fs = require('fs');
const path = require('path');

// VARIABLES GLOBALES
const ruta_usuarios = path.join(__dirname, '..', 'data', 'usuarios.json');
const ruta_productos = path.join(__dirname, '..', 'data', 'productos.json');
const ruta_carrito = path.join(__dirname, '..', 'data', 'carrito.json');
const ruta_ventas = path.join(__dirname, '..', 'data', 'ventas.json');

// FUNCIONES
function leer_usuarios()
{
    try
    {
        if (fs.existsSync(ruta_usuarios))
        {
            const datos = fs.readFileSync(ruta_usuarios, 'utf8');
            return JSON.parse(datos);
        }
    }
    catch (error)
    {
        console.error('Error al leer usuarios:', error);
    }
    return [];
}

function escribir_usuarios(usuarios)
{
    try
    {
        fs.writeFileSync(ruta_usuarios, JSON.stringify(usuarios, null, 2));
        return true;
    }
    catch (error)
    {
        console.error('Error al escribir usuarios:', error);
        return false;
    }
}

function leer_productos()
{
    try
    {
        if (fs.existsSync(ruta_productos))
        {
            const datos = fs.readFileSync(ruta_productos, 'utf8');
            return JSON.parse(datos);
        }
    }
    catch (error)
    {
        console.error('Error al leer productos:', error);
    }
    return [];
}

function escribir_productos(productos)
{
    try
    {
        fs.writeFileSync(ruta_productos, JSON.stringify(productos, null, 2));
        return true;
    }
    catch (error)
    {
        console.error('Error al escribir productos:', error);
        return false;
    }
}

function leer_carrito()
{
    try
    {
        if (fs.existsSync(ruta_carrito))
        {
            const datos = fs.readFileSync(ruta_carrito, 'utf8');
            return JSON.parse(datos);
        }
    }
    catch (error)
    {
        console.error('Error al leer carrito:', error);
    }
    return [];
}

function escribir_carrito(carrito)
{
    try
    {
        fs.writeFileSync(ruta_carrito, JSON.stringify(carrito, null, 2));
        return true;
    }
    catch (error)
    {
        console.error('Error al escribir carrito:', error);
        return false;
    }
}

function leer_ventas()
{
    try
    {
        if (fs.existsSync(ruta_ventas))
        {
            const datos = fs.readFileSync(ruta_ventas, 'utf8');
            return JSON.parse(datos);
        }
    }
    catch (error)
    {
        console.error('Error al leer ventas:', error);
    }
    return [];
}

function escribir_ventas(ventas)
{
    try
    {
        fs.writeFileSync(ruta_ventas, JSON.stringify(ventas, null, 2));
        return true;
    }
    catch (error)
    {
        console.error('Error al escribir ventas:', error);
        return false;
    }
}

module.exports = {
    leer_usuarios,
    escribir_usuarios,
    leer_productos,
    escribir_productos,
    leer_carrito,
    escribir_carrito,
    leer_ventas,
    escribir_ventas
};