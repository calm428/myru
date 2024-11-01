import os
from PIL import Image

# Set your source and destination folders
source_folder = 'assets-thispersondoesnotexist'
destination_folder = 'assets-thispersondoesnotexist-cropped'

# Create the destination folder if it doesn't already exist
if not os.path.exists(destination_folder):
    os.makedirs(destination_folder)

# Loop through image files, crop them, and save them to the destination folder
for i in range(1000):
    # Define the file names
    input_file = os.path.join(source_folder, f'avatar-{i}.jpg')
    output_file = os.path.join(destination_folder, f'avatar-{i}.jpg')

    # Open an existing image
    with Image.open(input_file) as img:
        # Calculate the size of the cropped image
        left = 12
        top = 0
        right = img.width - 12
        bottom = img.height - 24

        # Crop the image
        cropped_img = img.crop((left, top, right, bottom))

        # Save the cropped image
        cropped_img.save(output_file)

print("Cropping completed and images are saved in the destination folder.")
