// Login simple antes de mostrar el editor
window.addEventListener("DOMContentLoaded", () => {
  // Crear modal de login
  const modal = document.createElement("div");
  modal.style.position = "fixed";
  modal.style.top = 0;
  modal.style.left = 0;
  modal.style.width = "100vw";
  modal.style.height = "100vh";
  modal.style.background = "rgba(0,0,0,0.5)";
  modal.style.display = "flex";
  modal.style.alignItems = "center";
  modal.style.justifyContent = "center";
  modal.style.zIndex = 9999;

  modal.innerHTML = `
    <div style="background:#fff;padding:2rem 2.5rem;border-radius:10px;box-shadow:0 2px 12px #0002;min-width:260px;display:flex;flex-direction:column;gap:1rem;">
      <h2 style="margin:0 0 1rem 0;text-align:center;">Acceso al editor</h2>
      <input id="login-user" type="text" placeholder="Usuario" style="padding:0.5rem;font-size:1rem;">
      <input id="login-pass" type="password" placeholder="Contraseña" style="padding:0.5rem;font-size:1rem;">
      <button id="login-btn" style="padding:0.7rem 1.2rem;font-size:1rem;background:#0098db;color:#fff;border:none;border-radius:4px;cursor:pointer;">Entrar</button>
      <div id="login-error" style="color:#d32f2f;text-align:center;display:none;">Usuario o contraseña incorrectos</div>
    </div>
  `;
  document.body.appendChild(modal);

  // Bloquear el resto del contenido
  document.body.style.overflow = "hidden";

  // Cambia estos valores para tu acceso real
  const USER = "admin";
  const PASS = "cafeteria123";

  modal.querySelector("#login-btn").onclick = function () {
    const user = modal.querySelector("#login-user").value.trim();
    const pass = modal.querySelector("#login-pass").value;
    if (user === USER && pass === PASS) {
      modal.remove();
      document.body.style.overflow = "";
      iniciarEditor(); // Iniciar el editor después del login exitoso
    } else {
      modal.querySelector("#login-error").style.display = "block";
    }
  };

  // Permitir Enter para enviar
  modal.querySelector("#login-pass").addEventListener("keydown", function (e) {
    if (e.key === "Enter") modal.querySelector("#login-btn").click();
  });

  // Función para iniciar el editor
  function iniciarEditor() {
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
  }
});
