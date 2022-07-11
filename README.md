# ressource-aggregator (Mediacentre v2)

# À propos de l'application ressource-aggregator (Mediacentre v2)
* Licence : [AGPL v3](http://www.gnu.org/licenses/agpl.txt) - Copyright CGI
* Développeur : CGI
* Financeurs : CGI
* Description : Module permettant d'accéder à la liste et de rechercher des ressources GAR, PMB et Moodle accessibles à l'utilisateur

# Présentation du module

L'application **ressource-aggregator (Mediacentre v2)** devrait permettre l'accès à/la recherche dans toutes les ressources disponibles pour l’utilisateur, à savoir :
 - Les ressources externes qui ne demandent pas d’authentification ;
 - Les connecteurs type Single Sign On ;
 - Les ressources via fédération d’identité ;
 - Le connecteur vers PMB (ou autres logiciels SIGB) pour les ressources physiques du CDI ;
 - Les ressources produites sur l’ENT (Moodle et autres contenus types « Exercices et évaluation », etc.) ;
 - Les ressources du GAR.

## Configuration
<pre>
{
  "config": {
   ...
    "sources": {
        "fr.openent.mediacentre.source.GAR": true,
        "fr.openent.mediacentre.source.Moodle": true,
        "fr.openent.mediacentre.source.PMB": true,
        "fr.openent.mediacentre.source.Signet": true
    },
    "whitelist-sources": [],
    "textbook_typology": [
        "MAN"
    ],
    "wsPort": 3000,
    "elasticsearch": true,
    "elasticsearchConfig" : {
        "server-uri": "${elasticServerURI}",
        "index": "${elasticIndexName}",
        "elasticsearch-ssl": "${elasticSearchSsl}",
        "username": "${elasticSearchUsername}",
        "password": "${elasticSearchPassword}"
    }
  }
}
</pre>

Dans votre springboard, vous devez inclure des variables d'environnement :

<pre>
whitelist-sources = ${Array}
elasticServerURI = ${String}
elasticIndexName = ${String}
elasticSearchSsl = ${Boolean}
elasticSearchUsername = ${String}
elasticSearchPassword = ${String}
</pre>