from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime
import pandas as pd
import re
from pymongo import MongoClient
from airflow.models import Variable  

# Konfigurasi
EXCEL_PATH = "/opt/airflow/data_set.xlsx"
MONGO_URI = "mongodb://admin:%40dm1n%40123@localhost:27017/?authSource=admin"
MONGO_DB = "kibaid_unity"
MONGO_COLLECTION = "history_kibaid"

# Fungsi untuk mengecek apakah baris kosong
def is_row_empty_or_spaces(row):
    for val in row:
        if pd.isna(val):
            continue
        if isinstance(val, str) and val.strip() == '':
            continue
        return False
    return True

# Fungsi membersihkan nama sheet
def clean_sheet_name(sheet_name):
    return re.sub(r'\W+', '_', sheet_name)

# Extract & Transform
def extract_transform():
    print("📥 Membaca file Excel...")
    all_sheets = pd.read_excel(EXCEL_PATH, sheet_name=None)
    result_json = []

    for sheet_name, df in all_sheets.items():
        mask = df.apply(is_row_empty_or_spaces, axis=1)
        df_cleaned = df[~mask].copy()
        df_cleaned.insert(1, 'Klasis', sheet_name)
        df_cleaned = df_cleaned.fillna("")

        # Konversi datetime ke string
        for col in df_cleaned.select_dtypes(include=["datetime", "datetimetz"]).columns:
            df_cleaned[col] = df_cleaned[col].dt.strftime('%Y-%m-%d')
            df_cleaned[col] = df_cleaned[col].fillna("")

        for _, row in df_cleaned.iterrows():
            item = {
                "Klasis": row.get("Klasis", ""),
                "Nama Gereja": row.get("Nama Gereja", ""),
                "PERSEKUTUAN": {
                    "Tahun": row.get("PERSEKUTUAN_Tahun", ""),
                    "Tempat": row.get("PERSEKUTUAN_Tempat", ""),
                },
                "POS PI": {
                    "Tahun": row.get("POS PI_Tahun", ""),
                    "Tempat": row.get("POS PI_Tempat", ""),
                },
                "CABANG KEBAKTIAN": {
                    "Tahun": row.get("CABANG KEBAKTIAN_Tahun", ""),
                    "Tempat": row.get("CABANG KEBAKTIAN_Tempat", ""),
                },
                "JEMAAT LOKAL": {
                    "Tahun": row.get("JEMAAT LOKAL_Tahun", ""),
                    "Tempat": row.get("JEMAAT LOKAL_Tempat", ""),
                },
                "Keterangan": row.get("KETERANGAN", "")
            }
            result_json.append(item)
    
    return result_json

# Load ke MongoDB
def load_to_mongo():
    print("📤 Menghubungkan ke MongoDB dan meng-insert data...")
    client = MongoClient(MONGO_URI)
    db = client[MONGO_DB]
    collection = db[MONGO_COLLECTION]
    
    result_json = extract_transform()

    if result_json:
        collection.insert_many(result_json)
        print(f"✅ Selesai: {len(result_json)} dokumen berhasil dimasukkan ke MongoDB.")
    else:
        print("⚠️ Tidak ada data yang dimasukkan.")

# Definisi DAG
dag = DAG(
    "etl_airflow_dag",
    schedule_interval="@daily",
    start_date=datetime(2025, 6, 1),
    catchup=False
)

# Definisi tugas
extract_transform_task = PythonOperator(
    task_id="extract_transform",
    python_callable=extract_transform,
    dag=dag
)

load_to_mongo_task = PythonOperator(
    task_id="load_to_mongo",
    python_callable=load_to_mongo,
    dag=dag
)

# Menentukan urutan eksekusi
extract_transform_task >> load_to_mongo_task