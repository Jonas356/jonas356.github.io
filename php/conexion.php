<?php
$host = "localhost";
$usuario = "root"; // Por defecto, XAMPP usa 'root' sin contraseña
$contrasena = "";
$base_datos = "diabetes_db";

$conexion = new mysqli($host, $usuario, $contrasena, $base_datos);

if ($conexion->connect_error) {
    die("Error de conexión: " . $conexion->connect_error);
}

$conexion->set_charset("utf8");
?>