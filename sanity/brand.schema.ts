export default {
  name: "brand",
  title: "Brand",
  type: "document",
  fields: [
    {
      name: "name",
      title: "Brand Name",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "slug",
      title: "Slug",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    },
    {
      name: "logo",
      title: "Brand Logo",
      type: "image",
      options: {
        hotspot: true,
      },
    },
    {
      name: "isActive",
      title: "Is Active",
      type: "boolean",
      initialValue: true,
      description: "Set to false to hide this brand from the store",
    },
    {
      name: "order",
      title: "Display Order",
      type: "number",
      description: "Lower numbers appear first",
      initialValue: 0,
    },
    {
      name: "metadata",
      title: "SEO Metadata",
      type: "object",
      fields: [
        {
          name: "title",
          title: "SEO Title",
          type: "string",
        },
        {
          name: "description",
          title: "SEO Description",
          type: "text",
          rows: 2,
        },
      ],
    },
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "description",
      media: "logo",
    },
  },
};
