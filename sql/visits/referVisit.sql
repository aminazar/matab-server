do $$
declare
         rec RECORD;
BEGIN

if exists (select 1 from visits where did = ${to_did}) then

        -- plus each priority except which is 0 (under visit) by one to add new patient on top of them
         for rec in (select * from waiting where did = ${to_did}) loop
             if (rec.priority > 0) then
                 update waiting
                 set priority = rec.priority + 1
                 where did =  ${to_did} and wid = rec.wid;
             end if;
         end loop;

        --update did and priority in order to put patient on top off all other patient of new doctor
        update waiting
        set

            (did, priority) = (${to_did}, 1)
        where
            pid = ${pid} and did = ${from_did};

        --delete patient from visit list
        delete from visits where did = ${from_did} and pid = ${pid};

else
    update visits
    set
        (did, start_time) = (${to_did},current_timestamp)
    where
        pid = ${pid} and did = ${from_did};

    -- current visit must be updated in waiting table, also
    update waiting
    set
        did  = ${to_did}
    where
        pid = ${pid} and did = ${from_did};

end if;

END $$;