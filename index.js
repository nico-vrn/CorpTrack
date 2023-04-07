key=""; //clés API shodan

var bt_search=document.getElementById("btn-lancer-recherche");
bt_search.addEventListener("click",rechercher);
ch_search=document.getElementById("champs_recherche");
ch_search.focus();
ch_search.addEventListener("keydown",event=>{ //faire en sorte de recherche avec entrée
    if(event.keyCode==13)
        rechercher();
})
var recherche=document.getElementById("champs_recherche").value="";

son_ip() //récupération de l'IP
function son_ip(){
    var IP = "https://api.shodan.io/tools/myip?"+key;
    request(IP,afficher_IP)
}

function afficher_IP(data){ //affiche l'IP de l'utilisateur avec un lien de recherche
  document.getElementById("bloc-gif-attente").style.display="none";
  var response=JSON.parse(data.contents);
  var IP=document.getElementById("mon_ip");
  IP.textContent="Votre IP est: "+response;
  IP.addEventListener("click",function(){
    document.getElementById("champs_recherche").value=response;
    rechercher();
  });
}

function rechercher(){ //fonction de recherche
    //console.log("recherche en cours");
    recherche=document.getElementById("champs_recherche").value;
    var url = "https://api.shodan.io/shodan/host/search?" + key + "&query=" + recherche + "&facets=country";
    var url2="https://api.shodan.io/shodan/host/search?key=${apiKey}&query=country:france&facets=country"
    var url3="https://api.shodan.io/shodan/host/count?key=${apiKey}&query=port:22&facets=org,os"; // fonctionne retourne le nb de host par pays
    if(recherche[0]==undefined){ //si la recherche est vide
      document.getElementById('empty').textContent="le champs de recherche est vide";
    }
    favoris();
}

