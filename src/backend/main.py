from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def hello():
    return {"msg": "Hello this is the udpated text"}
