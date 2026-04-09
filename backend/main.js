// VARIABLES GLOBALES
let productos_globales = [];
let usuario_actual = null;

// FUNCIONES
function obtener_usuario_actual()
{
    const usuario = sessionStorage.getItem('usuario');
    
    if (usuario)
    {
        usuario_actual = JSON.parse(usuario);
        return usuario_actual;
    }
    
    return null;
}

function actualizar_contador_carrito()
{
    const usuario = obtener_usuario_actual();
    
    if (!usuario)
    {
        const contador = document.querySelector('.contador_carrito');
        
        if (contador)
        {
            contador.textContent = '0';
        }
        
        return;
    }
    
    fetch(`/api/carrito/${usuario.id}`)
        .then(response => response.json())
        .then(carrito =>
        {
            const contador = document.querySelector('.contador_carrito');
            
            if (contador)
            {
                contador.textContent = carrito.length;
            }
        })
        .catch(error => console.error('Error al obtener carrito:', error));
}

function agregar_al_carrito(id_producto)
{
    const usuario = obtener_usuario_actual();
    
    if (!usuario)
    {
        alert('Debes iniciar sesión para agregar productos al carrito');
        window.location.href = 'inicio_sesion.html';
        return;
    }
    
    const datos_enviar = {
        id_usuario: usuario.id,
        id_producto: parseInt(id_producto)
    };
    
    console.log('Enviando al servidor:', datos_enviar);
    console.log('URL completa:', window.location.origin + '/api/agregar-carrito');
    
    fetch(window.location.origin + '/api/agregar-carrito', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(datos_enviar)
    })
    .then(response => {
        console.log('Respuesta HTTP:', response.status, response.statusText);
        return response.json();
    })
    .then(data =>
    {
        console.log('Respuesta del servidor:', data);
        
        if (data.exito)
        {
            actualizar_contador_carrito();
            alert('Producto agregado al carrito');
        }
        else
        {
            alert('Error al agregar producto: ' + (data.mensaje || 'Error desconocido'));
        }
    })
    .catch(error =>
    {
        console.error('Error en fetch:', error);
        alert('Error de conexión al servidor. Asegúrate de que el servidor esté corriendo en el puerto 8000.');
    });
}

function cargar_productos_destacados()
{
    const productos = JSON.parse(localStorage.getItem('productos')) || [];

    productos_globales = productos;

    const contenedor = document.querySelector('.contenedor_grid_productos');

    if (!contenedor) return;

    contenedor.innerHTML = '';

    const productos_destacados = productos.filter(p => p.destacado).slice(0, 6);

    productos_destacados.forEach(producto =>
    {
        const tarjeta = document.createElement('div');
        tarjeta.className = 'tarjeta_producto';

        const precio_anterior_html = producto.precio_anterior && producto.precio_anterior > 0 ?
            `<span class="precio_anterior">$${producto.precio_anterior.toFixed(2)}</span>` : '';

        tarjeta.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen_producto">
            <h3 class="titulo_producto">${producto.nombre}</h3>
            <p class="descripcion_producto">${producto.descripcion}</p>
            <div class="contenedor_precio">
                <span class="precio_actual">$${producto.precio.toFixed(2)}</span>
                ${precio_anterior_html}
            </div>
            <button class="boton_agregar" data-id="${producto.id}">AGREGAR AL CARRITO</button>
        `;

        contenedor.appendChild(tarjeta);
    });

    document.querySelectorAll('.boton_agregar').forEach(boton =>
    {
        boton.addEventListener('click', (e) =>
        {
            e.preventDefault();
            agregar_al_carrito(boton.getAttribute('data-id'));
        });
    });
}

function manejar_icono_perfil()
{
    const boton_perfil = document.getElementById('boton_perfil');

    if (boton_perfil)
    {
        boton_perfil.addEventListener('click', () =>
        {
            window.location.href = 'perfil.html';
        });
    }
}

function manejar_carrito()
{
    const boton_carrito = document.getElementById('boton_carrito');

    if (boton_carrito)
    {
        boton_carrito.addEventListener('click', () =>
        {
            window.location.href = 'carrito.html';
        });
    }
}

// PUNTO DE PARTIDA
document.addEventListener('DOMContentLoaded', () =>
{
    const pathname = window.location.pathname;
    
    if (pathname.includes('inicio.html') || pathname === '/' || pathname === '/frontend/inicio.html')
    {
        fetch('/api/productos')
            .then(response => response.json())
            .then(productos =>
            {
                localStorage.setItem('productos', JSON.stringify(productos));
                cargar_productos_destacados();
            })
            .catch(error => console.error('Error al cargar productos:', error));
    }
    else
    {
        fetch('/api/productos')
            .then(response => response.json())
            .then(productos =>
            {
                localStorage.setItem('productos', JSON.stringify(productos));
            })
            .catch(error => console.error('Error al cargar productos:', error));
    }

    actualizar_contador_carrito();
    manejar_icono_perfil();
    manejar_carrito();
});