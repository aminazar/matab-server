select
    contact_details->'vip' as vip
from
    patients
where
    pid = ${pid}