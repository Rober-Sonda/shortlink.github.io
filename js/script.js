// Importar Firebase desde tu configuración
import { db } from '../js/firebaseConfig.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js'; // Agrupa las importaciones


// Función para agregar un documento con los campos necesarios a Firestore
async function addMediaToFirestore(title, destinationUrl, imageUrl, landingUrl) {
    try {
        // Agrega el documento en una colección llamada "media"
        await addDoc(collection(db, "media"), {
            title: title,
            destinationUrl: destinationUrl,
            imageUrl: imageUrl,
            landingUrl: landingUrl
        });
        console.log("Documento agregado a Firestore con éxito");
    } catch (error) {
        console.error("Error al agregar el documento a Firestore:", error);
    }
}


// Ejemplo de uso
// addMediaToFirestore("Título del ejemplo", "https://example.com/destino", "https://example.com/imagen.jpg", "https://example.com/landing");


//import { collection, getDocs } from "firebase/firestore";

// Función para recuperar y mostrar documentos de la colección "media"
async function fetchMediaFromFirestore() {
    try {
        const querySnapshot = await getDocs(collection(db, "media"));
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            console.log(`ID: ${doc.id}, Title: ${data.title}, Destination URL: ${data.destinationUrl}, Image URL: ${data.imageUrl}, Landing URL: ${data.landingUrl}`);
        });
    } catch (error) {
        console.error("Error al obtener los documentos de Firestore:", error);
    }
}


// Llamada a la función para recuperar los documentos
// fetchMediaFromFirestore();


// Al enviar el formulario
document.getElementById('url-form').addEventListener('submit', async function(event) {
    event.preventDefault(); // Evita el envío normal del formulario

    // Capturamos los datos del formulario
    const originalUrl = document.getElementById('url-input').value;
    const title = document.getElementById('title-input').value;
    const image = document.getElementById('image-input').value;

    // Generamos un ID único
    const uniqueId = Math.random().toString(36).substring(2, 8);

    // Acortamos la URL usando Bitly
    let shortenedUrl = '';
    try {
        shortenedUrl = await shortenUrl(originalUrl);
    } catch (error) {
        console.error('Error al acortar la URL:', error);
        alert('No se pudo acortar la URL. Intenta de nuevo más tarde.');
        return; // Salimos si hay un error
    }

    // Creamos un objeto para almacenar
    const linkData = {
        id: uniqueId,
        url: shortenedUrl, // Usamos la URL acortada
        title: title,
        image: image,
    };

    // Almacena en Firestore
    try {
        await addMediaToFirestore(title, shortenedUrl, image, originalUrl);
        console.log("Datos almacenados en Firestore exitosamente");

        // Llama a la función para recuperar y mostrar los documentos actualizados
        fetchMediaFromFirestore();
    } catch (error) {
        console.error("Error al almacenar los datos en Firestore:", error);
        alert("No se pudo almacenar la información. Intenta de nuevo.");
        return;
    }


    // Recuperamos los enlaces existentes o inicializamos un array vacío
    let links = JSON.parse(localStorage.getItem('links')) || [];
    links.push(linkData); // Agregamos el nuevo enlace
    localStorage.setItem('links', JSON.stringify(links)); // Guardamos el array actualizado en localStorage

    // Mostramos el enlace agregado
    displayLink(linkData); // Llamamos a una función para mostrar el enlace en el DOM

    // Limpiamos los campos del formulario
    document.getElementById('url-input').value = '';
    document.getElementById('title-input').value = '';
    document.getElementById('image-input').value = '';

    // Redirigimos a la página intermedia
    //const redirectUrl = `../html/redirect.html?id=${uniqueId}`; // Pasamos el ID único como parámetro
    //window.location.href = redirectUrl; // Redireccionamos
});

// Función para acortar la URL utilizando la API de Bitly
async function shortenUrl(url) {
    const accessToken = 'bc355c48f3bbab5d25f976bf093c66b5dc24d6e2'; // Tu token de acceso
    const response = await fetch('https://api-ssl.bitly.com/v4/shorten', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ long_url: url }) // Aquí puedes incluir group_guid y domain si es necesario
    });

    if (!response.ok) {
        throw new Error('Error al acortar la URL');
    }

    const data = await response.json();
    return data.link; // Retorna la URL acortada
}

// Función para mostrar un enlace en la interfaz
function displayLink(link) {
    const linksList = document.getElementById('links-list');
    const linkElement = document.createElement('div');
    linkElement.classList.add('link-item');

    linkElement.innerHTML = `
        <img src="${link.image}" alt="${link.title}" class="link-image" onclick="redirectToLink('${link.id}')">
        <div class="link-overlay">
            <h3 class="link-title">${link.title}</h3>
            <div class="link-actions">
                <button class="copy-button" onclick="copyToClipboard('${link.url}', this); event.stopPropagation();">Copiar</button>
                <span class="copy-message"">Enlace copiado</span>
            </div>
        </div>
    `;

    linksList.appendChild(linkElement);
}

/*
// Función para mostrar un enlace en la interfaz
function displayLink(link) {
    const linksList = document.getElementById('links-list');
    const linkElement = document.createElement('div');
    linkElement.classList.add('link-item');

    // Verifica que id esté definido
    if (!link.id) {
        console.error("El ID no está definido en el objeto link:", link);
        return; // Salir de la función si no hay id
    }

    // Construir la URL de redirección usando la propiedad correcta
    const redirectUrl = `../html/redirect.html?id=${link.id}`;

    linkElement.innerHTML = `
        <img src="${link.image}" alt="${link.title}" class="link-image" onclick="redirectToLink('${link.id}')">
        <div class="link-overlay">
            <h3 class="link-title">${link.title}</h3>
            <div class="link-actions">
                <button class="copy-button" onclick="copyToClipboard('${redirectUrl}', this); event.stopPropagation();">Copiar</button>
                <span class="copy-message" style="display:none;">Enlace copiado</span>
            </div>
        </div>
    `;

    linksList.appendChild(linkElement);
}
*/




// Función para redirigir al enlace
function redirectToLink(id) {
    // Redirige a la página intermedia antes de llevar al enlace original
    const redirectUrl = `../html/redirect.html?id=${id}`; // Pasamos el ID único como parámetro
    window.location.href = redirectUrl; // Redirecciona
}


// Función para copiar el enlace al portapapeles
function copyToClipboard(url, button) {
    navigator.clipboard.writeText(url).then(() => {
        // Mostrar mensaje de éxito
        const message = button.nextElementSibling;
        message.style.display = 'inline';
        
        // Cambiar el icono del botón
        button.innerText = 'Copiado!';
        setTimeout(() => {
            button.innerText = 'Copiar';
            message.style.display = 'none'; // Ocultar mensaje después de 2 segundos
        }, 2000);
    });
}

// Función para limpiar los enlaces
document.getElementById('clear-links').addEventListener('click', function() {
    localStorage.removeItem('links'); // Elimina los enlaces del localStorage
    document.getElementById('links-list').innerHTML = ''; // Limpia la lista en el DOM
});

// Cargar enlaces al iniciar
window.onload = function() {
    let links = JSON.parse(localStorage.getItem('links')) || []; // Recupera los enlaces existentes
    links.forEach(displayLink); // Muestra cada enlace en la interfaz
};
