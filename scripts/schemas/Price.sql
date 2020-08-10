create table "Price"
(
  id serial not null
    constraint "Price_pkey"
			primary key,
  "cardId" integer
    constraint card_id_foreign
			references "Card",
  "tcgplayerId" integer,
  low numeric(12,2),
  average numeric(12,2),
  high numeric(12,2),
  market numeric(12,2),
  foil numeric(12,2),
  "createdAt" timestamp,
  "updatedAt" timestamp
);

alter table "Price" owner to postgres;

create unique index price_tcgplayerid_uindex
	on "Price" ("tcgplayerId");

