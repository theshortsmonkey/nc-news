# Northcoders News API

## What is it?
This is an API for a news articles PSQL database.

It has articles that:
- are divided into topics. 
- users can add (and remove) comments on.
- can be up or down voted.
- can be deleted

The comments:
- can be up or down voted
- can be deleted

It has topics:
- that are linked to articles

Actions can only be performed by users with an account.



## Hosted API
https://nc-news-gyvj.onrender.com/api

Available endpoints are listed at the above address.

## Setup 
Files required to connect to databases:
- .env.development
- .env.test
- .env.production
- setup.sql

These files should contain the enviroment variable 'PGDATABASE' or 'DATABASE_URL' pointing to the relevant test and development database names. Speak to secret keeper to get database names/urls.
setup.sql is configured to create clean copies of the required databases.

Installing dependencies:
- all dependencies are defined in the package.json file and should be installed using the following command before seeding the database.

      'npm install' 
- developer dependencies can be installed with

      'npm install -D'

Seeding a clean local copy of the database:
- the development database can be seeded using the commands:

      'npm run setup-dbs' (this only needs to be run once)

      'npm run seed'


## Minimum application verions:
- Nodes.js - v21.6.1
- Postgres = v8.7.3
