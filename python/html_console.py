from flask import Flask, request, jsonify
import subprocess
import os
from openai import OpenAI

app = Flask(__name__)

# Initialize your OpenAI client
# It's best practice to load the key from an environment variable
# client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

@app.route('/execute', methods=['POST'])
def execute_command():
    data = request.get_json()
    command_str = data.get('command')
    current_dir = data.get('currentDirectory')

    if not command_str or not current_dir:
        return jsonify({"error": "Missing command or directory"}), 400

    # --- Tactic 1: Handle OpenAI Tool Commands ---
    if command_str.startswith('openai-tool'):
        try:
            # Example: openai-tool create-image "a cat in a hat"
            _, tool_name, prompt = command_str.split(' ', 2)
            prompt = prompt.strip('"')

            # Here you would call your specific OpenAI SDK function
            # This is a conceptual example for image generation
            # response = client.images.generate(
            #   model="dall-e-3",
            #   prompt=prompt,
            #   n=1,
            #   size="1024x1024"
            # )
            # result = response.data[0].url
            
            # For now, we simulate the successful tool execution
            result = f"SIMULATED_SUCCESS: OpenAI tool '{tool_name}' executed with prompt: '{prompt}'. Image URL would be here."
            return jsonify({"output": result})

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    # --- Tactic 2: Handle Standard Shell Commands ---
    else:
        try:
            # For security, it's crucial to be careful with shell=True in production
            # The filtering in your console.config.php is a good start
            result = subprocess.run(
                command_str,
                shell=True,
                cwd=current_dir,
                capture_output=True,
                text=True,
                timeout=30 # Add a timeout for safety
            )
            
            output = result.stdout
            error = result.stderr

            if error:
                return jsonify({"error": error})
            else:
                return jsonify({"output": output})

        except subprocess.TimeoutExpired:
            return jsonify({"error": "Command timed out."}), 408
        except Exception as e:
            return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)