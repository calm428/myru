import os
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

# The URL where the file links are located
BASE_URL = "https://www.geoapify.com/data-share/localities/"

# Make a directory to store the downloads
DOWNLOAD_DIR = "geoapify_downloads"
if not os.path.exists(DOWNLOAD_DIR):
    os.makedirs(DOWNLOAD_DIR)

def download_file(url, download_path):
    response = requests.get(url, stream=True)
    with open(download_path, 'wb') as file:
        for chunk in response.iter_content(chunk_size=1024):
            if chunk: # filter out keep-alive new chunks
                file.write(chunk)
    print(f"Downloaded {url}")

# Get the HTML content of the page
response = requests.get(BASE_URL)
soup = BeautifulSoup(response.content, "html.parser")

# Find all the <a> tags with "href" attributes containing ".zip"
for link in soup.find_all('a', href=True):
    href = link.get('href')
    if href.endswith('ru.zip'):
        zip_url = urljoin(BASE_URL, href)
        file_name = href.rsplit('/', 1)[-1]
        download_path = os.path.join(DOWNLOAD_DIR, file_name)
        download_file(zip_url, download_path)