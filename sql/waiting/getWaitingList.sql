
select
    waiting.pid,
    patients.firstname,
    patients.surname,
    users.uid as did,
    users.display_name as doctor,
    waiting.priority,
    waiting.wait_start_time,
    waiting.paper_id,
    waiting.vid
from
    waiting
join
    users
on
    users.uid = waiting.did
join
    patients
on
    patients.pid = waiting.pid

order by waiting.wait_start_time desc ;




