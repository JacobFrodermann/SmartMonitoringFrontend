// ------------------------------------------------------------------
//  Generelle Funktion für das Filtern einer Tabelle
//  (nicht performant, nur bei kleinen Tabellen zu empfehlen) 
//  Verwendung im html durch <table class="dev-table sortable-table"> und <th onclick="sortTable(columnNumber)">
// ------------------------------------------------------------------
let currentSortColumn = null;
let currentSortDir = 'asc';

/**
 * SORT table column
 * @param {*} n table column to be sorted
 */
function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.getElementsByClassName("sortable-table")[0];
    switching = true;
    dir = currentSortColumn === n && currentSortDir === 'asc' ? 'desc' : 'asc';
    currentSortColumn = n;
    currentSortDir = dir;

    // Pfeile in Header zurücksetzen
    const headers = table.querySelectorAll("th");
    headers.forEach((th, idx) => {
        th.classList.remove("sorted-asc", "sorted-desc");
        if (idx === n) th.classList.add(dir === "asc" ? "sorted-asc" : "sorted-desc");
    });

    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;
            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];
            if (!x || !y) continue;

            let xVal = x.textContent.trim();
            let yVal = y.textContent.trim();
            let xNum = parseFloat(xVal.replace(",", "."));
            let yNum = parseFloat(yVal.replace(",", "."));
            let bothNumeric = !isNaN(xNum) && !isNaN(yNum);

            if (dir === "asc") {
                if ((bothNumeric && xNum > yNum) || (!bothNumeric && xVal.toLowerCase() > yVal.toLowerCase())) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === "desc") {
                if ((bothNumeric && xNum < yNum) || (!bothNumeric && xVal.toLowerCase() < yVal.toLowerCase())) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

/**
 * SEARCH in table
 */
function filterTable() {
    const input = document.getElementById("tableSearch");
    const filter = input.value.toUpperCase();
    var table = document.getElementsByClassName("sortable-table");
    if (!table)
        table = document.getElementById("dataTable");
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) { // Skip header
        let row = tr[i];
        let tds = row.getElementsByTagName("td");
        let match = false;

        for (let j = 0; j < tds.length; j++) {
            let td = tds[j];
            if (td && td.textContent.toUpperCase().indexOf(filter) > -1) {
                match = true;
                break;
            }
        }
        row.style.visibility = match ? "visible" : "collapse";
    }
}