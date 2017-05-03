update
    visits
set
    end_time=current_timestamp
where
    did=${uid}
    and pid=${pid}