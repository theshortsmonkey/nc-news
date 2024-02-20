# Northcoders News API

## What is it?
This is an API for a news articles PSQL database.

It has articles that are divided into topics. 
Users can add (and remove) comments to articles.
Articles can be up or down voted.


## Hosted API
https://nc-news-gyvj.onrender.com/api

Available endpoints are listed at the above address.

## Setup 
Files required to connect to local databases:
- .env.development
- .env.test

These files should contain the enviroment variable 'PGDATABASE' pointing to the relevant test and development database names. Speak to secret keeper to get database names.

Installing dependencies

- all dependencies are defined in the package.json file and should be installed using the following command before seeding the database.

      'npm install' 
- developer dependencies can be installed with

      'npm install -D'

Seeding a clean local copy of the database
- the development database can be seeded using the commands:

      'npm run setup-dbs' (this only needs to be run once)

      'npm run seed'


## Minimum application verions:
- Nodes.js - v21.6.1
- Postgres = v8.7.3
