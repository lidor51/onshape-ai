import math


CORAL_RADIUS = 57.15
CORAL_LENGTH = 301.625
ROLLER_RADIUS = 25.0
COMPRESSION = 5.0
BUMPER_TOP = 165.0
PIVOT = (140.0, 435.0)
DEPLOY_RANGE = (-135.0, 0.0)
CONTROLS = {
    "mouthWidth": {"default": 500.0, "min": 500.0, "max": 520.0, "unit": "mm"},
    "receiverHeight": {"default": 447.15, "min": 437.15, "max": 467.15, "unit": "mm"},
    "topFloat": {"default": 0.0, "min": 0.0, "max": 12.0, "unit": "mm"},
}


def stations():
    return [(-240 + 35 * index, 50 + 40 * index) for index in range(9)] + [(90.0, 370.0), (140.0, 370.0)]


def rotate_point(point, angle):
    angle = math.radians(angle)
    longitudinal, height = (point[index] - PIVOT[index] for index in range(2))
    return (PIVOT[0] + longitudinal * math.cos(angle) - height * math.sin(angle),
            PIVOT[1] + longitudinal * math.sin(angle) + height * math.cos(angle))


def contact_half_span():
    return math.sqrt((CORAL_RADIUS + ROLLER_RADIUS) ** 2 -
                     (CORAL_RADIUS + ROLLER_RADIUS - COMPRESSION) ** 2)


def layout_check():
    centers = stations()
    overlap = [2 * contact_half_span() - math.dist(first, second)
               for first, second in zip(centers, centers[1:])]
    sweep = []
    for index in range(63):
        angle = DEPLOY_RANGE[0] + index * (DEPLOY_RANGE[1] - DEPLOY_RANGE[0]) / 62
        points = [rotate_point(center, angle) for center in centers]
        sweep.append({"angleDeg": angle, "frontMm": min(point[0] for point in points) - 40,
                      "topMm": max(point[1] for point in points) + 40})
    return {"minimumDrivenOverlapMm": min(overlap), "samples": sweep,
            "scope": "Necessary point-contact envelope only; not acquisition simulation or full BRep clearance"}