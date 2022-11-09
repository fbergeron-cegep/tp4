import mariadb
import sys


class BaseDonnees:
    def __init__(self):
        try:
            self.conn = mariadb.connect(
                user="root",
                password="root",
                host="127.0.0.1",
                port=3306,
                database="tp4"
            )
        except mariadb.Error as e:
            print(f"Zut, Un morse m'empêche de profiter de MariaDB: {e}")
            sys.exit(1)

        self.cursor = self.conn.cursor()

        self.creer_bd()

    def creer_bd(self):
        self.cursor.execute("""
            CREATE TABLE IF NOT EXISTS produits (
            id INT AUTO_INCREMENT,
            nom text NOT NULL,
            description text NOT NULL,
            prix DECIMAL(10,2),
            PRIMARY KEY (id),
            CONSTRAINT produits_unique UNIQUE (nom, description)
            );
        """)
        self.conn.commit()

    def execute(self, req, param=None):
        if param is not None:
            return self.cursor.execute(req, param)
        else:
            return self.cursor.execute(req)

    def fetchall(self):
        return self.cursor.fetchall()

    def fetchone(self):
        return self.cursor.fetchone()

    def commit(self):
        return self.conn.commit()

    def get_last_row_id(self):
        return self.cursor.lastrowid


bd = BaseDonnees()
