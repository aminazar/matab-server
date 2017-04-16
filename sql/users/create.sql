CREATE TABLE users(
    uid serial not null primary key,
    name varchar(40) not null unique,
    display_name varchar(40),
    is_doctor boolean not null default true,
    secret varchar(256) --hashed password
)