import { fail, redirect } from '@sveltejs/kit';
import { writeFileSync, existsSync } from 'fs';

export const actions = {
	async createPost({ request }) {
		// Fetch the form data
		const formData = await request.formData();

		// Get the image from the form data
		const images = formData.getAll('images');

		// Set the amount of uploaded images to 0, and the path to an empty string (used for redirecting later)
		let uploadedImagesAmount = 0;
		let path = '';

		for (const image of images) {
			// Upload the image and store the result
			const upload = await uploadFile(image);

			// If the upload fails, return the error
			if (!('path' in upload)) {
				return upload;
			}

			// If the upload succeeds, increment the amount of uploaded images and set the path to the uploaded image
			uploadedImagesAmount += 1;
			path = upload.path;
		}

		// If only one image was uploaded, redirect to the image page
		if (uploadedImagesAmount === 1) {
			throw redirect(301, path);
		}

		return {
			message: 'Upload successful',
			error: false
		};
	}
};

async function uploadFile(image: FormDataEntryValue) {
	// Check if the image is a file
	if (!(image instanceof File)) {
		return fail(400, { message: 'Ensure upload is a file', error: true });
	}

	// Check if the image is empty or not provided
	if (image.size === 0) {
		return fail(400, { message: 'No image provided', error: true });
	}

	// Check if the file submitted is an image
	if (!image.type.startsWith('image/')) {
		return fail(400, { message: 'Only images are supported', error: true });
	}

	// Set the path to the static folder
	let path = `./static/uploads/${image.name}`;

	// Check if the file already exists
	if (existsSync(path)) {
		// If it does, rename it with the current timestamp
		path = `./static/uploads/${Date.now()}-${image.name}`;
	}

	// Check if the file is too big (10MB)
	if (image.size > 10000000) {
		return fail(400, { message: 'File too big', error: true });
	}

	// Write the file to the static folder
	try {
		writeFileSync(path, Buffer.from(await image.arrayBuffer()));
	} catch (error) {
		// If something goes wrong, log the error and return a 500
		console.log(error);
		return fail(500, { message: 'Something went wrong...', error: true });
	}

	// Return the path to the uploaded image
	return {
		path: path.split('./static')[1]
	};
}
