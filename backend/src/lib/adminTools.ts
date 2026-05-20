import { prisma } from "./prisma";

export const adminTools = [
  {
    type: "function",
    function: {
      name: "get_store_summary",
      description: "Gets high-level store performance metrics: total revenue, total orders, total products, total customers, and low stock count.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_low_stock_products",
      description: "Gets products with variants whose stock is less than or equal to a given threshold.",
      parameters: {
        type: "object",
        properties: {
          threshold: {
            type: "number",
            description: "The stock threshold to filter by. Defaults to 5.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_recent_orders",
      description: "Gets recent orders placed in the store.",
      parameters: {
        type: "object",
        properties: {
          limit: {
            type: "number",
            description: "Maximum number of orders to return. Defaults to 10.",
          },
          status: {
            type: "string",
            description: "Optional order status to filter by (e.g. PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED).",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_top_products",
      description: "Gets the top-selling products over a given period.",
      parameters: {
        type: "object",
        properties: {
          period: {
            type: "string",
            enum: ["7days", "30days", "90days"],
            description: "The time period to calculate top products. Defaults to 30days.",
          },
          limit: {
            type: "number",
            description: "Maximum number of top products to return. Defaults to 5.",
          },
        },
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_products",
      description: "Searches for products by name or description and returns their stock and status.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "The search query.",
          },
        },
        required: ["query"],
      },
    },
  },
];

export async function executeAdminTool(name: string, args: any) {
  try {
    switch (name) {
      case "get_store_summary": {
        const [totalOrders, totalProducts, totalCustomers, lowStockCount, orders] = await Promise.all([
          prisma.order.count(),
          prisma.product.count(),
          prisma.user.count({ where: { role: 'CUSTOMER' } }),
          prisma.variant.count({ where: { stock: { lte: 5 } } }),
          prisma.order.aggregate({
            _sum: {
              total: true
            }
          })
        ]);

        return {
          totalRevenue: orders._sum.total || 0,
          totalOrders,
          totalProducts,
          totalCustomers,
          lowStockCount
        };
      }

      case "get_low_stock_products": {
        const threshold = args.threshold || 5;
        const products = await prisma.product.findMany({
          where: {
            variants: {
              some: {
                stock: { lte: threshold }
              }
            }
          },
          include: {
            variants: {
              where: {
                stock: { lte: threshold }
              },
              select: {
                sku: true,
                size: true,
                color: true,
                stock: true
              }
            }
          },
          take: 20
        });
        
        return products.map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          lowStockVariants: p.variants
        }));
      }

      case "get_recent_orders": {
        const limit = args.limit || 10;
        const whereClause = args.status ? { status: args.status as any } : {};
        const orders = await prisma.order.findMany({
          where: whereClause,
          orderBy: { createdAt: 'desc' },
          take: limit,
          include: {
            user: { select: { name: true, email: true } },
            items: { include: { product: { select: { name: true } } } }
          }
        });
        
        return orders.map(o => ({
          id: o.id,
          customerName: o.user.name,
          customerEmail: o.user.email,
          total: o.total,
          status: o.status,
          date: o.createdAt,
          items: o.items.map(i => ({ name: i.product.name, qty: i.quantity }))
        }));
      }

      case "get_top_products": {
        const period = args.period || "30days";
        const limit = args.limit || 5;
        
        const days = period === "7days" ? 7 : period === "90days" ? 90 : 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const topItems = await prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: {
            quantity: true
          },
          where: {
            order: {
              createdAt: { gte: startDate }
            }
          },
          orderBy: {
            _sum: {
              quantity: 'desc'
            }
          },
          take: limit
        });

        const productIds = topItems.map(item => item.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, price: true }
        });

        return topItems.map(item => {
          const product = products.find(p => p.id === item.productId);
          return {
            name: product?.name || 'Unknown Product',
            unitsSold: item._sum.quantity || 0,
            revenue: (product?.price || 0) * (item._sum.quantity || 0)
          };
        });
      }

      case "search_products": {
        const { query } = args;
        const products = await prisma.product.findMany({
          where: {
            OR: [
              { name: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } }
            ]
          },
          include: {
            variants: {
              select: { stock: true }
            }
          },
          take: 10
        });

        return products.map(p => ({
          id: p.id,
          name: p.name,
          status: p.status,
          price: p.price,
          totalStock: p.variants.reduce((acc, v) => acc + v.stock, 0)
        }));
      }

      default:
        return { error: `Tool ${name} not found` };
    }
  } catch (err: any) {
    console.error(`[AdminToolError] ${name}:`, err);
    return { error: err.message };
  }
}
