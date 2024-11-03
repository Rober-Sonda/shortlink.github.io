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
        <div class="link-content">
            <img src="${link.image}" alt="${link.title}">
            <div class="link-details">
                <h3>${link.title}</h3>
                <a href="${link.url}" target="_blank">${link.url}</a>
            </div>
            <button class="copy-button" onclick="copyToClipboard('${link.url}', this)">Copiar</button>
            <span class="copy-message" style="display:none;">Enlace copiado</span>
        </div>
    `;

    linksList.appendChild(linkElement); // Agregamos el nuevo enlace al contenedor
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
