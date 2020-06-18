#!/bin/bash
curl -X PUT "http://localhost:9200/mediacentre" -H 'Content-Type: application/json' -d'
{
    "mappings": {
        "resources": {
            "properties": {
                "title": {
                    "type": "text"
                },
                "authors": {
                    "type": "keyword"
                },
                "editors": {
                    "type": "keyword"
                },
                "image": {
                    "type": "keyword",
                    "index": false
                },
                "disciplines": {
                    "type": "keyword"
                },
                "levels": {
                    "type": "keyword"
                },
                "document_types": {
                    "type": "keyword"
                },
                "link": {
                    "type": "keyword",
                    "index": false
                },
                "source": {
                    "type": "keyword"
                },
                "id": {
                    "type": "keyword"
                },
                "date": {
                    "type": "date",
                    "format": "yyyy-MM-dd HH:mm:ss||yyyy-MM-dd||epoch_millis",
                    "index": false
                },
                "user": {
                    "type": "keyword",
                    "index": false
                }
            }
        }
    }
}
'