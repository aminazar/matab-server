select
    visits.*,documents.did as document_id
from
    visits
left outer join
    documents
on
    documents.vid = visits.vid
where
    visits.vid = ${vid}
    and start_time is not null