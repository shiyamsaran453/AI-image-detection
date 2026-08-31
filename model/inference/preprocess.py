from PIL import Image
import numpy as np
import cv2
from io import BytesIO


def preprocess_image(pil_img, blocky_save_path=None, forensic_save_path=None):
    img = pil_img.convert("RGB")

    # Step 1: Resize to 32x32
    img = img.resize((32, 32))

    # Step 2: Convert to numpy array
    img_array = np.array(img)

    # Step 3: Normalize (0–1)
    img_array = img_array / 255.0

    # Step 4: Slight blur
    img_array = cv2.GaussianBlur(img_array, (3, 3), 0)

    # Step 5: Back to image
    output = (img_array * 255).astype(np.uint8)
    blocky_img = Image.fromarray(output)

    if blocky_save_path:
        blocky_img.save(blocky_save_path)

    # Step 6: Red forensic preprocessing
    forensic_base = blocky_img.convert("RGB").resize((224, 224))

    gray = np.array(forensic_base.convert("L"), dtype=np.float32) / 255.0

    hpf = cv2.Laplacian(np.array(forensic_base), cv2.CV_32F, ksize=3)
    hpf = np.linalg.norm(hpf, axis=2)
    hpf = (hpf - hpf.min()) / (hpf.max() - hpf.min() + 1e-8)

    buf = BytesIO()
    forensic_base.save(buf, format="JPEG", quality=95)
    buf.seek(0)
    rec = Image.open(buf).convert("RGB")

    ela = np.abs(np.array(forensic_base) - np.array(rec))
    ela = cv2.cvtColor(ela.astype(np.uint8), cv2.COLOR_RGB2GRAY) / 255.0

    combined = np.stack([gray * 255, hpf * 255, ela * 255], axis=-1)
    forensic_img = Image.fromarray(combined.astype(np.uint8))

    if forensic_save_path:
        forensic_img.save(forensic_save_path)

    return forensic_img