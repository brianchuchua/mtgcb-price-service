# MTG CB Price Service

The *MTG CB Price Service* provides API endpoints to fetch card prices from the following sources:

- [TCGPlayer](https://docs.tcgplayer.com/reference)

It maintains a postgres database with `Card` and `Price` tables. Upon startup, it updates its `Card` table from MTG CB's legacy API and updates `Prices` from TCGPlayer. It then caches this information in memory.

It also creates a cron job to do the above once per day.

Currently, MTG CB Legacy executes a cron job to call this service once a day to receive `Price` updates.

In the future, 

## Installation

Install Docker.

`docker run --name postgres-mtgcb-price-service -p 1337:5432 -e POSTGRES_PASSWORD=MyPassword -d postgres`

`docker container ls -a` for your container hash
 
```
docker exec -it <container_hash> bash
root@4faeb6dab489:/# psql -U postgres
postgres-# CREATE DATABASE mtgcb_prices;
postgres-# \q (or CTRL-D)
```

Run the scripts in `./scripts`.

Duplicate `sample.env` as `.env` and populate with appropriate values.

`yarn`

## Execution

`yarn dev`

## Testing

`yarn test`

## Grievances

- Top level async not being fully supported yet
- Having to use babel until https://github.com/facebook/jest/issues/9430 is done

