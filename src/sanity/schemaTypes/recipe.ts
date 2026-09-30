import { defineField, defineType } from "sanity";

export const recipe = defineType({
  name: "recipe",
  title: "Recipe",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "Title",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      options: { source: "title" },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "image",
      title: "Photo",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "cuisine",
      title: "Cuisine",
      type: "string",
      options: {
        list: [
          "Indian",
          "Italian",
          "Mexican",
          "Japanese",
          "Thai",
          "Middle Eastern",
          "American",
          "Chinese",
          "Korean",
          "French",
          "Other",
        ],
      },
    }),
    defineField({
      name: "moods",
      title: "Moods",
      description: "Which mood tabs on the picker this recipe can show up under",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: ["Comfort", "Quick", "Spicy", "Sweet", "Anything"],
      },
    }),
    defineField({
      name: "timeMinutes",
      title: "Time (minutes)",
      type: "number",
    }),
    defineField({
      name: "note",
      title: "Short note",
      description: 'Small descriptor, e.g. "creamy, mild heat"',
      type: "string",
    }),
    defineField({
      name: "ingredients",
      title: "Ingredients",
      type: "array",
      of: [{ type: "string" }],
    }),
    defineField({
      name: "instructions",
      title: "Instructions",
      type: "array",
      of: [{ type: "block" }],
    }),
  ],
});
