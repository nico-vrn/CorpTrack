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


var map = null;
function initMap(lat,lon) { //fonction d'initialisation de la carte
    // Créer l'objet "map" et l'insèrer dans l'élément HTML qui a l'ID "map"
	map = new google.maps.Map(document.getElementById("map"), {
        // Nous plaçons le centre de la carte avec les coordonnées ci-dessus
        center: new google.maps.LatLng(lat, lon),
        // Nous définissons le zoom par défaut
        zoom: 12,
        // Nous définissons le type de carte (ici carte routière)
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        // Nous activons les options de contrôle de la carte (plan, satellite...)
        mapTypeControl: true,
        // Nous désactivons la roulette de souris
        scrollwheel: false,
        mapTypeControlOptions: {
            // Cette option sert à définir comment les options se placent
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR
        },
        // Activation des options de navigation dans la carte (zoom...)
        navigationControl: true,
        navigationControlOptions: {
            // Comment ces options doivent-elles s'afficher
            style: google.maps.NavigationControlStyle.ZOOM_PAN
        }

    });// Nous ajoutons un marqueur
    var marker = new google.maps.Marker({
        // Nous définissons sa position (syntaxe json)
        position: {lat: lat, lng: lon},
        // Nous définissons à quelle carte il est ajouté
        map: map
    });
}