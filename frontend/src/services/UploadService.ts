export const uploadFile = async (file: File): Promise<any> => {
    const formData = new FormData();
    formData.append('video', file);

    console.log("Starting upload request: " + file.name)

    const response = await fetch(`${process.env.API_URL}/api/upload`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`An error occurred: ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Response: "+response)

    return data;
};
