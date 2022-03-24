var information = document.getElementById('infos_jeu');
function affiche(id){
  console.log(id);
  localStorage.removeItem('jeuSelect');
  localStorage.setItem('jeuSelect',id);
}

window.onload = function(){
  if(localStorage.getItem('jeuSelect')){
    fetchDatas(localStorage.getItem('jeuSelect'));
  }else{
    console.log('Pas de jeu sélectionné')
  }
  if(!localStorage.getItem('storesNames')){
    fetch("https://www.cheapshark.com/api/1.0/stores")
    .then(manageErrors)
    .then(function(res){
      storesArrayToObject(res);
    })
  }
 
}

function storesArrayToObject(res){
  let storesObject = {};
  let storesImage = {};
  
  for(obj of res){
    let storeID = obj['storeID'];
    let storeName = obj['storeName'];
    let storeImage = "https://www.cheapshark.com"+obj['images']['icon'];
    storesObject[storeID] = storeName;
    storesImage[storeID] = storeImage;
  }
  localStorage.setItem('storesNames',JSON.stringify(storesObject));
  localStorage.setItem('storesImg',JSON.stringify(storesImage));
  
}

function fetchDatas(id){
  fetch("https://www.cheapshark.com/api/1.0/games?id="+localStorage.getItem('jeuSelect'))
  .then(manageErrors)
  .then(function(res){
    affichageJeu(res);
  })
}

function manageErrors(response){
  if(!response.ok){
      throw Error(response.statusText);
  }
  return response.json();
}

function affichageJeu(json){
  let storesList = JSON.parse(localStorage.getItem('storesNames'));
  let storesImg = JSON.parse(localStorage.getItem('storesImg'));
  console.log(storesImg);
  console.log(localStorage.getItem('jeuSelect'));
  let infos = json['info'];
  let deals = json['deals'];
  let list = document.createElement('ul');
  let imgJeu = document.createElement('img');
  imgJeu.src = infos['thumb'];
  for(deal of deals){
    let listItem = document.createElement('li');
    let img = document.createElement('img');
    img.src = storesImg[deal['storeID']];
    listItem.appendChild(img);
    listItem.innerHTML += storesList[deal['storeID']];
    
    
    if(deal['price'] == deal['retailPrice']){
      listItem.innerHTML += " -- Prix : " + deal['retailPrice'];
    } else{
      listItem.innerHTML += " -- Prix : <strike>" + deal['retailPrice'] + "</strike> => " + deal['price'] + " (-" + Math.round(deal['savings']) + "%)";
    }
    listItem.innerHTML += "<a href=https://www.cheapshark.com/redirect?dealID=" + deal['dealID'] + "> Acheter </a>";
    listItem.className = "magasin";
    list.appendChild(listItem);
  }

  let parNom = document.createElement('p');
  parNom.innerText = infos['title'];
  information.appendChild(imgJeu);
  information.appendChild(parNom);
  information.appendChild(list);
  console.log(json['info'])
}