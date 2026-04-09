// MÓDULOS REQUERIDOS
const fs = require('fs');
const path = require('path');

// VARIABLES GLOBALES
const ruta_usuarios = path.join(__dirname, '..', 'data', 'usuarios.json');
const ruta_productos = path.join(__dirname, '..', 'data', 'productos.json');
const ruta_carrito = path.join(__dirname, '..', 'data', 'carrito.json');
const ruta_pedidos = path.join(__dirname, '..', 'data', 'pedidos.json');
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

function actualizar_usuario(id_usuario, datos_actualizados)
{
    const usuarios = leer_usuarios();
    const indice = usuarios.findIndex(u => u.id == id_usuario);
    
    if (indice === -1)
    {
        return { exito: false, mensaje: 'Usuario no encontrado' };
    }
    
    usuarios[indice] = {
        ...usuarios[indice],
        nombre: datos_actualizados.nombre || usuarios[indice].nombre,
        apellido_paterno: datos_actualizados.apellido_paterno || usuarios[indice].apellido_paterno,
        apellido_materno: datos_actualizados.apellido_materno || usuarios[indice].apellido_materno,
        telefono: datos_actualizados.telefono || usuarios[indice].telefono,
        direccion: datos_actualizados.direccion || usuarios[indice].direccion,
        correo: datos_actualizados.correo || usuarios[indice].correo
    };
    
    if (datos_actualizados.contrasena)
    {
        const auth = require('./auth');
        usuarios[indice].contrasena = auth.hashear_contrasena(datos_actualizados.contrasena);
    }
    
    escribir_usuarios(usuarios);
    return { exito: true, mensaje: 'Perfil actualizado correctamente' };
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

function agregar_producto_nuevo(producto)
{
    const productos = leer_productos();
    
    const nuevo_id = Math.max(...productos.map(p => p.id), 0) + 1;
    
    const nuevo_producto = {
        id: nuevo_id,
        nombre: producto.nombre,
        descripcion: producto.descripcion,
        categoria: producto.categoria,
        precio: parseFloat(producto.precio),
        precio_anterior: producto.precio_anterior ? parseFloat(producto.precio_anterior) : 0,
        imagen: producto.imagen,
        destacado: producto.destacado === 'true' || producto.destacado === true
    };
    
    productos.push(nuevo_producto);
    escribir_productos(productos);
    
    return { exito: true, mensaje: 'Producto agregado exitosamente', id: nuevo_id };
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

function leer_pedidos()
{
    try
    {
        if (fs.existsSync(ruta_pedidos))
        {
            const datos = fs.readFileSync(ruta_pedidos, 'utf8');
            return JSON.parse(datos);
        }
    }
    catch (error)
    {
        console.error('Error al leer pedidos:', error);
    }
    return [];
}

function escribir_pedidos(pedidos)
{
    try
    {
        fs.writeFileSync(ruta_pedidos, JSON.stringify(pedidos, null, 2));
        return true;
    }
    catch (error)
    {
        console.error('Error al escribir pedidos:', error);
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

function crear_pedido(id_usuario, items_pedido, total_pedido, direccion_envio)
{
    const pedidos = leer_pedidos();
    
    const fecha_pedido = new Date();
    const fecha_entrega = new Date();
    fecha_entrega.setDate(fecha_entrega.getDate() + 3);
    
    const nuevo_pedido = {
        id: Date.now(),
        id_usuario: id_usuario,
        items: items_pedido,
        total: total_pedido,
        direccion: direccion_envio,
        estado: 'enviado',
        fecha_pedido: fecha_pedido.toISOString(),
        fecha_entrega_estimada: fecha_entrega.toISOString()
    };
    
    pedidos.push(nuevo_pedido);
    escribir_pedidos(pedidos);
    
    vaciar_carrito_usuario(id_usuario);
    
    return { exito: true, id_pedido: nuevo_pedido.id };
}

function obtener_pedidos_usuario(id_usuario)
{
    const pedidos = leer_pedidos();
    const ahora = new Date();
    
    const pedidos_usuario = pedidos.filter(p => p.id_usuario == id_usuario);
    
    const pedidos_actualizados = [];
    
    for (let iter_val = 0; iter_val < pedidos_usuario.length; iter_val++)
    {
        const pedido_iter = pedidos_usuario[iter_val];
        const fecha_entrega = new Date(pedido_iter.fecha_entrega_estimada);
        
        if (pedido_iter.estado === 'enviado' && fecha_entrega <= ahora)
        {
            pedido_iter.estado = 'entregado';
            
            const indice_original = pedidos.findIndex(p => p.id == pedido_iter.id);
            
            if (indice_original !== -1)
            {
                pedidos[indice_original].estado = 'entregado';
            }
        }
        
        pedidos_actualizados.push(pedido_iter);
    }
    
    if (pedidos_actualizados.some(p => p.estado === 'entregado'))
    {
        escribir_pedidos(pedidos);
    }
    
    return pedidos_actualizados;
}

function eliminar_pedido_entregado(id_pedido)
{
    let pedidos = leer_pedidos();
    const pedido = pedidos.find(p => p.id == id_pedido);
    
    if (pedido && pedido.estado === 'entregado')
    {
        pedidos = pedidos.filter(p => p.id != id_pedido);
        escribir_pedidos(pedidos);
        return true;
    }
    
    return false;
}

module.exports = {
    leer_usuarios,
    escribir_usuarios,
    actualizar_usuario,
    leer_productos,
    escribir_productos,
    agregar_producto_nuevo,
    leer_carrito,
    escribir_carrito,
    leer_pedidos,
    escribir_pedidos,
    leer_ventas,
    escribir_ventas,
    obtener_carrito_usuario,
    agregar_producto_carrito,
    eliminar_producto_carrito,
    vaciar_carrito_usuario,
    crear_pedido,
    obtener_pedidos_usuario,
    eliminar_pedido_entregado
};