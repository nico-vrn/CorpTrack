// Description: Fichier principal de l'application

//définition des constantes - liaison avec les éléments du DOM
document.getElementById("btn-lancer-recherche").addEventListener("click",rechercher);
const blocResultats = document.getElementById("bloc-resultats");
const recherche=document.getElementById("champs_recherche");
const erreur=document.getElementById("erreur");
const etoile_fav=document.getElementById("btn-favoris");
ch_search=document.getElementById("champs_recherche");

//permet de lancer la recherche avec la touche entrée + vide le champs de recherche + focus sur le champs de recherche
ch_search.focus(); //focus sur le champs de recherche
ch_search.addEventListener("keydown",event=>{ //faire en sorte de recherche avec entrée
    if(event.keyCode==13)
        rechercher();
})
ch_search.value=""; //vide le champs de recherche

//définition des variables globales js - utilisées dans les fonctions
let entreprises = [];
let vulnerabilities = [];
let date30joursAvant
let datejour

//fonction qui récupère l'IP de l'utilisateur
son_ip()
function son_ip(){
    var IP = "https://api.shodan.io/tools/myip";
    request(IP,afficher_IP)
}

//fonction qui affiche l'IP de l'utilisateur avec un lien de recherche
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

//fonction qui sors la date du jour et la date d'il y a 30 jours au format ISO
function bonne_date(){
  console.log("------- TOP2 : bonne_date en cours -------")
  const today = new Date();

  const datejour = today.toISOString().replace(/Z$/, '');
  console.log("date du jour : ", datejour); // affiche la date d'aujourd'hui au format ISO 
  
  const date30joursAvant = new Date(today.setDate(today.getDate() - 30)).toISOString().replace(/Z$/, '');
  console.log("date 30 jours avant :", date30joursAvant); // affiche la date d'il y a 30 jours au format ISO

  return [date30joursAvant, datejour];
}

//fonction qui vérifie si l'entrée est une adresse IP
function estUneIP(input) {
  //vérification si l'entrée est une adresse IPv4 valide
  const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  //vérification si l'entrée est une adresse IPv6 valide
  const ipv6Pattern = /^((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?!fe80:)[0-9a-fA-F]{1,4}:(:[0-9a-fA-F]{1,4}){1,6}|fe80:(:[0-9a-fA-F]{1,4}){1,6}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,4})$/;

  return ipv4Pattern.test(input) || ipv6Pattern.test(input);
}

//fonction qui vide le bloc de résultat et la map
function vider_resultat(){
  blocResultats.innerHTML="";
  erreur.innerHTML="";
  document.getElementById("map").style.display="none";
  document.getElementById("text_map").style.display="none";
}

//fonction qui lance les recherches
async function rechercher() {
  console.log("------- START : recherche en cours -------");

  //récupération du terme de recherche
  terme_recherche = document.getElementById("champs_recherche").value;
  console.log('terme_recherche: ' + terme_recherche);

  //vider le bloc de résultat et la map
  vider_resultat();

  //vérification si le champs de recherche est vide
  if (terme_recherche[0] === undefined) {
    document.getElementById("bloc-resultats").textContent = "le champs de recherche est vide";
  } else {
    //aficher gif d'attente
    document.getElementById("bloc-gif-attente").style.display="block";

    //vérification si l'entrée est une adresse IP
    if (estUneIP(terme_recherche)) {
      console.log("C'est une adresse IP.");

      const shodanData = await recherche_shodan(terme_recherche); //appel de la fonction pour rechercher l'IP
      console.log("shodanData:", shodanData);

      //affiche info de l'IP si une IP est trouvé sinon affiche "Aucune entreprise ou IP trouvée"
      if (shodanData.hasOwnProperty("error")) {
        erreur.appendChild(document.createTextNode("Aucune entreprise ou IP trouvée"));
        console.log("Aucune valeurs reconnus");
      } else {
        afficher_resultat(null, shodanData, null);
      }

    } 
    else {
      console.log("Ce n'est pas une adresse IP.");

      //appel de la fonction pour rechercher l'entreprise 
      await recherche_companie(terme_recherche);
        
      //affiche info de l'entreprise si une entreprise est trouvé
      if (entreprises[0] === undefined) {
        document.getElementById("bloc-resultats").textContent = "Aucune entreprise trouvée";
        console.log("Aucune entreprise trouvée");
      } else {
        console.log("Liste entreprises:",entreprises[0])
        /*for (let i = 0; i < entreprises.length; i++) {
          console.log("Liste entreprises:",entreprises[i])
        } */

        const [dateAncienne, dateActuelle] = bonne_date();
        //console.log("Date d'aujourd'hui :", dateActuelle);
        //console.log("Il y a 30 jours :", dateAncienne);

        //appel de la fonction pour rechercher les vulnérabilités de l'entreprise sur les 30 derniers jours
        //await rechercher_vulnerabilites(terme_recherche, dateAncienne, dateActuelle);

        if (vulnerabilities[0] === undefined) {
          console.log("Aucune vulnérabilité trouvée");
        } else {
          let n=0;
          for (let i = 0; i < vulnerabilities.length; i++) {
            //console.log("Liste vulnérabilités:", vulnerabilities[i]);
          }
          console.log("Nombre de vulnérabilités trouvés sur les 30 derniers jours :", vulnerabilities.length);
        }
        afficher_resultat(entreprises, null, vulnerabilities);
      }
    }

    //appel de la fonction qui vérifie les favoris
    await favoris();

    //supprimer gif d'attente
    document.getElementById("bloc-gif-attente").style.display="none";
        
  }
}


