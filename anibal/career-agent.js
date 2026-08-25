(() => {
  "use strict";

  const ANALYZE_API_URL =
    "https://career-agent-api-jd2uqc2g4a-ew.a.run.app/api/analyze-job";
  const DOSSIER_API_URL =
    "https://career-agent-api-jd2uqc2g4a-ew.a.run.app/api/build-dossier";
  const FIT_API_URL =
    "https://career-agent-api-jd2uqc2g4a-ew.a.run.app/api/analyze-fit";
  const DECISION_API_URL =
    "https://career-agent-api-jd2uqc2g4a-ew.a.run.app/api/decision";
  const GOOGLE_CLIENT_ID =
    "721604659809-betff2smpf2aofiv71fe71gnis54tq73.apps.googleusercontent.com";
  const MIN_DESCRIPTION_LENGTH = 200;

  let idToken = null;
  let latestAnalysis = null;
  let latestFit = null;

  const panel = document.getElementById("career-agent");
  const signInContainer = document.getElementById("google-signin");
  const signOutButton = document.getElementById("agent-signout");
  const authStatus = document.getElementById("agent-auth-status");
  const form = document.getElementById("agent-form");
  const fields = document.getElementById("agent-fields");
  const companyInput = document.getElementById("agent-company");
  const roleInput = document.getElementById("agent-role");
  const locationInput = document.getElementById("agent-location");
  const descriptionInput = document.getElementById("agent-description");
  const descriptionCount = document.getElementById("agent-description-count");
  const submitButton = document.getElementById("agent-submit");
  const resultContainer = document.getElementById("agent-result");
  const fitActions = document.getElementById("agent-fit-actions");
  const analyzeFitButton = document.getElementById("agent-analyze-fit");
  const fitContainer = document.getElementById("agent-fit-result");
  const decisionActions = document.getElementById("agent-decision-actions");
  const decisionSignalsInput = document.getElementById(
    "agent-decision-signals",
  );
  const buildDecisionButton = document.getElementById(
    "agent-build-decision",
  );
  const decisionContainer = document.getElementById("agent-decision-result");
  const dossierActions = document.getElementById("agent-dossier-actions");
  const buildDossierButton = document.getElementById("agent-build-dossier");
  const dossierContainer = document.getElementById("agent-dossier-result");

  if (
    !panel ||
    !signInContainer ||
    !signOutButton ||
    !authStatus ||
    !form ||
    !fields ||
    !companyInput ||
    !roleInput ||
    !locationInput ||
    !descriptionInput ||
    !descriptionCount ||
    !submitButton ||
    !resultContainer ||
    !fitActions ||
    !analyzeFitButton ||
    !fitContainer ||
    !decisionActions ||
    !decisionSignalsInput ||
    !buildDecisionButton ||
    !decisionContainer ||
    !dossierActions ||
    !buildDossierButton ||
    !dossierContainer
  ) {
    return;
  }

  const setStatus = (message, type = "") => {
    authStatus.textContent = message;
    authStatus.className = `agent-status${type ? ` ${type}` : ""}`;
  };

  const parseDecisionSignals = () => {
    const signals = decisionSignalsInput.value
      .split(",")
      .map((signal) => signal.trim())
      .filter(Boolean);
    if (
      signals.length === 0 ||
      signals.some(
        (signal) => !/^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(signal),
      ) ||
      new Set(signals).size !== signals.length
    ) {
      return null;
    }
    return signals;
  };

  const resetDerivedResults = () => {
    latestFit = null;
    fitActions.hidden = true;
    fitContainer.hidden = true;
    decisionActions.hidden = true;
    decisionContainer.hidden = true;
    analyzeFitButton.disabled = false;
    buildDecisionButton.disabled = true;
  };

  const updateDecisionState = () => {
    buildDecisionButton.disabled =
      !idToken || !latestAnalysis || !latestFit || !parseDecisionSignals();
  };

  const updateSubmitState = () => {
    const length = descriptionInput.value.trim().length;
    descriptionCount.textContent = `${length.toLocaleString("es-ES")} / 50.000`;
    submitButton.disabled =
      !idToken ||
      !companyInput.value.trim() ||
      !roleInput.value.trim() ||
      length < MIN_DESCRIPTION_LENGTH;
    updateDecisionState();
  };

  const setSignedOut = (
    message = "Inicia sesión para habilitar el análisis.",
  ) => {
    idToken = null;
    latestAnalysis = null;
    resetDerivedResults();
    fields.disabled = true;
    signOutButton.hidden = true;
    resultContainer.hidden = true;
    dossierActions.hidden = true;
    dossierContainer.hidden = true;
    setStatus(message);
    updateSubmitState();
  };

  const handleCredential = (response) => {
    if (!response || typeof response.credential !== "string") {
      setSignedOut(
        "Google no devolvió una credencial válida. Inténtalo de nuevo.",
      );
      authStatus.classList.add("error");
      return;
    }

    idToken = response.credential;
    fields.disabled = false;
    signOutButton.hidden = false;
    setStatus(
      "Sesión Google lista. La autorización final se valida en el servidor.",
      "success",
    );
    updateSubmitState();
  };

  const initializeGoogleSignIn = (attempt = 0) => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: "signin",
        ux_mode: "popup",
      });
      window.google.accounts.id.renderButton(signInContainer, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "pill",
      });
      return;
    }

    if (attempt < 40) {
      window.setTimeout(() => initializeGoogleSignIn(attempt + 1), 250);
      return;
    }

    setStatus("No se pudo cargar Google Sign-In. Recarga la página.", "error");
  };

  const createResultCard = (title, values) => {
    const card = document.createElement("section");
    card.className = "agent-result-card";

    const heading = document.createElement("h4");
    heading.textContent = title;
    card.append(heading);

    if (!Array.isArray(values) || values.length === 0) {
      const empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "Sin evidencia explícita en la descripción.";
      card.append(empty);
      return card;
    }

    const list = document.createElement("ul");
    values.forEach((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      list.append(item);
    });
    card.append(list);
    return card;
  };

  const renderAnalysis = (analysis, requestId) => {
    resultContainer.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = `Análisis estructurado · Seniority: ${analysis.seniority}`;
    resultContainer.append(heading);

    const requestMeta = document.createElement("p");
    requestMeta.className = "muted";
    requestMeta.textContent = `Trazabilidad: ${requestId || "request ID no disponible"}`;
    resultContainer.append(requestMeta);

    const grid = document.createElement("div");
    grid.className = "agent-result-grid";
    [
      ["Must have", analysis.must_have],
      ["Nice to have", analysis.nice_to_have],
      ["Keywords", analysis.keywords],
      ["Responsabilidades", analysis.responsibilities],
      ["Tecnología", analysis.technology],
      ["Liderazgo", analysis.leadership_expectations],
      ["Expectativas comerciales", analysis.commercial_expectations],
      ["Riesgos", analysis.risk_factors],
    ].forEach(([title, values]) =>
      grid.append(createResultCard(title, values)),
    );

    resultContainer.append(grid);
    resultContainer.hidden = false;
    latestAnalysis = analysis;
    fitActions.hidden = false;
    dossierActions.hidden = false;
  };

  const createScoreMetric = (label, value) => {
    const metric = document.createElement("div");
    metric.className = "agent-score-metric";
    const score = document.createElement("b");
    score.textContent = String(value);
    const caption = document.createElement("span");
    caption.textContent = label;
    metric.append(score, caption);
    return metric;
  };

  const renderFit = (fit, requestId) => {
    fitContainer.replaceChildren();
    const heading = document.createElement("h3");
    heading.textContent = "Fit objetivo";
    const meta = document.createElement("p");
    meta.className = "muted";
    meta.textContent = `Trazabilidad: ${requestId || "request ID no disponible"}`;
    const scores = document.createElement("div");
    scores.className = "agent-score-grid";
    scores.append(
      createScoreMetric("Fit", fit.score),
      createScoreMetric("Confianza de evidencia", fit.confidence),
      createScoreMetric("Recomendación", fit.applicationRecommendation),
    );
    const details = document.createElement("div");
    details.className = "agent-result-grid";
    details.append(
      createResultCard(
        "Fortalezas trazables",
        fit.strengths.map(
          (item) => `${item.requirement}: ${item.evidence}`,
        ),
      ),
      createResultCard(
        "Gaps visibles",
        fit.gaps.map(
          (item) =>
            `${item.classification} · ${item.requirement}: ${item.rationale}`,
        ),
      ),
    );
    fitContainer.append(heading, meta, scores, details);
    fitContainer.hidden = false;
    latestFit = fit;
    decisionActions.hidden = false;
    updateDecisionState();
  };

  const renderDecision = (decision, requestId) => {
    decisionContainer.replaceChildren();
    const heading = document.createElement("h3");
    heading.textContent = "Prioridad calibrada";
    const meta = document.createElement("p");
    meta.className = "muted";
    meta.textContent = `Confianza de calibración: ${decision.calibrationConfidence} · Trazabilidad: ${requestId || "request ID no disponible"}`;
    const scores = document.createElement("div");
    scores.className = "agent-score-grid";
    scores.append(
      createScoreMetric("Fit", decision.fitScore),
      createScoreMetric("Probability", decision.selectionProbability),
      createScoreMetric("Priority", decision.priorityScore),
      createScoreMetric("Acción", decision.recommendation),
    );
    const details = document.createElement("div");
    details.className = "agent-result-grid";
    details.append(
      createResultCard(
        "Señales positivas",
        decision.positiveSignals.map(
          (item) =>
            `+${item.adjustment} · ${item.explanation} · outcome: ${item.outcomeApplicationId}`,
        ),
      ),
      createResultCard(
        "Riesgos y ajustes",
        decision.negativeSignals.map(
          (item) =>
            `${item.adjustment} · ${item.explanation}${item.outcomeApplicationId ? ` · outcome: ${item.outcomeApplicationId}` : ""}`,
        ),
      ),
    );
    decisionContainer.append(heading, meta, scores, details);
    decisionContainer.hidden = false;
  };

  const appendDossierList = (container, title, items) => {
    const section = document.createElement("details");
    section.className = "agent-dossier-section";

    const summary = document.createElement("summary");
    summary.textContent = `${title} (${items.length})`;
    section.append(summary);

    const list = document.createElement("ul");
    items.forEach((value) => {
      const item = document.createElement("li");
      item.textContent = value;
      list.append(item);
    });
    section.append(list);
    container.append(section);
  };

  const renderDossier = (dossier, requestId) => {
    dossierContainer.replaceChildren();

    const heading = document.createElement("h3");
    heading.textContent = `Dossier de evidencia · ${dossier.target.role}`;
    dossierContainer.append(heading);

    const meta = document.createElement("p");
    meta.className = "muted";
    meta.textContent = `Perfil v${dossier.profile.schemaVersion} · ${dossier.profile.lastUpdated} · Trazabilidad: ${requestId || "request ID no disponible"}`;
    dossierContainer.append(meta);

    const warning = document.createElement("p");
    warning.className = "agent-dossier-warning";
    warning.textContent =
      "Este dossier separa evidencia verificada de datos pendientes. No es un CV final.";
    dossierContainer.append(warning);

    appendDossierList(
      dossierContainer,
      "Evidencia verificada",
      dossier.verifiedEvidence.map(
        (item) =>
          `${item.statement} · evidencia: ${item.evidenceIds.join(", ")}`,
      ),
    );
    appendDossierList(
      dossierContainer,
      "Perfil pendiente o desconocido",
      dossier.pendingProfileItems.map(
        (item) =>
          `${item.category}: ${item.value ?? "null"} · ${item.status} · evidencia: ${item.evidenceIds.join(", ") || "sin evidencia"}`,
      ),
    );
    appendDossierList(
      dossierContainer,
      "Cronología profesional",
      dossier.experienceTimeline.map(
        (item) =>
          `${item.organization} — ${item.role} · inicio: ${item.startDate ?? "null"} · fin: ${item.endDate ?? "null"} · ubicación: ${item.location ?? "null"} · ${item.status}`,
      ),
    );
    appendDossierList(
      dossierContainer,
      "Validaciones pendientes",
      dossier.pendingValidation,
    );
    appendDossierList(dossierContainer, "No afirmar", dossier.doNotClaim);

    dossierContainer.hidden = false;
  };

  const errorMessageForStatus = (status) => {
    if (status === 400)
      return "Revisa los campos y la longitud de la descripción.";
    if (status === 401 || status === 403)
      return "La sesión no está autorizada. Inicia sesión de nuevo con la cuenta permitida.";
    if (status === 502 || status === 503)
      return "El analizador no está disponible temporalmente. Inténtalo más tarde.";
    return "No se pudo completar el análisis.";
  };

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const trigger = event.target.closest("[data-agent-job]");
    if (!trigger) return;

    const jobIndex = Number.parseInt(trigger.dataset.agentJob ?? "", 10);
    const job = window.anibalJobs?.[jobIndex];
    if (!job) return;

    companyInput.value = job.company ?? "";
    roleInput.value = job.title ?? "";
    locationInput.value = job.loc ?? "";
    decisionSignalsInput.value = Array.isArray(job.decisionSignals)
      ? job.decisionSignals.join(", ")
      : "";
    resultContainer.hidden = true;
    resetDerivedResults();
    dossierActions.hidden = true;
    dossierContainer.hidden = true;
    latestAnalysis = null;
    updateSubmitState();
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => descriptionInput.focus(), 350);
    setStatus(
      idToken
        ? "Oportunidad seleccionada. Pega la descripción completa para analizarla."
        : "Oportunidad seleccionada. Inicia sesión y pega la descripción completa.",
      idToken ? "success" : "",
    );
  });

  signOutButton.addEventListener("click", () => {
    window.google?.accounts?.id?.disableAutoSelect();
    setSignedOut(
      "Sesión cerrada. El token se eliminó de la memoria de esta página.",
    );
  });

  [companyInput, roleInput, locationInput, descriptionInput].forEach((input) =>
    input.addEventListener("input", updateSubmitState),
  );
  decisionSignalsInput.addEventListener("input", updateDecisionState);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!idToken || submitButton.disabled) return;

    const requestId =
      window.crypto?.randomUUID?.() ?? `radar-${Date.now().toString(36)}`;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 50_000);

    submitButton.disabled = true;
    submitButton.textContent = "Analizando…";
    resultContainer.hidden = true;
    resetDerivedResults();
    dossierActions.hidden = true;
    dossierContainer.hidden = true;
    latestAnalysis = null;
    setStatus("Analizando la descripción. No cierres esta pestaña.");

    try {
      const response = await fetch(ANALYZE_API_URL, {
        method: "POST",
        mode: "cors",
        cache: "no-store",
        referrerPolicy: "strict-origin",
        signal: controller.signal,
        headers: {
          authorization: `Bearer ${idToken}`,
          "content-type": "application/json",
          "x-request-id": requestId,
        },
        body: JSON.stringify({
          company: companyInput.value.trim(),
          role: roleInput.value.trim(),
          location: locationInput.value.trim() || null,
          jobDescription: descriptionInput.value.trim(),
        }),
      });

      const responseBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setSignedOut(errorMessageForStatus(response.status));
          authStatus.classList.add("error");
        } else {
          setStatus(errorMessageForStatus(response.status), "error");
        }
        return;
      }

      renderAnalysis(responseBody, response.headers.get("x-request-id"));
      setStatus(
        "Análisis completado. Revisa la evidencia y los riesgos.",
        "success",
      );
    } catch (error) {
      setStatus(
        error?.name === "AbortError"
          ? "El análisis superó el tiempo máximo. Inténtalo de nuevo."
          : "No se pudo conectar con el Career Agent.",
        "error",
      );
    } finally {
      window.clearTimeout(timeout);
      submitButton.textContent = "Analizar vacante";
      updateSubmitState();
    }
  });

  analyzeFitButton.addEventListener("click", async () => {
    if (!idToken || !latestAnalysis) return;

    const requestId =
      window.crypto?.randomUUID?.() ?? `fit-${Date.now().toString(36)}`;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    analyzeFitButton.disabled = true;
    analyzeFitButton.textContent = "Calculando Fit…";
    fitContainer.hidden = true;
    decisionActions.hidden = true;
    decisionContainer.hidden = true;
    latestFit = null;
    setStatus("Comparando requisitos con evidencia trazable del perfil.");

    try {
      const response = await fetch(FIT_API_URL, {
        method: "POST",
        mode: "cors",
        cache: "no-store",
        referrerPolicy: "strict-origin",
        signal: controller.signal,
        headers: {
          authorization: `Bearer ${idToken}`,
          "content-type": "application/json",
          "x-request-id": requestId,
        },
        body: JSON.stringify({ jobAnalysis: latestAnalysis }),
      });
      const responseBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setSignedOut(errorMessageForStatus(response.status));
          authStatus.classList.add("error");
        } else {
          setStatus(errorMessageForStatus(response.status), "error");
        }
        return;
      }

      renderFit(responseBody, response.headers.get("x-request-id"));
      setStatus(
        "Fit objetivo calculado. Revisa gaps y señales antes de calibrar prioridad.",
        "success",
      );
    } catch (error) {
      setStatus(
        error?.name === "AbortError"
          ? "El Fit superó el tiempo máximo. Inténtalo de nuevo."
          : "No se pudo conectar con Fit Analyzer.",
        "error",
      );
    } finally {
      window.clearTimeout(timeout);
      analyzeFitButton.disabled = false;
      analyzeFitButton.textContent = "Calcular Fit objetivo";
    }
  });

  buildDecisionButton.addEventListener("click", async () => {
    const opportunitySignals = parseDecisionSignals();
    if (!idToken || !latestAnalysis || !latestFit || !opportunitySignals) {
      setStatus(
        "Revisa las señales: deben ser únicas, usar minúsculas y guion bajo.",
        "error",
      );
      return;
    }

    const requestId =
      window.crypto?.randomUUID?.() ?? `decision-${Date.now().toString(36)}`;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    buildDecisionButton.disabled = true;
    buildDecisionButton.textContent = "Calibrando prioridad…";
    decisionContainer.hidden = true;
    setStatus("Separando Fit objetivo de probabilidad práctica.");

    try {
      const response = await fetch(DECISION_API_URL, {
        method: "POST",
        mode: "cors",
        cache: "no-store",
        referrerPolicy: "strict-origin",
        signal: controller.signal,
        headers: {
          authorization: `Bearer ${idToken}`,
          "content-type": "application/json",
          "x-request-id": requestId,
        },
        body: JSON.stringify({
          jobAnalysis: latestAnalysis,
          opportunitySignals,
        }),
      });
      const responseBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setSignedOut(errorMessageForStatus(response.status));
          authStatus.classList.add("error");
        } else {
          setStatus(errorMessageForStatus(response.status), "error");
        }
        return;
      }
      if (responseBody.fitScore !== latestFit.score) {
        setStatus(
          "El Fit de la decisión no coincide con el Fit mostrado. No se presentará el resultado.",
          "error",
        );
        return;
      }

      renderDecision(responseBody, response.headers.get("x-request-id"));
      setStatus(
        "Prioridad calibrada. Los ajustes muestran su outcome y explicación.",
        "success",
      );
    } catch (error) {
      setStatus(
        error?.name === "AbortError"
          ? "La calibración superó el tiempo máximo. Inténtalo de nuevo."
          : "No se pudo conectar con Application Decision.",
        "error",
      );
    } finally {
      window.clearTimeout(timeout);
      buildDecisionButton.textContent = "Calibrar prioridad";
      updateDecisionState();
    }
  });

  buildDossierButton.addEventListener("click", async () => {
    if (!idToken || !latestAnalysis) return;

    const requestId =
      window.crypto?.randomUUID?.() ?? `dossier-${Date.now().toString(36)}`;
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15_000);
    buildDossierButton.disabled = true;
    buildDossierButton.textContent = "Construyendo dossier…";
    dossierContainer.hidden = true;
    setStatus("Organizando evidencia verificada y datos pendientes.");

    try {
      const response = await fetch(DOSSIER_API_URL, {
        method: "POST",
        mode: "cors",
        cache: "no-store",
        referrerPolicy: "strict-origin",
        signal: controller.signal,
        headers: {
          authorization: `Bearer ${idToken}`,
          "content-type": "application/json",
          "x-request-id": requestId,
        },
        body: JSON.stringify({
          target: {
            company: companyInput.value.trim(),
            role: roleInput.value.trim(),
            location: locationInput.value.trim() || null,
          },
          analysis: latestAnalysis,
        }),
      });

      const responseBody = await response.json().catch(() => ({}));
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setSignedOut(errorMessageForStatus(response.status));
          authStatus.classList.add("error");
        } else {
          setStatus(errorMessageForStatus(response.status), "error");
        }
        return;
      }

      renderDossier(responseBody, response.headers.get("x-request-id"));
      setStatus(
        "Dossier trazable completado. Revisa primero los pendientes y las prohibiciones.",
        "success",
      );
    } catch (error) {
      setStatus(
        error?.name === "AbortError"
          ? "El dossier superó el tiempo máximo. Inténtalo de nuevo."
          : "No se pudo conectar con el generador de dossier.",
        "error",
      );
    } finally {
      window.clearTimeout(timeout);
      buildDossierButton.disabled = false;
      buildDossierButton.textContent = "Crear dossier trazable";
    }
  });

  setSignedOut();
  initializeGoogleSignIn();
})();
