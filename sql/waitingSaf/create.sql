create table waiting_q(
    wsid serial not null primary key,
	uid integer not null,
	pid integer not null,
	page_num integer not null,
	note_num integer not null,
	priority numeric not null,
	visit_date date not null default current_date,
	unique(uid,pid,visit_date)
)