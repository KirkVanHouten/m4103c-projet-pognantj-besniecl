var information = document.getElementById('infos_jeu');
function affiche(id){
  console.log(id);
  localStorage.removeItem('jeuSelect');
  localStorage.setItem('jeuSelect',id);
}

window.onload = function(){
  if(localStorage.getItem('jeuSelect')){
    affichage(localStorage.getItem('jeuSelect'));
  }else{
    console.log('Pas de jeu sélectionné')
  }
}

function affichage(id){
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
  let infos = json['info'];
  let parNom = document.createElement('p');
  parNom.innerText = infos['title'];
  information.appendChild(parNom);
  console.log(json['info'])
}