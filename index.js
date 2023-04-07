const shodanKey=""

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
    var IP = "https://api.shodan.io/tools/myip?key=${shodanKey}";
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
    console.log("recherche en cours");
    recherche=document.getElementById("champs_recherche").value;
    var url = "https://api.shodan.io/shodan/host/search?" + key + "&query=" + recherche + "&facets=country";
    var url2="https://api.shodan.io/shodan/host/search?key=${apiKey}&query=country:france&facets=country"
    var url3="https://api.shodan.io/shodan/host/count?key=${apiKey}&query=port:22&facets=org,os"; // fonctionne retourne le nb de host par pays
    if(recherche[0]==undefined){ //si la recherche est vide
      document.getElementById('empty').textContent="le champs de recherche est vide";
    }
    favoris();
}

//requete ajax

function request(url, retour, autre){ //requete ajax
    //clean();
    document.getElementById("bloc-gif-attente").style.display="block";
    fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    .then(response => { 
      if (response.ok) return response.json()
      throw new Error('Network response was not ok.')
    })
    .then(data => retour(data,autre));
}

//gestion de la map

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


//gestion des favoris

favoris();
document.addEventListener('keyup', function(e) {favoris();});

function favoris(){ //gestion des favoris
  if(localStorage.fav==undefined){ //si pas de localStorage
    localStorage.fav=JSON.stringify({favoris:[]});
  }
  var loupe=document.getElementById("btn-favoris");
  var fav=recup_fav();
  var elmt_fav=fav.favoris;
  if (elmt_fav.length==0){ //si pas de favoris
    etoile("vide");
    loupe.addEventListener("click",ajouter_fav);
    return;
  }
  else{ //si des favoris
    for (var i=0;i<fav.favoris.length;i++){
      if (elmt_fav[i]==document.getElementById("champs_recherche").value){ //si le champ de recherche est déjà dans les favoris
        etoile("pleine");
        loupe.removeEventListener("click",ajouter_fav);
        loupe.addEventListener("click",function(){
          supprimer_fav("etoile");
        });
        return;
      }
      else{ //si le champ de recherche n'est pas dans les favoris
        etoile("vide");
        loupe.removeEventListener("click",supprimer_fav);
        loupe.addEventListener("click",ajouter_fav);
      }
    }
  }
}

function recup_fav(){ //recupère les favoris
  var fav=JSON.parse(localStorage.fav);
  return fav;
}

function etoile(cote){  //affiche les étoiles
  var loupe=document.getElementById("btn-favoris");
  var img_pleine=document.getElementById("img-pleine");
  var img_vide=document.getElementById("img-vide");
  if(cote=="pleine"){ //si pleine
    img_pleine.style.display="block";
    img_vide.style.display="none";
    loupe.style.backgroundColor="var(--main-green)";
    loupe.style.border=".1em solid grey"
  }
  else{   //si vide
    loupe.style.backgroundColor="grey";
    img_pleine.style.display="none";
    img_vide.style.display="block";
  }
}

function ajouter_fav(){ //ajoute un favoris
  recherche=document.getElementById("champs_recherche").value;
  empty=document.getElementById('empty');
  if(recherche==""){ //si champs de recherche vide
    empty.textContent="Vous ne pouvez pas ajouter rien au favoris";
  }
  else{ //si champs de recherche rempli
    empty.textContent="";
    var fav=recup_fav();
    fav.favoris.push(recherche);
    localStorage.fav=JSON.stringify(fav);
    favoris();
    affiche_fav();
  }
}

function supprimer_fav(cmt){ //supprime un favoris
  //console.log("supprimer_fav");
  var fav=recup_fav();
  var elmt_fav=fav.favoris;
  favoris();
  if (cmt=="etoile"){ //si clic sur étoile
    var elmt_fav_supp=document.getElementById("champs_recherche").value;
  }
  else{ //si clic sur le bouton supprimer
    var elmt_fav_supp=cmt;
  }
  for (var i=0;i<fav.favoris.length;i++){ //pour chaque favoris
    if (elmt_fav[i]==elmt_fav_supp){ //si le favoris à supprimer est le favoris en cours
      if(confirm("êtes vous sur de vouloire supprimer le favoris ?")){
        fav.favoris.splice(i,1);
        localStorage.fav=JSON.stringify(fav);
        favoris()
        affiche_fav();
        return;
      }
    }
    }
}

function affiche_fav(){ //affiche les favoris
  clear_fav(); //efface les favoris
  var liste=document.getElementById("liste-favoris");
  var empty=document.getElementById("info-vide");
  var btn_supp=document.getElementById("btn-supp");
  var fav = recup_fav();
  if (fav.favoris.length==0){ //si pas de favoris
    empty.style.display="block";
    btn_supp.style.display="none";
  }
  else{ //si des favoris
    empty.style.display="none";
    btn_supp.style.display="block";
    btn_supp.addEventListener("click",function(){
      localStorage.clear();
      favoris();
      affiche_fav();
    });
    for (var i=0;i<fav.favoris.length;i++){ //pour chaque favoris
      newLi=document.createElement("li");
      newA=document.createElement("a");
      newA.textContent=fav.favoris[i];
      newA.addEventListener("click",function(){
        document.getElementById("champs_recherche").value=this.textContent;
        rechercher();
      });
      var img_croix=document.createElement("img");
      img_croix.src="images/croix.svg";
      img_croix.title="Supprimer le favoris";
      img_croix.width="22";
      img_croix.setAttribute('id',fav.favoris[i])
      img_croix.addEventListener("click",function(){
        var ID=this.getAttribute('id');
        supprimer_fav(ID);
      });
      newLi.appendChild(newA);
      newLi.appendChild(img_croix);
      liste.appendChild(newLi);
    }
  }
}

function clear_fav(){ //efface les favoris
  var liste=document.getElementById("liste-favoris");
    while (liste.firstChild) {
        liste.removeChild(liste.firstChild);
    }
}

//auto-completion

// Charger la liste des entreprises
let companies = [];
fetch('ressources/liste_company.json')
    .then((response) => response.json())
    .then((data) => {
    companies = data;
    })
    .catch((error) => console.error('Erreur lors du chargement du fichier JSON:', error));
    //console.log(companies);

// Fonction pour créer l'autocomplétion
function autocomplete(input, suggestions) {
    //console.log('autocomplete');
    const container = document.getElementById('autocomplete-container');
    container.innerHTML = '';

    suggestions.forEach((suggestion) => {
    const div = document.createElement('div');
    div.classList.add('autocomplete-suggestion');
    div.textContent = suggestion;
    div.addEventListener('click', () => {
        input.value = suggestion;
        container.innerHTML = '';
    });

    container.appendChild(div);
    });
}

// Fonction pour gérer l'autocomplétion
function gestion_autocomplete(event) {
    //console.log('gestion_autocomplete');
    const input = event.target;
    const searchTerm = input.value.toLowerCase();
    if (searchTerm === '') {
        autocomplete(input, []);
    return;
    }
    const suggestions = companies.filter((company) =>
    company.toLowerCase().includes(searchTerm)
    );
    autocomplete(input, suggestions);
}

//Gestionnaire d'événements pour gérer l'autocomplétion
const searchInput = document.getElementById('champs_recherche');
searchInput.addEventListener('input', gestion_autocomplete);
