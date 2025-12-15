from flask import Flask, request, render_template
import diffusers

app = Flask(__name__)

# @app.route('/image', methods=['POST'])
# def generate_image():
#     pass

def main():
    print("Hello from backend!")
    app.run(host='0.0.0.0', port=3077)

if __name__ == "__main__":
    main()
