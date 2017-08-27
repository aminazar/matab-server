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
    start_time is not null
    and paper_id=${paper_id}
    and name=lower(${name})
    and start_waiting::date = current_date;