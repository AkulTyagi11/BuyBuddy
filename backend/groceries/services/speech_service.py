import re


UNIT_ALIASES = {
    'kg': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'l': 'l',
    'liter': 'l',
    'liters': 'l',
    'ml': 'ml',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'pcs': 'pcs',
    'piece': 'pcs',
    'pieces': 'pcs',
    'dozen': 'dozen',
    'pack': 'pack',
    'packet': 'pack',
    'packets': 'pack',
    'bottle': 'bottle',
    'bottles': 'bottle',
    'can': 'can',
    'cans': 'can',
    'bag': 'bag',
    'bags': 'bag',
}

CATEGORY_KEYWORDS = {
    'vegetables': ['tomato', 'onion', 'potato', 'carrot', 'broccoli', 'spinach'],
    'fruits': ['apple', 'banana', 'orange', 'mango', 'grape', 'berries'],
    'dairy': ['milk', 'yogurt', 'cheese', 'butter', 'cream'],
    'meat': ['chicken', 'beef', 'fish', 'pork', 'mutton'],
    'beverages': ['coffee', 'tea', 'juice', 'water', 'soda'],
    'grains': ['rice', 'pasta', 'flour', 'bread', 'oats'],
}


def _normalize_name(raw):
    name = raw.strip().lower()
    name = re.sub(r'\b(of|and)\b', ' ', name)
    name = re.sub(r'\s+', ' ', name)
    return name.strip()


def _guess_category_id(item_name, categories):
    normalized_item = item_name.lower()

    for family, keywords in CATEGORY_KEYWORDS.items():
        if not any(keyword in normalized_item for keyword in keywords):
            continue

        for category in categories:
            if family in category.name.lower():
                return category.id

    for category in categories:
        if category.name.lower() in normalized_item:
            return category.id

    return None


def parse_grocery_items(transcript, categories):
    if not transcript:
        return []

    parts = [segment.strip() for segment in re.split(r'\band\b|,', transcript.lower()) if segment.strip()]
    parsed_items = []

    for part in parts:
        match = re.match(r'^(?P<qty>\d+(?:\.\d+)?)\s*(?P<unit>[a-zA-Z]+)?\s*(?:of\s+)?(?P<name>.+)$', part)

        if match:
            quantity = float(match.group('qty'))
            unit_raw = (match.group('unit') or 'pcs').lower()
            unit = UNIT_ALIASES.get(unit_raw, 'pcs')
            name = _normalize_name(match.group('name'))
        else:
            quantity = 1
            unit = 'pcs'
            name = _normalize_name(part)

        if not name:
            continue

        parsed_items.append(
            {
                'name': name.title(),
                'quantity': quantity,
                'unit': unit,
                'category': _guess_category_id(name, categories),
            }
        )

    return parsed_items
