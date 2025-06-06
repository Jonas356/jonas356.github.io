// Función para calcular el IMC y actualizarlo automáticamente
function actualizarIMC() {
  const peso = parseFloat(document.getElementById("peso").value);
  const altura = parseFloat(document.getElementById("altura").value) / 100; // Convertir cm a metros

  const imcSpan = document.getElementById("imc");
  if (peso > 0 && altura > 0) {
    const imc = (peso / (altura * altura)).toFixed(2);
    imcSpan.textContent = imc;
  } else {
    imcSpan.textContent = "-";
  }
}

// Función para calcular el riesgo
function calcularRiesgo(event) {
  event.preventDefault(); // Prevenir el envío del formulario

  const nombre = document.getElementById("nombre").value;
  const ci = document.getElementById("ci").value;
  const sexo = document.getElementById("sexo").value;
  const edad = parseInt(document.getElementById("edad").value);
  const imc = parseFloat(document.getElementById("imc").textContent);
  const cintura = parseFloat(document.getElementById("cintura").value);
  const actividad = document.querySelector('input[name="actividad"]:checked');
  const frutas = document.querySelector('input[name="frutas"]:checked');
  const hipertension = document.querySelector('input[name="hipertension"]:checked');
  const glucosa = document.querySelector('input[name="glucosa"]:checked');
  const familia = document.querySelector('input[name="familia"]:checked');

  // Validar que todos los campos estén completos
  if (!nombre || !ci || !sexo || isNaN(edad) || isNaN(imc) || isNaN(cintura) ||
      !actividad || !frutas || !hipertension || !glucosa || !familia) {
    alert("Por favor, complete todos los campos antes de calcular el riesgo. Asegúrese de que el IMC se haya calculado correctamente.");
    return;
  }

  const puntosEdad = edad < 45 ? 0 : edad < 55 ? 2 : edad < 65 ? 3 : 4;
  const puntosIMC = imc < 25 ? 0 : imc < 30 ? 1 : 3;
  const puntosCintura = sexo === "hombre" ?
    (cintura < 94 ? 0 : cintura < 102 ? 3 : 4) :
    (cintura < 80 ? 0 : cintura < 88 ? 3 : 4);
  const puntosActividad = parseInt(actividad.value);
  const puntosFrutas = parseInt(frutas.value);
  const puntosHipertension = parseInt(hipertension.value);
  const puntosGlucosa = parseInt(glucosa.value);
  const puntosFamilia = parseInt(familia.value);

  const totalPuntos = puntosEdad + puntosIMC + puntosCintura + puntosActividad + puntosFrutas + puntosHipertension + puntosGlucosa + puntosFamilia;

  let riesgo = "";
  let recomendaciones = [];

  if (totalPuntos < 7) {
    riesgo = "Riesgo bajo (1%)";
    recomendaciones = [
      "Mantener hábitos saludables.",
      "Seguir una dieta equilibrada.",
      "Continuar con actividad física moderada."
    ];
  } else if (totalPuntos <= 11) {
    riesgo = "Riesgo ligeramente elevado (4%)";
    recomendaciones = [
      "Monitorear los niveles de glucosa ocasionalmente.",
      "Reducir el consumo de azúcares refinados.",
      "Evitar el sedentarismo."
    ];
  } else if (totalPuntos <= 14) {
    riesgo = "Riesgo moderado (17%)";
    recomendaciones = [
      "Se recomienda una consulta médica.",
      "Control de peso.",
      "Revisar la presión arterial periódicamente."
    ];
  } else if (totalPuntos <= 20) {
    riesgo = "Riesgo alto (33%)";
    recomendaciones = [
      "Visitar a un especialista en endocrinología.",
      "Control estricto de dieta y peso.",
      "Monitoreo de glucosa frecuente."
    ];
  } else {
    riesgo = "Riesgo muy alto (50%)";
    recomendaciones = [
      "Consultar de inmediato a un médico.",
      "Implementar un plan de salud urgente.",
      "Evaluación de prediabetes."
    ];
  }

  // Mostrar resultado en la página
  document.getElementById("resultado").innerHTML = `<h2>Puntuación: ${totalPuntos} - ${riesgo}</h2>`;
  document.getElementById("informeMedico").innerHTML = `
    <h2>Informe Médico</h2>
    <p><strong>Nombre:</strong> ${nombre}</p>
    <p><strong>Cédula de Identidad:</strong> ${ci}</p>
    <p><strong>Sexo:</strong> ${sexo}</p>
    <p><strong>Edad:</strong> ${edad} años</p>
    <p><strong>IMC:</strong> ${imc} kg/m²</p>
    <p><strong>Perímetro de cintura:</strong> ${cintura} cm</p>
    <h2>Evaluación del Riesgo</h2>
    <p><strong>Riesgo de desarrollar diabetes en los próximos 10 años:</strong> ${riesgo}</p>
    <h2>Recomendaciones Médicas</h2>
    <ul>
      ${recomendaciones.map(rec => `<li>${rec}</li>`).join('')}
    </ul>
  `;

  // Guardar datos para el PDF
  window.testData = {
    nombre, ci, sexo, edad, peso: document.getElementById("peso").value,
    altura: document.getElementById("altura").value, imc, cintura,
    totalPuntos, riesgo, recomendaciones
  };
}

// Función para generar el PDF
function generarPDF() {
  if (!window.testData) {
    alert("Por favor, calcule el riesgo antes de generar el informe.");
    return;
  }

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

// Asegurar que el DOM esté completamente cargado antes de asignar eventos
document.addEventListener("DOMContentLoaded", function() {
  // Asignar evento al formulario
  const form = document.getElementById("formDiabetes");
  if (form) {
    form.addEventListener("submit", calcularRiesgo);
  } else {
    console.error("El formulario 'formDiabetes' no se encontró en el DOM.");
  }

  // Asignar eventos para actualizar el IMC automáticamente
  const pesoInput = document.getElementById("peso");
  const alturaInput = document.getElementById("altura");

  if (pesoInput && alturaInput) {
    pesoInput.addEventListener("input", actualizarIMC);
    alturaInput.addEventListener("input", actualizarIMC);
  } else {
    console.error("Los campos 'peso' o 'altura' no se encontraron en el DOM.");
  }
});