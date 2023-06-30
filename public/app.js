/* ------------------------------------------

Fichier principal javascrpt de l'application

------------------------------------------ */

/* ------------------------------------------

Initialisaton

------------------------------------------ */

//définition des constantes - liaison avec les éléments du DOM
document.getElementById("btn-lancer-recherche").addEventListener("click", rechercher); //lance la recherche avec le bouton
const blocResultats = document.getElementById("bloc-resultats");
const recherche = document.getElementById("champs_recherche");
const erreur = document.getElementById("erreur");
const etoile_fav = document.getElementById("btn-favoris");
const liste_json = 'ressources/liste_company.json'
ch_search = document.getElementById("champs_recherche");

//permet à l'initialisation de la fenêtre de lancer la recherche avec la touche entrée + lancer l'autocomplétion + focus sur le champs de recherche + vide le champs de recherche 
ch_search.addEventListener("keydown", event => {
  if (event.keyCode == 13)
    rechercher();
})
ch_search.addEventListener('input', gestion_autocomplete);
ch_search.focus();
ch_search.value = "";

//définition des variables globales js - utilisées dans les fonctions
var map = null;
let entreprises = [];
let companies_autocompletion = [];
let vulnerabilities = [];
let shodanData = [];
let date30joursAvant
let datejour
let latitude
let longitude


/* ------------------------------------------

Fonctions principales de recherche et d'affichage

------------------------------------------ */

//fonction qui récupère l'IP de l'utilisateur

function son_ip() {
  fetch('https://ifconfig.me/ip', {
    headers: {
      'Accept': 'application/json'
    }
  })
    .then(response => response.text())
    .then(text => {
      const ipAddressElement = document.getElementById('mon_ip');
      ipAddressElement.textContent = text;
      ipAddressElement.addEventListener('click', function () {
        ch_search.value = text;
        rechercher();
      });
    })
    .catch(error => console.error(error));

  document.getElementById('bloc-gif-attente').style.display = 'none';
}
son_ip();


/*-------------------------------------------------------------------*/


//fonction qui sors la date du jour et la date d'il y a 30 jours au format ISO

function bonne_date() {
  console.log("------- TOP1 : bonne_date en cours -------")
  const today = new Date();

  const datejour = today.toISOString().replace(/Z$/, '');
  console.log("date du jour : ", datejour); // affiche la date d'aujourd'hui au format ISO 

  const date30joursAvant = new Date(today.setDate(today.getDate() - 30)).toISOString().replace(/Z$/, '');
  console.log("date 30 jours avant :", date30joursAvant); // affiche la date d'il y a 30 jours au format ISO

  return [date30joursAvant, datejour];
}


/*-------------------------------------------------------------------*/


//fonction qui vérifie si l'entrée est une adresse IP

function estUneIP(input) {
  console.log("------- TOP2 : estUneIp en cours -------")

  //vérification si l'entrée est une adresse IPv4 valide

  const ipv4Pattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

  //vérification si l'entrée est une adresse IPv6 valide

  const ipv6Pattern = /^((?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|(?!fe80:)[0-9a-fA-F]{1,4}:(:[0-9a-fA-F]{1,4}){1,6}|fe80:(:[0-9a-fA-F]{1,4}){1,6}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,4})$/;

  return ipv4Pattern.test(input) || ipv6Pattern.test(input);
}


/*-------------------------------------------------------------------*/


function estUnDomaine(input) {

  console.log("------- TOP2 : estUnDomaine -------")

  //Vérification si c'est bien un nom de domaine

  var expressionReguliere = /^[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,})$/;
  return expressionReguliere.test(input);
}


/*-------------------------------------------------------------------*/


//fonction qui vide le bloc de résultat, le bloc d'erreur la map et les tableaux

function vider_resultat() {
  blocResultats.innerHTML = "";
  erreur.innerHTML = "";
  document.getElementById("map").style.display = "none";
  document.getElementById("text_map").style.display = "none";
  entreprises = [];
  companies_autocompletion = [];
  vulnerabilities = [];
  shodanData = [];
  latitude = null;
  longitude = null;
}


