<!-- @format -->

# News Management Dashboard - Enhancement Guide

## Overview

This guide explains the manual enhancements needed for the News Management Dashboard form to support all new fields (slug, excerpt, detailed article, multiple images, and links).

## Current Status

✅ Core functionality updated
✅ Helper functions added (`generateSlug`, `addLink`, `updateLink`, `removeLink`, `addImage`, `removeImage`)
✅ Form state includes all new fields
✅ API routes support new fields
✅ News carousel clickable with "Read More" buttons
✅ Dynamic news detail page created

## Manual Updates Needed in Dashboard Form

### Location

File: `src/app/(dashboard)/dashboard/news/page.tsx`
Section: Modal Content (around line 450)

### Form Fields to Add

Replace the current simple form fields with the enhanced version below. Add these fields after line 450 in the modal content section:

```tsx
{
	/* Title & Slug */
}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
	<div>
		<label className="block text-sm font-medium text-gray-700 mb-2">
			Title <span className="text-red-500">*</span>
		</label>
		<input
			type="text"
			placeholder="Enter news title"
			value={formData.title}
			onChange={(e) => {
				const newTitle = e.target.value;
				setFormData({
					...formData,
					title: newTitle,
					slug:
						!editingId && !formData.slug
							? generateSlug(newTitle)
							: formData.slug,
				});
			}}
			className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
		/>
	</div>
	<div>
		<label className="block text-sm font-medium text-gray-700 mb-2">
			URL Slug
		</label>
		<input
			type="text"
			placeholder="auto-generated-from-title"
			value={formData.slug}
			onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
			className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
		/>
		<p className="text-xs text-gray-500 mt-1">Leave empty to auto-generate</p>
	</div>
</div>;

{
	/* Excerpt */
}
<div>
	<label className="block text-sm font-medium text-gray-700 mb-2">
		Excerpt / Summary <span className="text-red-500">*</span>
	</label>
	<textarea
		rows={3}
		placeholder="Brief summary for carousel (200 characters recommended)"
		value={formData.excerpt}
		onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
		className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
	/>
</div>;

{
	/* Short Content */
}
<div>
	<label className="block text-sm font-medium text-gray-700 mb-2">
		Short Content
	</label>
	<textarea
		rows={4}
		placeholder="Short version of the article"
		value={formData.content}
		onChange={(e) => setFormData({ ...formData, content: e.target.value })}
		className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
	/>
</div>;

{
	/* Detailed Article */
}
<div>
	<label className="block text-sm font-medium text-gray-700 mb-2">
		Detailed Article
	</label>
	<textarea
		rows={8}
		placeholder="Full detailed article content (supports HTML)"
		value={formData.detailedArticle}
		onChange={(e) =>
			setFormData({
				...formData,
				detailedArticle: e.target.value,
			})
		}
		className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-green-500 focus:border-green-500 font-mono text-sm"
	/>
	<p className="text-xs text-gray-500 mt-1">
		You can use HTML tags for formatting
	</p>
</div>;

{
	/* Primary Image */
}
<div>
	<label className="block text-sm font-medium text-gray-700 mb-2">
		Primary Image (for carousel)
	</label>
	<CloudinaryUpload
		currentImage={formData.imageUrl}
		folder="sarvodaya/news"
		onUploadSuccess={(url) => setFormData({ ...formData, imageUrl: url })}
	/>
</div>;

{
	/* Additional Images */
}
<div>
	<label className="block text-sm font-medium text-gray-700 mb-2">
		Additional Images (Optional)
	</label>
	<div className="space-y-3">
		{formData.images.map((img, index) => (
			<div
				key={index}
				className="flex items-center gap-2 p-2 border border-gray-200 rounded-lg"
			>
				<img
					src={img}
					alt={`Additional ${index + 1}`}
					className="w-16 h-16 object-cover rounded"
				/>
				<input
					type="text"
					value={img}
					readOnly
					className="flex-1 p-2 border border-gray-300 rounded text-sm"
				/>
				<button
					onClick={() => removeImage(index)}
					className="p-2 text-red-600 hover:bg-red-50 rounded"
				>
					<X className="w-4 h-4" />
				</button>
			</div>
		))}
		<CloudinaryUpload
			currentImage=""
			folder="sarvodaya/news/gallery"
			onUploadSuccess={addImage}
		/>
	</div>
</div>;

{
	/* Links */
}
<div>
	<label className="block text-sm font-medium text-gray-700 mb-2">
		Links (Optional)
	</label>
	<div className="space-y-3">
		{formData.links.map((link, index) => (
			<div
				key={index}
				className="grid grid-cols-12 gap-2 p-3 border border-gray-200 rounded-lg"
			>
				<select
					value={link.type}
					onChange={(e) => updateLink(index, "type", e.target.value)}
					className="col-span-3 p-2 border border-gray-300 rounded text-sm"
				>
					<option value="youtube">YouTube</option>
					<option value="facebook">Facebook</option>
					<option value="instagram">Instagram</option>
					<option value="twitter">Twitter</option>
					<option value="custom">Custom</option>
				</select>
				<input
					type="text"
					placeholder="URL"
					value={link.url}
					onChange={(e) => updateLink(index, "url", e.target.value)}
					className="col-span-5 p-2 border border-gray-300 rounded text-sm"
				/>
				<input
					type="text"
					placeholder="Title"
					value={link.title}
					onChange={(e) => updateLink(index, "title", e.target.value)}
					className="col-span-3 p-2 border border-gray-300 rounded text-sm"
				/>
				<button
					onClick={() => removeLink(index)}
					className="col-span-1 p-2 text-red-600 hover:bg-red-50 rounded"
				>
					<X className="w-4 h-4" />
				</button>
			</div>
		))}
		<button
			onClick={addLink}
			className="w-full p-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-green-500 hover:text-green-600 transition-colors"
		>
			+ Add Link
		</button>
	</div>
</div>;

{
	/* Category, Date, Published */
}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
	<div>
		<label className="block text-sm font-medium text-gray-700 mb-2">
			Category
		</label>
		<select
			value={formData.category}
			onChange={(e) => setFormData({ ...formData, category: e.target.value })}
			className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
		>
			<option value="General">General</option>
			<option value="Announcement">Announcement</option>
			<option value="Event">Event</option>
			<option value="Achievement">Achievement</option>
		</select>
	</div>

	<div>
		<label className="block text-sm font-medium text-gray-700 mb-2">
			Publish Date
		</label>
		<input
			type="date"
			value={formData.publishDate}
			onChange={(e) =>
				setFormData({
					...formData,
					publishDate: e.target.value,
				})
			}
			className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
		/>
	</div>

	<div>
		<label className="block text-sm font-medium text-gray-700 mb-2">
			Status
		</label>
		<div className="flex items-center gap-4 p-3">
			<label className="flex items-center gap-2 cursor-pointer">
				<input
					type="radio"
					checked={formData.isPublished}
					onChange={() => setFormData({ ...formData, isPublished: true })}
					className="w-4 h-4 text-green-600"
				/>
				<span className="text-sm flex items-center gap-1">
					<Eye className="w-4 h-4" />
					Published
				</span>
			</label>
			<label className="flex items-center gap-2 cursor-pointer">
				<input
					type="radio"
					checked={!formData.isPublished}
					onChange={() => setFormData({ ...formData, isPublished: false })}
					className="w-4 h-4 text-gray-600"
				/>
				<span className="text-sm flex items-center gap-1">
					<EyeOff className="w-4 h-4" />
					Draft
				</span>
			</label>
		</div>
	</div>
</div>;
```

