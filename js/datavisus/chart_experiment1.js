// ------------------------------------------------------------------
//  Konfiguration der Charts-Komponente
// ------------------------------------------------------------------
const urlParams = new URLSearchParams(window.location.search);

// Y1/Y2 vom url
const y1 = urlParams.get('y1') || 'pm2_5';
const y2 = urlParams.get('y2');

// Y Achses aufbauen
const yAxes = y2 ? [y1, y2] : [y1];

// Chart Achsen
const chart_options = {
  showWhenNoData: true,
  xAxisAttrName: 'ts',
  yAxisAttrNames: yAxes,
  plugins: new Map([
    ['Linechart', { id: 'Linechart', active: true }]
  ])
};

// Farben
const collection = urlParams.get('data_collection') || '';

chart_options.sourceColors = {
  pm2_5:  '#00A3FF',
  pm10_0: '#FF2E2E',
  temp1:  '#00C853',

  [`${collection}_pm2_5`]:  '#00A3FF',
  [`${collection}_pm10_0`]: '#FF2E2E',
  [`${collection}_temp1`]:  '#00C853'
};

chart_options.attrColors = chart_options.sourceColors;

window.chart_options = chart_options;


// 
// // ------------------------------------------------------------------
//  Funktionen zum Anzeigen und Filtern bestimmter Werte in den Charts
// ------------------------------------------------------------------
const params     = new URLSearchParams(window.location.search);
const COLLECTION = params.get('data_collection');
const STORAGE    = 'smartmonitoring';
const API_BASE   = `${window.location.origin}/SmartDataAirquality/smartdata/collection`;

function getAllowedNames() {
  const gp = (typeof SWAC_config !== 'undefined' && SWAC_config.globalparams)
    ? SWAC_config.globalparams
    : {};

  return [
    gp.display_value_1,
    gp.display_value_2,
    gp.display_value_5
  ].filter(Boolean);
}

const displayNames = {
  pm2_5:  'pm2_5_1',
  pm10_0: 'pm10_0_1',
  temp1:  'temp1_1'
};


function translateSelectOptions() {
  if (window.swac && window.swac.lang && typeof window.swac.lang.translateAll === 'function') {
    const opts = document.querySelectorAll('#y1-select option, #y2-select option');
    window.swac.lang.translateAll(opts);
  }
}

document.addEventListener('DOMContentLoaded', () => {
  loadAttributesAndFillCompareDropdowns();
});


// Attribute laden und Dropdowns ausfüllen
async function loadAttributesAndFillCompareDropdowns() {

  const y1Select = document.getElementById('y1-select');
  const y2Select = document.getElementById('y2-select');

  if (!y1Select || !y2Select) return;

  //Keine Collection -> Fehlermeldung für Y1&Y2
  if (!COLLECTION) {
    y1Select.innerHTML = '<option value="" swac_lang="noCollection"></option>';
    y2Select.innerHTML = '<option value="" swac_lang="noSelection"></option>';
    translateSelectOptions();
    return;
}

y1Select.innerHTML = '<option swac_lang="loading"></option>';
y2Select.innerHTML = '<option swac_lang="noSelection"></option>';
translateSelectOptions();

  try {
    const url =
      `${API_BASE}/${encodeURIComponent(COLLECTION)}?storage=${encodeURIComponent(STORAGE)}`;

    const response = await fetch(url, { headers: { Accept: 'application/json' } });

    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);

    const data = await response.json();
    const attrs = ensureAttributes(data);

    //Filtern nur nach den allowedNames 
    const map = new Map(attrs.map(a => [a.name, a]));
    const allowedNames = getAllowedNames();
    const filtered = allowedNames.map(n => map.get(n)).filter(Boolean);


    //Fehlermeldung wenn keine gültigen Attribute gefunden
    if (!filtered.length) {
      y1Select.innerHTML =
        '<option value="" swac_lang="noAttributesFound"></option>';
      y2Select.innerHTML =
        '<option value="" swac_lang="noAttributesFound"></option>';
      translateSelectOptions();
      return;
    }

    const currentY1 = params.get('y1') || allowedNames[0] || '';
    const currentY2 = params.get('y2');

    y1Select.innerHTML = '<option value="" swac_lang="noSelection"></option>';
    y2Select.innerHTML = '<option value="" swac_lang="noSelection"></option>';

    for (const attr of filtered) {
      const langKey = displayNames[attr.name] || attr.name;

      // Y1
      const opt1 = document.createElement('option');
      opt1.value = attr.name;                 
      opt1.setAttribute('swac_lang', langKey);
      if (attr.name === currentY1) opt1.selected = true;
      y1Select.appendChild(opt1);

      // Y2
      const opt2 = document.createElement('option');
      opt2.value = attr.name;                
      opt2.setAttribute('swac_lang', langKey);
      if (attr.name === currentY2) opt2.selected = true;
      y2Select.appendChild(opt2);
    }

  } catch (err) {
    console.error(err);
    y1Select.innerHTML = '<option swac_lang="loadError"></option>';
    y2Select.innerHTML = '<option swac_lang="loadError"></option>';
    translateSelectOptions();
  }
}

//Sichergehen, dass data.attributes immer ein Array zurück gibt.
function ensureAttributes(data) {
  return Array.isArray(data.attributes) ? data.attributes : [];
}

