var sourcestable_options = {
    plugins: new Map()
};
sourcestable_options.plugins.set('TableFilter', {
    id: 'TableFilter',
    active: true
});

document.addEventListener('swac_sourcestable_repeatedForSet', function (evt) {
    console.log('TEST', evt.detail);
    let ooTpl = evt.detail.repeateds[0].querySelector('.repeatForOo');
    for (let curOo of evt.detail.set.tbl_observedobject) {
        let curOoElem = ooTpl.cloneNode(true);
        curOoElem.classList.remove('swac_dontdisplay');
        curOoElem.classList.remove('repeatForOo');
        replacePlaceholders(curOoElem, curOo);
        ooTpl.parentElement.appendChild(curOoElem);
    }
});

function replacePlaceholders(element, data) {
    const html = element.innerHTML;

    const replaced = html.replace(/\[([^\]]+)\]/g, (match, key) => {
        // Wenn Wert existiert → ersetzen
        if (data[key] !== undefined && data[key] !== null) {
            return data[key];
        }
        // Wenn kein Wert existiert → entfernen
        return "";
    });

    element.innerHTML = replaced;

}
