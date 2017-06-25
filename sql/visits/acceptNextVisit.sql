do $$
declare
         rec RECORD;
         visit_id integer;
BEGIN

    -- minus each priority by one to add first patient in current visit state
     for rec in (select * from waiting where did = ${did} and priority > 0) loop

         if (rec.priority = 1) then
         -- insert first patient in waiting list (previous priority = 1, current priority = 0) in visit table
            insert into visits(did, pid, paper_id)
                values (
                 ${did},
                  rec.pid,
                  rec.paper_id
                ) returning vid into visit_id;

         -- update vid in waiting table for priority 0 equal to new added vid

            update waiting
            set (vid, priority) = (visit_id, rec.priority - 1)
            where did =  ${did} and wid = rec.wid;

         end if;

        update waiting
        set priority = rec.priority - 1
        where did =  ${did} and wid = rec.wid;

     end loop;

END $$;