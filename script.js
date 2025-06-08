document.addEventListener("DOMContentLoaded", function() {
    const form = document.getElementById("formDiabetes");
    if (form) {
        form.addEventListener("submit", calcularRiesgo);
    } else {
        console.error("El formulario 'formDiabetes' no se encontró en el DOM.");
    }

    // Actualizar IMC automáticamente
    const pesoInput = document.getElementById("peso");
    const alturaInput = document.getElementById("altura");
    if (pesoInput && alturaInput) {
        pesoInput.addEventListener("input", actualizarIMC);
        alturaInput.addEventListener("input", actualizarIMC);
    } else {
        console.error("Los campos 'peso' o 'altura' no se encontraron en el DOM.");
    }
});

function actualizarIMC() {
    const peso = parseFloat(document.getElementById("peso").value);
    const altura = parseFloat(document.getElementById("altura").value) / 100; // Convertir a metros
    if (peso && altura) {
        const imc = peso / (altura * altura);
        document.getElementById("imc").textContent = imc.toFixed(1);
    } else {
        document.getElementById("imc").textContent = "-";
    }
}

function calcularRiesgo(event) {
    event.preventDefault();

    const nombre = document.getElementById("nombre").value;
    const ci = document.getElementById("ci").value;
    const sexo = document.getElementById("sexo").value;
    const edad = parseInt(document.getElementById("edad").value);
    const peso = parseFloat(document.getElementById("peso").value);
    const altura = parseInt(document.getElementById("altura").value);
    const cintura = parseInt(document.getElementById("cintura").value);
    const actividad = parseInt(document.querySelector('input[name="actividad"]:checked').value);
    const frutas = parseInt(document.querySelector('input[name="frutas"]:checked').value);
    const hipertension = parseInt(document.querySelector('input[name="hipertension"]:checked').value);
    const glucosa = parseInt(document.querySelector('input[name="glucosa"]:checked').value);
    const familia = parseInt(document.querySelector('input[name="familia"]:checked').value);

    // Calcular IMC
    const imc = peso / ((altura / 100) * (altura / 100));
    document.getElementById("imc").textContent = imc.toFixed(1);

    // Calcular puntos por IMC
    let puntosIMC = 0;
    if (imc >= 25 && imc < 30) puntosIMC = 1;
    else if (imc >= 30 && imc < 35) puntosIMC = 2;
    else if (imc >= 35) puntosIMC = 3;

    // Calcular puntos por edad
    let puntosEdad = 0;
    if (edad >= 45 && edad < 55) puntosEdad = 2;
    else if (edad >= 55 && edad < 65) puntosEdad = 3;
    else if (edad >= 65) puntosEdad = 4;

    // Calcular puntos por cintura
    let puntosCintura = 0;
    if (sexo === "hombre") {
        if (cintura >= 90 && cintura < 100) puntosCintura = 3;
        else if (cintura >= 100) puntosCintura = 4;
    } else if (sexo === "mujer") {
        if (cintura >= 80 && cintura < 90) puntosCintura = 3;
        else if (cintura >= 90) puntosCintura = 4;
    }

    // Sumar puntos totales
    const puntosTotales = puntosEdad + puntosIMC + puntosCintura + actividad + frutas + hipertension + glucosa + familia;

    // Determinar nivel de riesgo
    let nivelRiesgo = "";
    if (puntosTotales < 7) nivelRiesgo = "Bajo";
    else if (puntosTotales < 12) nivelRiesgo = "Ligeramente elevado";
    else if (puntosTotales < 15) nivelRiesgo = "Moderado";
    else if (puntosTotales < 21) nivelRiesgo = "Alto";
    else nivelRiesgo = "Muy alto";

    // Generar recomendaciones
    const recomendaciones = [
        nivelRiesgo === "Bajo"
            ? "Mantenga un estilo de vida saludable."
            : "Consulte a un médico para un seguimiento detallado."
    ];

    // Generar mensaje del resultado
    const mensajeResultado = `Puntuación: ${puntosTotales} - ${nivelRiesgo}`;

    // Mostrar resultado en la página
    const resultadoDiv = document.getElementById("resultado");
    resultadoDiv.innerHTML = `<h2>Resultado</h2>
                             <p>IMC: ${imc.toFixed(1)}</p>
                             <p>${mensajeResultado}</p>`;

    // Mostrar informe médico en la página
    const informeDiv = document.getElementById("informeMedico");
    informeDiv.innerHTML = `<h2>Informe Médico</h2>
                           <p>Nombre: ${nombre}</p>
                           <p>Cédula: ${ci}</p>
                           <p>Sexo: ${sexo}</p>
                           <p>Edad: ${edad} años</p>
                           <p>IMC: ${imc.toFixed(1)}</p>
                           <p>Nivel de riesgo de diabetes tipo 2: ${nivelRiesgo}</p>
                           <p>Recomendaciones: ${recomendaciones[0]}</p>`;

    // Almacenar datos para el PDF
    window.testData = {
        nombre,
        ci,
        sexo,
        edad,
        peso,
        altura,
        imc: imc.toFixed(1),
        cintura,
        totalPuntos: puntosTotales,
        riesgo: nivelRiesgo,
        recomendaciones
    };

    // Enviar datos a PHP
    const formData = new FormData(document.getElementById("formDiabetes"));
    formData.append("imc", imc.toFixed(1));
    formData.append("riesgo", puntosTotales);

    fetch("php/guardar_paciente.php", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function generarPDF() {
    if (!window.testData) {
        alert("Por favor, calcule el riesgo antes de generar el informe.");
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Colores alineados con variables CSS
    const azul = [0, 114, 47]; // --azul: #00722f
    const grisClaro = [241, 241, 241]; // --gris-claro: #f1f1f1
    const grisFondo = [220, 220, 220]; // Aproximación para fondo de secciones
    const amarillo = [245, 124, 0]; // --naranja: #f57c00
    const azulClaro = [173, 216, 230]; // Aproximación para --azul-claro

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
            ["Nombre", window.testData.nombre],
            ["Cédula de Identidad (CI)", window.testData.ci],
            ["Sexo", window.testData.sexo],
            ["Edad", `${window.testData.edad} años`],
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
            ["Peso", `${window.testData.peso} kg`],
            ["Altura", `${window.testData.altura} cm`],
            ["IMC", `${window.testData.imc} kg/m²`],
            ["Perímetro de cintura", `${window.testData.cintura} cm`],
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
        body: [["Resultado", `Puntuación: ${window.testData.totalPuntos} - ${window.testData.riesgo}`]],
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
        body: window.testData.recomendaciones.map(rec => [rec]),
        theme: "grid",
        styles: { fontSize: 12, halign: "left" },
        headStyles: { fillColor: azul },
    });

    // Sanear nombre del archivo
    const nombreArchivo = window.testData.nombre.replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Informe_${nombreArchivo}.pdf`);
}