### Update Submit Button Validation

Update the submit button's disabled condition (around line 555):

```tsx
<button
	onClick={handleSubmit}
	disabled={submitting || !formData.title.trim()}
	className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center"
>
	{submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
	{editingId ? "Update News" : "Create News"}
</button>
```

## Database Migration

**IMPORTANT:** Before testing, you must apply the database migration:

```bash
npx prisma migrate deploy
```

Or if the migration fails due to existing data:

```bash
npx prisma db push
```

This will apply the schema changes to add the new columns to the News table.

## Testing Checklist

After making these changes:

1. ✅ Test creating a new news article with all fields
2. ✅ Test auto-slug generation
3. ✅ Test uploading multiple images
4. ✅ Test adding multiple links (YouTube, Facebook, etc.)
5. ✅ Test publish/draft toggle
6. ✅ Test editing existing news
7. ✅ Navigate to `/news/[slug]` to view full article
8. ✅ Test video embeds (YouTube links)
9. ✅ Test image gallery functionality
10. ✅ Test social sharing buttons

## Features Implemented

### ✅ Backend

- Updated Prisma schema with new fields
- Created migration script
- Updated API routes (/api/news, /api/news/[id], /api/news/slug/[slug])
- Slug-based fetching

### ✅ Frontend - Public

- Dynamic news detail page (`/news/[slug]/page.tsx`)
- Video embedding component (YouTube, Facebook)
- Image gallery with lightbox
- Social sharing buttons
- Related news section
- SEO metadata and Open Graph tags
- Updated news carousel with clickable links

### ✅ Frontend - Dashboard

- Form state with all new fields
- Helper functions for slug generation
- Link management functions
- Image management functions
- Enhanced submit logic

### ⚠️ Needs Manual Update

- Dashboard form UI (detailed above) - replace modal content section

## Next Steps

1. Apply the form field updates to the dashboard modal
2. Run database migration
3. Test all functionality
4. Create/edit news articles with rich content
5. Verify dynamic pages work correctly

## Support

If you encounter any issues:

- Check browser console for errors
- Verify Prisma client is regenerated (`npx prisma generate`)
- Ensure all imports are correct
- Check API responses in Network tab
