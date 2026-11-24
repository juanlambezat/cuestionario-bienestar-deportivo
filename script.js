/**
 * Cuestionario de Bienestar Emocional en el Deporte
 * Lógica 100% en navegador, sin almacenamiento ni envío de datos.
 */

// Banco exacto de las 10 preguntas y su sistema de puntuación
const QUESTIONS = [
  {
    text: "¿Disfrutás de practicar tu deporte, aunque no ganes?",
    points: { si: 0, no: 1 }
  },
  {
    text: "¿Te sentís muy mal cuando cometés un error durante un partido?",
    points: { si: 1, no: 0 }
  },
  {
    text: "¿Sentís que tenés que ganar para que los demás estén orgullosos de vos?",
    points: { si: 1, no: 0 }
  },
  {
    text: "¿Podés aceptar una derrota sin pensar que sos un mal deportista?",
    points: { si: 0, no: 1 }
  },
  {
    text: "¿Te da miedo que tus compañeros se burlen de vos si te equivocás?",
    points: { si: 1, no: 0 }
  },
  {
    text: "¿Podés hablar con alguien cuando el deporte te genera estrés o tristeza?",
    points: { si: 0, no: 1 }
  },
  {
    text: "¿Sentís que la presión de tu entrenador, tu familia o tus compañeros te supera?",
    points: { si: 1, no: 0 }
  },
  {
    text: "¿Podés descansar sin sentir culpa por no estar entrenando?",
    points: { si: 0, no: 1 }
  },
  {
    text: "¿Te sentís respetado e incluido por las personas de tu equipo?",
    points: { si: 0, no: 1 }
  },
  {
    text: "¿Podés reconocer tus avances y valorar tu esfuerzo, aunque no seas el mejor?",
    points: { si: 0, no: 1 }
  }
];

// Definición de los 4 niveles de resultados personalizados
const RESULTS = [
  {
    min: 0,
    max: 2,
    emoji: "🟢",
    levelClass: "level-green",
    title: "BIENESTAR EMOCIONAL",
    message: '"Tenés una relación saludable con el deporte."',
    advice:
      "¡Seguí así! Es importante que disfrutes de la actividad física, reconozcas tus logros y mantengas un equilibrio entre el deporte, el descanso y tu vida personal."
  },
  {
    min: 3,
    max: 4,
    emoji: "🟡",
    levelClass: "level-yellow",
    title: "A PRESTAR ATENCIÓN",
    message: '"Algunas situaciones te generan presión o frustración."',
    advice:
      "Es normal tener días difíciles, pero es importante identificar qué situaciones te hacen sentir así y evitar que afecten tu disfrute del deporte. Aprendé a valorar tus pequeños avances y no te compares constantemente con los demás."
  },
  {
    min: 5,
    max: 6,
    emoji: "🟠",
    levelClass: "level-orange",
    title: "NECESITÁS CUIDARTE",
    message: '"El deporte podría estar afectando tu bienestar."',
    advice:
      "Es importante darle lugar a tus emociones y recordar que tu bienestar está por encima de cualquier resultado. Tomarte un descanso, hablar sobre lo que sentís y revisar tus objetivos puede ayudarte a recuperar el disfrute."
  },
  {
    min: 7,
    max: 10,
    emoji: "🔴",
    levelClass: "level-red",
    title: "BUSCÁ APOYO",
    message: '"Sería bueno hablar con alguien de confianza sobre cómo te sentís."',
    advice:
      "No tenés que atravesar estas situaciones en soledad ni sentir vergüenza por lo que te pasa. Hablá con un familiar, entrenador, profesional de la salud o alguien de confianza. Pedir ayuda también es parte de cuidarte."
  }
];

// Estado en memoria volátil (se borra al recargar o reiniciar)
let currentQuestionIndex = 0;
let userAnswers = new Array(QUESTIONS.length).fill(null);

// Referencias a elementos del DOM
const screens = {
  start: document.getElementById("screen-start"),
  quiz: document.getElementById("screen-quiz"),
  result: document.getElementById("screen-result")
};

const btnStart = document.getElementById("btn-start");
const btnPrev = document.getElementById("btn-prev");
const btnNext = document.getElementById("btn-next");
const btnNextText = document.getElementById("btn-next-text");
const btnRestart = document.getElementById("btn-restart");

const questionWrapper = document.getElementById("question-wrapper");
const questionCounter = document.getElementById("question-counter");
const progressPercent = document.getElementById("progress-percent");
const progressFill = document.getElementById("progress-fill");
const progressBarContainer = document.getElementById("progress-bar-container");
const questionPill = document.getElementById("question-pill");
const questionText = document.getElementById("question-text");

const optionButtons = document.querySelectorAll(".option-btn");

