#!/bin/bash
curl -X PUT "http://localhost:9200/mediacentre" -H 'Content-Type: application/json' -d'
{
    "mappings": {
        "resources": {
            "properties": {
                "title": {
                    "type": "keyword"
                },
                "author": {
                    "type": "keyword"
                },
                "editor": {
                    "type": "keyword"
                },
                "image": {
                    "type": "keyword",
                    "index": false
                },
                "discipline": {
                    "type": "keyword"
                },
                "level": {
                    "type": "keyword"
                },
                "document_type": {
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
                    "type": "keyword",
                    "index": false
                },
                "date": {
                    "type": "date",
                    "format": "epoch_millis",
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