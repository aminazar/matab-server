CREATE TABLE visits(
    vid serial not null primary key,
    did integer not null references users(uid),
    pid integer not null references patients(pid),
    start_time timestamp with time zone not null default current_timestamp,
    end_time timestamp with time zone,
    paper_id integer, --- Notebook number * 101 + Page number
    comments jsonb
)