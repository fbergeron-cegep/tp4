from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from bd import bd


class ProduitBD(BaseModel):
    id: int
    nom: str
    description: str
    prix: float


class CommandeForm(BaseModel):
    client: str
    commande: list


app = FastAPI()

app.mount("/client_web", StaticFiles(directory="client_web"), name="static")


@app.get("/", response_class=HTMLResponse)
def root():
    f = open("client_web/index.html", 'r')
    html = f.read()
    return html


@app.get("/api/produits")
async def get_produits():
    bd.execute("SELECT id, nom, description, prix FROM produits")
    tuples_produits = bd.fetchall()
    produits = [ProduitBD(id=t[0], nom=t[1], description=t[2], prix=t[3]) for t in tuples_produits]
    return produits


@app.post("/api/commandes")
async def commander(c: CommandeForm):
    print(c.client)
    print(c. commande)
    # TODO point de départ des choses! Enregistrer la commande, lancer le message MQTT


@app.patch("/global/peublerBD")
async def peubler_bd():
    bd.execute("INSERT INTO produits(nom, description, prix) "
               "VALUES ('Pizza', 'Pizza', '23.24'),"
               "('Frite', 'Moyen', '4.45'),"
               "('Poutine', 'Grosse', '20.21'),"
               "('Poutine', 'Petite', '10.21'),"
               "('Poutine', 'Moyenne', '15.21'),"
               "('Poutine', 'Fin de soirée', '25.21')")
    bd.commit()
