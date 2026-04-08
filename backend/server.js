// MÓDULOS REQUERIDOS
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const auth = require('./auth');
const database = require('./database');

// VARIABLES GLOBALES
const puerto = 8000;

// FUNCIONES
function manejar_peticion_post(peticion, respuesta, ruta_parseada)
{
    let cuerpo = '';

    peticion.on('data', chunk =>
    {
        cuerpo += chunk.toString();
    });

    peticion.on('end', () =>
    {
        console.log('=== POST RECIBIDO ===');
        console.log('Ruta completa:', ruta_parseada.pathname);
        console.log('Cuerpo recibido:', cuerpo);
        
        // Intentar parsear como JSON primero
        let datos_json = null;
        let es_json = false;
        
        try
        {
            datos_json = JSON.parse(cuerpo);
            es_json = true;
            console.log('Parseado como JSON:', datos_json);
        }
        catch (e)
        {
            console.log('No es JSON, procesando como URLSearchParams');
        }
        
        // Manejar diferentes rutas POST
        if (ruta_parseada.pathname === '/registro')
        {
            const parametros = new URLSearchParams(cuerpo);
            
            const datos_usuario = {
                nombre: parametros.get('nombre'),
                apellido_paterno: parametros.get('apellido_paterno'),
                apellido_materno: parametros.get('apellido_materno'),
                telefono: parametros.get('telefono'),
                direccion: parametros.get('direccion'),
                correo: parametros.get('correo'),
                contrasena: parametros.get('contrasena')
            };

            const resultado = auth.registrar_usuario(datos_usuario);

            if (resultado.exito)
            {
                respuesta.writeHead(302, { 'Location': '/frontend/inicio_sesion.html?registro=exitoso' });
                respuesta.end();
            }
            else
            {
                respuesta.writeHead(302, { 'Location': '/frontend/registro.html?error=1' });
                respuesta.end();
            }
            return;
        }
        
        if (ruta_parseada.pathname === '/inicio-sesion')
        {
            const parametros = new URLSearchParams(cuerpo);
            
            const resultado = auth.iniciar_sesion(
                parametros.get('correo_usuario'),
                parametros.get('contrasena_usuario')
            );

            respuesta.setHeader('Content-Type', 'application/json');
            respuesta.end(JSON.stringify(resultado));
            return;
        }
        
        // Manejar rutas API POST
        if (ruta_parseada.pathname === '/api/agregar-carrito')
        {
            console.log('=== MANEJANDO /api/agregar-carrito ===');
            respuesta.setHeader('Content-Type', 'application/json');

            try
            {
                let id_usuario_val = null;
                let id_producto_val = null;
                
                if (es_json && datos_json)
                {
                    id_usuario_val = datos_json.id_usuario;
                    id_producto_val = datos_json.id_producto;
                }
                else
                {
                    const parametros = new URLSearchParams(cuerpo);
                    id_usuario_val = parseInt(parametros.get('id_usuario'));
                    id_producto_val = parseInt(parametros.get('id_producto'));
                }
                
                console.log('id_usuario extraído:', id_usuario_val);
                console.log('id_producto extraído:', id_producto_val);
                
                if (!id_usuario_val || !id_producto_val)
                {
                    console.log('Faltan datos');
                    respuesta.statusCode = 400;
                    respuesta.end(JSON.stringify({ exito: false, mensaje: 'Faltan datos requeridos' }));
                    return;
                }
                
                const exito = database.agregar_producto_carrito(id_usuario_val, id_producto_val);
                console.log('Resultado de agregar_producto_carrito:', exito);
                
                respuesta.end(JSON.stringify({ exito: exito, mensaje: 'Producto agregado al carrito' }));
            }
            catch (error)
            {
                console.error('Error en agregar-carrito:', error);
                respuesta.statusCode = 500;
                respuesta.end(JSON.stringify({ exito: false, mensaje: 'Error al agregar al carrito: ' + error.message }));
            }
            return;
        }
        
        if (ruta_parseada.pathname === '/api/eliminar-carrito')
        {
            respuesta.setHeader('Content-Type', 'application/json');

            try
            {
                let id_usuario_val = null;
                let id_producto_val = null;
                
                if (es_json && datos_json)
                {
                    id_usuario_val = datos_json.id_usuario;
                    id_producto_val = datos_json.id_producto;
                }
                else
                {
                    const parametros = new URLSearchParams(cuerpo);
                    id_usuario_val = parseInt(parametros.get('id_usuario'));
                    id_producto_val = parseInt(parametros.get('id_producto'));
                }
                
                if (!id_usuario_val || !id_producto_val)
                {
                    respuesta.statusCode = 400;
                    respuesta.end(JSON.stringify({ exito: false, mensaje: 'Faltan datos requeridos' }));
                    return;
                }
                
                const exito = database.eliminar_producto_carrito(id_usuario_val, id_producto_val);
                respuesta.end(JSON.stringify({ exito: exito, mensaje: 'Producto eliminado del carrito' }));
            }
            catch (error)
            {
                console.error('Error en eliminar-carrito:', error);
                respuesta.statusCode = 500;
                respuesta.end(JSON.stringify({ exito: false, mensaje: 'Error al eliminar del carrito' }));
            }
            return;
        }
        
        if (ruta_parseada.pathname === '/api/vaciar-carrito')
        {
            respuesta.setHeader('Content-Type', 'application/json');

            try
            {
                let id_usuario_val = null;
                
                if (es_json && datos_json)
                {
                    id_usuario_val = datos_json.id_usuario;
                }
                else
                {
                    const parametros = new URLSearchParams(cuerpo);
                    id_usuario_val = parseInt(parametros.get('id_usuario'));
                }
                
                if (!id_usuario_val)
                {
                    respuesta.statusCode = 400;
                    respuesta.end(JSON.stringify({ exito: false, mensaje: 'Falta ID de usuario' }));
                    return;
                }
                
                const exito = database.vaciar_carrito_usuario(id_usuario_val);
                respuesta.end(JSON.stringify({ exito: exito, mensaje: 'Carrito vaciado' }));
            }
            catch (error)
            {
                console.error('Error en vaciar-carrito:', error);
                respuesta.statusCode = 500;
                respuesta.end(JSON.stringify({ exito: false, mensaje: 'Error al vaciar el carrito' }));
            }
            return;
        }
        
        // Si llegamos aquí, la ruta POST no existe
        console.log('Ruta POST no encontrada:', ruta_parseada.pathname);
        respuesta.statusCode = 404;
        respuesta.setHeader('Content-Type', 'application/json');
        respuesta.end(JSON.stringify({ exito: false, mensaje: 'Ruta no encontrada' }));
    });
}

