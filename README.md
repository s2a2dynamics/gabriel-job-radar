# Gabriel Job Radar

Dashboard permanente de oportunidades profesionales para Gabriel Suárez.

Áreas prioritarias: Data Science / Data & AI, Quantitative Research, Scientific Computing, Optimization, Data Engineering y Quant Software Engineering.

## Capas

- `index.html`: radar, recomendadas y plan de acción diario.
- `preparacion.html`: centro de preparación específica por candidatura.
- `data/opportunities.json`: radar completo.
- `data/recommended.json`: Top 10 diario.
- `data/action-plan.json`: agenda diaria.
- `data/application-packs.json`: dossiers ATS, CV, TFG/TFM, gaps, pitch, preguntas y checklist.

La actualización diaria debe priorizar fuentes oficiales y retirar o degradar oportunidades cuando la vacante ya no aparezca en el portal oficial.

## Aníbal Career Agent

`anibal/` incorpora un análisis de vacantes bajo demanda protegido por Google
Sign-In. El radar público sigue siendo visible sin autenticación; solo la llamada
al Career Agent requiere una cuenta autorizada. El ID token vive únicamente en
memoria durante la pestaña y nunca se guarda en almacenamiento del navegador.
Tras un análisis correcto, el usuario puede crear explícitamente un dossier que separa
evidencias verificadas, cronología incompleta, validaciones pendientes y afirmaciones prohibidas.
El dossier tampoco se persiste ni genera texto profesional libre.

Career Agent v1.1 añade dos pasos explícitos posteriores: Fit objetivo y prioridad calibrada.
La decisión muestra Fit, selection probability, priority y cada ajuste trazable. Las señales se
revisan antes de enviarse; solo tres oportunidades documentadas tienen un prefill curado y las
demás quedan en blanco, sin inferencia por empresa o familia AI.

## Beta familiar

`family/` resuelve primero la identidad contra `/api/me` y muestra únicamente el workspace del
miembro autenticado. Aníbal conserva su perfil validado; Gabriel permanece en
`onboarding_pending` hasta aportar fuentes aprobadas y confirmar sus claims. El navegador no puede
seleccionar un workspace, no accede directamente a Firestore y no persiste el token.

```bash
npm test
npm run typecheck
```
