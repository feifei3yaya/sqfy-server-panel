import paramiko
import os
import io

HOST = "43.138.188.183"
USER = "Administrator"
PASS = "@Kw123456789"
LOCAL_ROOT = "SquadUpdateManager"
REMOTE_ROOT = "D:/squad_server/UpdateManager"

def deploy_files():
    ssh = None
    try:
        print(f"Connecting to {HOST}...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        ssh.connect(HOST, username=USER, password=PASS)
        print("Connected.")
        
        sftp = ssh.open_sftp()
        print("SFTP Connected.")

        # Walk through local directory
        for root, dirs, files in os.walk(LOCAL_ROOT):
            # Create corresponding remote directory
            rel_path = os.path.relpath(root, LOCAL_ROOT)
            if rel_path == ".":
                remote_dir = REMOTE_ROOT
            else:
                remote_dir = f"{REMOTE_ROOT}/{rel_path}".replace("\\", "/")
            
            try:
                sftp.stat(remote_dir)
            except FileNotFoundError:
                print(f"Creating remote directory: {remote_dir}")
                sftp.mkdir(remote_dir)
            
            # Upload files
            for file in files:
                local_path = os.path.join(root, file)
                remote_path = f"{remote_dir}/{file}".replace("\\", "/")
                
                print(f"Uploading {local_path} -> {remote_path}")
                sftp.put(local_path, remote_path)

        sftp.close()
        print("Deployment completed successfully.")

    except Exception as e:
        print(f"An error occurred: {e}")
    finally:
        if ssh:
            ssh.close()

if __name__ == "__main__":
    deploy_files()
