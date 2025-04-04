
async function addToCart(productId) {
    const cartId = document.getElementById("search").value.trim(); // Obtener el ID del carrito

    if (!cartId) {
        alert("Ingrese un ID de carrito válido");
        return;
    }

    try {
        const response = await fetch(`/api/carts/${cartId}/product/${productId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Error al agregar producto al carrito");
        }

        const result = await response.json();
        alert(result.message || "Producto agregado correctamente");
    } catch (error) {
        console.error("Error:", error);
        alert("No se pudo agregar el producto al carrito");
    }
}

function updateCartLink() {
    const input = document.getElementById('search');
    const link = document.getElementById('cartLink');
    const cartId = input.value.trim();

    if (cartId) {
      link.href = `http://localhost:8080/carts/${cartId}`;
    } else {
      link.href = `http://localhost:8080/carts/`;
    }
  }