select
    *
from
    visits
join
    patients
on
    visits.pid = patients.pid
where
    vid = ${vid}