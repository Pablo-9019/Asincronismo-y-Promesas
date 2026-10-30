const productos = [
    { id: 1, nombre: "Pan", variedad: "Ciabatta", precio: 500, stock: 30},
    { id: 2, nombre: "Galletas", variedad: "Surtidas", precio: 1000, stock: 100},
    { id: 3, nombre: "Facturas", variedad: "Sacramentos", precio: 850, stock: 50},
    { id: 4, nombre: "Tortas", variedad: "Raspadas", precio: 350, stock: 100},
    { id: 5, nombre: "Sandwiches", variedad: "Jamon y Queso", precio: 1500, stock: 150},
]
const descuento = 0.15
const precioConDescuento = (precio) => (precio * (1 - descuento))
const listaProductos = document.getElementById("productos")
const listaCarrito = document.getElementById("lista")
const panelCarrito = document.querySelector(".carrito")
const busqueda = document.getElementById("busqueda")
const totalCarrito = document.getElementById("total")
const comprar = document.getElementById("compra")
let carrito = []
 
// Recuperar el carrito guardado: ?? usa [] si todavia no hay nada en el storage
const productosGuardados = JSON.parse(localStorage.getItem("carrito")) ?? []
productosGuardados.forEach((productoGuardado) => {
    const {id, cantidad} = productoGuardado
    const producto = productos.find((item) => item.id === id)
    if (producto !== undefined && cantidad > 0){
        const cantidadFinal = cantidad > producto.stock
        ? producto.stock
        : cantidad
        carrito.push({
            id: producto.id,
            cantidad: cantidadFinal
        })
    }
})
 
function aviso(mensaje, tipo = "info"){
    const contenedor = document.getElementById("alerta")
    contenedor.textContent = mensaje
    contenedor.className = `alerta visible ${tipo}`
}
 
setTimeout(() => {
   aviso("Oferta 15% OFF en nuestros productos")
}, 1000)
 
comprar.addEventListener("click", async () => {
    if (carrito.length === 0){
        aviso("No se puede realizar la compra, tu carrito esta vacio", "error")
        return
    }
    comprar.disabled = true
    try {
        await new Promise((resolve) => {
            setTimeout(resolve, 1000)
        })
        carrito = []
        guardarCarrito()
        aviso("Tu compra se realizo con exito", "exito")
    }
    catch(error){
        aviso("Tu compra no se realizo con exito, volve a verificar", "error")
    }
    finally{
        comprar.disabled = false
    }
})
 
function guardarCarrito(){
    localStorage.setItem("carrito", JSON.stringify(carrito))
    actualizarCarrito()
}
 
function buscarEnCarrito(id){
    return carrito.find((item) =>{
        return item.id === id
    })
}
 
function agregarAlCarrito(id){
    const producto = productos.find((item) =>{
        return item.id === id
    })
    const productoEnCarrito = buscarEnCarrito(id)
    if(productoEnCarrito !== undefined){
        if(productoEnCarrito.cantidad < producto.stock){
            productoEnCarrito.cantidad++
        }
        else{
            aviso("No hay mas stock de " + producto.nombre, "error")
        }
    }
    else if(producto.stock > 0){
        carrito.push({id: producto.id, cantidad: 1})
    }
    guardarCarrito()
}
 
function eliminarDelCarrito(id){
    carrito = carrito.filter((item) =>{
        return item.id !== id
    })
    guardarCarrito()
}
 
function cambiarCantidad(id, cambio){
    const producto = productos.find((item) =>{
        return item.id === id
    })
    const productoEnCarrito = buscarEnCarrito(id)
    if (productoEnCarrito === undefined){
        return
    }
    productoEnCarrito.cantidad += cambio
    if(productoEnCarrito.cantidad <= 0){
        eliminarDelCarrito(id)
        return
    }
    if(productoEnCarrito.cantidad > producto.stock){
        productoEnCarrito.cantidad = producto.stock
    }
    guardarCarrito()
}
 
function renderizarProductos(){
    const tarjetas = []
    productos.forEach(({id, nombre, precio, stock}) => {
        tarjetas.push(`<article class="box">
        <h3>${nombre}</h3>
        <p class="precio">
        <span class="precio-original">$${precio.toLocaleString("es-AR")}</span>
        <span class="precio-descuento">$${precioConDescuento(precio).toLocaleString("es-AR")}</span>
        <span class="etiqueta-descuento">15% OFF</span>
        </p>
        <p>Disponible: ${stock}</p>
        <button type="button" class="btn" data-id="${id}" ${stock === 0 ? "disabled" : ""}>
        + Agregar al Carrito</button></article>`)
    })
    listaProductos.innerHTML = tarjetas.join("")
    const botones = listaProductos.querySelectorAll(".btn")
    botones.forEach((boton) => {
        boton.addEventListener("click", () =>{
            agregarAlCarrito(Number(boton.dataset.id))
        })
    })
}
 
function actualizarCarrito(){
    listaCarrito.innerHTML = ""
    let total = 0
    carrito.forEach(({id, cantidad}) =>{
        const producto = productos.find((productoCatalogo) =>{
            return productoCatalogo.id === id
        })
        if(producto === undefined) {
            return
        }
        const {nombre, precio, stock} = producto
        const elemento = document.createElement("li")
        elemento.innerHTML = `
        <span>${nombre} - <del>$${precio.toLocaleString("es-AR")}</del> $${precioConDescuento(precio).toLocaleString("es-AR")}</span>
        <div class="controles-cantidad">
        <button type="button" class="btn-restar">-</button>
        <span>${cantidad}</span>
        <button type="button" class="btn-sumar">+</button>
        </div>
        <button type="button" class="btn-eliminar">Eliminar</button>`
        elemento.querySelector(".btn-eliminar").addEventListener("click", () =>{
            eliminarDelCarrito(id)
        })
        elemento.querySelector(".btn-restar").addEventListener("click", () =>{
            cambiarCantidad(id, -1)
        })
        elemento.querySelector(".btn-sumar").addEventListener("click", () =>{
            if(cantidad >= stock){
                return
            }
            cambiarCantidad(id, 1)
        })
        listaCarrito.appendChild(elemento)
        total += precioConDescuento(precio) * cantidad
    })
    totalCarrito.textContent = `Total: $${total.toLocaleString("es-AR")}`
}
 
function filtrarProductos(){
    const texto = busqueda.value.toLocaleLowerCase()
    const tarjetas = listaProductos.querySelectorAll(".box")
    tarjetas.forEach((tarjeta) =>{
        // ?. y ?? evitan un error si la tarjeta no tuviera h3
        const nombre = tarjeta.querySelector("h3")?.textContent.toLocaleLowerCase() ?? ""
        tarjeta.classList.toggle("oculto", !nombre.includes(texto))
    })
}
 
document.getElementById("vaciar").addEventListener("click", () =>{
    carrito = []
    guardarCarrito()
})
 
document.getElementById("ver-carrito").addEventListener("click", () =>{
    panelCarrito.classList.add("active")
})
 
document.querySelector(".cerrar").addEventListener("click", () =>{
    panelCarrito.classList.remove("active")
})
 
busqueda.addEventListener("input", filtrarProductos)
 
renderizarProductos()
actualizarCarrito()