/*-------------------------------------------------------------------*/


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

    document.getElementById("bloc-gif-attente").style.display = "block";

    const [dateAncienne, dateActuelle] = bonne_date();

    //vérification si l'entrée est une adresse IP

    if (estUneIP(terme_recherche)) {
      
      console.log("C'est une adresse IP.");

      await recherche_shodan(terme_recherche); //appel de la fonction pour rechercher l'IP
      console.log("shodanData:", shodanData);

      //affiche info de l'IP si une IP est trouvé sinon affiche "Aucune entreprise ou IP trouvée"

      if (shodanData.hasOwnProperty("error") || shodanData === undefined) {
        erreur.appendChild(document.createTextNode(shodanData.error));
        console.log("Aucune valeurs reconnus");

      } else {

        var nom_societe = shodanData.org;
        nom_societe = nom_societe.split(" ")[0];
        console.log("nom_societe:", nom_societe)
        terme_recherche = nom_societe; //récupère le nom de l'entreprise

      }

    } else if (estUnDomaine(terme_recherche) == true) { //Si c'est un domaine

      console.log("C'est un domaine.");

      await recherche_shodanSubdomain(terme_recherche);
      
      console.log("shodanData:", shodanData);


    } else {

        //appel de la fonction pour rechercher l'entreprise 

        await recherche_companie(terme_recherche);

        //affiche info de l'entreprise si une entreprise est trouvé

        if (entreprises[0] === undefined || entreprises.hasOwnProperty("erreur")) {
          document.getElementById("bloc-resultats").textContent = "Aucune entreprise trouvée";
          console.log("Aucune entreprise trouvée");
        } else {
          console.log("Liste entreprises:", entreprises[0])
          /*for (let i = 0; i < entreprises.length; i++) {
            console.log("Liste entreprises:",entreprises[i])
          } */
        }
    }

    if (entreprises[0] === undefined || entreprises.hasOwnProperty("erreur") || shodanData.hasOwnProperty("error") || shodanData === undefined) {
      console.log("Aucune entreprise ou IP trouvée");
      const vulnInfo = document.createElement("p");
      vulnInfo.innerHTML = "/!\\ Aucune entreprise ou IP trouvée /!\\";
      erreur.appendChild(vulnInfo);
    } else {

      //appel de la fonction pour rechercher les vulnérabilités de l'entreprise sur les 30 derniers jours

      await rechercher_vulnerabilites(terme_recherche, dateAncienne, dateActuelle);

      //affiche les vulnérabilités si il y en a sinon affiche erreur

      if (vulnerabilities[0] === undefined) {
        console.log("Aucune vulnérabilité trouvée");
        const vulnInfo = document.createElement("p");
        vulnInfo.innerHTML = "/!\\ Aucune vulnérabilité trouvée ou entreprise indéfinie /!\\";
        erreur.appendChild(vulnInfo);
      } else {
        let n = 0;
        for (let i = 0; i < vulnerabilities.length; i++) { //affiche les vulnérabilités (pour debeug)
          //console.log("Liste vulnérabilités:", vulnerabilities[i]);
        }
        console.log("Nombre de vulnérabilités trouvés sur les 30 derniers jours :", vulnerabilities.length);
      }
    }

    //appel de la fonction qui affiche les résultats

    await afficher_resultat();

    //appel de la fonction qui gère les favoris

    await favoris();

    //supprimer gif d'attente

    document.getElementById("bloc-gif-attente").style.display = "none";
  }
}


/*-------------------------------------------------------------------*/


//fonction qui appel l'API pour rechercher l'enreprise et récupérer les données

async function recherche_companie(terme_recherche) {
  console.log("------- TOP3 : recherche_companie en cours -------");

  return new Promise((resolve, reject) => {
    fetch('https://recherche-entreprises.api.gouv.fr/search?q=' + terme_recherche)
      .then(response => response.json())
      .then(data => { //récupération des données et stockage dans un tableau "entreprises"
        entreprises = [];
        for (let i = 0; i < 1; i++) {
          entreprises.push(data.results[i]);
        }
        resolve(entreprises);
      })
      .catch(error => reject(error));
  });
}


