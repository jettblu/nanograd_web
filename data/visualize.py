# chart each json file from the saved directory

# iterate through saved directory and get all json data
import json
import os
import matplotlib.pyplot as plt

BASEPATH = "data/saved/charts/"

dataArray = []
nameArray = []
for filename in os.listdir('data/saved'):
    if(filename.endswith("json")):
        nameArray.append(filename)
        # open each json file and read the data
        with open('data/saved/' + filename, 'r') as f:
            # get json data
            newData = json.load(f)
            # append json data to dataArray
            dataArray.append(newData)

# iterate through dataArray and plot each data
for data in dataArray:
    print("Plotting " + nameArray[dataArray.index(data)] + " data...")
    # plot the data
    # each observation has two features and a label
    # plot the features and color the label
    xs = []
    ys = []
    labels = []
    colors = []
    # new figure
    plt.figure()
    for observation in data:
        x = observation["features"][0]
        y = observation["features"][1]
        label = observation["label"]
        color = "purple" if label == -1 else "#f52ce4"
        xs.append(x)
        ys.append(y)
        labels.append(label)
        colors.append(color)
    plt.scatter(xs, ys, color=colors)
    plt.title(nameArray[dataArray.index(data)])
    # save chart to png file
    plt.savefig(BASEPATH + nameArray[dataArray.index(data)] + '.png')

print("Done!")
print("Saved charts to " + BASEPATH)

