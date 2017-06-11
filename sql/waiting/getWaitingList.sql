select
    patients.firstname, patients.surname, users.uid as did, users.display_name as doctor, waiting.priority, waiting.wait_start_time
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