//recherche entreprise
async function recherche_companie(terme_recherche) {
  console.log("------- TOP1 : recherche_companie en cours -------");
  return new Promise((resolve, reject) => {
    fetch('https://recherche-entreprises.api.gouv.fr/search?q=' + terme_recherche)
      .then(response => response.json())
      .then(data => {
        entreprises = [];
        for (let i = 0; i < 1; i++) {
          entreprises.push(data.results[i]);
        }
        resolve(entreprises);
      })
      .catch(error => reject(error));
  });
}

async function rechercher_vulnerabilites(nomEntreprise, dateAncienne, dateActuelle) {
  console.log("------- TOP3 : rechercher_vulnerabilites en cours -------");

  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${nomEntreprise}&pubStartDate=${dateAncienne}&pubEndDate=${dateActuelle}`;
  console.log("URL:", url);

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log(`Vulnérabilités pour l'entreprise ${nomEntreprise}:`);

      data.vulnerabilities.forEach(vulnerability => {
        const cve = vulnerability.cve;
        //console.log(`${cve.id}: ${cve.descriptions[0].value}`);
        vulnerabilities.push(vulnerability);
      });

      resolve(vulnerabilities);
    } 
    catch (error) {
      console.error(error);
      reject(error);
    }
  });
}


async function recherche_shodan(terme_recherche) {
  console.log("------- TOP4 : recherche_shodan en cours -------");

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`/api/data/${terme_recherche}`);
      const data = await response.json();

      // affiche les données récupérées
      //console.log(data);
      resolve(data);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      reject(error);
    }
  });
}