function manejar_peticion_api(peticion, respuesta, ruta_parseada)
{
    const metodo = peticion.method;
    const pathname = ruta_parseada.pathname;

    console.log('API request GET/DELETE:', metodo, pathname);
    
    respuesta.setHeader('Content-Type', 'application/json');
    respuesta.setHeader('Access-Control-Allow-Origin', '*');
    respuesta.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
    respuesta.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (metodo === 'OPTIONS')
    {
        respuesta.statusCode = 200;
        respuesta.end();
        return;
    }

    if (pathname === '/api/productos' && metodo === 'GET')
    {
        try
        {
            const productos = database.leer_productos();
            respuesta.end(JSON.stringify(productos));
        }
        catch (error)
        {
            respuesta.statusCode = 500;
            respuesta.end(JSON.stringify({ exito: false, mensaje: 'Error al obtener los productos' }));
        }
        return;
    }
    
    if (pathname === '/api/ofertas' && metodo === 'GET')
    {
        try
        {
            const ruta_ofertas = path.join(__dirname, '..', 'data', 'ofertas.json');
            
            if (fs.existsSync(ruta_ofertas))
            {
                const datos = fs.readFileSync(ruta_ofertas, 'utf8');
                const ofertas = JSON.parse(datos);
                respuesta.end(JSON.stringify(ofertas));
            }
            else
            {
                respuesta.end(JSON.stringify([]));
            }
        }
        catch (error)
        {
            console.error('Error al leer ofertas:', error);
            respuesta.statusCode = 500;
            respuesta.end(JSON.stringify({ exito: false, mensaje: 'Error al obtener las ofertas' }));
        }
        return;
    }
    
    if (pathname.startsWith('/api/carrito/') && metodo === 'GET')
    {
        try
        {
            const partes = pathname.split('/');
            const id_usuario = parseInt(partes[partes.length - 1]);
            
            if (isNaN(id_usuario))
            {
                respuesta.statusCode = 400;
                respuesta.end(JSON.stringify({ exito: false, mensaje: 'ID de usuario inválido' }));
                return;
            }
            
            const carrito = database.obtener_carrito_usuario(id_usuario);
            respuesta.end(JSON.stringify(carrito));
        }
        catch (error)
        {
            console.error('Error al obtener carrito:', error);
            respuesta.statusCode = 500;
            respuesta.end(JSON.stringify({ exito: false, mensaje: 'Error al obtener el carrito' }));
        }
        return;
    }
    
    if (pathname === '/api/carrito' && metodo === 'DELETE')
    {
        try
        {
            database.escribir_carrito([]);
            respuesta.end(JSON.stringify({ exito: true, mensaje: 'Carrito vaciado' }));
        }
        catch (error)
        {
            respuesta.statusCode = 500;
            respuesta.end(JSON.stringify({ exito: false, mensaje: 'Error al vaciar el carrito' }));
        }
        return;
    }
    
    // Si llegamos aquí, la ruta API no existe
    console.log('API ruta no encontrada:', metodo, pathname);
    respuesta.statusCode = 404;
    respuesta.end(JSON.stringify({ exito: false, mensaje: 'Ruta API no encontrada' }));
}

