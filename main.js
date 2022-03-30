var input = document.querySelector('#bloc-recherche > input');
var recherchesFavorites;
if(localStorage.getItem('fav')){
    recherchesFavorites = JSON.parse(localStorage.getItem('fav'));
} else {
    recherchesFavorites = {};
}

input.addEventListener('keyup', checkFavoris);
input.addEventListener('keypress', function(event){
    if(event.keyCode === 13){
        event.preventDefault();
        verifValeurRecherche();
    }
})


function checkFavoris(){
    localStorage.setItem('recherchePrec', input.value);
    let imgFav = document.getElementById('btn-favoris').querySelector('img');
    if(input.value!=""){
        document.getElementById('btn-favoris').disabled = false;
        document.getElementById('btn-favoris').className = 'btn_clicable';
    }
    else{
        document.getElementById('btn-favoris').disabled = true;
        document.getElementById('btn-favoris').className = '';
    }
    if(findVal(recherchesFavorites,input.value)){
        imgFav.src = "images/etoile-pleine.svg";
    }
    else{
        imgFav.src = "images/etoile-vide.svg";
    }
}

function findVal(fav, inputValue) {
    inputValue = (inputValue + "").toLowerCase();
    for (var p in fav) {
        if (fav.hasOwnProperty(p) && inputValue == 
            (p + "").toLowerCase()) {
            return p;
        }
    }
}

function addFavoris(){
    let inputValue = input.value;
    let imgFav = document.getElementById('btn-favoris').querySelector('img');
    if(imgFav.src != window.location['origin']+"/images/etoile-pleine.svg" && !findVal(recherchesFavorites,inputValue)){
        imgFav.src = "images/etoile-pleine.svg";
        recherchesFavorites[inputValue] = 'https://www.cheapshark.com/api/1.0/deals?title='+inputValue;
        localStorage.setItem('fav', JSON.stringify(recherchesFavorites));
    } else{
        removeFavoris(inputValue);
    }
    majRecherchesFav();
}

function removeFavoris(search){
    let imgFav = document.getElementById('btn-favoris').querySelector('img');
    imgFav.src = "images/etoile-vide.svg";
    delete recherchesFavorites[findVal(recherchesFavorites,search)];
    localStorage.setItem('fav', JSON.stringify(recherchesFavorites));
    majRecherchesFav();
    checkFavoris();
}

function majRecherchesFav(){

    let listeFavoris = document.getElementById('liste-favoris');
    let sectionFav = document.getElementById('section-favoris');
    let noRes = document.getElementById('noRes');
    noRes.innerHTML='';
    listeFavoris.innerHTML='';
    if(Object.keys(recherchesFavorites).length>0){
        
        let noFav = noRes.getElementsByClassName('info-vide');
        if(noFav.length!=0){
            sectionFav.removeChild(noFav[0]);
        }
        for(rech in recherchesFavorites){
            let li = document.createElement('li');
            let title = document.createElement('span');
            let btnCroix = document.createElement('img');
            title.innerText = rech;
            title.addEventListener('click',function(){
                recherche(title.innerText);
                input.value = title.innerText;
                checkFavoris();
            } );
            btnCroix.addEventListener('click', function(){
                removeFavoris(title.innerText);
            })
            btnCroix.src = "images/croix.svg";
            btnCroix.width=15;
            btnCroix.title="Cliquer pour supprimer le favori";
            li.appendChild(title);
            li.appendChild(btnCroix);
            listeFavoris.appendChild(li);
    
        }
        
    }
    else{
        let noFav = document.createElement('p');
        noFav.innerHTML = '( &empty; Aucune recherche enregistrée )';
        noFav.className = "info-vide";
        noRes.appendChild(noFav);
    }
    
}

document.getElementById("btn-lancer-recherche").onclick = ()=>{
    verifValeurRecherche();
}



function verifValeurRecherche(){
    let valeurInput = document.querySelector('#bloc-recherche input').value;
    if(valeurInput!=""){
        recherche(valeurInput,"");
    }else{
        recherche("","onSale=1&sortBy=recent");
    }
}   

var doc = document.getElementById('bloc-resultats');
if(localStorage.getItem('recherchePrec') || localStorage.getItem('rechercheFiltre')){
    window.onload = function(){
        
        document.getElementById('btn-favoris').addEventListener('click', addFavoris);
        if(localStorage.getItem('rechercheTitre')){
            recherche(localStorage.getItem('rechercheTitre'));
        }
        else{
            recherche("",localStorage.getItem('rechercheFiltre'));
        }
        checkFavoris();
        majRecherchesFav();
    }
}else{
    window.onload = function(){
        document.getElementById('btn-favoris').addEventListener('click', addFavoris);
        document.getElementById('btn-favoris').disabled = true;
        document.querySelector('#bloc-recherche input').value = "";
        majRecherchesFav();
        recherche("","onSale=1&sortBy=recent");
    }
}


async function recherche(title="", filter=""){
    document.getElementById('loading').hidden=false;
    doc.innerHTML = '';
    let res;
    try{
        if(title == ""){
            console.log(filter);
            res = await fetch('https://www.cheapshark.com/api/1.0/deals?'+filter);
            localStorage.setItem('rechercheFiltre',filter );
            localStorage.removeItem('rechercheTitre');
        } else {
            res = await fetch('https://www.cheapshark.com/api/1.0/deals?'+filter+"title="+title);
            localStorage.setItem('rechercheTitre',title );
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
            titre.innerHTML += "<img src='images/SteamIcon.webp'/>";
            if(parseFloat(elem['normalPrice'])==parseFloat(elem['salePrice'])){
                titre.innerHTML += elem['normalPrice'];
            }else{
                titre.innerHTML += '<span class="oldPrice">'+elem['normalPrice']+'</span> => '+elem['salePrice']+' (-'+Math.round(elem['savings'])+'%)';
            }
            
            let notes = document.createElement('p');
            if(elem['metacriticScore']!=0 && elem['steamRatingText']!=null){
                notes.innerText = "Metacritic : " + elem['metacriticScore'] + ' -- Score Steam : ' + elem['steamRatingText'];
            }
            else{
                notes.innerHTML = "Aucune note renseignée"
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
    if(localStorage.getItem('rechercheTitre')){
        if(localStorage.getItem('rechercheFiltre')){
            localStorage.removeItem('rechercheFiltre');
        }
    }
    window.location.href = "jeu.html";
    affiche(bloc);
}

function noResult(){
    let noResultP = document.createElement('p');
    noResultP.innerHTML = '<p class="info-vide">( &empty; Aucun résultat trouvé )</p>'
    doc.appendChild(noResultP);
}