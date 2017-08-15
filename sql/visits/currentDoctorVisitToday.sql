select
    vid
from
    visits
where
    did = ${did}
    and start_time is not null
    and end_time is null
    and cast(start_waiting as date)=current_date