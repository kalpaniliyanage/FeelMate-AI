
from functools import lru_cache

from transformers import pipeline

MODEL_NAME = "trpakov/vit-face-expression"


@lru_cache(maxsize=1)
def get_classifier():
    return pipeline(
        "image-classification",
        model=MODEL_NAME,
        device=-1
    )


def predict_expression(image):
    results = get_classifier()(image)

    if not results:
        raise ValueError("No prediction returned")

    return {
        "expression": str(results[0]["label"]).lower(),
        "confidence": float(results[0]["score"]),
        "all_predictions": [
            {
                "label": str(item["label"]).lower(),
                "score": float(item["score"])
            }
            for item in results[:5]
        ]
    } 