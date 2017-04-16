CREATE TABLE documents(
    did serial not null primary key,
    local_addr varchar(512) not null unique,
    mime_type varchar(100) not null,
    size integer not null,
    description varchar(512),
    pid integer not null references patients(pid),
    uid integer not null references users(uid),
    vid integer references visits(vid),
    saved_at timestamp with time zone not null default current_timestamp
)