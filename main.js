/* document.getElementById("btn-lancer-recherche").onclick = ()=>{
    fetch('https://www.cheapshark.com/api/1.0/deals?title=%27Powerwash%27')
    .then(function(response){
        return response.json();
    })
    .then(function(resJson){
        console.log(resJson);
    })
} */

window.onload = function(){
    fetch('https://www.cheapshark.com/api/1.0/deals?onSale=1&sortBy="recent"&pageSize=10')
    .then(function(res){
        return res.json();
    })
    .then(function(json){
        console.log(json);
        afficheJeux(json);
    })
}

function afficheJeux(json){
    for(elem of json){
        let bloc = document.createElement('div');
        bloc.className = "res";
        let imgJeu = document.createElement('img');
        imgJeu.src = elem['thumb'];
        let titre = document.createElement('p');
        titre.innerText = elem['title'] + " - ";
        let price = document.createElement('span');
        price.innerText=elem['normalPrice'];
        price.className = 'oldPrice'
        let reducePrice = document.createElement('p');
        reducePrice.innerText = elem['salePrice']
        bloc.appendChild(imgJeu);
        bloc.appendChild(titre);
        bloc.appendChild(price);
        bloc.appendChild(reducePrice);
        document.getElementById('bloc-resultats').appendChild(bloc);
        console.log(bloc.classList);
    }
    
    
}