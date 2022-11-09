function createUUID() { // https://gist.github.com/ifandelse/3031112
    const s = [];
    const hexDigits = "0123456789abcdef";
    for (let i = 0; i < 36; i++) {
        const debut = Math.floor(Math.random() * 0x10)
        s[i] = hexDigits.substring(debut, debut + 1);
    }
    s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
    const p = (s[19] & 0x3) | 0x8
    s[19] = hexDigits.substring(p, p + 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = "-";
    return s.join("");
}

const monId = createUUID()
let ws = new WebSocket("ws://localhost:8080/ws/" + monId);
ws.onmessage = function(event) {
    const messages = document.getElementById('messages');
    const message = document.createElement('li');
    const content = document.createTextNode(event.data);
    message.appendChild(content);
    messages.appendChild(message);
};

async function chargerProduits(){
    const temp = await fetch('/api/produits')
    return await temp.json()
}

async function peuplerBD(){
    await fetch('/global/peublerBD', {
        method: 'PATCH'
    });
}

function creerFormulaireCommande(produits){
    let formulaire = document.getElementById('formCommander');
    produits.forEach(function(p){
        let parag = document.createElement('p')
        let label =  document.createElement('label');
        label.for = 'produit-' + p.id;
        label.innerText = p.nom + ": " + p.description + " (" + p.prix + "$) ";

        let espace = document.createTextNode('\u00A0\u00A0\u00A0\u00A0');

        let input = document.createElement('input');
        input.type = 'number';
        input.value = '0';
        input.min = '0';
        input.id = 'produit-' + p.id;
        input.name = 'produit-' + p.id;

        parag.append(label, espace,  input);
        formulaire.prepend(parag);
    });
}

async function commander(e){
    e.preventDefault()

    const form = e.currentTarget;
    const data = new FormData(form);
    const plainFormData = Object.fromEntries(data.entries());

    let liste = []
    for(const cle in plainFormData){
        const obj = {};
        obj.id = cle.split('-')[1] * 1;
        obj.quantite = plainFormData[cle] * 1;
        if(obj.quantite > 0)
            liste.push(obj);
    }

	const formDataJsonString = JSON.stringify({'client': monId, 'commande':liste});
    const options = {
        method: 'POST',
        body: formDataJsonString,
        headers: {
			"Content-Type": "application/json",
			"Accept": "application/json"
		}
    }
    await fetch(form.action, options)
}

document.addEventListener("DOMContentLoaded", async function (){
    const btnPeupler = document.getElementById('peupler');
    btnPeupler.addEventListener('click', peuplerBD)
    const produits = await chargerProduits();
    creerFormulaireCommande(produits);

    const formulaire = document.getElementById('formCommander');
    formulaire.addEventListener('submit', await commander)
});


