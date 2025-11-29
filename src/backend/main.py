from fastapi import FastAPI
app = FastAPI()
@app.get("/")
def hello():
    return {"msg": "Hello production added in develop"}
