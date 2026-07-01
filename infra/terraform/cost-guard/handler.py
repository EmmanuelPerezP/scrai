"""
Budget hard-stop. Invoked via SNS when the monthly budget hits 100%.
Scales the ECS services to zero and stops the RDS instance — the biggest
variable costs. (The ALB keeps billing until `terraform destroy`.)
"""
import os
import boto3


def handler(event, context):
    cluster = os.environ["CLUSTER"]
    services = [s for s in os.environ["SERVICES"].split(",") if s]
    db_instance = os.environ["DB_INSTANCE"]

    ecs = boto3.client("ecs")
    for service in services:
        try:
            ecs.update_service(cluster=cluster, service=service, desiredCount=0)
            print(f"scaled {service} to 0")
        except Exception as exc:  # keep going — a partial stop still helps
            print(f"ecs {service} failed: {exc}")

    rds = boto3.client("rds")
    try:
        rds.stop_db_instance(DBInstanceIdentifier=db_instance)
        print(f"stopped RDS {db_instance}")
    except Exception as exc:
        print(f"rds {db_instance} failed: {exc}")

    return {"cluster": cluster, "scaled_to_zero": services, "stopped_db": db_instance}
