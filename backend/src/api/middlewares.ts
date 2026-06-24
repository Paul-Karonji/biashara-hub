import { defineMiddlewares } from '@medusajs/framework/http'

export default defineMiddlewares({
  routes: [
    {
      matcher: '/hooks/*',
      bodyParser: {
        preserveRawBody: true,
      },
      middlewares: [], // Ensure no default auth runs on webhook callbacks
    },
  ],
})
