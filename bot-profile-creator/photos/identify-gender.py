import os
import json
from deepface import DeepFace

# Set your source folder
source_folder = 'assets'

# Initialize a dictionary to hold the analysis results
results = {}
men_images = []
women_images = []

# Loop through the image files and analyze them
for i in range(1070):  # Assuming images are sequentially numbered from 0 to 1069
    filename = f'avatar-{i}.jpg'
    image_path = os.path.join(source_folder, filename)

    try:
        # Analyze the image for the gender attribute
        analysis = DeepFace.analyze(img_path=image_path, actions=['gender'])
        print(f"{image_path}: {analysis[0]['dominant_gender']}")
        if analysis[0]['dominant_gender'] == 'Man':
            men_images.append(filename)
        elif analysis[0]['dominant_gender'] == 'Woman':
            women_images.append(filename)
        # Save the gender result in the dictionary
        results[filename] = analysis[0]
    except Exception as e:
        print(f"An error occurred while analyzing {filename}: {str(e)}")
        # If an exception occurs during analysis, record it as 'error'
        results[filename] = 'error'

# Write the results to a JSON file
results_json_path = 'results.json'
with open(results_json_path, 'w') as json_file:
    json.dump({
        "results": results,
        "men_images": men_images,
        "women_images": women_images}, json_file, indent=2)

print(f"Analysis completed. Results are saved in '{results_json_path}'.")
