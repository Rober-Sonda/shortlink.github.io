// Importar Firebase desde tu configuración
import { db } from '../js/firebaseConfig.js';
import { collection, addDoc, getDocs } from 'https://www.gstatic.com/firebasejs/9.20.0/firebase-firestore.js'; // Agrupa las importaciones


// Función para agregar un documento a Firestore
async function addMediaToFirestore(title, destinationUrl, imageUrl, landingUrl, shortenedUrl, uniqueId) {
    try {
        // Agrega el documento en la colección "media" con un uniqueId y URL acortada
        await addDoc(collection(db, "media"), {
            title: title,
            destinationUrl: destinationUrl,
            imageUrl: imageUrl,
            landingUrl: landingUrl,
            shortenedUrl: shortenedUrl,
            uniqueId: uniqueId  // Guardamos también el ID único
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
    const destinationUrl = document.getElementById('url-input').value;
    const title = document.getElementById('title-input').value;
    const imageUrl = document.getElementById('image-input').value;
    // Generamos un ID único
    const uniqueId = Math.random().toString(36).substring(2, 8);
    const landingUrl = generateRedirectUrl(uniqueId);
    console.log("Generado uniqueId:", uniqueId); // Verifica si se genera correctamente

    // Acortamos la URL usando Bitly
    var shortenedUrl = '';
    try {
        shortenedUrl = await shortenUrl(destinationUrl);
    } catch (error) {
        console.error('Error al acortar la URL:', error);
        alert('No se pudo acortar la URL. Intenta de nuevo más tarde.');
        return; // Salimos si hay un error
    }

    // Creamos un objeto para almacenar
    const linkData = {
        title: title,
        destinationUrl: destinationUrl,
        imageUrl: imageUrl,
        landingUrl: landingUrl,
        shortenedUrl: shortenedUrl,
        uniqueId: uniqueId  // Guardamos también el ID único
    };

    // Almacena en Firestore
    try {
        await addMediaToFirestore(title, destinationUrl, imageUrl, landingUrl, shortenedUrl, uniqueId);
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
        <img src="${link.imageUrl}" alt="${link.title}" class="link-image">
        <div class="link-overlay">
            <h3 class="link-title">${link.title}</h3>
            <div class="link-actions">
                <button class="copy-button" onclick="copyToClipboard('${link.landingUrl}', this); event.stopPropagation();">Copiar</button>
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

// Función para generar la URL de redirección a partir del ID
function generateRedirectUrl(uniqueid) {
    // Obtén el dominio y puerto (si lo hay) del servidor actual
    var baseUrl = window.location.origin;

    // Construye la URL completa usando el ID único
    return `${baseUrl}/php/redirect.php?id=${uniqueid}`;
}
window.generateRedirectUrl = generateRedirectUrl;

// Al hacer clic en el enlace
function redirectToLink(id) {
    // Obtén el dominio y puerto (si lo hay) del servidor actual
    var baseUrl = window.location.origin;

    // Construye la URL completa usando el ID único

    const redirectUrl = `${baseUrl}/php/redirect.php?id=${uniqueid}`;
    window.location.href = redirectUrl; // Realiza la redirección
}

window.redirectToLink = redirectToLink;

// Función para copiar el enlace al portapapeles
function copyToClipboard(id, buttonElement) {
    // Crear la URL de redirección
    const redirectUrl = `../php/redirect.php?id=${id}`;
    
    // Crear un elemento de texto temporal
    const tempInput = document.createElement('input');
    tempInput.value = redirectUrl; // Asignar la URL al valor del input
    
    // Añadirlo al DOM (necesario para interactuar con el portapapeles)
    document.body.appendChild(tempInput);
    
    // Seleccionar el contenido del input
    tempInput.select();
    tempInput.setSelectionRange(0, 99999); // Para dispositivos móviles
    
    // Copiar el contenido al portapapeles
    document.execCommand('copy');
    
    // Eliminar el input temporal
    document.body.removeChild(tempInput);
    
    // Cambiar el texto del botón para indicar que se copió
    const copyMessage = buttonElement.nextElementSibling; // Asumiendo que el span está justo después del botón
    copyMessage.style.display = 'block'; // Mostrar el mensaje de "Enlace copiado"
    
    // Opcional: ocultar el mensaje después de unos segundos
    setTimeout(() => {
        copyMessage.style.display = 'none';
    }, 2000);
}


// Expón la función al ámbito global
window.copyToClipboard = copyToClipboard;

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
