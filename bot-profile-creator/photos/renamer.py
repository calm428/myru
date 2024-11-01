import os

# Set your source folder
source_folder = 'assets-pravatar'

# Loop through and rename the files
for i in range(70):  # Since the files are numbered from 0 to 69
    original_filename = os.path.join(source_folder, f'avatar-{i}.jpg')
    new_filename = os.path.join(source_folder, f'avatar-{1000 + i}.jpg')

    # Rename the file
    os.rename(original_filename, new_filename)

print("Files have been successfully renamed.")
