<?php
require_once __DIR__ . '/../vendor/autoload.php';

use Firebase\JWT\JWT;

// Carga el archivo JSON de la cuenta de servicio
$serviceAccountFile = '../shortener-firebase-admin.json';
$serviceAccount = json_decode(file_get_contents($serviceAccountFile), true);

// Variables de configuración de Firestore
$projectId = $serviceAccount['project_id'];
$privateKey = $serviceAccount['private_key'];
$clientEmail = $serviceAccount['client_email'];
$collection = "media";
$id = isset($_GET['id']) ? $_GET['id'] : '';


if (empty($id)) {
    echo '<!DOCTYPE html><html lang="es"><body><h1>Ni arrancamos ,enlace no encontrado</h1></body></html>';
    exit();
}




// Endpoint de la API de Firestore
$url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/$collection/$id";


// Consulta estructurada que busca por 'uniqueId'
$query = [
    'structuredQuery' => [
        'where' => [
            'fieldFilter' => [
                'field' => [
                    'fieldPath' => 'uniqueId'  // Nombre del campo en Firestore
                ],
                'op' => 'EQUAL',
                'value' => [
                    'stringValue' => $id // El valor de 'id' que viene de la URL
                ]
            ]
        ],
        'from' => [
            ['collectionId' => $collection] // Especifica la colección
        ]
    ]
];

// Autenticación con token de cuenta de servicio
// Generar un token JWT
$now = time();
$token = [
    "iss" => $clientEmail,
    "scope" => "https://www.googleapis.com/auth/datastore",
    "aud" => "https://oauth2.googleapis.com/token",
    "iat" => $now,
    "exp" => $now + 3600
];

$jwt = JWT::encode($token, $privateKey, 'RS256');

// Obtén un token de acceso con el JWT
$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, "https://oauth2.googleapis.com/token");
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curl, CURLOPT_POST, true);
curl_setopt($curl, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
]);

curl_setopt($curl, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    'assertion' => $jwt
]));

// Desactiva la verificación del certificado SSL
curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

// Ejecuta la solicitud y decodifica la respuesta
$response = curl_exec($curl);

// Comprueba si hubo un error en cURL
if ($response === false) {
    $error = curl_error($curl);
    echo '<p>Error en cURL: ' . htmlspecialchars($error) . '</p>';
    curl_close($curl);
    exit();
}

curl_close($curl);

// Muestra la respuesta completa de Firestore sin procesar
echo '<h2>Respuesta sin procesar de Firestore:</h2>';
echo '<pre>' . htmlspecialchars($response) . '</pre>';

// Decodifica la respuesta de Firestore
$data = json_decode($response, true);

if (isset($responseData['access_token'])) {
    $accessToken = $responseData['access_token'];
} else {
    echo '<p>Error al obtener el token de acceso</p>';
    curl_close($curl);
    exit();
}
curl_close($curl);

// Realiza la solicitud a Firestore con el token de acceso
$url = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/$collection/$id";
$curlFirestore = curl_init($url);
curl_setopt($curlFirestore, CURLOPT_RETURNTRANSFER, true);
curl_setopt($curlFirestore, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . $accessToken,
    'Content-Type: application/json'
]);

// Verifica si la decodificación fue exitosa
if (json_last_error() !== JSON_ERROR_NONE) {
    echo '<p>Error al decodificar JSON: ' . json_last_error_msg() . '</p>';
    exit();
}

// Verifica si se encontró un error al obtener los datos de Firestore
if (isset($data['error'])) {
    echo '<!DOCTYPE html><html lang="es"><body><h1>Error al obtener datos: ' . htmlspecialchars($data['error']['message']) . '</h1></body></html>';
    exit();
}

$responseFirestore = curl_exec($curlFirestore);
$data = json_decode($responseFirestore, true);
curl_close($curlFirestore);

