create table "Card"
(
  id serial not null
    constraint "Card_pkey"
			primary key,
  name text not null,
  set text
  not null,
	"scryfallId" uuid,
	"tcgplayerId" integer
);

  alter table "Card" owner to postgres;

