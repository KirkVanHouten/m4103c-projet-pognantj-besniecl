var information = document.getElementById('infos_jeu');
var main        = document.getElementById('conteneur');
//stocke en local le jeu qui a été sélectionné pour éviter tout problème
//lorsque l'on rafraichit la page
function affiche(id){
  localStorage.removeItem('jeuSelect');
  localStorage.setItem('jeuSelect',id);
}

//utilisation du async pour éviter que la page ne s'affiche avant que les données ne
//soient récupérées.
window.onload = async function(){
  if(!localStorage.getItem('storesNames') && !localStorage.getItem('storesImg')){
    let res = await fetch("https://www.cheapshark.com/api/1.0/stores");
    let resJSON = manageErrors(res);
    resJSON.then(function(res){
      storesArrayToObject(res);
    })
  }
  fetchDatas(localStorage.getItem('jeuSelect'));
}

//gère les erreurs sur le fetch
function manageErrors(response){
  if(!response.ok){
      throw Error(response.statusText);
  }
  return response.json();
}

//transforme listes de magasin en object et les stocke dans le local storage
function storesArrayToObject(res){
  let storesObject = {};
  let storesImage  = {};
  
  for(obj of res){
    let storeID           = obj['storeID'];
    let storeName         = obj['storeName'];
    let storeImage        = "https://www.cheapshark.com"+obj['images']['icon'];
    storesObject[storeID] = storeName;
    storesImage[storeID]  = storeImage;
  }
  localStorage.setItem('storesNames', JSON.stringify(storesObject) );
  localStorage.setItem('storesImg'  , JSON.stringify(storesImage)  );
  
}

//permet de récupérer les données du jeu sélectionné
function fetchDatas(id){
  fetch("https://www.cheapshark.com/api/1.0/games?id="+id)
  .then(manageErrors)
  .then(function(res){
    affichageJeu(res);
  })
}

//affichage du jeu et de tous les magasins ainsi que leurs prix,...
function affichageJeu(res){
  let storesList   = JSON.parse(localStorage.getItem('storesNames'));
  let storesImg    = JSON.parse(localStorage.getItem('storesImg'));
  let information  = document.createElement('div');
  information.id   = "infos_jeu";
  let infos        = res['info'];
  let deals        = res['deals'];
  let list         = document.createElement('ul');
  let imgJeu       = document.createElement('img');
  let divJeu       = document.createElement('div');
  let parNom       = document.createElement('p');
  parNom.innerText = infos['title'];
  divJeu.id        = "jeu";
  imgJeu.src       = infos['thumb'];

  for(deal of deals){

    let listItem = document.createElement('li');
    let img      = document.createElement('img');
    img.src      = storesImg[deal['storeID']];
    let div      = document.createElement('div');
    div.appendChild(img);
    div.innerHTML += storesList[deal['storeID']];
    
    
    if(parseFloat(deal['retailPrice']) > parseFloat(deal['price'])){
      let reduction = ((parseFloat(deal['retailPrice'])-parseFloat(deal['price']))/((parseFloat(deal['retailPrice'])+parseFloat(deal['price']))/2))*100;
      div.innerHTML += " -- Prix : <strike>" + deal['retailPrice'] + " €</strike> => " + deal['price'] + " € (-" + Math.round(reduction) + "%)</div>";
    }else if(parseFloat(deal['price']) == parseFloat(deal['retailPrice'])){
      div.innerHTML += " -- Prix : " + deal['price'] + " €</div>";
    }
    else{
      div.innerHTML += " -- Prix : <strike>" + deal['retailPrice'] + " €</strike> => " + deal['price'] + " € (-" + Math.round(deal['savings']) + "%)</div>";
    }
    listItem.appendChild(div);
    listItem.innerHTML += "<a href=https://www.cheapshark.com/redirect?dealID=" + deal['dealID'] + "> Acheter </a>";
    listItem.className = "magasin";
    list.appendChild(listItem);

  }

  
  divJeu.appendChild(imgJeu);
  divJeu.appendChild(parNom);
  main.appendChild(divJeu);
  information.appendChild(list);
  main.appendChild(information);
}