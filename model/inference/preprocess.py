from PIL import Image, ImageChops, ImageEnhance
import numpy as np
import cv2
import os


# ==============================
# 🔥 HIGH PASS FILTER
# ==============================
def high_pass_filter(pil_img):
    try:
        img = np.array(pil_img.convert("RGB"))

        # Blur image
        blur = cv2.GaussianBlur(img, (9, 9), 0)

        # High-pass = original - blur
        high_pass = cv2.subtract(img, blur)

        return Image.fromarray(high_pass)

    except Exception as e:
        print("HIGH PASS ERROR:", e)
        return None


# ==============================
# 🔥 ELA (Error Level Analysis)
# ==============================
def ela_image(pil_img, quality=90):
    try:
        temp_path = "temp_ela.jpg"

        # Save compressed image
        pil_img.save(temp_path, "JPEG", quality=quality)

        compressed = Image.open(temp_path)

        # Difference
        diff = ImageChops.difference(pil_img, compressed)

        # Scale difference
        extrema = diff.getextrema()
        max_diff = max([ex[1] for ex in extrema])

        scale = 255.0 / max_diff if max_diff != 0 else 1

        diff = ImageEnhance.Brightness(diff).enhance(scale)

        # Cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

        return diff

    except Exception as e:
        print("ELA ERROR:", e)
        return None


# ==============================
# 🔥 MAIN FUNCTION (3 IMAGES)
# ==============================
def generate_display_images(pil_img, base_path):
    try:
        if not hasattr(pil_img, "convert"):
            return {}

        img = pil_img.convert("RGB")

        # 🔥 File paths
        original_path = base_path.replace(".", "_original.", 1)
        highpass_path = base_path.replace(".", "_highpass.", 1)
        ela_path = base_path.replace(".", "_ela.", 1)

        # 🔥 Save Original copy
        img.save(original_path)

        # 🔥 High-pass image
        hp = high_pass_filter(img)
        if hp:
            hp.save(highpass_path)

        # 🔥 ELA image
        ela = ela_image(img)
        if ela:
            ela.save(ela_path)

        return {
            "original": original_path,
            "highpass": highpass_path,
            "ela": ela_path,
        }

    except Exception as e:
        print("DISPLAY IMAGE ERROR:", e)
        return {}