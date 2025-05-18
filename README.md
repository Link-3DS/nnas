# **NNAS**  
🚀 **Link3DS NNAS Server Replacement for Wii U/3DS.**  

## **📌 Prerequisites**  
Before starting the installation, make sure you have installed:  
- **Node.js**  
- **PostgreSQL** with **Adminer**

## **📦 Installation**  
1. **Install dependencies**  
   ```bash
   npm install
   ```
2. **Generate an AES Key**
    ```bash
    npm run aes-key
    ```
3. **Start the NNAS server**
    ```bash
    npm run start
    ```

## **🌿 Configuration environment**

| Name                                          | Description                                                                                       | Optional |
|-----------------------------------------------|--------------------------------------------------------------------------------------------------|----------|
| `HTTP_PORT`                                   | Server Port                                    | No       |
| `DB_HOST`                                     | Database Host                                  | No       |
| `DB_PORT`                                     | Database Port                                  | No       |
| `DB_USERNAME`                                 | Database Username                              | No       |
| `DB_PASSWORD`                                 | Database password                              | No       |
| `DB_NAME`                                     | Database name                                  | No       |
| `AES_KEY`                                     | AES-KEY                                        | No       |