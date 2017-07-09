do $$
declare
         rec RECORD;
BEGIN

if exists (select * from visits where did = ${to_did} and end_time is null) then

        -- plus each priority except which is 0 (under visit) by one to add new patient on top of them
         for rec in (select * from waiting where did = ${to_did} and priority > 0) loop
                 update waiting
                 set priority = rec.priority + 1
                 where wid = rec.wid;
         end loop;

        --update did and priority in order to put patient (which already has priority = 0) on top off all other patient of new doctor
        update waiting
        set
            (did, priority, vid) = (${to_did}, 1, null)
        where
            pid = ${pid} and did = ${from_did};

        --delete patient from visit list
        delete from visits where did = ${from_did} and pid = ${pid};

else

    update visits
    set
        (did, start_time) = (${to_did},current_timestamp)
    where
        vid = ${vid};

    -- current visit must be updated in waiting table, also
    update waiting
    set
        (did, vid, priority)  = (${to_did}, ${vid}, 0)

    where
        pid = ${pid} and did = ${from_did};

end if;

END $$;