function afficher_resultat(entreprises, shodanData, vulnerabilities) {
  console.log("------- TOP5 : afficher_resultat en cours -------");

  if (shodanData) {
    const ipInfo = document.createElement("div");
    ipInfo.innerHTML = `<h3>Informations venant de Shodan :</h3>
                        <p><strong>Adresse IP :</strong> ${shodanData.ip_str}</p>
                        <p><strong>Ville :</strong> ${shodanData.city} (${shodanData.region_code})</p>
                        <p><strong>Pays :</strong> ${shodanData.country_name} (${shodanData.country_code})</p>
                        <p><strong>OS :</strong> ${shodanData.os}</p>
                        <p><strong>code ASN :</strong> ${shodanData.asn}</p>`;
    //domaines associés
    const domaines = document.createElement("div");
    domaines.innerHTML = `<h3>Domaines associés :</h3>`;
    const listeDomaines = document.createElement("ul");
    shodanData.domains.forEach(domaine => {
      //console.log("domaine:",domaine)
      const domaineItem = document.createElement("li");
      domaineItem.textContent = domaine;
      listeDomaines.appendChild(domaineItem);
    });
    //ports ouverts
    const ports = document.createElement("div");
    ports.innerHTML = `<h3>Ports ouverts :</h3>`;
    const listePorts = document.createElement("ul");
    shodanData.ports.forEach(port => {
      //console.log("port:",port)
      const portItem = document.createElement("li");
      portItem.textContent = port;
      listePorts.appendChild(portItem);
    });
    blocResultats.appendChild(ipInfo);
    blocResultats.appendChild(domaines);
    blocResultats.appendChild(listeDomaines);
    blocResultats.appendChild(ports);
    blocResultats.appendChild(listePorts);
    latitude=shodanData.latitude;
    longitude=shodanData.longitude;
  }

  if (entreprises && entreprises.length > 0) {
    const entrepriseInfo = document.createElement("div");
    entrepriseInfo.innerHTML = `<h3>Informations sur l'entreprise</h3>
                                 <p><strong>Nom :</strong> ${entreprises[0].nom_raison_sociale}</p>
                                 <p><strong>Adresse :</strong> ${entreprises[0].siege.adresse}</p>
                                 <p><strong>Code postal :</strong> ${entreprises[0].siege.code_postal}</p>`;
    blocResultats.appendChild(entrepriseInfo);
    latitude=parseFloat(entreprises[0].siege.latitude);
    longitude=parseFloat(entreprises[0].siege.longitude);
  }

  if (vulnerabilities && vulnerabilities.length > 0) {
    const vulnInfo = document.createElement("div");
    vulnInfo.innerHTML = `<h3>Vulnérabilités trouvées (${vulnerabilities.length})</h3>`;
    vulnerabilities.forEach((vulnerability, index) => {
      vulnInfo.innerHTML += `<p><strong>${index + 1}. ${vulnerability.cve.id} :</strong> ${vulnerability.cve.descriptions[0].value}</p>`;
    });
    blocResultats.appendChild(vulnInfo);
  }
  else {
    const vulnInfo = document.createElement("p");
    vulnInfo.innerHTML = "/!\\ Aucune vulnérabilité trouvée";
    erreur.appendChild(vulnInfo);
  }

  console.log("Latitude:", latitude, "Longitude:", longitude);

  if (latitude && longitude) {
    initMap(latitude, longitude);
    document.getElementById("map").style.display="block";
    document.getElementById("text_map").style.display="block";
  }
  else {
    const mapInfo = document.createElement("p");
    mapInfo.innerHTML = "/!\\ Aucune position géographique trouvée";
    erreur.appendChild(mapInfo);
  }
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
document.addEventListener('keyup', function(e) {favoris();}); //si on appuie sur une touche du clavier

//fonction de gestion des favoris
function favoris(){
  if(localStorage.fav==undefined){ //si pas de localStorage favoris on le crée
    localStorage.fav=JSON.stringify({favoris:[]});
  }

  var fav=recup_fav();
  var elmt_fav=fav.favoris;

  if (elmt_fav.length==0){ //si pas de favoris
    etoile("vide");
    etoile_fav.addEventListener("click",ajouter_fav);
    return;
  }
  else{ //si des favoris
    for (var i=0;i<fav.favoris.length;i++){
      if (elmt_fav[i]==ch_search.value){ //si le champ de recherche est déjà dans les favoris
        etoile("pleine");
        etoile_fav.removeEventListener("click",ajouter_fav);
        etoile_fav.addEventListener("click",function(){
          supprimer_fav("etoile");
        });
        return;
      }
      else{ //si le champ de recherche n'est pas dans les favoris
        etoile("vide");
        etoile_fav.removeEventListener("click",supprimer_fav);
        etoile_fav.addEventListener("click",ajouter_fav);
      }
    }
  }
}

function recup_fav(){ //recupère les favoris
  var fav=JSON.parse(localStorage.fav);
  return fav;
}

function etoile(cote){  //affiche les étoiles
  var img_etoile_pleine=document.getElementById("img-pleine");
  var img_etoile_vide=document.getElementById("img-vide");
  if(cote=="pleine"){ //si l'étoile est pleine
    img_etoile_pleine.style.display="block";
    img_etoile_vide.style.display="none";
    etoile_fav.style.backgroundColor="var(--main-green)";
    etoile_fav.style.border=".1em solid grey"
  }
  else{   //si l'étoiile est vide
    etoile_fav.style.backgroundColor="grey"; 
    img_etoile_pleine.style.display="none";
    img_etoile_vide.style.display="block";
  }
}

function ajouter_fav(){ //ajoute un favoris
  //console.log("champs recherche=",ch_search.value);
  if(ch_search.value==""){ //si champs de recherche vide
    vider_resultat();
    const rien_favoris = document.createElement("p");
    rien_favoris.innerHTML = "Vous ne pouvez pas ajouter rien aux favoris";
    erreur.appendChild(rien_favoris);
  }
  else{ //si champs de recherche rempli
    var fav=recup_fav();
    fav.favoris.push(ch_search.value);
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
    var elmt_fav_supp=ch_search.value;
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
        ch_search.value=this.textContent;
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
    //console.log('gestion autocomplete');
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
