# Prompt maestro — Fase 3 Conectemos (experiencia cliente + productos + panel)

Copia esto en cualquier terminal Grok que trabaje el repo de Conectemos.

## Qué quiere el dueño

Tras registrarse: bienvenida, conocer productos (crédito personal, tarjetas de crédito y débito, cuenta empresarial). Aún no tiene productos contratados.

El menú no debe mostrar lo que solo aplica a clientes ya autorizados.

Cuando se autoriza el crédito (panel admin O automáticamente al terminar la hora de revisión) y el usuario vuelve a iniciar sesión: “Felicidades, fue autorizado”, se creó una cuenta digital temporal para recibir el préstamo, y se complementa con fondo de ahorro y su pago.

Estudio socioeconómico: unificar vivienda, alimentación, servicios y transporte en un solo gasto; ejemplos en los recuadros; domicilio = residencia actual; código postal primero para autollenar municipio y estado.

Preguntar si conoce su estatus de buró, créditos actuales, crédito de autos, deudas y referencias.

Subpáginas de productos. Para contratar, primero cuenta básica (explicarlo).

Quitar “DEMO” y “Valor registrado por la financiera. No es un saldo bancario ni dinero retirable”.

Móvil de `/mi-cuenta` con look de banca (estilo BBVA en estructura, paleta Conectemos).

Panel: agregar/quitar productos; en cada usuario cambiar monto, bloquear/no disponible, mensaje al intentar abrir; historial de contratado/cancelado.

No romper lo existente.

## Piezas ya listas

- Prisma: Product, ClientProduct, ClientProductEvent, DigitalAccount, SavingsFund, User.welcomeSeenAt/approvalSeenAt, Study.monthlyExpenses/autoCredits/knowsBureau/bureauStatus
- `grantAuthorizedCredit` / `maybeAutoApprove` en `src/lib/credit-grant.ts`
- Catálogo seed `src/lib/product-catalog.ts`
- CP México `ZipFill` + `/api/cp/[cp]`

## Rutas objetivo

- `/mi-cuenta/bienvenida`
- `/mi-cuenta/autorizado`
- `/mi-cuenta/productos` y `/mi-cuenta/productos/[slug]`
- `/mi-cuenta/cuenta-digital`
- `/mi-cuenta/ahorro` (fondo + comprobante)
- `/admin/productos`
- Tab productos en `/admin/clientes/[id]`
