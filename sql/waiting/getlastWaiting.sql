
select
    waiting.pid, patients.firstname, patients.surname, users.uid, users.display_name as doctor, waiting.priority, waiting.wait_start_time
as
    data_source
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

order by waiting.wait_start_time desc limit 1;




