import io
import torch
import requests
from flask import Flask, request, Response
from flask_cors import CORS
from diffusers import DiffusionPipeline

app = Flask(__name__)
CORS(app)

pipeline = None


def get_pipeline():
    global pipeline
    if pipeline is not None:
        return pipeline

    device = "cuda" if torch.cuda.is_available() else "cpu"
    dtype = torch.bfloat16 if device == "cuda" else torch.float32

    pipe = DiffusionPipeline.from_pretrained(
        "Tongyi-MAI/Z-Image-Turbo",
        torch_dtype=dtype,
        safety_checker=None,
        requires_safety_checker=False
    )

    pipe.to(device)
    pipeline = pipe

    print(f"[INFO] Loaded RealVisXL V3 Turbo on {device} ({dtype})")
    return pipeline


def classify_weather(forecast_text: str):
    text = forecast_text.lower()

    precipitation = "clear"
    if "snow" in text or "blizzard" in text:
        precipitation = "snow"
    elif "rain" in text or "showers" in text or "thunderstorm" in text:
        precipitation = "rain"
    elif "fog" in text or "mist" in text:
        precipitation = "fog"

    lighting = "natural daylight"
    if "cloudy" in text or "overcast" in text:
        lighting = "soft overcast lighting"
    if "night" in text:
        lighting = "low natural nighttime lighting"

    return precipitation, lighting


@app.route("/image", methods=["POST"])
def generate_image():
    data = request.get_json(force=True)
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if latitude is None or longitude is None:
        return {"error": "Missing latitude or longitude"}, 400

    # --- Fetch weather data ---
    point_resp = requests.get(
        f"https://api.weather.gov/points/{latitude},{longitude}",
        timeout=10
    )
    if point_resp.status_code != 200:
        return {"error": "Failed to fetch weather point"}, 500

    forecast_url = point_resp.json()["properties"]["forecast"]

    forecast_resp = requests.get(forecast_url, timeout=10)
    if forecast_resp.status_code != 200:
        return {"error": "Failed to fetch forecast"}, 500

    periods = forecast_resp.json()["properties"]["periods"]
    if not periods:
        return {"error": "No forecast data"}, 500

    period = periods[0]

    temperature = period["temperature"]
    temp_unit = period["temperatureUnit"]
    wind_speed = period["windSpeed"]
    wind_dir = period["windDirection"]
    forecast_text = period["detailedForecast"]

    precipitation, lighting = classify_weather(forecast_text)

    # --- Behavioral logic ---
    if temperature <= 32:
        panda_behavior = "the panda is huddled for warmth, fur puffed up, breath visible in the cold air"
    elif temperature >= 85:
        panda_behavior = "the panda looks warm and relaxed, slower posture, fur slightly flattened"
    else:
        panda_behavior = "the panda stands naturally, calm and alert"

    # if wind_speed > 20:
    #     wind_strength = "strong wind"
    # else:
    #     wind_strength = "gentle wind"
    #
    wind_strength = "strong wind"

    if precipitation == "rain":
        environment = "wet ground, falling rain, splashing droplets, soaked fur"
    elif precipitation == "snow":
        environment = "falling snow, snow-covered ground, frosted fur"
    elif precipitation == "fog":
        environment = "thick fog, misty air, reduced visibility"
    else:
        environment = "clear open air, dry natural terrain"

    camera_bias = (
        f"cinematic outdoor photograph, camera facing into the wind from the {wind_dir}, "
        "shallow depth of field, environmental motion blur"
    )

    # --- FINAL PROMPT ---
    prompt = (
        "Ultra-realistic cinematic wildlife scene. "
        "A giant panda bear physically present outdoors in a real natural environment. "
        f"{panda_behavior}. "
        f"The panda is directly exposed to {wind_strength} blowing from the {wind_dir}. "
        f"Air temperature is {temperature} {temp_unit}. "
        f"Weather conditions: {forecast_text}. "
        f"Environment details: {environment}. "
        f"{lighting}. "
        "The panda’s fur, posture, and stance visibly react to the weather. "
        "No photo frames, no posters, no paintings. "
        f"{camera_bias}. "
        "Highly detailed fur, realistic anatomy, true-to-life lighting and shadows."
    )

    negative_prompt = (
        "photo frame, picture frame, poster, painting, illustration, "
        "printed image, gallery, studio background, watermark, text, border"
    )

    pipe = get_pipeline()

    # --- Image generation ---
    with torch.inference_mode():
        image = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=4,
            guidance_scale=4.0
        ).images[0]

    img_io = io.BytesIO()
    image.save(img_io, format="PNG")
    img_io.seek(0)

    return Response(img_io.read(), mimetype="image/png")


def main():
    print("[INFO] Weather-aware panda generator running on port 3077")
    app.run(host="0.0.0.0", port=3077)


if __name__ == "__main__":
    main()
