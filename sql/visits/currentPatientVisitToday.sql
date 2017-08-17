select
    vid
from
    visits
where
    pid = ${pid}
    and cast(start_waiting as date)=current_date
    and end_time is null
