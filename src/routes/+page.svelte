<script lang="ts">
	import { applyAction, enhance, type SubmitFunction } from '$app/forms';
	import { invalidateAll } from '$app/navigation';

	// Form data
	export let form;

	// Form state and submission
	let submitting = false;

	const submitEnhancer: SubmitFunction = ({ cancel }) => {
		// If the form is already submitting, cancel the submission
		if (submitting) {
			return cancel();
		}

		// Otherwise, set the submitting state to true
		submitting = true;

		// Return a function that will be called when the form is submitted
		return async ({ result }) => {
			// Invalidate the page to force a reload / refetch of state
			await invalidateAll();

			// Apply the action to the form. E.g. if the action was a redirect, this will redirect the page
			await applyAction(result);

			// Set the submitting state to false to allow the form to be submitted again
			submitting = false;
		};
	};
</script>

<main class="container">
	<h1>Demo - Upload an image!</h1>
	<form action="?/createPost" method="post" use:enhance={submitEnhancer}>
		<!-- The file input -->
		<label for="images">Upload an image!</label>
		<input type="file" multiple accept=".png, .jpg, .jpeg, .webp" name="images" id="images" />

		<!-- Update the apperance of the submit button to reflect the state of the form (submitting or not) -->
		<button type="submit" class:secondary={submitting} aria-busy={submitting}>
			{#if submitting}
				Uploading...
			{:else}
				Upload
			{/if}
		</button>
		<!-- If the server returned a message -->
		{#if form}
			<!-- Conditionally apply error class if the message contained an error -->
			<p class:error={form.error}>{form.message}</p>
		{/if}
	</form>
</main>

<style>
	.error {
		color: red;
		text-align: center;
	}

	.container {
		margin-top: 2rem;
	}
</style>