const resultBanner = document.getElementById("result-banner");
const resultEmoji = document.getElementById("result-emoji");
const resultTitle = document.getElementById("result-title");
const resultMessage = document.getElementById("result-message");
const resultAdvice = document.getElementById("result-advice");

/**
 * Cambia de pantalla con transición suave
 */
function showScreen(screenName) {
  Object.values(screens).forEach((screen) => {
    screen.classList.remove("active");
    screen.classList.add("hidden");
  });

  screens[screenName].classList.remove("hidden");
  screens[screenName].classList.add("active");
}

/**
 * Actualiza la barra de progreso según las preguntas respondidas
 */
function updateProgressBar() {
  const answeredCount = userAnswers.filter((ans) => ans !== null).length;
  const percentage = Math.round((answeredCount / QUESTIONS.length) * 100);

  progressFill.style.width = `${percentage}%`;
  progressPercent.textContent = `${percentage}% completado`;
  progressBarContainer.setAttribute("aria-valuenow", percentage);
}

/**
 * Renderiza la pregunta actual y restaura la selección si el usuario volvió atrás
 */
function renderQuestion() {
  const total = QUESTIONS.length;
  const currentQ = QUESTIONS[currentQuestionIndex];
  const savedAnswer = userAnswers[currentQuestionIndex];

  // Actualizar textos de numeración
  questionCounter.textContent = `Pregunta ${currentQuestionIndex + 1} de ${total}`;
  questionPill.textContent = `#${String(currentQuestionIndex + 1).padStart(2, "0")}`;
  questionText.textContent = currentQ.text;

  // Reiniciar animación suave de entrada
  questionWrapper.classList.remove("slide-in");
  void questionWrapper.offsetWidth; // Fuerza reflujo para reiniciar CSS animation
  questionWrapper.classList.add("slide-in");

  // Actualizar estado visual de los botones Sí / No
  optionButtons.forEach((btn) => {
    const isSelected = btn.dataset.value === savedAnswer;
    btn.classList.toggle("selected", isSelected);
    btn.setAttribute("aria-checked", isSelected ? "true" : "false");
  });

  // Habilitar o deshabilitar botón "Anterior"
  btnPrev.disabled = currentQuestionIndex === 0;

  // No permitir avanzar si no hay respuesta seleccionada
  btnNext.disabled = savedAnswer === null;

  // Cambiar texto del botón en la última pregunta
  if (currentQuestionIndex === total - 1) {
    btnNextText.textContent = "Ver mi resultado";
  } else {
    btnNextText.textContent = "Siguiente";
  }

  updateProgressBar();
}

/**
 * Guarda la respuesta elegida ("si" o "no")
 */
function selectAnswer(value) {
  userAnswers[currentQuestionIndex] = value;

  optionButtons.forEach((btn) => {
    const isSelected = btn.dataset.value === value;
    btn.classList.toggle("selected", isSelected);
    btn.setAttribute("aria-checked", isSelected ? "true" : "false");
  });

  btnNext.disabled = false;
  updateProgressBar();
}

/**
 * Calcula el puntaje total y muestra la pantalla de resultados correspondiente
 */
function calculateAndShowResult() {
  const totalScore = userAnswers.reduce((acc, answer, index) => {
    if (!answer) return acc;
    return acc + QUESTIONS[index].points[answer];
  }, 0);

  const matchedResult =
    RESULTS.find((item) => totalScore >= item.min && totalScore <= item.max) ||
    RESULTS[0];

  // Limpiar clases de nivel previas y aplicar la correspondiente
  resultBanner.classList.remove("level-green", "level-yellow", "level-orange", "level-red");
  resultBanner.classList.add(matchedResult.levelClass);

  resultEmoji.textContent = matchedResult.emoji;
  resultTitle.textContent = matchedResult.title;
  resultMessage.textContent = matchedResult.message;
  resultAdvice.textContent = matchedResult.advice;

  showScreen("result");
}

/**
 * Reinicia todo el estado en memoria para volver a empezar
 */
function resetQuiz() {
  currentQuestionIndex = 0;
  userAnswers = new Array(QUESTIONS.length).fill(null);
  renderQuestion();
  showScreen("start");
}

// ==========================================================================
// Eventos de interacción
// ==========================================================================

btnStart.addEventListener("click", () => {
  currentQuestionIndex = 0;
  renderQuestion();
  showScreen("quiz");
});

optionButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    selectAnswer(btn.dataset.value);
  });
});

btnPrev.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
  }
});

btnNext.addEventListener("click", () => {
  // Validación extra para impedir avanzar sin respuesta
  if (userAnswers[currentQuestionIndex] === null) return;

  if (currentQuestionIndex < QUESTIONS.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    calculateAndShowResult();
  }
});

btnRestart.addEventListener("click", resetQuiz);