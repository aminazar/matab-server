select
    *
from
    visits
join
    patients
on
    visits.pid = patients.pid
where
    cast(start_waiting as date)=current_date