CREATE TABLE patients(
    pid serial not null primary key,
    firstname varchar(50),
    surname varchar(50),
    id_number varchar(16),
    dob date not null,
    vip boolean not null default false,
    contact_details jsonb,
    unique(firstname,surname,id_number)
)
-- alter table patients add column vip boolean not null default false
-- update patients set vip=true where pid in (select pid from (select pid,contact_details->'vip' as vip from patients) t where cast(vip as text)='true');