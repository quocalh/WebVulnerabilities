from flask import Flask, request, jsonify
import subprocess
import os

app = Flask(__name__)

# --- THE INFRASTRUCTURE ---
# This mimics the "gadgetMap" from your JS code
def config_gadget(internal_data):
    # In a real attack, the attacker "pollutes" the default values
    # if 'shell' isn't in internal_data, it might look at a global config
    shell = internal_data.get('shell', os.environ.get('DEFAULT_SHELL', 'bash'))
    print(f"[CONFIG]: Using shell: {shell}")
    return shell

# --- THE SINK ---
def exec_sink(cmd):
    print(f"\n!!! [SINK REACHED] !!!")
    print(f"[SHELL]: Executing -> {cmd}")
    try:
        # Dangerous execution
        output = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)
        return output.decode()
    except Exception as e:
        return str(e)

# --- THE VULNERABLE SOURCE: Recursive Merge ---
def deep_merge(target, source):
    """
    Vulnerable merge function. 
    In Python, attacking __class__.__init__.__globals__ is the equivalent 
    of polluting __proto__ in JS.
    """
    for key, value in source.items():
        if key == "__class__" or key == "__globals__":
            # In a real scenario, this is where the 'pollution' happens
            continue 
        
        if isinstance(value, dict):
            node = target.setdefault(key, {})
            deep_merge(node, value)
        else:
            target[key] = value

# --- THE ROUTE ---
@app.route('/handle-flight-request', methods=['POST'])
def handle_request():
    incoming_payload = request.json
    internal_state = {
        "is_authenticated": True,
        "shell": "sh" # Default safe value
    }

    print("--- Step 1: Merging Payload ---")
    deep_merge(internal_state, incoming_payload)

    print("--- Step 2: Triggering Gadget Chain ---")
    # Gadget 1: Get Shell
    current_shell = config_gadget(internal_state)
    
    # Gadget 2: Logic branch (Logic Sink)
    # If the attacker successfully merged "execute": True
    if internal_state.get("execute") == True:
        args = internal_state.get("args", "echo 'No args provided'")
        result = exec_sink(f"{current_shell} -c \"{args}\"")
        return jsonify({"status": "Exploited", "output": result}), 200

    return jsonify({"status": "Success", "state": internal_state}), 200

if __name__ == '__main__':
    # Running on port 5000
    app.run(debug=True, port=5000)