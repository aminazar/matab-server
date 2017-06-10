insert into waiting(did,pid,page_num,note_num,priority)
values
(
  ${did},
  ${pid},
  ${page_num},
  ${note_num},
  (select coalesce((select max(priority) as pr from waiting where did=${did}),0)+1)
);