/*-------------------------------------------------------------------*/


//fonction qui va rechercher si des vulnérabilités ont été détectées sur l'entreprise

async function rechercher_vulnerabilites(nomEntreprise, dateAncienne, dateActuelle) {
  console.log("------- TOP4 : rechercher_vulnerabilites en cours -------");

  //configure l'URL avec le nom de l'entreprise et les dates que l'on veut pour la recherche (30 derniers jours)
  const url = `https://services.nvd.nist.gov/rest/json/cves/2.0?keywordSearch=${nomEntreprise}&pubStartDate=${dateAncienne}&pubEndDate=${dateActuelle}`;
  console.log("URL:", url);

  //récupération des données
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url);
      const data = await response.json();

      console.log(`Vulnérabilités pour l'entreprise ${nomEntreprise}:`);

      data.vulnerabilities.forEach(vulnerability => { //stockage des données dans un tableau "vulnerabilities"
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


/*-------------------------------------------------------------------*/


async function recherche_shodan(terme_recherche) {
  console.log("------- TOP3 : recherche_shodan en cours -------");

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`/api/data/${terme_recherche}`);
      const data = await response.json();

      // Stocke les données récupérées dans la variable globale shodanData

      shodanData = data;

      resolve(shodanData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      reject(error);
    }
  });
}


/*-------------------------------------------------------------------*/


async function recherche_shodanSubdomain(terme_recherche) {
  console.log("------- TOP3 : recherche_shodanSubDomain en cours -------");

  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(`/api/dataSubDomain/${terme_recherche}`);
      const data = await response.json();

      // Stocke les données récupérées dans la variable globale shodanData

      shodanData = data;

      resolve(shodanData);
    } catch (error) {
      console.error("Erreur lors de la récupération des données:", error);
      reject(error);
    }
  });
}

/*-------------------------------------------------------------------*/


//fonction qui va afficher les résultats des recherches


/*-------------------------------------------------------------------*/


