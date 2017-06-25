DO $$

DECLARE
    pr integer; -- new priority
    visit_id integer;
BEGIN

if exists ( select * from waiting where did=${did} ) then
    pr = (select max(priority) from waiting where did=${did}) +1;
else
    pr = 0;
end if;

visit_id = (select vid from visits where did = ${did} and end_time is null);

  IF visit_id is null THEN

    insert into visits(did, pid, paper_id)
    values (
     ${did},
      ${pid},
      ${paper_id}
     )
     returning vid into visit_id;

  else
  -- if doctor has current visit (visit id is not null) => null vid must be added to new record in waiting table
     visit_id = null;

  END IF;

insert into waiting(did,pid,vid,paper_id,priority)
values
(
 ${did},
  ${pid},
  visit_id,
  ${paper_id},
  pr
);

END $$;


