# BITÁCORA — 2026-08

## 2026-08-24 — Career Agent en radar de Aníbal

**Estado al inicio**: radar público estático sin autenticación ni análisis asistido.

### Qué se hizo
- Integrado panel responsive con Google Sign-In y prefill desde cada vacante.
- La descripción se analiza solo por acción explícita; el token queda solo en memoria.
- Tests 3/3, typecheck, desktop/móvil y flujo autenticado de producción: PASS.

### Decisiones tomadas
- **Radar público**: consultar vacantes no requiere login; únicamente el análisis usa auth.

### Pendiente / Próximos pasos
- [ ] Diseñar el dossier de candidatura con evidencia y estados de validación explícitos.

## 2026-08-24 — Dossier trazable publicado

**Estado al inicio**: análisis protegido visible; dossier aún pendiente.

### Qué se hizo
- Añadida acción explícita posterior al análisis y render seguro sin persistencia.
- UI separa evidencia, pendientes, cronología, validaciones y afirmaciones prohibidas.
- Tests 4/4; producción escritorio/móvil y consola: PASS.

### Decisiones tomadas
- **No es un CV**: el radar muestra el inventario de evidencia antes de generar documentos.

### Pendiente / Próximos pasos
- [x] Validar fuentes y publicar Fit Analyzer con decisión calibrada trazable.

## 2026-08-25 — Career Agent v1.1 publicado

**Estado al inicio**: Radar con Job Analysis y dossier; sin Fit ni prioridad calibrada.

### Qué se hizo
- Añadidos pasos explícitos Fit → Decision, scores y ajustes con trazabilidad visible.
- Señales curadas solo para Telefónica, KPMG y Accenture; el resto queda sin inferencia.
- PR #3 publicado; tests 6/6 y KPMG producción 77/62/72 desktop/móvil: PASS.

### Decisiones tomadas
- **Token en memoria**: no cambia auth ni persistencia; el Radar público sigue abierto.

### Pendiente / Próximos pasos
- [ ] Añadir outcomes reales y mantener baja la confianza mientras haya pocas muestras.

## 2026-08-25 — Portal de acceso familiar

**Estado al inicio**: Radar de Aníbal autenticado; sin entrada común ni estado de Gabriel.

### Qué se hizo
- Publicado `/family/` con contexto resuelto por `/api/me`, sin selector de workspace.
- Aníbal muestra perfil validado; Gabriel queda `onboarding_pending` sin claims inferidos.
- PR #4, tests 9/9, escritorio 1512 px y móvil 390×844 sin overflow: PASS.

### Decisiones tomadas
- **Token en memoria**: la web no consulta Firestore ni persiste identidad o candidatura.

### Pendiente / Próximos pasos
- [ ] Confirmar correo Google de Gabriel antes de habilitar su membresía.

## 2026-08-28 — Radar Gabriel: verificación estricta + C1

### Qué se hizo
- Revalidación contra páginas oficiales activas de CERN, Optiver, Jane Street, Leversys e IMC.
- Incorporadas dos oportunidades nuevas y postulables: **IMC Graduate Quant Researcher — Digital Assets (Zug)** e **Intropic Quantitative Analyst (Client Solutions) (London)**.
- Retirado de recomendadas **IMC Graduate Software Engineer 2027**: exige estar en último año y Gabriel terminó el Máster en julio de 2026.
- Actualizado el perfil con **English C1 certified**: el inglés deja de ser gap y pasa a ser fortaleza; la preparación se concentra en comunicación técnica y entrevistas.
- Actualizados `daily-verified.json`, `recommended.json`, `action-plan.json`, `application-packs.json` e `interview-simulations.json` en `main`.

### Prioridades del día
1. CERN Full-Stack Software Engineer 199 — deadline 02/09.
2. Optiver Graduate Quantitative Researcher 2027 Start.
3. IMC Graduate Quant Researcher — Digital Assets (Zug).

### Deadlines cercanos
- CERN Data & Reporting Specialist — **30/08/2026**: aplicar solo si puede demostrar SQL sólido.
- CERN Full-Stack 199 — **02/09/2026**.
- CERN 207/208 — **09/09/2026**.
- Optiver Career Kickstarter Tech — **13/09/2026 17:00 CET**.
