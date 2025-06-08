<?php
include 'conexion.php';
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Buscar Pacientes</title>
    <link rel="stylesheet" href="../styles.css">
</head>
<body>
    <header>
        <h1 class="titulo">BUSCAR PACIENTES</h1>
    </header>

    <section class="intro">
        <p>BUSCA PACIENTES POR NOMBRE O CÉDULA DE IDENTIDAD</p>
    </section>

    <main class="contenedor sombra">
        <form method="GET" action="">
            <div class="pregunta">
                <label for="busqueda">Buscar por Nombre o CI:</label>
                <input type="text" id="busqueda" name="busqueda" placeholder="Ingrese nombre o CI" required>
            </div>
            <div class="boton">
                <button type="submit">Buscar</button>
                <button type="button" onclick="window.location.href='../index.html'">Volver</button>
            </div>
        </form>

        <?php
        if (isset($_GET['busqueda'])) {
            $busqueda = $_GET['busqueda'];
            $sql = "SELECT * FROM pacientes WHERE nombre LIKE ? OR ci LIKE ?";
            $stmt = $conexion->prepare($sql);
            $param = "%$busqueda%";
            $stmt->bind_param("ss", $param, $param);
            $stmt->execute();
            $resultado = $stmt->get_result();

            if ($resultado->num_rows > 0) {
                echo "<div class='resultado'><h2>Resultados de la búsqueda</h2>";
                echo "<table border='1' style='width:100%; text-align:left;'>
                        <tr>
                            <th>Nombre</th>
                            <th>CI</th>
                            <th>Sexo</th>
                            <th>Edad</th>
                            <th>IMC</th>
                            <th>Riesgo</th>
                            <th>Fecha Registro</th>
                            <th>Acción</th>
                        </tr>";
                while ($row = $resultado->fetch_assoc()) {
                    $nivelRiesgo = "";
                    if ($row['riesgo'] < 7) $nivelRiesgo = "Bajo";
                    else if ($row['riesgo'] < 12) $nivelRiesgo = "Ligeramente elevado";
                    else if ($row['riesgo'] < 15) $nivelRiesgo = "Moderado";
                    else if ($row['riesgo'] < 21) $nivelRiesgo = "Alto";
                    else $nivelRiesgo = "Muy alto";

                    echo "<tr>
                            <td>{$row['nombre']}</td>
                            <td>{$row['ci']}</td>
                            <td>{$row['sexo']}</td>
                            <td>{$row['edad']}</td>
                            <td>{$row['imc']}</td>
                            <td>Puntuación: {$row['riesgo']} - {$nivelRiesgo}</td>
                            <td>{$row['fecha_registro']}</td>
                            <td><a href='generar_pdf_paciente.php?ci={$row['ci']}' target='_blank'>Descargar PDF</a></td>
                          </tr>";
                }
                echo "</table></div>";
            } else {
                echo "<div class='resultado'>No se encontraron pacientes.</div>";
            }
            $stmt->close();
        }
        $conexion->close();
        ?>
    </main>

    <footer>
        <p>Todos los derechos reservados por Jhonatan © 2025</p>
    </footer>
</body>
</html>