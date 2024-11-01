import requests

# URL of the thispersondoesnotexist.com website
url = "https://i.pravatar.cc/1000?img="

for i in range(70):
    # Send a GET request to the website
    response = requests.get(
        url + f'{i + 1}', headers={'User-Agent': 'Mozilla/5.0'})

    # Check if the request was successful
    if response.status_code == 200:
        # You can also use uuid or similar method to generate unique file names
        filename = f"assets-pravatar/avatar-{i}.jpg"

        # Save the image to the current directory
        with open(filename, 'wb') as f:
            f.write(response.content)

        print(f"The image was downloaded successfully and saved as {filename}")
    else:
        print(
            f"Failed to retrieve the image. Status code: {response.status_code}")
