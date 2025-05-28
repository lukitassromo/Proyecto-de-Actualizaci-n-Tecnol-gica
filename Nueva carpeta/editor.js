// Login simple antes de mostrar el editor
window.addEventListener("DOMContentLoaded", () => {
  // Eliminar login para acceso directo al editor

  // --- NUEVO: Panel de edición unificado ---
  const toggleBtn = document.getElementById("toggleEditorBtn");
  const editorPanel = document.getElementById("editorPanel");
  const closeBtn = document.getElementById("closeEditorBtn");
  const seccionSelect = document.getElementById("seccion");
  const editorContenido = document.getElementById("editorContenido");

  // Mostrar/ocultar panel
  toggleBtn.onclick = () => { editorPanel.style.display = "block"; };
  closeBtn.onclick = () => { editorPanel.style.display = "none"; };

  // --- Funciones para obtener y mostrar datos actuales ---
  function getHeroData() {
    const heroImg = document.querySelector(".hero-img");
    const heroText = document.querySelector(".hero-text p");
    return {
      imagen: heroImg.style.backgroundImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "") || "",
      texto: heroText ? heroText.innerHTML : ""
    };
  }
  function setHeroData(data) {
    const heroImg = document.querySelector(".hero-img");
    const heroText = document.querySelector(".hero-text p");
    if (data.imagen) heroImg.style.backgroundImage = `url('${data.imagen}')`;
    if (heroText) heroText.innerHTML = data.texto || "";
  }

  function getMenuData(menu) {
    const grid = document.querySelector(`.${menu}-grid`);
    if (!grid) return [];
    return Array.from(grid.children).map(item => {
      const nombrePrecio = item.querySelector("p")?.innerHTML.split(/<br\s*\/?>/) || ["", ""];
      const nombre = nombrePrecio[0].trim();
      const precio = nombrePrecio[1]?.replace("$", "").trim() || "";
      const destacado = !!item.querySelector(".badge");
      const imgDiv = item.querySelector(".img");
      let imagen = "";
      if (imgDiv && imgDiv.style.backgroundImage) {
        imagen = imgDiv.style.backgroundImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");
      }
      let opciones = [];
      const select = item.querySelector("select");
      if (select) {
        opciones = Array.from(select.options).map(opt => opt.textContent);
      }
      return { nombre, precio, imagen, destacado, opciones };
    });
  }
  function setMenuData(menu, productos) {
    const grid = document.querySelector(`.${menu}-grid`);
    if (!grid) return;
    grid.innerHTML = "";
    productos.forEach(prod => {
      const div = document.createElement("div");
      div.className = "item";
      if (prod.destacado) {
        const badge = document.createElement("div");
        badge.className = "badge";
        badge.textContent = "Más vendido";
        div.appendChild(badge);
      }
      const img = document.createElement("div");
      img.className = "img";
      if (prod.imagen) img.style.backgroundImage = `url('${prod.imagen}')`;
      div.appendChild(img);
      const p = document.createElement("p");
      p.innerHTML = `${prod.nombre}<br />$${prod.precio}`;
      div.appendChild(p);
      if (menu === "menu2" && prod.opciones && prod.opciones.length > 0) {
        const select = document.createElement("select");
        prod.opciones.forEach(op => {
          const option = document.createElement("option");
          option.textContent = op;
          select.appendChild(option);
        });
        div.appendChild(select);
      }
      grid.appendChild(div);
    });
  }

  function getPromosData() {
    const grid = document.querySelector(".promo-grid");
    if (!grid) return [];
    return Array.from(grid.children).map(item => {
      const titulo = item.querySelector("h4")?.textContent || "";
      const descripcion = item.querySelector("p")?.textContent || "";
      let imagen = "";
      const imgDiv = item.querySelector(".promo-img");
      if (imgDiv && imgDiv.style.backgroundImage) {
        imagen = imgDiv.style.backgroundImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");
      }
      return { titulo, descripcion, imagen };
    });
  }
  function setPromosData(promos) {
    const grid = document.querySelector(".promo-grid");
    if (!grid) return;
    grid.innerHTML = "";
    promos.forEach(promo => {
      const card = document.createElement("div");
      card.className = "promo-card";
      const imgDiv = document.createElement("div");
      imgDiv.className = "promo-img";
      if (promo.imagen) imgDiv.style.backgroundImage = `url('${promo.imagen}')`;
      card.appendChild(imgDiv);
      const infoDiv = document.createElement("div");
      const h4 = document.createElement("h4");
      h4.textContent = promo.titulo;
      const p = document.createElement("p");
      p.textContent = promo.descripcion;
      infoDiv.appendChild(h4);
      infoDiv.appendChild(p);
      card.appendChild(infoDiv);
      grid.appendChild(card);
    });
  }

  // --- Renderizar el editor según la sección seleccionada ---
  function renderEditor() {
    const seccion = seccionSelect.value;
    editorContenido.innerHTML = "";
    if (seccion === "hero") {
      // Cambiar label y opción a "Logo"
      editorContenido.innerHTML = `
        <label>Modifique título</label>
        <textarea id="heroTexto" style="width:100%;height:4em;"></textarea>
        <label>Imagen de fondo (URL o archivo)</label>
        <input type="text" id="heroImg" value="" placeholder="URL de la imagen" />
        <input type="file" id="heroImgFile" accept="image/*" style="margin-top:4px" />
        <button id="guardarHero">Guardar cambios</button>
      `;
      editorContenido.querySelector("#heroImgFile").addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (file) {
          const url = URL.createObjectURL(file);
          editorContenido.querySelector("#heroImg").value = url;
        }
      });
      editorContenido.querySelector("#guardarHero").onclick = function() {
        setHeroData({
          texto: editorContenido.querySelector("#heroTexto").value,
          imagen: editorContenido.querySelector("#heroImg").value
        });
        alert("Logo actualizado.");
      };
    } else if (seccion === "menu1" || seccion === "menu2") {
      const productos = getMenuData(seccion);
      editorContenido.innerHTML = `<div id="productos"></div>
        <button id="agregarProducto">➕ Agregar producto</button>
        <button id="guardarMenu">Guardar cambios</button>`;
      const productosDiv = editorContenido.querySelector("#productos");
      function renderProductos() {
        productosDiv.innerHTML = "";
        productos.forEach((prod, idx) => {
          const div = document.createElement("div");
          div.className = "producto";
          div.innerHTML = `
            <label>Nombre</label>
            <input type="text" class="nombre" value="${prod.nombre || ""}" />
            <label>Precio</label>
            <input type="number" class="precio" step="0.01" value="${prod.precio || ""}" />
            <label>Imagen (URL o archivo)</label>
            <input type="text" class="imagen" value="${prod.imagen || ""}" />
            <input type="file" class="imagen-file" accept="image/*" style="margin-top:4px" />
            <label>¿Destacado?</label>
            <select class="destacado">
              <option value="false"${!prod.destacado ? " selected" : ""}>No</option>
              <option value="true"${prod.destacado ? " selected" : ""}>Sí</option>
            </select>
            ${seccion === "menu2"
              ? `<label>Opciones (separadas por coma)</label>
                 <input type="text" class="opciones" value="${prod.opciones ? prod.opciones.join(", ") : ""}" />`
              : ""}
            <button class="btn-remove">🗑 Quitar producto</button>
          `;
          div.querySelector('.imagen-file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
              const url = URL.createObjectURL(file);
              div.querySelector('.imagen').value = url;
            }
          });
          div.querySelector('.btn-remove').onclick = () => {
            productos.splice(idx, 1);
            renderProductos();
          };
          productosDiv.appendChild(div);
        });
      }
      renderProductos();
      editorContenido.querySelector("#agregarProducto").onclick = () => {
        productos.push({ nombre: "", precio: "", imagen: "", destacado: false, opciones: [] });
        renderProductos();
      };
      editorContenido.querySelector("#guardarMenu").onclick = () => {
        const nodos = productosDiv.querySelectorAll(".producto");
        const nuevos = [];
        nodos.forEach(nodo => {
          const nombre = nodo.querySelector(".nombre").value.trim();
          const precio = nodo.querySelector(".precio").value.trim();
          const imagen = nodo.querySelector(".imagen").value.trim();
          const destacado = nodo.querySelector(".destacado").value === "true";
          const opciones = nodo.querySelector(".opciones")
            ? nodo.querySelector(".opciones").value.split(",").map(o => o.trim()).filter(o => o)
            : [];
          if (nombre && precio) {
            nuevos.push({ nombre, precio, imagen, destacado, opciones });
          }
        });
        setMenuData(seccion, nuevos);
        alert("Menú actualizado.");
      };
    } else if (seccion === "promos") {
      const promos = getPromosData();
      editorContenido.innerHTML = `<div id="promos"></div>
        <button id="agregarPromo">➕ Agregar promoción</button>
        <button id="guardarPromos">Guardar cambios</button>`;
      const promosDiv = editorContenido.querySelector("#promos");
      function renderPromos() {
        promosDiv.innerHTML = "";
        promos.forEach((promo, idx) => {
          const div = document.createElement("div");
          div.className = "promo";
          div.innerHTML = `
            <label>Título</label>
            <input type="text" class="titulo" value="${promo.titulo || ""}" />
            <label>Descripción</label>
            <input type="text" class="descripcion" value="${promo.descripcion || ""}" />
            <label>Imagen (URL o archivo)</label>
            <input type="text" class="imagen" value="${promo.imagen || ""}" />
            <input type="file" class="imagen-file" accept="image/*" style="margin-top:4px" />
            <button class="btn-remove">🗑 Quitar promoción</button>
          `;
          div.querySelector('.imagen-file').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
              const url = URL.createObjectURL(file);
              div.querySelector('.imagen').value = url;
            }
          });
          div.querySelector('.btn-remove').onclick = () => {
            promos.splice(idx, 1);
            renderPromos();
          };
          promosDiv.appendChild(div);
        });
      }
      renderPromos();
      editorContenido.querySelector("#agregarPromo").onclick = () => {
        promos.push({ titulo: "", descripcion: "", imagen: "" });
        renderPromos();
      };
      editorContenido.querySelector("#guardarPromos").onclick = () => {
        const nodos = promosDiv.querySelectorAll(".promo");
        const nuevos = [];
        nodos.forEach(nodo => {
          const titulo = nodo.querySelector(".titulo").value.trim();
          const descripcion = nodo.querySelector(".descripcion").value.trim();
          const imagen = nodo.querySelector(".imagen").value.trim();
          if (titulo && descripcion) {
            nuevos.push({ titulo, descripcion, imagen });
          }
        });
        setPromosData(nuevos);
        alert("Promociones actualizadas.");
      };
    }
  }

  // Cambiar editor según sección
  seccionSelect.addEventListener("change", renderEditor);

  // Mostrar editor con la sección por defecto
  renderEditor();

  // Cambiar la opción en el select de secciones a "Logo"
  // Esto debe hacerse en el HTML, pero si quieres hacerlo por JS:
  const heroOption = seccionSelect.querySelector('option[value="hero"]');
  if (heroOption) heroOption.textContent = "Logo";
});
