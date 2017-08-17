CREATE TABLE visits(
    vid serial not null primary key,
    did integer references users(uid),
    pid integer not null references patients(pid),
    start_waiting timestamp with time zone not null default current_timestamp,
    start_time timestamp with time zone,
    end_time timestamp with time zone,
    referee_visit integer references visits(vid),
    paper_id integer, --- (Notebook number - 1) * 101 + (Page number - 1)
    emgy boolean not null default false,
    nocardio boolean not null default false,
    comments jsonb
)
-- alter table visits add column start_waiting timestamp with time zone not null default current_timestamp;
-- alter table visits alter column start_time drop not null;
-- alter table visits alter column start_time set default null;
-- alter table visits add column referee_visit integer references visits(vid)
-- alter table visits add column emgy boolean not null default false
-- alter table visits add column nocardio boolean not null default false