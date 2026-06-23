import orderPlacedHandler from "../subscribers/order-placed"
import customerCreatedHandler from "../subscribers/customer-created"

const mockContainer = {
  resolve: (name: string) => {
    if (name === "query") {
      return {
        graph: async ({ entity, filters }: any) => {
          console.log(`[Mock Query] Fetching entity: ${entity} for filters:`, JSON.stringify(filters))
          
          if (entity === "order") {
            return {
              data: [
                {
                  id: filters.id,
                  display_id: 1204,
                  email: "customer@example.com",
                  total: 250000, // KES 2,500
                  currency_code: "kes",
                  shipping_address: {
                    first_name: "John",
                    last_name: "Kamau",
                    phone: "0712345678" // Sample local format to test normalization
                  },
                  items: [
                    { title: "Kenyan Coffee Blend", quantity: 2, unit_price: 75000 },
                    { title: "Handwoven Basket", quantity: 1, unit_price: 100000 }
                  ]
                }
              ]
            }
          }

          if (entity === "customer") {
            return {
              data: [
                {
                  id: filters.id,
                  email: "jane.doe@example.com",
                  first_name: "Jane",
                  last_name: "Muthoni"
                }
              ]
            }
          }

          return { data: [] }
        }
      }
    }
    throw new Error(`Service ${name} not registered in mock container.`)
  }
}

async function run() {
  console.log("=== Biashara Hub Notification Dry-Run Tests ===")
  
  // Test Order Placed
  console.log("\nTriggering mock Order Placed event...")
  await orderPlacedHandler({
    event: {
      id: "event_1",
      name: "order.placed",
      timestamp: Date.now(),
      data: { id: "ord_test_9999" }
    },
    container: mockContainer
  } as any)

  // Test Customer Created
  console.log("\nTriggering mock Customer Created event...")
  await customerCreatedHandler({
    event: {
      id: "event_2",
      name: "customer.created",
      timestamp: Date.now(),
      data: { id: "cust_test_9999" }
    },
    container: mockContainer
  } as any)

  console.log("\n=== Dry-Run Execution Complete ===")
}

run().catch(console.error)
