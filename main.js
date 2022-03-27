var input = document.querySelector('#bloc-recherche > input');
var recherchesFavorites = {};

input.addEventListener('keyup', checkFavoris);


function checkFavoris(){
    let imgFav = document.getElementById('btn-favoris').querySelector('img');
    let listeFavoris = JSON.parse(localStorage.getItem('fav'));
    if(input.value!=""){
        document.getElementById('btn-favoris').disabled = false;
    }
    else{
        document.getElementById('btn-favoris').disabled = true;
    }
    if(listeFavoris[input.value]){
        imgFav.src = "images/etoile-pleine.svg";
    }
    else{
        imgFav.src = "images/etoile-vide.svg";
    }
}



function addFavoris(){
    let inputValue = input.value;
    recherchesFavorites = JSON.parse(localStorage.getItem('fav'))
    let imgFav = document.getElementById('btn-favoris').querySelector('img');
    if(imgFav.src != window.location['origin']+"/images/etoile-pleine.svg"){
        imgFav.src = "images/etoile-pleine.svg";
        recherchesFavorites[inputValue] = 'https://www.cheapshark.com/api/1.0/deals?title='+inputValue;
        localStorage.setItem('fav', JSON.stringify(recherchesFavorites));
        console.log(JSON.parse(localStorage.getItem('fav')));
    } else{
        imgFav.src = "images/etoile-vide.svg";
        delete recherchesFavorites[inputValue];
        localStorage.setItem('fav', JSON.stringify(recherchesFavorites));
        console.log(JSON.parse(localStorage.getItem('fav')));
    }
    majRecherchesFav();
}

function majRecherchesFav(){

    let recherches = JSON.parse(localStorage.getItem('fav'));
    console.log(recherches);
    let listeFavoris = document.getElementById('liste-favoris');
    let sectionFav = document.getElementById('section-favoris');
    listeFavoris.innerHTML='';
    if(Object.keys(recherches).length>0){
        
        let noFav = sectionFav.getElementsByClassName('info-vide');
        if(noFav.length!=0){
            sectionFav.removeChild(noFav[0]);
        }
        for(rech in recherches){
            let li = document.createElement('li');
            let title = document.createElement('span');
            let btnCroix = document.createElement('img');
            title.innerText = rech;
            title.addEventListener('click',function(){
                recherche(title.innerText);
                input.value = title.innerText;
                checkFavoris();
            } );
            li.appendChild(title);
            listeFavoris.appendChild(li);
    
        }
        
    }
    else{
        let noFav = document.createElement('p');
        noFav.innerHTML = '( &empty; Aucune recherche enregistrée )';
        noFav.className = "info-vide";
        sectionFav.appendChild(noFav);
    }
    
}

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
    document.getElementById('btn-favoris').addEventListener('click', addFavoris);
    document.getElementById('btn-favoris').disabled = true;
    document.querySelector('#bloc-recherche input').value = "";
    majRecherchesFav();
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