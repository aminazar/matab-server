select
    *
from
    visits
where
    (
        did=2
        and date(end_time)=current_date
    )
    or
    (
        vid in
        (
            select
                shares.vid
            from
                shares
            join
                visits
            on
                shares.vid=visits.vid
            where
                rdid=2
                and date(visits.end_time)=current_date
        )

    )