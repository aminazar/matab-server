DO $$

DECLARE
    pr integer; -- new priority

BEGIN

if exists ( select * from waiting where did=${did} ) then
    pr = (select max(priority) from waiting where did=${did}) +1;
else
    pr = 0;
end if;

insert into waiting(did,pid,paper_id,priority)
values
(
 ${did},
  ${pid},
  ${paper_id},
  pr
);


  IF not exists (select * from visits where did = ${did} and end_time is null limit 1)  THEN
	insert into visits(did, pid, paper_id)
    values (
     ${did},
      ${pid},
      ${paper_id}
    );

  END IF;
END $$;


