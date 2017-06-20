
-- update end time of visit
update
    visits
set
    end_time=current_timestamp
where
    did=${uid}
    and pid=${pid}
    and end_time is null;

-- delete corresponding waiting record
delete from waiting where
    did=${uid}
    and pid=${pid};

select ${uid} as did;