if (isset($data['fields'])) {
    $title = $data['fields']['title']['stringValue'];
    $description = "Un nuevo tiempo de Dios para tu vida";
    $imageUrl = $data['fields']['imageUrl']['stringValue'];
    $destinationUrl = $data['fields']['destinationUrl']['stringValue'];
    $landingUrl = $data['fields']['landingUrl']['stringValue'];
    $shortenedUrl = $data['fields']['shortenedUrl']['stringValue'];
} else {
    echo '<!DOCTYPE html><html lang="es"><body><h1>Enlace no encontrado</h1></body></html>';
    exit();
}
// Verifica si encontramos datos
if (isset($data['fields'])) {
    // Extrae los campos del documento
    $title = $data['fields']['title']['stringValue'];
    $description = "Un nuevo tiempo de Dios para tu vida";  // Puedes ajustar este valor si lo deseas
    $imageUrl = $data['fields']['imageUrl']['stringValue'];
    $destinationUrl = $data['fields']['destinationUrl']['stringValue'];
    $landingUrl = $data['fields']['landingUrl']['stringValue'];
    $shortenedUrl = $data['fields']['shortenedUrl']['stringValue'];
    $uniqueId = $data['fields']['uniqueId']['stringValue'];

    // Si la URL de destino está vacía, establece una predeterminada
    if (empty($destinationUrl)) {
        $destinationUrl = 'http://example.com'; // Cambia esto por una URL predeterminada
    }

    // Muestra los datos obtenidos
    echo "<h1>$title</h1>";
    echo "<p>$description</p>";
    echo "<img src='$imageUrl' alt='Imagen elegida'>";
    echo "<p>Redirigiendo a: <a href='$destinationUrl'>$destinationUrl</a></p>";
    echo "<p><a href='$landingUrl'>Ir a la página de aterrizaje</a></p>";
    echo "<p><a href='$shortenedUrl'>Ir al enlace acortado</a></p>";
} else {
    // Si no se encuentra el documento, muestra un error
    echo '<!DOCTYPE html><html lang="es"><body><h1>Enlace no encontrado</h1></body></html>';
    // Aquí puedes imprimir o utilizar las variables según necesites
    echo "<h2>Datos obtenidos:</h2>";
    echo "<p>Título: " . htmlspecialchars($title) . "</p>";
    echo "<p>Descripción: " . htmlspecialchars($description) . "</p>";
    echo "<p>URL de la imagen: " . htmlspecialchars($imageUrl) . "</p>";
    echo "<p>URL de destino: " . htmlspecialchars($destinationUrl) . "</p>";
    echo "<p>URL de aterrizaje: " . htmlspecialchars($landingUrl) . "</p>";
    echo "<p>URL acortada: " . htmlspecialchars($shortenedUrl) . "</p>";
    echo "<p>ID único: " . htmlspecialchars($uniqueId) . "</p>";
    exit();
}
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo htmlspecialchars($title); ?></title>
    
    <!-- Open Graph Meta Tags -->
    <meta property="og:title" content="<?php echo htmlspecialchars($title); ?>" />
    <meta property="og:description" content="<?php echo htmlspecialchars($description); ?>" />
    <meta property="og:image" content="<?php echo htmlspecialchars($imageUrl); ?>" />
    <meta property="og:url" content="<?php echo htmlspecialchars($destinationUrl); ?>" />
    <meta property="og:type" content="website" />

    <link rel="stylesheet" href="../styles/styles.css">
    <link rel="stylesheet" href="../styles/redirect.css">
    
    <!-- Redirige automáticamente a la URL de destino después de 3 segundos -->
    <meta http-equiv="refresh" content="3;url=<?php echo htmlspecialchars($destinationUrl); ?>">
</head>

<body>
    <div class="container">
        <h1>Redireccionando...</h1>
        <img src="<?php echo htmlspecialchars($imageUrl); ?>" alt="Imagen elegida" class="image">
        <p><?php echo htmlspecialchars($description); ?></p>
        <p>Serás redirigido en unos momentos...</p>
        <script>
            setTimeout(function() {
                window.location.href = "<?php echo htmlspecialchars($destinationUrl); ?>";
            }, 3000);
        </script>
    </div>
</body>
</html>
