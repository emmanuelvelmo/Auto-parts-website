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

function obtener_carrito_usuario(id_usuario)
{
    const carrito = leer_carrito();
    const carrito_usuario = carrito.filter(item => item.id_usuario == id_usuario);
    return carrito_usuario;
}

function agregar_producto_carrito(id_usuario, id_producto)
{
    console.log('agregar_producto_carrito llamado con:', id_usuario, id_producto);
    
    const carrito = leer_carrito();
    console.log('Carrito actual:', carrito);
    
    const nuevo_item = {
        id_usuario: id_usuario,
        id_producto: id_producto,
        fecha_agregado: new Date().toISOString()
    };
    
    carrito.push(nuevo_item);
    console.log('Nuevo carrito:', carrito);
    
    escribir_carrito(carrito);
    
    return true;
}

function eliminar_producto_carrito(id_usuario, id_producto)
{
    let carrito = leer_carrito();
    
    let indice_eliminar = -1;
    
    for (let iter_val = 0; iter_val < carrito.length; iter_val++)
    {
        if (carrito[iter_val].id_usuario == id_usuario && carrito[iter_val].id_producto == id_producto)
        {
            indice_eliminar = iter_val;
            break;
        }
    }
    
    if (indice_eliminar !== -1)
    {
        carrito.splice(indice_eliminar, 1);
        escribir_carrito(carrito);
        return true;
    }
    
    return false;
}

function vaciar_carrito_usuario(id_usuario)
{
    let carrito = leer_carrito();
    carrito = carrito.filter(item => item.id_usuario != id_usuario);
    escribir_carrito(carrito);
    return true;
}

module.exports = {
    leer_usuarios,
    escribir_usuarios,
    leer_productos,
    escribir_productos,
    leer_carrito,
    escribir_carrito,
    leer_ventas,
    escribir_ventas,
    obtener_carrito_usuario,
    agregar_producto_carrito,
    eliminar_producto_carrito,
    vaciar_carrito_usuario
};