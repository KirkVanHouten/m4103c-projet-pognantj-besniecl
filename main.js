/* document.getElementById("btn-lancer-recherche").onclick = ()=>{
    fetch('https://www.cheapshark.com/api/1.0/deals?title=%27Powerwash%27')
    .then(function(response){
        return response.json();
    })
    .then(function(resJson){
        console.log(resJson);
    })
} */



var doc = document.getElementById('bloc-resultats');

window.onload = function(){
    fetch('https://www.cheapshark.com/api/1.0/deals?onSale=1&sortBy=%22recent%22&pageSize=10')
    .then(manageErrors)
    .then(function(json){
        afficheJeux(json);
    })
    .catch(function(error){
        noResult();
    })
}

function manageErrors(response){
    if(!response.ok){
        throw Error(response.statusText);
    }
    return response.json();
}

function afficheJeux(json){
    for(elem of json){
        let bloc = document.createElement('div');
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
        let link = document.createElement('a');
        link.href = "https://www.cheapshark.com/redirect?dealID="+elem['dealID'];
        link.innerText = "Acheter";
        bloc.appendChild(imgJeu);
        bloc.appendChild(titre);
        bloc.appendChild(notes);
        bloc.appendChild(link);
        doc.appendChild(bloc);
    }
    
    
}

function noResult(){
    let noResultP = document.createElement('p');
    noResultP.innerHTML = '<p class="info-vide">( &empty; Aucun machin trouvé )</p>'
    doc.appendChild(noResultP);
}