CREATE TABLE patients(
    pid serial not null primary key,
    firstname varchar(50),
    surname varchar(50),
    id_number varchar(16),
    dob date not null,
    contact_details jsonb,
    unique(firstname,surname,id_number)
)