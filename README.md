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

```bash
npm test
npm run typecheck
```
