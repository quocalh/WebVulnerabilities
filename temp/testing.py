from flask import Flask, request, jsonify
# from flask import Flask, request, jsonify
from datetime import datetime, timezone

app = Flask(__name__)

# GET: http://localhost:5000/api/hello?name=bnh
@app.get("/api/hello")
def hello():
    name = request.args.get("name", "stupid nigger")
    world = request.args.get("world", "Cadia")
    return jsonify({
        "message": f"Hello, {name}, from {world}!",
        "time": datetime.now(timezone.utc).isoformat() + "Z"
    }), 200



# POST: http://localhost:5000/api/echo
@app.post("/api/echo")
def echo():
    data = request.get_json(silent=True) or {}
    return jsonify({
        "received": data,
        "info": "This is the temp backend echoing your JSON body."
    }), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


