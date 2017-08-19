select
    *
from
    visits
join
    users
on
    users.is_doctor = true
    and users.uid = visits.did
join
    patients
on
    patients.pid = visits.pid
where
    end_time is null
    and paper_id=${paper_id}
    and name=lower(${name})