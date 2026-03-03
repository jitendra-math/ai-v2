<!-- src/routes/+layout.svelte -->
<script>
    import '../app.css';
    import Toast from '$lib/components/Toast.svelte';
</script>

<div class="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 antialiased">
    <Toast />
    <slot />
</div>

<style>
    :global(html, body) {
        height: 100%;
        margin: 0;
        padding: 0;
    }
</style>