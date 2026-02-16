// VARIABLES GLOBALES
let productos_globales = [];

// FUNCIONES
function actualizar_contador_carrito()
{
    const carrito = JSON.parse(localStorage.getItem('carrito_temporal')) || [];
    const contador = document.querySelector('.contador_carrito');

    if (contador)
    {
        contador.textContent = carrito.length;
    }
}

function agregar_al_carrito(id_producto)
{
    let carrito = JSON.parse(localStorage.getItem('carrito_temporal')) || [];

    carrito.push(id_producto);
    localStorage.setItem('carrito_temporal', JSON.stringify(carrito));

    actualizar_contador_carrito();

    alert('Producto agregado al carrito');
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

// PUNTO DE PARTIDA
document.addEventListener('DOMContentLoaded', () =>
{
    // Cargar productos desde productos.json
    fetch('/api/productos')
        .then(response => response.json())
        .then(productos =>
        {
            localStorage.setItem('productos', JSON.stringify(productos));
            cargar_productos_destacados();
        })
        .catch(error => console.error('Error al cargar productos:', error));

    actualizar_contador_carrito();

    const enlace_carrito = document.querySelector('.contenedor_carrito');

    if (enlace_carrito)
    {
        enlace_carrito.addEventListener('click', () =>
        {
            window.location.href = '/frontend/carrito.html';
        });
    }
});