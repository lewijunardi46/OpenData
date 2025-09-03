from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime, timedelta

def extract():
    print("Extract data dari sumber")

def transform():
    print("Transform data")

def load():
    print("Load data ke database")
default_args = {
    'owner': 'bulunangko',
    'depends_on_past': False,
    'email': ['admin@example.com'],
    'email_on_failure': True,
    'email_on_retry': False,
    'retries': 2,
    'retry_delay': timedelta(minutes=3),
}

with DAG(
    dag_id='etl_dag',
    schedule_interval='30 15 * * *',  # setiap hari jam 15:30
    start_date=datetime(2025,8,25),
    catchup=False
) as dag:

    t1 = PythonOperator(task_id='extract', python_callable=extract)
    t2 = PythonOperator(task_id='transform', python_callable=transform)
    t3 = PythonOperator(task_id='load', python_callable=load)

    # Atur dependensi
    t1 >> t2 >> t3
