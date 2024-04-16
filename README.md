# Drive API

This API allows you to manage files and folders.

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Vodianoi/API-JS
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

## Usage

### Get Contents of a Folder

Retrieve the contents of a folder.

**Endpoint**: `GET /api/drive`

#### Query Parameters

- `search` (optional): Search for files or folders by name.

#### Response

- **200 OK**: Folder contents retrieved successfully.
- **404 Not Found**: Parent folder not found.

### Create a New Folder

Create a new folder.

**Endpoint**: `POST /api/drive`

#### Query Parameters

- `name`: Name of the folder to create.

#### Response

- **201 Created**: Folder created successfully.
- **400 Bad Request**: Folder already exists or contains invalid characters.
- **404 Not Found**: Parent folder not found.

### Delete a File or Folder

Delete a file or folder.

**Endpoint**: `DELETE /api/drive/{name}`

#### Path Parameters

- `name`: Name of the file or folder to delete.

#### Response

- **200 OK**: File or folder deleted successfully.
- **400 Bad Request**: File or folder not provided or contains invalid characters.
- **404 Not Found**: File or folder not found.

### Upload a File

Upload a file to a specified path.

**Endpoint**: `PUT /api/drive/{name}`

#### Path Parameters

- `name`: Path where the file will be uploaded.

#### Request Body

- Form-data:
    - `file`: The file to upload.

#### Response

- **201 Created**: File uploaded successfully.
- **400 Bad Request**: No file uploaded or file already exists.
- **404 Not Found**: Folder does not exist.

## Contributors

- [Vodianoi](https://github.com/Vodianoi)

