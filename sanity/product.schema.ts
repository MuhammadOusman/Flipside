// Sanity Schema for Product (Thrift Store)
// This schema defines the structure for 1-of-1 thrift inventory

export default {
  name: 'product',
  title: 'Product',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'Product Title',
      type: 'string',
      description: 'e.g., "Jordan 1 Retro High OG"',
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'images',
      title: 'Images',
      type: 'array',
      of: [
        {
          type: 'image',
          options: {
            hotspot: true, // Enables image cropping
          },
        },
      ],
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: 'brand',
      title: 'Brand',
      type: 'string',
      options: {
        list: [
          { title: 'Nike', value: 'nike' },
          { title: 'Adidas', value: 'adidas' },
          { title: 'New Balance', value: 'new-balance' },
          { title: 'Jordan', value: 'jordan' },
          { title: 'Yeezy', value: 'yeezy' },
          { title: 'Puma', value: 'puma' },
          { title: 'Vans', value: 'vans' },
          { title: 'Converse', value: 'converse' },
          { title: 'Other', value: 'other' },
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'size',
      title: 'Size (UK)',
      type: 'string',
      options: {
        list: [
          '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10',
          '10.5', '11', '11.5', '12', '12.5', '13'
        ],
      },
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: 'price',
      title: 'Price (PKR)',
      type: 'number',
      validation: (Rule: any) => Rule.required().positive(),
    },
    {
      name: 'condition',
      title: 'Condition (1-10)',
      type: 'number',
      description: '1 = Poor, 10 = Deadstock',
      validation: (Rule: any) => Rule.required().min(1).max(10),
    },
    {
      name: 'isSold',
      title: 'Sold Out?',
      type: 'boolean',
      initialValue: false,
    },
    {
      name: 'description',
      title: 'Description',
      type: 'text',
      description: 'Short punchy description',
    },
    {
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Jordans', value: 'jordans' },
          { title: 'Dunks', value: 'dunks' },
          { title: 'Yeezy', value: 'yeezy' },
          { title: 'Running', value: 'running' },
          { title: 'Lifestyle', value: 'lifestyle' },
        ],
      },
    },
  ],
  preview: {
    select: {
      title: 'title',
      brand: 'brand',
      size: 'size',
      media: 'images.0',
      isSold: 'isSold',
    },
    prepare(selection: any) {
      const { title, brand, size, media, isSold } = selection;
      return {
        title: `${title} - UK ${size}`,
        subtitle: `${brand.toUpperCase()} ${isSold ? '🔴 SOLD' : '🟢 Available'}`,
        media,
      };
    },
  },
};
