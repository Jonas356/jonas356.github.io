<?php
include 'conexion.php';

if (!isset($_GET['ci'])) {
    die("Error: No se proporcionó CI.");
}

$ci = $_GET['ci'];
$sql = "SELECT * FROM pacientes WHERE ci = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("s", $ci);
$stmt->execute();
$resultado = $stmt->get_result();

if ($resultado->num_rows === 0) {
    die("Error: Paciente no encontrado.");
}

$paciente = $resultado->fetch_assoc();
$nivelRiesgo = "";
if ($paciente['riesgo'] < 7) $nivelRiesgo = "Bajo";
else if ($paciente['riesgo'] < 12) $nivelRiesgo = "Ligeramente elevado";
else if ($paciente['riesgo'] < 15) $nivelRiesgo = "Moderado";
else if ($paciente['riesgo'] < 21) $nivelRiesgo = "Alto";
else $nivelRiesgo = "Muy alto";

$recomendaciones = [
    $nivelRiesgo === "Bajo" ? "Mantenga un estilo de vida saludable." : "Consulte a un médico para un seguimiento detallado."
];

$stmt->close();
$conexion->close();
?>

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generando Informe PDF</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.22/jspdf.plugin.autotable.min.js"></script>
</head>
<body>
    <script>
        document.addEventListener("DOMContentLoaded", function() {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Colores alineados con variables CSS
            const azul = [0, 114, 47];
            const grisClaro = [241, 241, 241];
            const grisFondo = [220, 220, 220];
            const amarillo = [245, 124, 0];
            const azulClaro = [173, 216, 230];

            // Fondo
            doc.setFillColor(...grisClaro);
            doc.rect(10, 10, 190, 270, "F");

            // Título
            doc.setFont("helvetica", "bold");
            doc.setFontSize(18);
            doc.setTextColor(...azul);
            doc.text("Informe Médico - Evaluación FINDRISK", 20, 20);

            // Línea decorativa
            doc.setDrawColor(...azul);
            doc.setLineWidth(0.5);
            doc.line(20, 25, 190, 25);

            // Sección: Datos del Paciente
            doc.setFontSize(14);
            doc.setFillColor(...grisFondo);
            doc.rect(20, 30, 170, 8, "F");
            doc.text("Datos del Paciente", 22, 36);

            doc.autoTable({
                startY: 40,
                body: [
                    ["Nombre", "<?php echo htmlspecialchars($paciente['nombre']); ?>"],
                    ["Cédula de Identidad (CI)", "<?php echo htmlspecialchars($paciente['ci']); ?>"],
                    ["Sexo", "<?php echo htmlspecialchars($paciente['sexo']); ?>"],
                    ["Edad", "<?php echo htmlspecialchars($paciente['edad']); ?> años"],
                ],
                theme: "grid",
                styles: { fontSize: 12, halign: "left" },
                headStyles: { fillColor: azul },
            });

            // Sección: Datos Clínicos
            doc.setFontSize(14);
            doc.setFillColor(...grisFondo);
            doc.rect(20, doc.lastAutoTable.finalY + 5, 170, 8, "F");
            doc.text("Datos Clínicos", 22, doc.lastAutoTable.finalY + 10);

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 15,
                body: [
                    ["Peso", "<?php echo htmlspecialchars($paciente['peso']); ?> kg"],
                    ["Altura", "<?php echo htmlspecialchars($paciente['altura']); ?> cm"],
                    ["IMC", "<?php echo htmlspecialchars($paciente['imc']); ?> kg/m²"],
                    ["Perímetro de cintura", "<?php echo htmlspecialchars($paciente['cintura']); ?> cm"],
                ],
                theme: "grid",
                styles: { fontSize: 12, halign: "left" },
                headStyles: { fillColor: azul },
            });

            // Sección: Evaluación de Riesgo
            doc.setFontSize(14);
            doc.setFillColor(...amarillo);
            doc.rect(20, doc.lastAutoTable.finalY + 5, 170, 8, "F");
            doc.text("Evaluación de Riesgo", 22, doc.lastAutoTable.finalY + 10);

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 15,
                body: [["Resultado", "Puntuación: <?php echo htmlspecialchars($paciente['riesgo']); ?> - <?php echo htmlspecialchars($nivelRiesgo); ?>"]],
                theme: "grid",
                styles: { fontSize: 12, halign: "left" },
                headStyles: { fillColor: azul },
            });

            // Sección: Recomendaciones Médicas
            doc.setFontSize(14);
            doc.setFillColor(...azulClaro);
            doc.rect(20, doc.lastAutoTable.finalY + 5, 170, 8, "F");
            doc.text("Recomendaciones Médicas", 22, doc.lastAutoTable.finalY + 10);

            doc.autoTable({
                startY: doc.lastAutoTable.finalY + 15,
                body: <?php echo json_encode($recomendaciones); ?>.map(rec => [rec]),
                theme: "grid",
                styles: { fontSize: 12, halign: "left" },
                headStyles: { fillColor: azul },
            });

            // Sanear nombre del archivo
            const nombreArchivo = "<?php echo preg_replace('/[^a-zA-Z0-9]/', '_', $paciente['nombre']); ?>";
            doc.save(`Informe_${nombreArchivo}.pdf`);
        });
    </script>
</body>
</html>