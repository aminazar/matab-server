select
    documents.vid,users.uid,local_addr,mime_type,description,saved_at,display_name
from
    documents
left outer join
    visits
on
    documents.pid = visits.pid
left outer join
    users
on
    visits.did = users.uid
where
    documents.pid = ${pid}
order by
    saved_at