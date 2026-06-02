
// Function to convert an array of files to base64
export default function convertImagesToBase64(files) {
    return Promise.all(
        files.map(async (file) => {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        })
    );
};