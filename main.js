var doc = document.getElementById('bloc-resultats');
//le bloc de code suivant permet de rafficher la dernière recherche effectuée lorsque l'on recharge la page ou que l'on revient de la page de détails
//ce premier if vérifie si une sauvegarde existe et l'affiche si oui
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
//sinon, on fait une recherche de base
}else{
    window.onload = function(){
        document.getElementById('btn-favoris').addEventListener('click', addFavoris);
        document.getElementById('btn-favoris').disabled = true;
        document.querySelector('#bloc-recherche input').value = "";
        majRecherchesFav();
        recherche("","onSale=1&sortBy=recent");
    }
}
var input = document.querySelector('#bloc-recherche > input');
var recherchesFavorites;
//le code suivant récupère dans le local storage les recherches favorites
if(localStorage.getItem('fav')){
    recherchesFavorites = JSON.parse(localStorage.getItem('fav'));
} else {
    recherchesFavorites = {};
}

//A chaque lettre tappée on vérifie si le contenu de la barre de recherche correspond a un favoris existant
input.addEventListener('keyup', checkFavoris);

//lance une recherche avec la touche 'entrée'
input.addEventListener('keypress', function(event){
    if(event.keyCode === 13){
        event.preventDefault();
        verifValeurRecherche();
    }
})

//Fonction permettant de vérifier si le texte tappé est déjà enregistré dans les favoris
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

//Cette fonction permet de rendre la recherche des favoris non sensible à la casse
function findVal(fav, inputValue) {
    inputValue = (inputValue + "").toLowerCase();
    for (var p in fav) {
        if (fav.hasOwnProperty(p) && inputValue == 
            (p + "").toLowerCase()) {
            return p;
        }
    }
}

//fonction permettant d'afficher les favoris
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

//Suppression les favoris
function removeFavoris(search){
    if(confirm("Etes-vous sûr de vouloir supprimer le favori ?")){
        let imgFav = document.getElementById('btn-favoris').querySelector('img');
        imgFav.src = "images/etoile-vide.svg";
        delete recherchesFavorites[findVal(recherchesFavorites,search)];
        localStorage.setItem('fav', JSON.stringify(recherchesFavorites));
        majRecherchesFav();
        checkFavoris();
    }
    
}

//Mise à jour du menu droit affichant la liste des favoris
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

//Association de la fonction vérifiant si une recherche est valide sur le bouton loupe
document.getElementById("btn-lancer-recherche").onclick = ()=>{
    verifValeurRecherche();
}


//Vérification de la valeur de la recherche, bloquant une recherche vide
function verifValeurRecherche(){
    let valeurInput = document.querySelector('#bloc-recherche input').value;
    if(valeurInput!=""){
        recherche(valeurInput,"");
    }
}   



//Fonction permettant de rechercher un jeu avec son nom/ses filtres
//Utilisation du async/await pour avoir l'icone le chargement jusqu'à la fin du fetch
async function recherche(title="", filter=""){
    document.getElementById('loading').hidden=false;
    doc.innerHTML = '';
    let res;
    try{
        if(title == ""){
            res = await fetch('https://www.cheapshark.com/api/1.0/deals?'+filter);
            localStorage.setItem('rechercheFiltre',filter );
            localStorage.removeItem('rechercheTitre');
        } else {
            res = await fetch('https://www.cheapshark.com/api/1.0/deals?sortBy=price&'+"title="+title);
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

//gestion des erreurs sur les fetch
function manageErrors(response){
    if(!response.ok){
        throw Error(response.statusText);
    }
    return response.json();
}

//Affichage des blocs contenant le nom du jeu, son image, ...
async function afficheJeux(json){
    let listeJeuxAffiches = [];
    for(elem of json){
        if(!listeJeuxAffiches.includes(elem['title'])){
            listeJeuxAffiches.push(elem['title']);
            let bloc = document.createElement('div');
            let idValue = elem['gameID'];
            let sale = elem['salePrice'];
            
            let normalPrice = elem['normalPrice'];
            bloc.className = "res";
            let imgJeu = document.createElement('img');
            imgJeu.src = elem['thumb'];
            let titre = document.createElement('p');
            titre.className = "titreJeu";
            titre.innerText = elem['title'] + " - ";
            //ce if est nécessaire pour corriger un problème de l'API inversant le prix en promotion et le prix normal
            if(parseFloat(sale) > parseFloat(normalPrice)){
                let reduction = ((parseFloat(sale)-parseFloat(normalPrice))/((parseFloat(sale)+parseFloat(normalPrice))/2))*100;
                titre.innerHTML += " -- Prix : <strike>" + sale + " €</strike> => " + normalPrice + "  € (-" + Math.round(reduction) + "%)</div>";
            }else if(parseFloat(normalPrice) == parseFloat(sale)){
                titre.innerHTML += " -- Prix : " + normalPrice+ " €</div>";
            }else{
                titre.innerHTML += '<span class="oldPrice">'+normalPrice+'  €</span> => '+sale+' € (-'+Math.round(elem['savings'])+'%)';
            }
            
            let notes = document.createElement('p');
            if(elem['metacriticScore']!=0 && elem['steamRatingText']!=null){
                notes.innerText = "Metacritic : " + elem['metacriticScore'] + ' -- Score Steam : ' + elem['steamRatingText'];
            }
            else{
                notes.innerHTML = "Aucune note renseignée"
            }
            let clicTxt = document.createElement("p");
            clicTxt.innerText = "Cliquez pour d'autres d'offres";
            clicTxt.className = "clicOffres"
            bloc.appendChild(imgJeu);
            bloc.appendChild(titre);
            bloc.appendChild(notes);
            bloc.appendChild(clicTxt);
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

//permet de stocker la recherche précédente dans le local storage en cas de clic sur un jeu
function clic(bloc){
    if(localStorage.getItem('rechercheTitre')){
        if(localStorage.getItem('rechercheFiltre')){
            localStorage.removeItem('rechercheFiltre');
        }
    }
    window.location.href = "jeu.html";
    affiche(bloc);
}

//Affichage d'un texte en cas d'absence de résultat
function noResult(){
    let noResultP = document.createElement('p');
    noResultP.innerHTML = '<p class="info-vide">( &empty; Aucun résultat trouvé )</p>'
    doc.appendChild(noResultP);
}