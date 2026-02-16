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
        const parametros = new URLSearchParams(cuerpo);

        if (ruta_parseada.pathname === '/registro')
        {
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
        }
        else if (ruta_parseada.pathname === '/inicio-sesion')
        {
            const resultado = auth.iniciar_sesion(
                parametros.get('correo_usuario'),
                parametros.get('contrasena_usuario')
            );

            respuesta.setHeader('Content-Type', 'application/json');

            if (resultado.exito)
            {
                respuesta.end(JSON.stringify(resultado));
            }
            else
            {
                respuesta.end(JSON.stringify(resultado));
            }
        }
        else if (ruta_parseada.pathname === '/api/agregar-carrito')
        {
            respuesta.setHeader('Content-Type', 'application/json');

            try
            {
                const datos = JSON.parse(cuerpo);
                const carrito = database.leer_carrito();

                carrito.push(datos);
                database.escribir_carrito(carrito);

                respuesta.end(JSON.stringify({ exito: true, mensaje: 'Producto agregado al carrito' }));
            }
            catch (error)
            {
                respuesta.statusCode = 500;
                respuesta.end(JSON.stringify({ exito: false, mensaje: 'Error al agregar al carrito' }));
            }
        }
    });
}

function manejar_peticion_api(peticion, respuesta, ruta_parseada)
{
    const metodo = peticion.method;
    const pathname = ruta_parseada.pathname;

    respuesta.setHeader('Content-Type', 'application/json');

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
    }
    else if (pathname === '/api/carrito' && metodo === 'GET')
    {
        try
        {
            const carrito = database.leer_carrito();
            respuesta.end(JSON.stringify(carrito));
        }
        catch (error)
        {
            respuesta.statusCode = 500;
            respuesta.end(JSON.stringify({ exito: false, mensaje: 'Error al obtener el carrito' }));
        }
    }
    else if (pathname === '/api/carrito' && metodo === 'DELETE')
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
    }
    else
    {
        respuesta.statusCode = 404;
        respuesta.end(JSON.stringify({ exito: false, mensaje: 'Ruta no encontrada' }));
    }
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
                        <a href="/frontend/index.html">Ir al inicio</a>
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
        '/index.html',
        '/inicio_sesion.html',
        '/registro.html',
        '/perfil.html',
        '/carrito.html',
        '/catalogo.html',
        '/producto_detalle.html',
        '/acerca_de.html',
        '/contacto.html',
        '/faq.html',
        '/terminos.html',
        '/testimonios.html'
    ];

    return archivos_html_frontend.includes(ruta);
}

// PUNTO DE PARTIDA
const servidor = http.createServer((peticion, respuesta) =>
{
    const ruta_parseada = url.parse(peticion.url, true);
    let ruta_archivo = ruta_parseada.pathname;

    if (ruta_archivo.startsWith('/api/'))
    {
        manejar_peticion_api(peticion, respuesta, ruta_parseada);
        return;
    }

    if (peticion.method === 'POST')
    {
        manejar_peticion_post(peticion, respuesta, ruta_parseada);
        return;
    }

    if (ruta_archivo === '/')
    {
        ruta_archivo = '/frontend/index.html';
    }
    else if (es_ruta_html_frontend(ruta_archivo))
    {
        ruta_archivo = `/frontend${ruta_archivo}`;
    }

    const ruta_completa = path.join(__dirname, '..', ruta_archivo);

    servir_archivo(respuesta, ruta_completa);
});

servidor.listen(puerto, () =>
{
    console.log('================================');
    console.log('   AUTOPARTS STORE');
    console.log('================================');
    console.log(`Servidor ejecutándose en:`);
    console.log(`http://localhost:${puerto}`);
    console.log(`http://localhost:${puerto}/frontend/index.html`);
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