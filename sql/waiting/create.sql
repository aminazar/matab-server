create table waiting(
    wid serial not null primary key,
	did integer not null,
	pid integer not null,
    paper_id integer not null,
	priority numeric not null,
    wait_start_time timestamp with time zone not null default current_timestamp,
  	unique(did,pid)
)