function afficher_resultat(definition) {
  console.log("------- TOP5 : afficher_resultat en cours -------");

  //si les données viennent de Shodan et contiennent des sous domaines

  if(shodanData.hasOwnProperty('subdomains')){

    const resultatElement = document.createElement("div");
    resultatElement.id="resultat";

    // Récup des sous-domaines à partir de shodanData
    const sousDomaines = shodanData.subdomains;

    // Création d'une liste (ul) pour afficher les sous-domaines
    const listeSousDomaines = document.createElement("ul");

    // Parcoure les sous-domaines et créez des éléments de liste (li) pour chaque sous-domaine
    sousDomaines.forEach((sousDomaine) => {
      const elementLi = document.createElement("li");
      elementLi.textContent = sousDomaine + "." + terme_recherche;
      listeSousDomaines.appendChild(elementLi);
    });

    // Ajoute la liste des sous-domaines à l'élément HTML de résultat
    blocResultats.appendChild(resultatElement);
    
    resultatElement.innerHTML = `<h3>Liste des sous domaines de ${terme_recherche} :</h3>`

    // Ajout des résultats dans la div bloc-resultats
    blocResultats.appendChild(listeSousDomaines);

  }

  console.log("shodanData:", Object.keys(shodanData).length)
  if (shodanData.hasOwnProperty("error")) {

  } else if (shodanData.hasOwnProperty('city')) {
    
    //console.log("Données venant de Shodan");
    const ipInfo = document.createElement("div");

    //selectionne les informations choisies de l'IP 
    ipInfo.innerHTML = `<h3>Informations venant de Shodan :</h3> 
                        <p><strong> Entreprise : </strong> ${shodanData.org}</p>
                        <p><strong>Adresse IP :</strong> ${shodanData.ip_str}</p>
                        <p><strong>Ville :</strong> ${shodanData.city} (${shodanData.region_code})</p>
                        <p><strong>Pays :</strong> ${shodanData.country_name} (${shodanData.country_code})</p>
                        <p><strong>OS :</strong> ${shodanData.os}</p>
                        <p><strong>code ASN :</strong> ${shodanData.asn}</p>`;

    //selectionne les domaines associés à l'IP si il y en a
    const domaines = document.createElement("div");
    domaines.innerHTML = `<h3>Domaines associés :</h3>`;
    const listeDomaines = document.createElement("ul");
    shodanData.domains.forEach(domaine => {
      //console.log("domaine:",domaine)
      const domaineItem = document.createElement("li");
      domaineItem.textContent = domaine;
      listeDomaines.appendChild(domaineItem);
    });

    //selectionne les ports ouverts si il y en a
    const ports = document.createElement("div");
    ports.innerHTML = `<h3>Ports ouverts :</h3>`;
    const listePorts = document.createElement("ul");
    shodanData.ports.forEach(port => {
      //console.log("port:",port)
      const portItem = document.createElement("li");
      portItem.textContent = port;
      listePorts.appendChild(portItem);
    });

    //affiche les résultats
    blocResultats.appendChild(ipInfo);
    blocResultats.appendChild(domaines);
    blocResultats.appendChild(listeDomaines);
    blocResultats.appendChild(ports);
    blocResultats.appendChild(listePorts);

    //stocke les coordonnées de l'IP pour l'afficher sur la carte
    latitude = shodanData.latitude;
    longitude = shodanData.longitude;

  }

  //si les données viennent de l'API Entreprise
  if (entreprises[0] === undefined || entreprises.hasOwnProperty("erreur")) {
    console.log("Pas de données venant de l'API Entreprise");
  } else if (entreprises && entreprises.length > 0) {
    const entrepriseInfo = document.createElement("div");

    //selectionne les informations choisies de l'entreprise
    entrepriseInfo.innerHTML = `<h3>Informations sur l'entreprise</h3>
                                 <p><strong>Nom :</strong> ${entreprises[0].nom_raison_sociale}</p>
                                 <p><strong>Adresse :</strong> ${entreprises[0].siege.adresse}</p>
                                 <p><strong>SIRET :</strong> ${entreprises[0].siege.siret}</p>
                                 <p><strong>SIREN :</strong> ${entreprises[0].siren}</p>
                                 <p><strong>Code postal :</strong> ${entreprises[0].siege.code_postal}</p>`;

    //affiche les résultats
    blocResultats.appendChild(entrepriseInfo);

    //stocke les coordonnées de l'entreprise pour l'afficher sur la carte
    latitude = parseFloat(entreprises[0].siege.latitude);
    longitude = parseFloat(entreprises[0].siege.longitude);
  }

  //si des vulnérabilités ont été trouvées
  if (vulnerabilities && vulnerabilities.length > 0) {
    const vulnInfo = document.createElement("div");

    vulnInfo.innerHTML = `<h3>Vulnérabilités trouvées (30 derniers jours) (${vulnerabilities.length}) :</h3>
                        <p>Vous pouvez consulter les détails de chaque vulnérabilité en cliquant sur son nom dans la liste.</p>`;


    //Crée un élément <select>
    const select = document.createElement("select");
    select.style.width = "100%";
    select.id = "vulnerabilitiesSelect";

    //Ajoute un écouteur d'événements pour gérer les clics sur les options de la liste déroulante
    select.addEventListener('change', function () {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption.value) {
        window.open(`https://cve.mitre.org/cgi-bin/cvename.cgi?name=${selectedOption.value}`, '_blank');
      }
    });

    //Sélectionne les vulnérabilités trouvées
    vulnerabilities.forEach((vulnerability, index) => {
      //Crée un élément <option> pour chaque vulnérabilité
      const option = document.createElement("option");
      option.value = vulnerability.cve.id;
      option.textContent = `${index + 1}. ${vulnerability.cve.id}: ${vulnerability.cve.descriptions[0].value}`;
      select.appendChild(option);
    });

    //affiche les résultats
    vulnInfo.appendChild(select);
    blocResultats.appendChild(vulnInfo);
  }

  //affiche la carte si des coordonnées ont été trouvées
  if (latitude && longitude) {
    initMap(latitude, longitude);
    document.getElementById("map").style.display = "block";
    document.getElementById("text_map").style.display = "block";
  }
  else {
    const mapInfo = document.createElement("p");
    mapInfo.innerHTML = "/!\\ Aucune position géographique trouvée";
    erreur.appendChild(mapInfo);
  }

}


