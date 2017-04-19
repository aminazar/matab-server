select
    visits.vid,users.uid,local_addr,mime_type,description,saved_at,display_name
from
    documents
left outer join
    visits
on
    documents.vid = visits.vid
left outer join
    users
on
    visits.did = users.uid
where
    documents.pid = ${pid}