create table waiting_q(
    wsid serial not null primary key,
	did integer not null,
	pid integer not null,
    firstname varchar(50),
    surname varchar(50),
    display_name varchar(40),
	page_num integer not null,
	note_num integer not null,
	priority numeric not null,
	visit_date date not null default current_date,
	waite_start_time time,
	unique(did,pid,visit_date)
)