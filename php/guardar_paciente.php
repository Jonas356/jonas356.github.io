<?php
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = $_POST['nombre'];
    $ci = $_POST['ci'];
    $sexo = $_POST['sexo'];
    $edad = $_POST['edad'];
    $peso = $_POST['peso'];
    $altura = $_POST['altura'];
    $imc = $_POST['imc'];
    $cintura = $_POST['cintura'];
    $actividad = $_POST['actividad'];
    $frutas = $_POST['frutas'];
    $hipertension = $_POST['hipertension'];
    $glucosa = $_POST['glucosa'];
    $familia = $_POST['familia'];
    $riesgo = $_POST['riesgo'];

    $sql = "INSERT INTO pacientes (nombre, ci, sexo, edad, peso, altura, imc, cintura, actividad, frutas, hipertension, glucosa, familia, riesgo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
    
    $stmt = $conexion->prepare($sql);
    $stmt->bind_param("sssiiddiidiiii", $nombre, $ci, $sexo, $edad, $peso, $altura, $imc, $cintura, $actividad, $frutas, $hipertension, $glucosa, $familia, $riesgo);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Paciente guardado correctamente"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error al guardar: " . $conexion->error]);
    }

    $stmt->close();
    $conexion->close();
}
?>