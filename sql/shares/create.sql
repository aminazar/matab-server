create table shares(
    sid serial not null primary key,
    did integer not null references users(uid),
    vid integer not null references visits(vid),
    rdid integer not null references users(uid),
    unique(did,vid,rdid)
)