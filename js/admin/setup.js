window["adm_configuration_options"] = {
    customAfterAddSet: function (set, repeateds) {
        // Check if datasource is reachable
        if (set.url.includes('/smartdata/')) {
            let url = set.url.split('/smartdata/');
            fetch(url[0]).then(function (res) {
                if (res.ok) {
                    for (let curRep of repeateds) {
                        curRep.style.border = '1px solid green';
                    }
                } else {
                    throw 'Returend with status ' + res.status;
                }
            }).catch(function (err) {
                for (let curRep of repeateds) {
                    curRep.style.border = '1px solid red';
                    let errNode = document.createElement('p');
                    errNode.innerHTML = '<div class="uk-alert-danger" uk-alert><a href class="uk-alert-close" uk-close></a><p>This datasource can not be reached.</p></div>';
                    curRep.appendChild(errNode);
                }
            });
        } else {
            console.log('Could not check ' + set.url);
        }
    }
};