from flask import Flask, request, render_template
import diffuser
def main():
    print("Hello from backend!")


if __name__ == "__main__":
    main()

app = Flask(__name__)
@app.route('/image', methods=['POST'])
def generate_image():
    data = request.json
    prompt = data.get('prompt', '')
    negative_prompt = data.get('negative_prompt', '')
    image = diffuser.generate_image(prompt, negative_prompt)
    return render_template('image.html', image=image)