export default {
  name: "order",
  title: "Order",
  type: "document",
  fields: [
    {
      name: "orderNumber",
      title: "Order Number",
      type: "string",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "customer",
      title: "Customer",
      type: "object",
      fields: [
        { name: "name", title: "Name", type: "string" },
        { name: "email", title: "Email", type: "string" },
        { name: "phone", title: "Phone", type: "string" },
        { name: "address", title: "Address", type: "string" },
        { name: "city", title: "City", type: "string" },
      ],
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "items",
      title: "Order Items",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "product",
              title: "Product",
              type: "reference",
              to: [{ type: "product" }],
            },
            {
              name: "quantity",
              title: "Quantity",
              type: "number",
              validation: (Rule: any) => Rule.required().min(1),
            },
            {
              name: "price",
              title: "Price at Purchase",
              type: "number",
              validation: (Rule: any) => Rule.required(),
            },
          ],
        },
      ],
      validation: (Rule: any) => Rule.required().min(1),
    },
    {
      name: "total",
      title: "Total Amount",
      type: "number",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "status",
      title: "Order Status",
      type: "string",
      options: {
        list: [
          { title: "Pending", value: "pending" },
          { title: "Processing", value: "processing" },
          { title: "Shipped", value: "shipped" },
          { title: "Delivered", value: "delivered" },
          { title: "Cancelled", value: "cancelled" },
        ],
      },
      initialValue: "pending",
      validation: (Rule: any) => Rule.required(),
    },
    {
      name: "paymentMethod",
      title: "Payment Method",
      type: "string",
      options: {
        list: [
          { title: "Cash on Delivery", value: "cod" },
          { title: "Bank Transfer", value: "bank" },
          { title: "JazzCash", value: "jazzcash" },
          { title: "Easypaisa", value: "easypaisa" },
        ],
      },
      initialValue: "cod",
    },
    {
      name: "notes",
      title: "Order Notes",
      type: "text",
    },
    {
      name: "createdAt",
      title: "Created At",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    },
    {
      name: "updatedAt",
      title: "Updated At",
      type: "datetime",
    },
  ],
  preview: {
    select: {
      title: "orderNumber",
      subtitle: "customer.name",
      status: "status",
    },
    prepare(selection: any) {
      const { title, subtitle, status } = selection;
      return {
        title: `${title} - ${subtitle}`,
        subtitle: `Status: ${status}`,
      };
    },
  },
};
