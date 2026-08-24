(() => {
  "use strict";

  const API_URL =
    "https://career-agent-api-jd2uqc2g4a-ew.a.run.app/api/analyze-job";
  const GOOGLE_CLIENT_ID =
    "721604659809-betff2smpf2aofiv71fe71gnis54tq73.apps.googleusercontent.com";
  const MIN_DESCRIPTION_LENGTH = 200;

  let idToken = null;

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
    !resultContainer
  ) {
    return;
  }

  const setStatus = (message, type = "") => {
    authStatus.textContent = message;
    authStatus.className = `agent-status${type ? ` ${type}` : ""}`;
  };

  const updateSubmitState = () => {
    const length = descriptionInput.value.trim().length;
    descriptionCount.textContent = `${length.toLocaleString("es-ES")} / 50.000`;
    submitButton.disabled =
      !idToken ||
      !companyInput.value.trim() ||
      !roleInput.value.trim() ||
      length < MIN_DESCRIPTION_LENGTH;
  };

  const setSignedOut = (
    message = "Inicia sesión para habilitar el análisis.",
  ) => {
    idToken = null;
    fields.disabled = true;
    signOutButton.hidden = true;
    resultContainer.hidden = true;
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
    resultContainer.hidden = true;
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
    setStatus("Analizando la descripción. No cierres esta pestaña.");

    try {
      const response = await fetch(API_URL, {
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

  setSignedOut();
  initializeGoogleSignIn();
})();
