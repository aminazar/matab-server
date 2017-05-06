select
    *
from
    visits
where
    (
        did=${did}
        and to_date(end_time)=current_date
    )
    or
    (

    )