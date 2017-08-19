select
    visits.vid,visits.did,visits.start_time
from
    visits
join
    visits dr_visits
on
    visits.did=dr_visits.did
    and dr_visits.vid=${vid}
where
    visits.start_time is not null
    and visits.end_time is null
    and cast(visits.start_waiting as date)=current_date