insert into waiting_q(did,pid,page_num,note_num,priority)
values
(
  ${did},
  ${pid},
  ${page_num},
  ${note_num},
  (select coalesce((select max(priority) as pr from waiting_q where did=${did}),0)+1)
);