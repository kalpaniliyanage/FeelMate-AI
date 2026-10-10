
MOOD_CONTENT = {
    "happy": {
        "title": "Keep Your Good Vibes! ☀️",
        "message": "Would you like to enjoy something fun?",
        "activities": [
            {
                "type": "music",
                "title": "Play a favourite song",
                "description": "Choose music that you enjoy."
            },
            {
                "type": "activity",
                "title": "Try a mini game",
                "description": "Take a fun little break."
            },
            {
                "type": "message",
                "title": "Save a happy moment",
                "description": "Write down something good from today."
            }
        ]
    },
    "sad": {
        "title": "A Little Care for You 💙",
        "message": "Would a gentle break feel helpful?",
        "activities": [
            {
                "type": "music",
                "title": "Relaxing music",
                "description": "Choose a calm song you like."
            },
            {
                "type": "activity",
                "title": "Take a short break",
                "description": "Stretch or get some fresh air."
            },
            {
                "type": "message",
                "title": "A gentle reminder",
                "description": "You can take things one step at a time."
            }
        ]
    },
    "angry": {
        "title": "Take a Moment 🌿",
        "message": "Choose a break if that feels right for you.",
        "activities": [
            {
                "type": "activity",
                "title": "Slow breathing",
                "description": "Breathe slowly at a comfortable pace."
            },
            {
                "type": "music",
                "title": "Listen to calm music",
                "description": "Choose a peaceful song."
            }
        ]
    },
    "fear": {
        "title": "A Gentle Moment 🌼",
        "message": "Would a grounding exercise be helpful?",
        "activities": [
            {
                "type": "activity",
                "title": "Try grounding",
                "description": "Notice five things you can see."
            },
            {
                "type": "message",
                "title": "Talk to someone",
                "description": "Consider contacting someone you trust."
            }
        ]
    },
    "disgust": {
        "title": "A Fresh Start 🌱",
        "message": "Would you like to switch activities?",
        "activities": [
            {
                "type": "activity",
                "title": "Take a little break",
                "description": "Find a comfortable space if possible."
            }
        ]
    },
    "surprise": {
        "title": "Explore Something New ✨",
        "message": "Want to discover something interesting?",
        "activities": [
            {
                "type": "activity",
                "title": "Discover a fun fact",
                "description": "Learn something new today."
            }
        ]
    },
    "neutral": {
        "title": "Welcome to FeelMate 💜",
        "message": "Choose something that suits your moment.",
        "activities": [
            {
                "type": "activity",
                "title": "Check in with yourself",
                "description": "Select the mood that feels right."
            },
            {
                "type": "music",
                "title": "Play your favourite music",
                "description": "Choose a song you enjoy."
            }
        ]
    }
}


def normalize_label(label):
    label = label.lower().strip()

    aliases = {
        "happiness": "happy",
        "sadness": "sad",
        "anger": "angry",
        "fearful": "fear",
        "surprised": "surprise",
        "disgusted": "disgust"
    }

    return aliases.get(label, label)


def get_recommendations(expression):
    label = normalize_label(expression)
    content = MOOD_CONTENT.get(
        label,
        MOOD_CONTENT["neutral"]
    )

    return {
        **content,
        "based_on": label,
        "notice": (
            "This is a predicted facial expression, not a "
            "confirmed emotional state. Choose what feels "
            "right for you."
        )
    }  