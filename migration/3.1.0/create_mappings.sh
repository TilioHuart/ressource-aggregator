#!/bin/bash
curl -X PUT "http://192.168.240.31:9200/mediacentre" -H 'Content-Type: application/json' -d'
{
    "settings": {
      "index": {
        "blocks": {
          "read_only_allow_delete": "false"
        }
      },
      "analysis": {
        "normalizer": {
          "lower_normalizer": {
            "type": "custom",
            "char_filter": [],
            "filter": ["lowercase", "asciifolding"]
          }
        }
      }
    },
    "mappings": {
        "resources": {
            "properties": {
                "title": {
                    "type": "keyword",
                    "normalizer": "lower_normalizer"
                },
                "authors": {
                    "type": "keyword",
                    "normalizer": "lower_normalizer"
                },
                "editors": {
                    "type": "keyword",
                    "normalizer": "lower_normalizer"
                },
                "image": {
                    "type": "keyword",
                    "index": false
                },
                "disciplines": {
                    "type": "keyword",
                    "normalizer": "lower_normalizer"
                },
                "levels": {
                    "type": "keyword",
                    "normalizer": "lower_normalizer"
                },
                "document_types": {
                    "type": "keyword",
                    "normalizer": "lower_normalizer"
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
                },
                "structure": {
                  "type": "keyword"
                },
                "description": {
                  "type": "keyword",
                  "normalizer": "lower_normalizer"
                }
            }
        }
    }
}
'