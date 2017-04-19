select
    *
from
    visits
join
    patients
on
    patients.pid = visits.pid
join
    users
on
    users.uid = visits.did
where
    end_time is null