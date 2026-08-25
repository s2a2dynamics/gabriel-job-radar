(() => {
  "use strict";

  const ME_API_URL =
    "https://career-agent-api-jd2uqc2g4a-ew.a.run.app/api/me";
  const GOOGLE_CLIENT_ID =
    "721604659809-betff2smpf2aofiv71fe71gnis54tq73.apps.googleusercontent.com";

  let idToken = null;
  const signIn = document.getElementById("google-signin");
  const signOut = document.getElementById("signout");
  const status = document.getElementById("status");
  const memberPanel = document.getElementById("member");
  const memberName = document.getElementById("member-name");
  const profileStatus = document.getElementById("profile-status");
  const nextStep = document.getElementById("next-step");
  const openAgent = document.getElementById("open-agent");

  const signedOut = (message = "Inicia sesión con tu cuenta invitada.") => {
    idToken = null;
    signOut.hidden = true;
    memberPanel.hidden = true;
    openAgent.hidden = true;
    status.textContent = message;
  };

  const handleCredential = async (credentialResponse) => {
    if (typeof credentialResponse?.credential !== "string") {
      signedOut("Google no devolvió una credencial válida.");
      return;
    }
    idToken = credentialResponse.credential;
    signOut.hidden = false;
    status.textContent = "Validando tu espacio privado…";

    try {
      const requestId =
        window.crypto?.randomUUID?.() ?? `family-${Date.now().toString(36)}`;
      const response = await fetch(ME_API_URL, {
        method: "GET",
        mode: "cors",
        cache: "no-store",
        referrerPolicy: "strict-origin",
        headers: {
          authorization: `Bearer ${idToken}`,
          "x-request-id": requestId,
        },
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        signedOut(
          response.status === 403
            ? "Esta cuenta todavía no pertenece a la beta familiar."
            : "No se pudo validar la sesión.",
        );
        return;
      }

      memberName.textContent = body.displayName;
      profileStatus.textContent =
        body.profileStatus === "ready" ? "Validado" : "Pendiente";
      memberPanel.hidden = false;
      if (body.profileStatus === "ready") {
        status.textContent = "Identidad y espacio verificados.";
        nextStep.textContent =
          "Ya puedes analizar vacantes usando exclusivamente tu Master Profile.";
        openAgent.hidden = false;
      } else {
        status.textContent = "Tu espacio privado está preparado.";
        nextStep.textContent =
          "Falta validar fuentes y claims antes de habilitar análisis. No se inferirá información desde el Radar.";
        openAgent.hidden = true;
      }
    } catch {
      signedOut("No se pudo conectar con Career Agent.");
    }
  };

  const initializeGoogle = (attempt = 0) => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
      });
      window.google.accounts.id.renderButton(signIn, {
        type: "standard",
        theme: "outline",
        size: "large",
        shape: "pill",
      });
      return;
    }
    if (attempt < 40) {
      window.setTimeout(() => initializeGoogle(attempt + 1), 250);
      return;
    }
    status.textContent = "No se pudo cargar Google Sign-In.";
  };

  signOut.addEventListener("click", () => {
    window.google?.accounts?.id?.disableAutoSelect();
    signedOut("Sesión cerrada; el token se eliminó de la memoria.");
  });
  signedOut();
  initializeGoogle();
})();
