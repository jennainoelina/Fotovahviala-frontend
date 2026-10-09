// ===============================
// ASETUKSET
// ===============================
const API = "https://fotovahviala-backend.onrender.com";

// ===============================
// KUVAKARUSELLI
// ===============================
const track = document.querySelector(".carousel-track");
const images = document.querySelectorAll(".carousel-track img");

if (track && images.length > 0) {

    let currentIndex = 0;
    const visibleImages = 3;

    function updateCarousel() {
        const imageWidth = images[0].offsetWidth;
        track.style.transform =
            `translateX(-${currentIndex * imageWidth}px)`;
    }

    function nextSlide() {
        currentIndex++;

        if (currentIndex > images.length - visibleImages) {
            currentIndex = 0;
        }

        updateCarousel();
    }

    const nextBtn = document.querySelector(".next");
    const prevBtn = document.querySelector(".prev");

    if (nextBtn) {
        nextBtn.addEventListener("click", nextSlide);
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            currentIndex--;

            if (currentIndex < 0) {
                currentIndex = images.length - visibleImages;
            }

            updateCarousel();
        });
    }

    setInterval(nextSlide, 4000);
}

// ===============================
// ADMIN: kirjautuminen
// ===============================
async function kirjauduAdmin() {
    const kayttaja = document.getElementById("kayttaja").value;
    const salasana = document.getElementById("admin_salasana").value;

    const vastaus = await fetch(`${API}/api/kirjautuminen/admin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kayttaja, salasana })
    });

    const data = await vastaus.json();

    if (vastaus.ok) {
        window.location.href = "admin.html";
    } else {
        alert(data.viesti);
    }
}




// ===============================
// ADMIN: luo asiakas
// ===============================

async function luoAsiakas() {

    const asiakasId =
        document.getElementById("uusiAsiakasId").value.trim();

    const salasana =
        document.getElementById("uusiAsiakasSalasana").value;

    if (!asiakasId || !salasana) {

        alert("Anna sekä asiakas ID että salasana");
        return;

    }

    try {

        const vastaus = await fetch(
            `${API}/api/admin/luo-asiakas`,
            {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    asiakasId,
                    salasana
                })
            }
        );

        const data = await vastaus.json();

        if (!vastaus.ok) {
            throw new Error(
                data.virhe || "Tuntematon virhe"
            );
        }

        alert(data.viesti);

        document.getElementById(
            "uusiAsiakasId"
        ).value = "";

        document.getElementById(
            "uusiAsiakasSalasana"
        ).value = "";

        await naytaAsiakkaat();

    } catch (virhe) {

        console.error(
            "Asiakkaan luonti epäonnistui:",
            virhe
        );

        alert(
            "Asiakkaan luonti epäonnistui: " +
            virhe.message
        );

    }

}

// ===============================
// ADMIN: lataa kuvia asiakkaalle
// ===============================
async function lataaKuvat() {
  const asiakasId = document.getElementById("uploadAsiakasId").value;
  const input = document.getElementById("kuvatInput");

  const formData = new FormData();
  formData.append("asiakasId", asiakasId);

  for (const file of input.files) {
    formData.append("kuvat", file);
  }

  const vastaus = await fetch(`${API}/api/admin/lataa`, {
    method: "POST",
    credentials: "include",
    body: formData
  });

  const data = await vastaus.json();
  alert("Kuvat ladattu onnistuneesti!");
  console.log(data);
}

// ===============================
// ADMIN: asiakaslista
// ===============================

async function naytaAsiakkaat() {

    try {

        const vastaus = await fetch(
            `${API}/api/admin/asiakkaat`
        );

        const asiakkaat = await vastaus.json();

        const lista = document.getElementById(
            "asiakkaatLista"
        );

        lista.innerHTML = "";

        asiakkaat.forEach(asiakasId => {

            const rivi = document.createElement("div");

            rivi.className = "asiakas-rivi";

            rivi.innerHTML = `
                <span>${asiakasId}</span>

                <button onclick="poistaKuvat('${asiakasId}')">
                    Poista kuvat
                </button>

                <button
                    class="danger-button"
                    onclick="poistaAsiakas('${asiakasId}')">
                    Poista asiakas
                </button>
            `;

            lista.appendChild(rivi);

        });

    } catch (virhe) {

        console.error(
            "Asiakkaiden haku epäonnistui:",
            virhe
        );

    }

}

// ===============================
// Poista asiakkaan kuvat
// ===============================

async function poistaKuvat(asiakasId) {

    if (
        !confirm(
            `Poistetaanko kaikki kuvat asiakkaalta ${asiakasId}?`
        )
    ) {
        return;
    }

    try {

        const vastaus = await fetch(
            `${API}/api/admin/asiakkaat/${asiakasId}/kuvat`,
            {
                method: "DELETE"
            }
        );

        const data = await vastaus.json();

        alert(data.viesti);

    } catch (virhe) {

        console.error(virhe);
        alert("Kuvien poisto epäonnistui");

    }

}

// ===============================
// Poista asiakas
// ===============================

async function poistaAsiakas(asiakasId) {

    if (
        !confirm(
            `Poistetaanko asiakas ${asiakasId}?`
        )
    ) {
        return;
    }

    try {

        const vastaus = await fetch(
            `${API}/api/admin/asiakkaat/${asiakasId}`,
            {
                method: "DELETE"
            }
        );

        const data = await vastaus.json();

        alert(data.viesti);

        await naytaAsiakkaat();

    } catch (virhe) {

        console.error(virhe);
        alert("Asiakkaan poisto epäonnistui");

    }

}

// ===============================
// Lataa lista sivun avautuessa
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    naytaAsiakkaat
);


// ===============================
// ASIAKAS: kirjautuminen
// ===============================
async function kirjauduAsiakas() {
  const asiakasId = document.getElementById("asiakasId").value;
  const salasana = document.getElementById("asiakas_salasana").value;

  const vastaus = await fetch(`${API}/api/kirjautuminen/asiakas`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ asiakasId, salasana })
  });

  const data = await vastaus.json();

  if (vastaus.status === 200) {
    // Kirjautuminen onnistui → siirrytään galleriaan
    window.location.href = "galleria.html";
  } else {
    alert(data.viesti);
  }
}


// ===============================
// ASIAKAS: hae kuvat
// ===============================
async function haeKuvat() {
  const vastaus = await fetch(`${API}/api/galleria/kuvat`, {
    credentials: "include"
  });

  if (!vastaus.ok) {
    console.error("Kuvien haku epäonnistui:", vastaus.status);
    return;
  }

  const data = await vastaus.json();

  const container = document.getElementById("galleria");
  container.innerHTML = "";

  data.kuvat.forEach(kuva => {
    const img = document.createElement("img");
    img.src = `${API}/galleriat/${data.asiakasId}/${kuva}`;
    img.classList.add("galleria-kuva");
    container.appendChild(img);
  });
}

// ===============================
// ASIAKAS: ZIP-lataus
// ===============================
function lataaZip() {
  window.location.href = `${API}/api/galleria/zip`;
}

// ===============================
// YHTEYDENOTTOLOMAKE
// ===============================
document
    .getElementById("yhteyslomake")
    ?.addEventListener("submit", async (e) => {

        e.preventDefault();

        const form = e.target;

        const data = {
            nimi: form.nimi.value,
            sahkoposti: form.sahkoposti.value,
            viesti: form.viesti.value
        };

        const vastaus = await fetch(`${API}/api/yhteydenotto`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (vastaus.ok) {
            alert("Viesti lähetetty!");
            form.reset();
        } else {
            alert("Lähetys epäonnistui.");
        }
    });