// chart_options 
function updateChartYAxes(attr1, attr2, urlObj) {
  if (!attr1) return urlObj;

  //chart_options für die Achese defenieren
  chart_options.yAxisAttrNames = attr2 ? [attr1, attr2] : [attr1];

  const url = urlObj || new URL(window.location.href);
  url.searchParams.set('y1', attr1);

  if (attr2) url.searchParams.set('y2', attr2);
  else url.searchParams.delete('y2');

  return url;
}

console.log("chart_dynamic.js loaded");

//Zeitangaben und Button
document.addEventListener('DOMContentLoaded', () => {
  initTimeRangeControls();
  waitForChartAndApplyDefaultLastHour();
});

function getMainChartInstance() {
  const canvas = document.querySelector('#chart canvas');
  if (!canvas || typeof window.Chart === 'undefined' || typeof Chart.getChart !== 'function') {
    return null;
  }
  return Chart.getChart(canvas) || null;
}

//Zeitspanne für den Chart setzen
function setChartTimeRange(startDate, endDate) {
  const chart = getMainChartInstance();
  if (!chart || !startDate || !endDate) return;

  const min = startDate.getTime ? startDate.getTime() : +startDate;
  const max = endDate.getTime ? endDate.getTime() : +endDate;

  if (!chart.options.scales) chart.options.scales = {};
  if (!chart.options.scales.x) chart.options.scales.x = {};

  chart.options.scales.x.min = min;
  chart.options.scales.x.max = max;

  chart.update();
}

function initTimeRangeControls() {
  const startInput = document.getElementById('start-datetime');
  const endInput   = document.getElementById('end-datetime');
  const confirmBtn = document.getElementById('confirm-range');

  if (!startInput || !endInput || !confirmBtn) return;

  confirmBtn.addEventListener('click', () => {
    const y1Select = document.getElementById('y1-select');
    const y2Select = document.getElementById('y2-select');

    const attr1 = y1Select ? y1Select.value : null;
    const attr2 = y2Select ? (y2Select.value || null) : null;

    const startVal = startInput.value;
    const endVal   = endInput.value;

    const url = new URL(window.location.href);

    if (attr1) {
      updateChartYAxes(attr1, attr2, url);
    }

    //nur wenn Zeitangabe erfolgt, wird in URL gescpeichrt
    if (startVal && endVal) {
      const startDate = new Date(startVal);
      const endDate   = new Date(endVal);

      if (isNaN(startDate) || isNaN(endDate)) {
        console.warn('Ungültiges Datumsformat.');
        return;
      }

      url.searchParams.set('from', startDate.toISOString());
      url.searchParams.set('to',   endDate.toISOString());
    } else {
      url.searchParams.delete('from');
      url.searchParams.delete('to');
    }

    window.location.replace(url.toString());
  });
}

//Datum Übergeben und das passende Format zurückbekommen
function formatForDatetimeLocal(date) {
  const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm"
}


function waitForChartAndApplyDefaultLastHour(maxTries = 50) {
  const chart = getMainChartInstance();

  if (!chart) {
    if (maxTries <= 0) return;
    setTimeout(() => waitForChartAndApplyDefaultLastHour(maxTries - 1), 200);
    return;
  }

  const labels = chart.data && chart.data.labels ? chart.data.labels : null;
  if (!labels || !labels.length) return;

  // Wenn form/to in url , dann werden verwendt
  const fromParam = params.get('from');
  const toParam   = params.get('to');

  if (fromParam && toParam) {
    const startDate = new Date(fromParam);
    const endDate   = new Date(toParam);

    if (!isNaN(startDate) && !isNaN(endDate)) {
      setChartTimeRange(startDate, endDate);

      const startInput = document.getElementById('start-datetime');
      const endInput   = document.getElementById('end-datetime');

      if (startInput && endInput) {
        startInput.value = formatForDatetimeLocal(startDate);
        endInput.value   = formatForDatetimeLocal(endDate);
      }
      return;
    }
  }

  //DESC dann das erste Element das neueste.
  let endDate = new Date(labels[0]);

  if (isNaN(endDate)) {
    const ds = chart.data.datasets && chart.data.datasets[0];
    if (ds && ds.data && ds.data.length) {
      const firstPoint = ds.data[0];
      if (firstPoint && firstPoint.ts) endDate = new Date(firstPoint.ts);
    }
  }

  if (isNaN(endDate)) {
    console.warn('Konnte das letzte Zeitlabel nicht als Datum interpretieren.');
    return;
  }

  const oneHourMs     = 60 * 60 * 1000;
  const lastHourStart = new Date(endDate.getTime() - oneHourMs);
  let   effectiveStart = lastHourStart;

  //DESC: Die letzten Elemente sind die ältesten
  for (let i = labels.length - 1; i >= 0; i--) {
    const t = new Date(labels[i]);
    if (isNaN(t)) continue;
    if (t >= lastHourStart && t <= endDate) {
      effectiveStart = t;
      break;
    }
  }

  setChartTimeRange(effectiveStart, endDate);

  const startInput = document.getElementById('start-datetime');
  const endInput   = document.getElementById('end-datetime');

  if (startInput && endInput) {
    startInput.value = formatForDatetimeLocal(effectiveStart);
    endInput.value   = formatForDatetimeLocal(endDate);
  }
}