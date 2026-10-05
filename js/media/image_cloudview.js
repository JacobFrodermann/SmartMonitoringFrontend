async function renderDayKeogramToCanvas(ts, fieldName, canvasSelector) {

// 1. Parameter auslesen
    const params = new URLSearchParams(window.location.search);
    const collectionMedia = params.get("collection_media");

// 2. Tagesgrenzen setzen
    const day = ts.substring(0, 10);
    const tsStart = day + "T00:00:00";
    const tsEnd = day + "T23:59:59";

// 3. Basis-URL dynamisch aus aktueller Domain erzeugen
    const baseUrl = window.location.origin.replace(/\/$/, "")
            + "/SmartDataHELIOS/smartdata/records/";

// 4. API-URL zusammenbauen
    const url =
            baseUrl + collectionMedia
            + "?storage=smartmonitoring"
            + "&filter=ts,gt," + tsStart
            + "&filter=ts,lt," + tsEnd
            + "&includes=" + fieldName + ",ts";

    console.log("API-URL:", url);


    const response = await fetch(url);
    const data = await response.json();

    let recList = data.records || [];
    if (recList.length === 0)
        return;

    recList.sort((a, b) => a.ts.localeCompare(b.ts));

    const canvas = document.querySelector(canvasSelector);
    const ctx = canvas.getContext("2d");

    // Erste PNG laden
    const firstImg = await loadImageFromBase64(recList[0][fieldName]);
    const w = firstImg.width;
    const h = firstImg.height;
    console.log('TEST first image width: ' + w + " height: " + h);

    // AUTOMATISCHE ERKENNUNG:
    // - Wenn Bild breiter als hoch → East–West (Zeile)
    // - Wenn Bild höher als breit → North–South (Spalte)
    let mode = (w > h) ? "EW" : "NS";

    if (mode === "NS") {
        console.log('TEST columns');
        // Spalten nebeneinander
        canvas.width = recList.length * w;
        canvas.height = h;
        canvas.style.height = '100 px';
    } else {
        console.log('TEST rows');
        // Zeilen untereinander
        canvas.width = w;
        canvas.height = recList.length * h;
    }
    console.log("TEST width: " + canvas.width + " height: " + canvas.height);
    canvas.style.imageRendering = "pixelated";
    canvas.style.background = "#222";
    canvas.style.border = "2px solid red";

    for (let i = 0; i < recList.length; i++) {
        const rec = recList[i];
        const img = await loadImageFromBase64(rec[fieldName]);

        if (mode === "NS") {
            // Spalten nebeneinander
            ctx.drawImage(img, i * w, 0);
        } else {
            // Zeilen untereinander
            ctx.drawImage(img, 0, i * h);
        }

        if (rec.ts === ts) {
            ctx.strokeStyle = "yellow";
            ctx.lineWidth = 2;

            if (mode === "NS") {
                ctx.strokeRect(i * w, 0, w, h);
            } else {
                ctx.strokeRect(0, i * h, w, h);
            }
        }
    }
}

function loadImageFromBase64(base64) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = "data:image/png;base64," + base64;
    });
}

async function getFirstImageOfNextDay(collectionMedia, fieldName, nextDayStr) {

    const url = window.location.origin.replace(/\/$/, "") +
            "/SmartDataHELIOS/smartdata/records/" + collectionMedia +
            "?storage=smartmonitoring" +
            "&filter=ts,gt," + nextDayStr + "T00:00:00" +
            "&filter=ts,lt," + nextDayStr + "T23:59:59" +
            "&order=ts,asc" +
            "&limit=1" +
            "&includes=id,ts";

    const response = await fetch(url);
    const data = await response.json();

    if (!data.records || data.records.length === 0) {
        console.warn("Kein Bild für nächsten Tag gefunden:", nextDayStr);
        return null;
    }

    return data.records[0].id;
}

async function getLastImageOfPreviousDay(collectionMedia, fieldName, prevDayStr) {

    const url = window.location.origin.replace(/\/$/, "") +
            "/SmartDataHELIOS/smartdata/records/" + collectionMedia +
            "?storage=smartmonitoring" +
            "&filter=ts,gt," + prevDayStr + "T00:00:00" +
            "&filter=ts,lt," + prevDayStr + "T23:59:59" +
            "&order=ts,desc" +
            "&limit=1" +
            "&includes=id,ts";

    const response = await fetch(url);
    const data = await response.json();

    if (!data.records || data.records.length === 0) {
        console.warn("Kein Bild für vorherigen Tag gefunden:", prevDayStr);
        return null;
    }

    return data.records[0].id;
}


document.addEventListener(
        'swac_Component_image_cloudview_lastSetFromRequestAdded',
        async function (evt) {

            const params = new URLSearchParams(window.location.search);
            const collectionMedia = params.get("collection_media");
            const id = params.get("id");

            const tsElem = document.querySelector(".current_ts_" + id);
            if (!tsElem)
                return;

            const ts = tsElem.getAttribute("data-ts");
            if (!ts)
                return;

            // Tages-Keogramme als Canvas-Bilder rendern
            await renderDayKeogramToCanvas(ts, "keogram_column_png", "#day_kcol_canvas_" + id);
            await renderDayKeogramToCanvas(ts, "keogram_line_png", "#day_kline_canvas_" + id);
            await renderDayKeogramToCanvas(ts, "dynkeogram_ns_png", "#day_dynkeo_ns_canvas_" + id);
            await renderDayKeogramToCanvas(ts, "dynkeogram_ew_png", "#day_dynkeo_ew_canvas_" + id);
            await renderDayKeogramToCanvas(ts, "dynkeogram_azel_png", "#day_dynkeo_azel_canvas_" + id);

            // Aktuelle ID aus URL holen
            const currentId = parseInt(params.get("id"), 10);

            const fieldName = "";

            const currentDate = new Date(ts);
            // Nächsten Tag berechnen
            const nextDate = new Date(currentDate.getTime() + 24 * 60 * 60 * 1000);
            const nextDayStr = nextDate.toISOString().substring(0, 10);
            const nextDayId = await getFirstImageOfNextDay(collectionMedia, fieldName, nextDayStr);
// Vorheriger Tag
            const prevDate = new Date(new Date(ts).getTime() - 24 * 60 * 60 * 1000);
            const prevDayStr = prevDate.toISOString().substring(0, 10);
            const prevDayId = await getLastImageOfPreviousDay(collectionMedia, fieldName, prevDayStr);

// Basis-URL ohne id-Parameter
            const baseUrl = window.location.origin + window.location.pathname + "?collection_media=" + collectionMedia;

// Links erzeugen
            const navHtml = `
    <div class="uk-margin-small uk-text-center">
        <a href="${baseUrl}&id=${prevDayId}" class="uk-button uk-button-default uk-margin-small">◀ vorheriges Bild</a>
        <a href="${baseUrl}&id=${nextDayId}" class="uk-button uk-button-default uk-margin-small">nächstes Bild ▶</a>
        <br>
        <a href="${baseUrl}&id=${prevDayId}" class="uk-button uk-button-secondary uk-margin-small">◀ vorheriger Tag</a>
        <a href="${baseUrl}&id=${nextDayId}" class="uk-button uk-button-secondary uk-margin-small">nächster Tag ▶</a>
    </div>
`;

// Unter dem All-Sky-Image einfügen
            const imgContainer = document.querySelector(".allsky_image_container_" + currentId);
            console.log('TEST img', imgContainer);
            if (imgContainer) {
                imgContainer.insertAdjacentHTML("afterend", navHtml);
            }

        }
);