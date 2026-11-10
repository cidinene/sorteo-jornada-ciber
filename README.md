# Sorteo del décimo · Demo de concienciación

Jornada de Ciberseguridad para la Administración Pública · 12 de noviembre de 2026

- **Móviles (QR):** `https://cidinene.github.io/sorteo-jornada-ciber/`
- **Proyector:** `https://cidinene.github.io/sorteo-jornada-ciber/admin.html?key=TU_CLAVE`

Las páginas están en GitHub Pages. Los registros se guardan en **una hoja de Google tuya** mediante Apps Script (`apps-script/Codigo.gs`).

## Puesta en marcha (unos 10 minutos)

1. Crea una hoja de cálculo nueva en Google Drive, por ejemplo «Sorteo jornada».
2. Menú **Extensiones → Apps Script**. Borra lo que haya y pega el contenido de `apps-script/Codigo.gs`.
3. En la línea `const ADMIN_KEY = 'cambia-esta-clave';` pon tu clave y guarda (icono del disquete).
4. **Implementar → Nueva implementación**. En el engranaje elige **Aplicación web**:
   - Ejecutar como: **Yo**
   - Quién tiene acceso: **Cualquier usuario**
5. Pulsa **Implementar** y autoriza los permisos. Google avisará de que la app «no está verificada»: pulsa **Configuración avanzada → Ir a…**, porque el script es tuyo.
6. Copia la **URL de la aplicación web**, la que termina en `/exec`.
7. En GitHub, edita `config.js` y pega esa URL entre las comillas. Guarda con *Commit changes*. GitHub Pages tarda un minuto en actualizarse.
8. Abre el proyector con `admin.html?key=TU_CLAVE`.

> Si cambias algo en `Codigo.gs`, ve a **Implementar → Gestionar implementaciones → editar → Versión: nueva** para que la URL siga siendo la misma.

## Durante la jornada

Teclas en el proyector: **1** QR y registro · **2** revelar · **3** sorteo de las 10 participaciones · **H** ocultar botones · **F** pantalla completa.

| Momento | Acción |
|---|---|
| 9:00 Recepción | Proyecta el QR (tecla **1**). |
| 12:00 Descanso | Recuerda el sorteo. |
| Cierre | Tecla **2** (revelar) y después tecla **3** (sortear). |
| Al terminar | **Borrar datos técnicos**: se conservan nombre, correo y ganadores para entregar las participaciones. |

Los registros se ven en directo en la hoja. La columna `ganador` indica el número de participación.

## Qué se recoge

Con «Aceptar todo» se recogen la IP (consultada a api.ipify.org desde el propio móvil), el modelo, el sistema, el navegador, la pantalla, los idiomas, la zona horaria, los núcleos, la memoria, la GPU, la conexión, la batería y el modo oscuro. También el tiempo que tardaron en aceptar y si abrieron las condiciones. Todo sale de APIs estándar del navegador, sin pedir permisos.

Quien rechaza participa igual y solo deja su nombre y su correo. Las condiciones (punto 4) describen exactamente lo que se recoge.

## Antes del día

1. Prueba con un Android y un iPhone usando sus datos móviles.
2. En la hoja, borra las filas de prueba o pulsa **Reiniciar** en el proyector.
3. Comprueba con el DPD de la organización los plazos del punto 7 de las condiciones.

## Límites

Apps Script de una cuenta gratuita aguanta sin problema a 100–200 asistentes: los móviles consultan el estado cada 10–13 segundos. Por eso la revelación y el resultado del sorteo pueden tardar unos segundos en aparecer en cada móvil.