function servir_archivo(respuesta, ruta_completa)
{
    fs.readFile(ruta_completa, (error, datos) =>
    {
        if (error)
        {
            respuesta.writeHead(404, { 'Content-Type': 'text/html' });
            respuesta.end(`
                <html>
                    <body>
                        <h1>Error 404 - Archivo no encontrado</h1>
                        <p>No se pudo encontrar: ${ruta_completa}</p>
                        <a href="/frontend/inicio.html">Ir al inicio</a>
                    </body>
                </html>
            `);
        }
        else
        {
            const extension = path.extname(ruta_completa);
            const tipos_mime = {
                '.html': 'text/html',
                '.css': 'text/css',
                '.js': 'text/javascript',
                '.json': 'application/json'
            };

            respuesta.writeHead(200, {
                'Content-Type': tipos_mime[extension] || 'text/plain'
            });
            respuesta.end(datos);
        }
    });
}

function es_ruta_html_frontend(ruta)
{
    const archivos_html_frontend = [
        '/inicio.html',
        '/inicio_sesion.html',
        '/registro.html',
        '/perfil.html',
        '/carrito.html',
        '/catalogo.html',
        '/ofertas.html',
        '/acerca_de_nosotros.html',
        '/contacto.html',
        '/preguntas_frecuentes.html',
        '/terminos.html'
    ];

    return archivos_html_frontend.includes(ruta);
}

// PUNTO DE PARTIDA
const servidor = http.createServer((peticion, respuesta) =>
{
    const ruta_parseada = url.parse(peticion.url, true);
    let ruta_archivo = ruta_parseada.pathname;

    console.log('=== NUEVA PETICIÓN ===');
    console.log('Método:', peticion.method);
    console.log('Ruta:', ruta_archivo);
    console.log('Headers:', peticion.headers);

    // Manejar todas las peticiones POST
    if (peticion.method === 'POST')
    {
        manejar_peticion_post(peticion, respuesta, ruta_parseada);
        return;
    }

    // Manejar peticiones GET a rutas API
    if (ruta_archivo.startsWith('/api/'))
    {
        manejar_peticion_api(peticion, respuesta, ruta_parseada);
        return;
    }

    // Manejar archivos estáticos (GET)
    if (ruta_archivo === '/')
    {
        ruta_archivo = '/frontend/inicio.html';
    }
    else if (es_ruta_html_frontend(ruta_archivo))
    {
        ruta_archivo = `/frontend${ruta_archivo}`;
    }

    const ruta_completa = path.join(__dirname, '..', ruta_archivo);
    console.log('Sirviendo archivo estático:', ruta_completa);

    servir_archivo(respuesta, ruta_completa);
});

servidor.listen(puerto, () =>
{
    console.log('================================');
    console.log('   AUTOPARTS STORE');
    console.log('================================');
    console.log(`Servidor ejecutándose en:`);
    console.log(`http://localhost:${puerto}`);
    console.log(`http://localhost:${puerto}/frontend/inicio.html`);
    console.log('================================');
    console.log('NOTA: Las sesiones son temporales.');
    console.log('================================');
    console.log('Presiona Ctrl + C para detener');
    console.log('================================');
});

process.on('uncaughtException', (error) =>
{
    console.error('Error no capturado:', error);
});

process.on('unhandledRejection', (reason, promise) =>
{
    console.error('Rechazo de promesa no manejado:', reason);
});