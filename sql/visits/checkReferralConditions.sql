select
    *
from
    visits
join
    patients
on
    visits.pid = patients.pid
where
    did=${uid}
    and vid=${vid}
    and start_time is not null
    and cast(start_waiting as date)=current_date