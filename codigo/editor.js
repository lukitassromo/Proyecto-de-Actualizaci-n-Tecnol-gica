window.addEventListener("DOMContentLoaded", () => {
  const iframe = document.getElementById("iframeDestino");
  const productosDiv = document.getElementById("productos");
  const promosDiv = document.getElementById("promos");
  const seccionSelect = document.getElementById("seccion");

  // Mostrar panel según sección
  function mostrarPanelSegunSeccion() {
    document.querySelector('.editor-panel').style.display =
      (seccionSelect.value === "menu1" || seccionSelect.value === "menu2") ? "block" : "none";
    document.querySelector('.promo-panel').style.display =
      (seccionSelect.value === "promos") ? "block" : "none";
  }

  // Mostrar productos en el editor
  function mostrarProductos(productos) {
    productosDiv.innerHTML = "";
    productos.forEach(prod => agregarProducto(prod));
  }

  // Mostrar promociones en el editor
  function mostrarPromos(promosArr) {
    promosDiv.innerHTML = "";
    promosArr.forEach(promo => agregarPromo(promo));
  }

  // Agregar producto al editor
  function agregarProducto(prod = {}) {
    const div = document.createElement("div");
    div.className = "producto";
    div.innerHTML = `
      <label>Nombre</label>
      <input type="text" class="nombre" value="${prod.nombre || ""}" placeholder="Ej: Cheesecake" />
      <label>Precio</label>
      <input type="number" class="precio" step="0.01" value="${prod.precio || ""}" placeholder="Ej: 3.00" />
      <label>Imagen (URL o archivo)</label>
      <input type="text" class="imagen" value="${prod.imagen || ""}" placeholder="URL de la imagen" />
      <input type="file" class="imagen-file" accept="image/*" style="margin-top:4px" />
      <label>¿Destacado?</label>
      <select class="destacado">
        <option value="false"${!prod.destacado ? " selected" : ""}>No</option>
        <option value="true"${prod.destacado ? " selected" : ""}>Sí</option>
      </select>
      ${seccionSelect.value === "menu2"
        ? `<label>Opciones (solo bebidas, separadas por coma)</label>
           <input type="text" class="opciones" value="${prod.opciones ? prod.opciones.join(", ") : ""}" placeholder="Ej: Pequeño, Mediano, Grande" />`
        : ""}
      <button class="btn-remove" onclick="this.parentElement.remove()">🗑 Quitar producto</button>
    `;
    // Manejar archivo de imagen
    const fileInput = div.querySelector('.imagen-file');
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        div.querySelector('.imagen').value = url;
      }
    });
    productosDiv.appendChild(div);
  }

  // Agregar promoción al editor
  function agregarPromo(promo = {}) {
    const div = document.createElement("div");
    div.className = "promo";
    div.innerHTML = `
      <label>Título</label>
      <input type="text" class="titulo" value="${promo.titulo || ""}" placeholder="Ej: 2x1 en café" />
      <label>Descripción</label>
      <input type="text" class="descripcion" value="${promo.descripcion || ""}" placeholder="Ej: Solo lunes y martes" />
      <label>Imagen (URL o archivo)</label>
      <input type="text" class="imagen" value="${promo.imagen || ""}" placeholder="URL de la imagen" />
      <input type="file" class="imagen-file" accept="image/*" style="margin-top:4px" />
      <button class="btn-remove" onclick="this.parentElement.remove()">🗑 Quitar promoción</button>
    `;
    // Manejar archivo de imagen
    const fileInput = div.querySelector('.imagen-file');
    fileInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        div.querySelector('.imagen').value = url;
      }
    });
    promosDiv.appendChild(div);
  }

  // Recibe datos del iframe y muestra en el editor según la sección
  window.addEventListener("message", (event) => {
    if (event.data && event.data.tipo === "productos-actuales") {
      mostrarProductos(event.data.productos || []);
    }
    if (event.data && event.data.tipo === "promos-actuales") {
      mostrarPromos(event.data.promos || []);
    }
  });

  // Pedir datos al iframe según la sección seleccionada
  function pedirDatos() {
    const seccion = seccionSelect.value;
    if (seccion === "menu1" || seccion === "menu2") {
      iframe.contentWindow.postMessage({ tipo: "pedir-productos", menu: seccion }, "*");
    } else if (seccion === "promos") {
      iframe.contentWindow.postMessage({ tipo: "pedir-promos" }, "*");
    }
  }

  // Al iniciar, mostrar panel y pedir datos de la sección seleccionada
  mostrarPanelSegunSeccion();
  pedirDatos();

  // Al cambiar de sección, mostrar panel y pedir datos de la nueva sección
  seccionSelect.addEventListener("change", () => {
    mostrarPanelSegunSeccion();
    pedirDatos();
  });

  // Implementación de enviarProductos
  window.enviarProductos = function() {
    const nodos = productosDiv.querySelectorAll(".producto");
    const productos = [];
    nodos.forEach(nodo => {
      const nombre = nodo.querySelector(".nombre").value.trim();
      const precio = nodo.querySelector(".precio").value.trim();
      const imagen = nodo.querySelector(".imagen").value.trim();
      const destacado = nodo.querySelector(".destacado").value === "true";
      const opciones = nodo.querySelector(".opciones")
        ? nodo.querySelector(".opciones").value.split(",").map(o => o.trim()).filter(o => o)
        : [];
      if (nombre && precio) {
        productos.push({ nombre, precio, imagen, destacado, opciones });
      }
    });
    const mensaje = {
      tipo: "modificar-productos",
      menu: seccionSelect.value,
      productos
    };
    // ENVÍA el mensaje al iframe
    iframe.contentWindow.postMessage(mensaje, "*");
    // Espera a que el iframe actualice la grilla y luego pide los datos de nuevo para refrescar el editor
    setTimeout(pedirDatos, 200);
    alert("Productos enviados al menú.");
  };

  // Implementación de enviarPromos
  window.enviarPromos = function() {
    const nodos = promosDiv.querySelectorAll(".promo");
    const promos = [];
    nodos.forEach(nodo => {
      const titulo = nodo.querySelector(".titulo").value.trim();
      const descripcion = nodo.querySelector(".descripcion").value.trim();
      const imagen = nodo.querySelector(".imagen").value.trim();
      if (titulo && descripcion) {
        promos.push({ titulo, descripcion, imagen });
      }
    });
    const mensaje = {
      tipo: "modificar-promos",
      promos
    };
    // ENVÍA el mensaje al iframe
    iframe.contentWindow.postMessage(mensaje, "*");
    // Espera a que el iframe actualice la grilla y luego pide los datos de nuevo para refrescar el editor
    setTimeout(pedirDatos, 200);
    alert("Promociones enviadas.");
  };

  // Exponer funciones globales para los botones del HTML
  window.agregarProducto = agregarProducto;
  window.agregarPromo = agregarPromo;
});
