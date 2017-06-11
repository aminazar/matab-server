insert into waiting(did,pid,paper_id,priority)
values
(
  ${did},
  ${pid},
  ${paper_id},
  (select coalesce((select max(priority) as pr from waiting where did=${did}),0)+1)
);