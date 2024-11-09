import express from 'express';
import path from 'path';
import phpExpress from 'php-express';

const app = express();
const port = 3000;

const php = phpExpress({
    binPath: 'php' // Asegúrate de que PHP esté instalado y en tu PATH
});

// Usa PHP como middleware para las rutas que contienen .php
app.use('/html', php.router);

// Servir archivos estáticos (HTML, CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
    console.log(`Servidor con PHP corriendo en http://localhost:${port}`);
});