//requete ajax pour récupérer l'IP de l'utilisateur
function request(url, retour, autre) {
  document.getElementById("bloc-gif-attente").style.display = "block";
  fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`)
    .then(response => {
      if (response.ok) return response.json()
      throw new Error('Network response was not ok.')
    })
    .then(data => retour(data, autre));
}

/* ------------------------------------------

gestion de la map

------------------------------------------ */

//fonction d'initialisation de la carte
function initMap(lat,lon) {
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


/* ------------------------------------------

gestion des favoris

------------------------------------------ */

favoris();
document.addEventListener('keyup', function (e) { favoris(); }); //si on appuie sur une touche du clavier on vérifie si le champ de recherche est déjà dans les favoris

//fonction de gestion des favoris dans le localStorage  
function favoris() {
  //si pas de localStorage "favoris" on le crée
  if (localStorage.fav == undefined) {
    localStorage.fav = JSON.stringify({ favoris: [] });
  }

  //récupère les favoris
  var fav = recup_fav();
  var elmt_fav = fav.favoris;

  //si pas de favoris
  if (elmt_fav.length == 0) {
    etoile("vide"); //affiche une étoile vide
    etoile_fav.addEventListener("click", ajouter_fav); //met l'étoile en cliquable pour ajouter un favori
    return;
  }
  else { //si des favoris
    for (var i = 0; i < fav.favoris.length; i++) { //parcours les favoris
      if (elmt_fav[i] == ch_search.value) { //si le champ de recherche est déjà dans les favoris
        etoile("pleine"); //affiche une étoile pleine
        etoile_fav.removeEventListener("click", ajouter_fav); //enlève l'évènement "click" pour ajouter un favori
        etoile_fav.addEventListener("click", function () { //met l'étoile en cliquable pour supprimer un favori
          supprimer_fav("etoile");
        });
        return;
      }
      else { //si le champ de recherche n'est pas dans les favoris
        etoile("vide"); //affiche une étoile vide
        etoile_fav.removeEventListener("click", supprimer_fav); //enlève l'évènement "click" pour supprimer un favori
        etoile_fav.addEventListener("click", ajouter_fav); //met l'étoile en cliquable pour ajouter un favori
      }
    }
  }
}

/*-------------------------------------------------------------------*/

//fonction pour récupérer les favoris
function recup_fav() {
  var fav = JSON.parse(localStorage.fav); //récupère les favoris dans le localStorage
  return fav;
}

/*-------------------------------------------------------------------*/

//fonction pour afficher les étoiles pleines ou vides
function etoile(cote) {
  var img_etoile_pleine = document.getElementById("img-pleine");
  var img_etoile_vide = document.getElementById("img-vide");
  if (cote == "pleine") { //si l'étoile est pleine
    img_etoile_pleine.style.display = "block";
    img_etoile_vide.style.display = "none";
    etoile_fav.style.backgroundColor = "var(--main-green)";
    etoile_fav.style.border = ".1em solid grey"
  }
  else {   //si l'étoiile est vide
    etoile_fav.style.backgroundColor = "grey";
    img_etoile_pleine.style.display = "none";
    img_etoile_vide.style.display = "block";
  }
}

/*-------------------------------------------------------------------*/

//fonction pour ajouter un favori
function ajouter_fav() {
  //console.log("champs recherche=",ch_search.value);

  //si champs de recherche vide
  if (ch_search.value == "") {
    vider_resultat(); //vide les résultats
    const rien_favoris = document.createElement("p");
    rien_favoris.innerHTML = "Vous ne pouvez pas ajouter rien aux favoris"; //affiche un message d'erreur
    erreur.appendChild(rien_favoris);
  }
  else { //si champs de recherche rempli
    var fav = recup_fav(); //récupère les favoris
    fav.favoris.push(ch_search.value); //ajoute le favoris dans le tableau des favoris
    localStorage.fav = JSON.stringify(fav); //enregistre les favoris dans le localStorage
    favoris();
    affiche_fav(); //affiche les favoris
  }
}

/*-------------------------------------------------------------------*/

//fonction pour supprimer les favoris
function supprimer_fav(cmt) {
  //console.log("supprimer_fav");
  var fav = recup_fav();
  var elmt_fav = fav.favoris;
  favoris();

  //si clic sur étoile
  if (cmt == "etoile") {
    var elmt_fav_supp = ch_search.value;
  }
  else { //si clic sur le bouton supprimer
    var elmt_fav_supp = cmt;
  }

  //boucle pour chaque favoris
  for (var i = 0; i < fav.favoris.length; i++) {
    if (elmt_fav[i] == elmt_fav_supp) { //si le favoris à supprimer est le favoris en cours
      if (confirm("êtes vous sur de vouloire supprimer le favoris ?")) { //confirmation de suppression
        fav.favoris.splice(i, 1);
        localStorage.fav = JSON.stringify(fav);
        favoris()
        affiche_fav();
        return;
      }
    }
  }
}

/*-------------------------------------------------------------------*/

//fonction pour afficher les favoris
function affiche_fav() {
  clear_fav(); //efface les favoris
  var liste = document.getElementById("liste-favoris");
  var empty = document.getElementById("info-vide");
  var btn_supp = document.getElementById("btn-supp");
  var fav = recup_fav();

  //si pas de favoris
  if (fav.favoris.length == 0) {
    empty.style.display = "block";
    btn_supp.style.display = "none";
  }
  else { //si des favoris
    empty.style.display = "none";
    btn_supp.style.display = "block";
    btn_supp.addEventListener("click", function () { //met le bouton supprimer en cliquable
      localStorage.clear();
      favoris();
      affiche_fav();
    });

    //boucle pour chaque favoris pour les afficher sous forme de liste
    for (var i = 0; i < fav.favoris.length; i++) {
      newLi = document.createElement("li");
      newA = document.createElement("a");
      newA.textContent = fav.favoris[i];
      newA.addEventListener("click", function () {
        ch_search.value = this.textContent;
        rechercher();
      });

      //création de l'image "croix" pour supprimer le favoris
      var img_croix = document.createElement("img");
      img_croix.src = "images/croix.svg";
      img_croix.title = "Supprimer le favoris";
      img_croix.width = "22";
      img_croix.setAttribute('id', fav.favoris[i]) //ajoute l'id du favoris à l'image
      img_croix.addEventListener("click", function () {
        var ID = this.getAttribute('id'); //récupère l'id du favoris
        supprimer_fav(ID); //supprime le favoris correspondant à l'id
      });
      newLi.appendChild(newA);
      newLi.appendChild(img_croix);
      liste.appendChild(newLi);
    }
  }
}

/*-------------------------------------------------------------------*/

//fonction pour effacer tous les favoris
function clear_fav() {
  var liste = document.getElementById("liste-favoris");

  //boucle pour chaque favoris pour les supprimer
  while (liste.firstChild) {
    liste.removeChild(liste.firstChild);
  }
}


/* ------------------------------------------

gestion de l'auto-completion

------------------------------------------ */

async function fetchCompanies() {
  if (companies_autocompletion.length > 0) {
    console.log('Le tableau companies_autocompletion est déjà rempli. Pas besoin de récupérer les données.');
    return;
  }

  try {
    // Récupération des données du fichier JSON défini en constante et ajout dans le tableau "companies_autocompletion"
    const response1 = await fetch(liste_json);
    const data = await response1.json();
    for (let i = 0; i < data.length; i++) {
      companies_autocompletion.push(data[i]);
    }

    // Récupération des entreprises présentes dans l'ETF S&P500 (fichier JSON) et ajout dans le tableau "companies_autocompletion"
    const response2 = await fetch('/api/companies');
    const companies_autocompletion_deb = await response2.json();
    console.log(companies_autocompletion_deb.length);
    for (let i = 0; i < companies_autocompletion_deb.length; i++) {
      companies_autocompletion.push(companies_autocompletion_deb[i].name);
    }
    console.log(companies_autocompletion.length);
    // console.log('Données du fichier JSON :', companies_autocompletion);

    // testElements(companies_autocompletion); // Décommenter pour effectuer le test de la liste en JSON avec l'API
  } catch (error) {
    console.error('Erreur lors du chargement du fichier JSON ou de la récupération des entreprises :', error);
  }
}


/*-------------------------------------------------------------------*/

// Fonction pour créer l'autocomplétion
function autocomplete(input, suggestions) {
  console.log('autocomplete');
  const container = document.getElementById('autocomplete-container');
  container.innerHTML = '';

  //boucle pour chaque suggestion
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

/*-------------------------------------------------------------------*/

// Fonction pour gérer l'autocomplétion
function gestion_autocomplete(event) {
  fetchCompanies();
  console.log('gestion autocomplete');
  const input = event.target;
  const searchTerm = input.value.toLowerCase();

  // Si le champ de recherche est vide, on ne fait rien
  if (searchTerm === '') {
    autocomplete(input, []);
    console.log("vide");
    return;
  }

  // Filtrer les suggestions pour ne conserver que les mots qui commencent par le terme recherché
  const suggestions = companies_autocompletion.filter((company) =>
    company.toLowerCase().startsWith(searchTerm)
  );

  console.log("taille json companie:", companies_autocompletion.length);

  // Appel de la fonction autocomplete pour afficher les suggestions
  autocomplete(input, suggestions);

   // Ajout d'un événement d'écouteur pour le clic sur les éléments de la liste
   const autocompleteList = document.getElementById('autocomplete-container');
   autocompleteList.addEventListener('click', function (event) {
     const selectedCompany = event.target.innerText;
     input.value = selectedCompany;
     //rechercher();
   });
}



/* ------------------------------------------

fonction qui test simplement la liste en json choisi avec l'api d'entreprise française pour savoir si toutes les entreprises sur le json sont bien sur l'api

------------------------------------------ */

var elements = [];
const liste_json2 = 'ressources/liste_company.json' //changer cette constante avec sa liste d'entreprise pour l'autocompletition

/*-------------------------------------------------------------------*/

//décommenter la ligne ci-dessous pour effectuer le test de la liste en json choisis avec l'api
//recup_json(liste_json); 
async function recup_json(liste_json) {

  fetch(liste_json)
    .then((response) => response.json())
    .then((data) => {
      console.log('Données du fichier JSON:', data)
      elements = data;
      testElements(elements)
    })
    .catch((error) => console.error('Erreur lors du chargement du fichier JSON:', error));
}

/*-------------------------------------------------------------------*/

async function waitRandomSeconds(min, max) {
  const randomSeconds = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, randomSeconds * 1000));
}

/*-------------------------------------------------------------------*/

async function testElements(elements) {
  const noResults = [];

  console.log("Début de la recherche pour les éléments :", elements);

  // Boucle qui teste chaque element.name de la liste elements
  for (var i = 0; i < elements.length; i++) {
    // Attendre un nombre aléatoire de secondes entre 3 et 20
    //await waitRandomSeconds(3, 20); //pas utile en général mais si l'api est surchargé il faut attendre un peu entre chaque requête

    console.log(`Recherche en cours pour l'élément : ${elements[i]}`);
    const url = 'https://recherche-entreprises.api.gouv.fr/search?q=' + elements[i];

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.results.length === 0) {
        console.log(`AUCUN résultat trouvé pour l'élément : ${elements[i]}`);
        noResults.push(elements[i]);
      } else {
        //console.log(`Résultats trouvés pour l'élément : ${elements[i]}`);
      }
    } catch (error) {
      console.error(`Erreur lors de la recherche pour l'élément ${elements[i]}:`, error);
    }
  }

  console.log("Recherche terminée. Aucun résultat pour les éléments suivants :", noResults);

  return noResults;
}
