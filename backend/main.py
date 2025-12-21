from flask import Flask, request, send_file
from diffusers.pipelines.auto_pipeline import AutoPipelineForText2Image
import torch
from io import BytesIO

app = Flask(__name__)


@app.route("/image", methods=["POST"])
def generate_image():
    prompt = request.get_json().get("prompt", "")
    if not prompt:
        return {"error": "Provide prompt"}, 400

    pipeline = AutoPipelineForText2Image.from_pretrained(
        "stabilityai/stable-diffusion-xl-base-1.0",
        torch_dtype=torch.float16,
        variant="fp16",
    ).to("mps")
    image = pipeline(prompt=prompt).images[0]
    img_io = BytesIO()
    image.save(img_io, "PNG")
    img_io.seek(0)
    return send_file(img_io, mimetype="image/png")


def main():
    app.run(host="0.0.0.0", port=3077)


if __name__ == "__main__":
    main()
