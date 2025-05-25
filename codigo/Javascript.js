
window.addEventListener("message", function(event) {
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
  // Modificar productos de menu1 o menu2
  if (event.data && event.data.tipo === "modificar-productos") {
    const { menu, productos } = event.data;
    let grid, section;
    if (menu === "menu1") {
      section = document.querySelector(".menu1");
      grid = section?.querySelector(".menu1-grid");
    } else if (menu === "menu2") {
      section = document.querySelector(".menu2");
      grid = section?.querySelector(".menu2-grid");
    }
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

  // Modificar promociones
  if (event.data && event.data.tipo === "modificar-promos") {
    const promos = event.data.promos;
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

  // Responder con productos actuales al editor
  if (event.data && event.data.tipo === "pedir-productos") {
    const menu = event.data.menu;
    let grid;
    if (menu === "menu1") {
      grid = document.querySelector(".menu1-grid");
    } else if (menu === "menu2") {
      grid = document.querySelector(".menu2-grid");
    }
    if (!grid) return;
    const items = Array.from(grid.children);
    const productos = items.map(item => {
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
    event.source.postMessage({ tipo: "productos-actuales", productos }, event.origin);
  }

  // Responder con promociones actuales al editor
  if (event.data && event.data.tipo === "pedir-promos") {
    const grid = document.querySelector(".promo-grid");
    if (!grid) return;
    const items = Array.from(grid.children);
    const promos = items.map(item => {
      const titulo = item.querySelector("h4")?.textContent || "";
      const descripcion = item.querySelector("p")?.textContent || "";
      let imagen = "";
      const imgDiv = item.querySelector(".promo-img");
      if (imgDiv && imgDiv.style.backgroundImage) {
        imagen = imgDiv.style.backgroundImage.replace(/^url\(['"]?/, "").replace(/['"]?\)$/, "");
      }
      return { titulo, descripcion, imagen };
    });
    event.source.postMessage({ tipo: "promos-actuales", promos }, event.origin);
  }
  }
});
