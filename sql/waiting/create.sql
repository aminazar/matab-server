create table waiting(
    wid serial not null primary key,
	did integer not null references users(uid),
	pid integer not null references patients(pid) unique,
	vid integer null references visits(vid) unique,
    paper_id integer not null,
	priority numeric not null,
    wait_start_time timestamp with time zone not null default current_timestamp,
	unique(did,pid)
)