from flask import Flask, request, send_file
from diffusers import PixArtAlphaPipeline
from transformers import T5EncoderModel
import torch
from io import BytesIO

app = Flask(__name__)

def generate_image(prompt:str) -> BytesIO:
    model_id = "PixArt-alpha/PixArt-XL-2-1024-MS"
    text_encoder = T5EncoderModel.from_pretrained(
        model_id,
        subfolder="text_encoder",
        load_in_8bit=True,
        device_map="auto",
    )
    pipe = PixArtAlphaPipeline.from_pretrained(
        model_id,
        text_encoder=text_encoder,
        transformer=None,
    ).to("cuda")
    image = pipe(prompt=prompt).images[0]
    img_io = BytesIO()
    image.save(img_io, "PNG")
    img_io.seek(0)
    return img_io

@app.route("/image", methods=["POST"])
def return_image():
    prompt = request.get_json().get("prompt", "")
    if not prompt:
        return {"error": "Provide prompt"}, 400

    return send_file(generate_image(prompt), mimetype="image/png")


def main():
    app.run(host="0.0.0.0", port=3077)


if __name__ == "__main__":
    main()
