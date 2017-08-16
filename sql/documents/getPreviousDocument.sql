select *
from documents
join visits on documents.vid = visits.vid
where documents.pid = ${pid} and visits.paper_id = ${paper_id}
order by saved_at desc
limit 1