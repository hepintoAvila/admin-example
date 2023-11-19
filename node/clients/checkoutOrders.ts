import type { InstanceOptions, IOContext } from '@vtex/api'
import { ExternalClient } from '@vtex/api'
import { apiKey, apiToken } from '../env'

export class CheckoutOrders extends ExternalClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(`https://${ctx.account}.vtexcommercestable.com.br/api`, ctx, {
      ...options,
      headers: {
        ...options?.headers,
        VtexIdclientAutCookie:
          ctx.storeUserAuthToken ?? ctx.adminUserAuthToken ?? ctx.authToken,
        'X-VTEX-API-AppKey': apiKey,
        'X-VTEX-API-AppToken': apiToken,
      },
    })
  }

  public getUserByEmail = async (email: string) => {
    const response = await this.http.get(
      `/checkout/pub/profiles?email=${email}&ensureComplete=true`
    )
    console.log(response)
    return response
  }
}
//
