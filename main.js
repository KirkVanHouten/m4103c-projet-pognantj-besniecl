document.getElementById("btn-lancer-recherche").onclick = ()=>{
    let valeurInput = document.querySelector('#bloc-recherche input').value;
    if(valeurInput!=""){
        recherche(valeurInput,"");
    }else{
        recherche("","onSale=1&sortBy=recent");
    }
}



var doc = document.getElementById('bloc-resultats');

window.onload = function(){
    recherche("","onSale=1&sortBy=recent");
}

async function recherche(title="", filter=""){
    document.getElementById('loading').hidden=false;
    doc.innerHTML = '';
    let res;
    try{
        if(title == ""){
            res = await fetch('https://www.cheapshark.com/api/1.0/deals?'+filter);
        } else {
            res = await fetch('https://www.cheapshark.com/api/1.0/deals?'+filter+"title="+title);
        }
        document.getElementById('loading').hidden=true;
        let resJSON = manageErrors(res);
        resJSON.then(function(res){
            if(res.length==0){
                noResult();
            } else {
                afficheJeux(res);
            }
        })
    }
    catch(error){
        noResult();
    }
}

function manageErrors(response){
    if(!response.ok){
        throw Error(response.statusText);
    }
    return response.json();
}

async function afficheJeux(json){
    let listeJeuxAffiches = [];
    for(elem of json){
        if(!listeJeuxAffiches.includes(elem['title'])){
            listeJeuxAffiches.push(elem['title']);
            let bloc = document.createElement('div');
            let idValue = elem['gameID'];
            bloc.className = "res";
            let imgJeu = document.createElement('img');
            imgJeu.src = elem['thumb'];
            let titre = document.createElement('p');
            titre.innerText = elem['title'] + " - ";
            titre.innerHTML += '<span class="oldPrice">'+elem['normalPrice']+'</span> => '+elem['salePrice']+' (-'+Math.round(elem['savings'])+'%)';
            let notes = document.createElement('p');
            if(elem['metacriticScore']!=0 && elem['steamRatingText']!=null){
                notes.innerText = "Metacritic : " + elem['metacriticScore'] + ' -- Score Steam : ' + elem['steamRatingText'];
            }
            else{
                notes.innerHTML = "Aucune notes renseignées"
            }
            bloc.appendChild(imgJeu);
            bloc.appendChild(titre);
            bloc.appendChild(notes);
            bloc.addEventListener('click', () => {
                clic(idValue);
            })
            doc.appendChild(bloc);
        }
        if(listeJeuxAffiches.length == 10){
            break;
        }
        
    }
}

function clic(bloc){
    window.location.href = "jeu.html";
    affiche(bloc);
}

function noResult(){
    let noResultP = document.createElement('p');
    noResultP.innerHTML = '<p class="info-vide">( &empty; Aucun résultat trouvé )</p>'
    doc.appendChild(noResultP);
}