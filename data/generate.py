import math
import random
import json
import numpy as np

BASEPATH = "data/saved/"
# Shuffles the array using Fisher-Yates algorithm.
def shuffle(array):
    counter = len(array)
    temp = 0
    index = 0

    # While there are elements in the array
    while counter > 0:
        # Pick a random index
        index = random.randint(0, counter - 1)
        # Decrease counter by 1
        counter -= 1
        # And swap the last element with it
        temp = array[counter]
        array[counter] = array[index]
        array[index] = temp

# DataGenerator type
def DataGenerator(numSamples, noise, type):
    def generate():
        points = []
        variance = noise

        if type == "gaussian":
            def genGauss(cx, cy, indicator):
                x = random.gauss(cx, variance)
                y = random.gauss(cy, variance)
                return {"features":[x, y], "label": 0 if indicator else 1}

            for i in range(numSamples//2):
                points.append(genGauss(-2,3, True))
            for i in range(numSamples//2):
                points.append(genGauss(2, -3, False))

        elif type == "circle":
                 # Parameters for the outer circle
                outer_radius = 10

                # Parameters for the inner circle
                inner_radius = 8

                # Generate scatter points around the circumferences
                outer_theta = np.linspace(0, 2 * np.pi, numSamples//2)
                inner_theta = np.linspace(0, 2 * np.pi, numSamples//2)
                outer_scatter = outer_radius * np.array([np.cos(outer_theta), np.sin(outer_theta)]) + np.random.rand(2, numSamples//2) * 2
                inner_scatter = inner_radius * np.array([np.cos(inner_theta), np.sin(inner_theta)]) + np.random.rand(2, numSamples//2) * 1
                # return point objects
                for i in range(numSamples//2):
                    points.append({"features":[inner_scatter[0][i], inner_scatter[1][i]], "label": 0})
                    points.append({"features":[outer_scatter[0][i], outer_scatter[1][i]], "label": 1})

            
        elif type == "spiral":
            def genSpiral(deltaT, indicator):
                 n = numSamples//2
                 r = i / n * 10
                 t = 1.75 * i / n * 2 * math.pi + deltaT
                 x = r * math.sin(t) + random.uniform(-1, 1) * noise
                 y = r * math.cos(t) + random.uniform(-1, 1) * noise
                 return {"features":[x, y], "label": 0 if indicator else 1}

            for i in range(numSamples//2):
                points.append(genSpiral(0, False))
                points.append(genSpiral(math.pi, True))

        elif type == "xor":
            def genXor(cx, cy):
                x = random.uniform(cx - 0.5, cx + 0.5)
                y = random.uniform(cy - 0.5, cy + 0.5)
                return {"features":[x, y], "label": 0 if x * y > 0 else 1}

            for i in range(numSamples):
                points.append(genXor(0, 0))

        return points

    return generate

# classifyData function
def classifyData(numSamples, noise, type):
    points = DataGenerator(numSamples, noise, type)()
    shuffle(points)

    # Save the observations in JSON files
    fileName = BASEPATH+type + ".json"
    with open(fileName, "w") as f:
        json.dump(points, f)

    return points

if __name__ == "__main__":
    for type in ["gaussian", "circle", "spiral", "xor"]:
        print("Generating " + type + " data...")
        classifyData(100, .5, type)
    print("Done!")




